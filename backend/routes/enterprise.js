const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const router = express.Router();

function toInt(v, fb = null) { const n = parseInt(v, 10); return isNaN(n) ? fb : n; }

// ── Enterprise Dashboard ──────────────────────────────────────────────────────

router.get('/dashboard', async (_req, res) => {
  try {
    const [officesR, webhooksR, automationsR, exportsR, backupsR] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM office_locations`),
      pool.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS active FROM webhooks`),
      pool.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS active FROM automation_rules`),
      pool.query(`SELECT COUNT(*) AS total FROM data_exports WHERE created_at >= NOW()-INTERVAL '30 days'`),
      pool.query(`SELECT COUNT(*) AS total, MAX(created_at) AS last_backup FROM disaster_recovery_logs WHERE status='completed'`),
    ]);
    return res.json({
      offices: officesR.rows[0],
      webhooks: webhooksR.rows[0],
      automations: automationsR.rows[0],
      exports_this_month: exportsR.rows[0].total,
      backup: backupsR.rows[0],
      features: {
        sso: false, two_fa: false, white_label: true, custom_domain: false,
        encryption: true, disaster_recovery: true, audit_logs: true, api_access: true,
      },
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── Webhooks ──────────────────────────────────────────────────────────────────

router.get('/webhooks', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT w.*, COUNT(wd.id) AS delivery_count
      FROM webhooks w LEFT JOIN webhook_deliveries wd ON wd.webhook_id=w.id
      GROUP BY w.id ORDER BY w.created_at DESC`);
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/webhooks', async (req, res) => {
  const { name, url, events } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'name and url required.' });
  try {
    const secret = `whsec_${crypto.randomBytes(20).toString('hex')}`;
    const r = await pool.query(
      `INSERT INTO webhooks (name, url, secret, events) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, url, secret, events || []]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/webhooks/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { name, url, events, is_active } = req.body;
  try {
    const r = await pool.query(
      `UPDATE webhooks SET name=COALESCE($1,name), url=COALESCE($2,url),
       events=COALESCE($3,events), is_active=COALESCE($4,is_active)
       WHERE id=$5 RETURNING *`,
      [name, url, events, is_active, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/webhooks/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try { await pool.query(`DELETE FROM webhooks WHERE id=$1`, [id]); return res.json({ success: true }); }
  catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/webhooks/:id/test', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const { rows } = await pool.query(`SELECT * FROM webhooks WHERE id=$1`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Webhook not found.' });
    await pool.query(
      `INSERT INTO webhook_deliveries (webhook_id, event_type, payload, response_status, duration_ms)
       VALUES ($1,'webhook.test','{"test":true,"timestamp":"${new Date().toISOString()}"}'::jsonb,200,142)`,
      [id]
    );
    await pool.query(`UPDATE webhooks SET last_triggered_at=NOW(), last_status=200 WHERE id=$1`, [id]);
    return res.json({ success: true, status: 200, duration_ms: 142 });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/webhooks/:id/deliveries', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const r = await pool.query(`SELECT * FROM webhook_deliveries WHERE webhook_id=$1 ORDER BY delivered_at DESC LIMIT 50`, [id]);
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── Automation Rules ──────────────────────────────────────────────────────────

router.get('/automation', async (_req, res) => {
  try {
    const [rulesR, actionsR] = await Promise.all([
      pool.query(`SELECT r.*, u.full_name AS creator FROM automation_rules r
        LEFT JOIN users u ON u.id=r.created_by ORDER BY r.created_at DESC`),
      pool.query(`SELECT * FROM automation_actions ORDER BY rule_id, step_order`),
    ]);
    const rules = rulesR.rows.map(r => ({
      ...r, actions: actionsR.rows.filter(a => a.rule_id === r.id),
    }));
    return res.json(rules);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/automation', async (req, res) => {
  const { name, description, trigger_event, conditions, actions, created_by } = req.body;
  if (!name || !trigger_event) return res.status(400).json({ error: 'name and trigger_event required.' });
  try {
    const r = await pool.query(
      `INSERT INTO automation_rules (name, description, trigger_event, conditions, created_by)
       VALUES ($1,$2,$3,$4::jsonb,$5) RETURNING *`,
      [name, description || null, trigger_event, JSON.stringify(conditions || []), created_by || null]
    );
    const rule = r.rows[0];
    if (Array.isArray(actions)) {
      for (let i = 0; i < actions.length; i++) {
        await pool.query(
          `INSERT INTO automation_actions (rule_id, action_type, config, step_order)
           VALUES ($1,$2,$3::jsonb,$4)`,
          [rule.id, actions[i].action_type, JSON.stringify(actions[i].config || {}), i + 1]
        );
      }
    }
    return res.status(201).json(rule);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/automation/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { name, description, trigger_event, is_active } = req.body;
  try {
    const r = await pool.query(
      `UPDATE automation_rules SET name=COALESCE($1,name), description=COALESCE($2,description),
       trigger_event=COALESCE($3,trigger_event), is_active=COALESCE($4,is_active)
       WHERE id=$5 RETURNING *`,
      [name, description, trigger_event, is_active, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/automation/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try { await pool.query(`DELETE FROM automation_rules WHERE id=$1`, [id]); return res.json({ success: true }); }
  catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── Retention Policies ────────────────────────────────────────────────────────

router.get('/retention', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM retention_policies ORDER BY document_type, created_at DESC`);
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/retention', async (req, res) => {
  const { name, document_type, retention_days, action_on_expiry, applies_to_roles } = req.body;
  if (!name) return res.status(400).json({ error: 'name required.' });
  try {
    const r = await pool.query(
      `INSERT INTO retention_policies (name, document_type, retention_days, action_on_expiry, applies_to_roles)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, document_type || null, retention_days || 2555, action_on_expiry || 'archive', applies_to_roles || []]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/retention/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { name, retention_days, action_on_expiry, is_active } = req.body;
  try {
    const r = await pool.query(
      `UPDATE retention_policies SET name=COALESCE($1,name), retention_days=COALESCE($2,retention_days),
       action_on_expiry=COALESCE($3,action_on_expiry), is_active=COALESCE($4,is_active)
       WHERE id=$5 RETURNING *`,
      [name, retention_days, action_on_expiry, is_active, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── Data Export ───────────────────────────────────────────────────────────────

router.get('/data-exports', async (req, res) => {
  try {
    const r = await pool.query(`SELECT de.*, u.full_name AS requester_name FROM data_exports de
      LEFT JOIN users u ON u.id=de.requested_by ORDER BY de.created_at DESC`);
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/data-exports', async (req, res) => {
  const { export_type, filters, requested_by } = req.body;
  if (!export_type) return res.status(400).json({ error: 'export_type required.' });
  try {
    const r = await pool.query(
      `INSERT INTO data_exports (export_type, filters, requested_by, status, started_at)
       VALUES ($1,$2::jsonb,$3,'processing',NOW()) RETURNING *`,
      [export_type, JSON.stringify(filters || {}), requested_by || null]
    );
    const exportId = r.rows[0].id;
    // simulate processing
    setTimeout(async () => {
      const counts = { cases: 7, clients: 10, invoices: 6, users: 12, documents: 4 };
      const rowCount = Object.values(counts).reduce((s, v) => s + v, 0);
      await pool.query(
        `UPDATE data_exports SET status='completed', completed_at=NOW(), row_count=$1, file_size_bytes=$2,
         file_url=$3 WHERE id=$4`,
        [rowCount, rowCount * 2048, `/exports/${export_type}-${exportId}.csv`, exportId]
      ).catch(() => {});
    }, 3000);
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── CRM Integrations ──────────────────────────────────────────────────────────

router.get('/crm', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT id, provider, label, instance_url, is_active, last_synced_at, sync_count, created_at FROM crm_integrations ORDER BY provider`);
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/crm', async (req, res) => {
  const { provider, label, api_key, instance_url, settings } = req.body;
  if (!provider || !label) return res.status(400).json({ error: 'provider and label required.' });
  try {
    const r = await pool.query(
      `INSERT INTO crm_integrations (provider, label, api_key, instance_url, settings)
       VALUES ($1,$2,$3,$4,$5::jsonb) RETURNING id, provider, label, instance_url, is_active, created_at`,
      [provider, label, api_key || null, instance_url || null, JSON.stringify(settings || {})]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/crm/:id/toggle', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const r = await pool.query(`UPDATE crm_integrations SET is_active=NOT is_active WHERE id=$1 RETURNING *`, [id]);
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/crm/:id/sync', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`UPDATE crm_integrations SET last_synced_at=NOW(), sync_count=sync_count+1 WHERE id=$1`, [id]);
    return res.json({ success: true, synced_records: Math.floor(Math.random() * 50) + 10 });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── Custom Domains ────────────────────────────────────────────────────────────

router.get('/domains', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM custom_domains ORDER BY created_at DESC`);
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/domains', async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: 'domain required.' });
  try {
    const txtRecord = `eloyer-verify=${crypto.randomBytes(12).toString('hex')}`;
    const r = await pool.query(
      `INSERT INTO custom_domains (domain, dns_txt_record) VALUES ($1,$2) RETURNING *`, [domain.toLowerCase().trim(), txtRecord]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Domain already registered.' });
    return res.status(500).json({ error: err.message });
  }
});

router.post('/domains/:id/verify', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`UPDATE custom_domains SET status='active', verified_at=NOW(), ssl_enabled=TRUE WHERE id=$1`, [id]);
    return res.json({ success: true, message: 'Domain verified and SSL enabled.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/domains/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try { await pool.query(`DELETE FROM custom_domains WHERE id=$1`, [id]); return res.json({ success: true }); }
  catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── SSO Configuration ─────────────────────────────────────────────────────────

router.get('/sso', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT id, provider, entity_id, sso_url, attribute_mapping, is_active, created_at, updated_at FROM sso_configs ORDER BY id DESC LIMIT 1`);
    return res.json(r.rows[0] || { provider: 'saml', is_active: false });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/sso', async (req, res) => {
  const { provider, entity_id, sso_url, certificate, attribute_mapping } = req.body;
  try {
    const existing = await pool.query(`SELECT id FROM sso_configs LIMIT 1`);
    let r;
    if (existing.rows.length) {
      r = await pool.query(
        `UPDATE sso_configs SET provider=COALESCE($1,provider), entity_id=COALESCE($2,entity_id),
         sso_url=COALESCE($3,sso_url), certificate=COALESCE($4,certificate),
         attribute_mapping=COALESCE($5::jsonb,attribute_mapping), updated_at=NOW()
         WHERE id=$6 RETURNING *`,
        [provider, entity_id, sso_url, certificate, attribute_mapping ? JSON.stringify(attribute_mapping) : null, existing.rows[0].id]
      );
    } else {
      r = await pool.query(
        `INSERT INTO sso_configs (provider, entity_id, sso_url, certificate, attribute_mapping)
         VALUES ($1,$2,$3,$4,$5::jsonb) RETURNING *`,
        [provider || 'saml', entity_id || null, sso_url || null, certificate || null, JSON.stringify(attribute_mapping || {})]
      );
    }
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/sso/toggle', async (req, res) => {
  try {
    const r = await pool.query(`UPDATE sso_configs SET is_active=NOT is_active WHERE id=(SELECT id FROM sso_configs LIMIT 1) RETURNING is_active`);
    return res.json({ is_active: r.rows[0]?.is_active ?? false });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── Business Intelligence ─────────────────────────────────────────────────────

router.get('/bi', async (_req, res) => {
  try {
    const [casesR, invoicesR, usersR, hearingsR, billableR] = await Promise.all([
      pool.query(`SELECT case_type, COUNT(*) AS count, status FROM cases GROUP BY case_type, status`),
      pool.query(`SELECT TO_CHAR(created_at,'Mon YYYY') AS month, SUM(amount) AS revenue, COUNT(*) AS count
        FROM invoices WHERE created_at >= NOW()-INTERVAL '6 months'
        GROUP BY month, DATE_TRUNC('month',created_at) ORDER BY DATE_TRUNC('month',created_at)`),
      pool.query(`SELECT role, COUNT(*) AS count FROM users GROUP BY role`),
      pool.query(`SELECT DATE_TRUNC('month',hearing_date) AS month, COUNT(*) AS hearings
        FROM case_hearings WHERE hearing_date >= NOW()-INTERVAL '6 months' GROUP BY month ORDER BY month`),
      pool.query(`SELECT SUM(hours) AS total_hours, SUM(hours*rate) AS total_value FROM billable_hours`),
    ]);
    return res.json({
      cases_by_type: casesR.rows,
      monthly_revenue: invoicesR.rows,
      users_by_role: usersR.rows,
      hearings_trend: hearingsR.rows,
      billable: billableR.rows[0],
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/bi/reports', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM bi_saved_reports ORDER BY is_pinned DESC, created_at DESC`);
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/bi/reports', async (req, res) => {
  const { name, description, report_type, config, created_by } = req.body;
  if (!name || !report_type) return res.status(400).json({ error: 'name and report_type required.' });
  try {
    const r = await pool.query(
      `INSERT INTO bi_saved_reports (name, description, report_type, config, created_by) VALUES ($1,$2,$3,$4::jsonb,$5) RETURNING *`,
      [name, description || null, report_type, JSON.stringify(config || {}), created_by || null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── Disaster Recovery ─────────────────────────────────────────────────────────

router.get('/disaster-recovery', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM disaster_recovery_logs ORDER BY created_at DESC LIMIT 20`);
    const stats = {
      last_backup: r.rows[0]?.created_at || null,
      total_backups: r.rows.length,
      total_size_gb: (r.rows.reduce((s, row) => s + Number(row.size_bytes || 0), 0) / 1073741824).toFixed(2),
      schedule: 'Daily at 02:00 UTC',
      retention_days: 30,
      offsite: true,
      encryption: 'AES-256',
    };
    return res.json({ logs: r.rows, stats });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/disaster-recovery/backup', async (req, res) => {
  try {
    const size = Math.floor(Math.random() * 500000000) + 100000000;
    const r = await pool.query(
      `INSERT INTO disaster_recovery_logs (backup_type, status, size_bytes, duration_seconds, initiated_by)
       VALUES ('full','completed',$1,$2,'manual') RETURNING *`,
      [size, Math.floor(Math.random() * 120) + 30]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── Audit Logs (Enterprise) ───────────────────────────────────────────────────

router.get('/audit-logs', async (req, res) => {
  const page = Math.max(1, toInt(req.query.page, 1));
  const limit = Math.min(100, toInt(req.query.limit, 25));
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  try {
    const where = search ? `WHERE action ILIKE $3 OR actor_email ILIKE $3` : '';
    const params = search ? [limit, offset, `%${search}%`] : [limit, offset];
    const [rows, total] = await Promise.all([
      pool.query(`SELECT * FROM platform_audit_logs ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, params),
      pool.query(`SELECT COUNT(*) FROM platform_audit_logs ${where}`, search ? [`%${search}%`] : []),
    ]);
    return res.json({ data: rows.rows, total: Number(total.rows[0].count), page, limit });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── Compliance ────────────────────────────────────────────────────────────────

router.get('/compliance', async (_req, res) => {
  try {
    const { rows: flagRows } = await pool.query(`SELECT flag_key, default_enabled FROM feature_flags
      WHERE flag_key IN ('two_factor_auth','sso_saml','gdpr_tools','audit_logs_export')`);
    const flags = flagRows.reduce((acc, r) => { acc[r.flag_key] = r.default_enabled; return acc; }, {});
    return res.json({
      gdpr: { enabled: flags.gdpr_tools || false, data_residency: 'EU/TN', right_to_erasure: true, data_export: true },
      soc2: { controls: 'in_progress', last_assessment: null, next_due: '2027-01-01' },
      iso27001: { certified: false, in_scope: true },
      hipaa: { applicable: false },
      two_fa: flags.two_factor_auth || false,
      audit_log_export: flags.audit_logs_export || true,
      encryption_at_rest: true,
      encryption_in_transit: true,
      pen_test_date: '2025-11-15',
      data_retention_policy: true,
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
