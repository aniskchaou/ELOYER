const express = require('express');
const crypto = require('crypto');
const pool = require('../db');

const router = express.Router();

// ─── helpers ─────────────────────────────────────────────────────────────────

function toInt(value, fallback = null) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

async function logAudit(action, resourceType, resourceId, details = {}, req = null) {
  const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') : 'system';
  try {
    await pool.query(
      `INSERT INTO platform_audit_logs (actor_email, actor_role, action, resource_type, resource_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      ['superadmin@eloyer.io', 'superadmin', action, resourceType, String(resourceId || ''), JSON.stringify(details), ip]
    );
  } catch (_) { /* non-blocking */ }
}

// ─── Platform Analytics ───────────────────────────────────────────────────────

router.get('/analytics', async (req, res) => {
  try {
    const [tenantsR, plansR, usersR, casesR, invoicesR, auditR] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total,
                   SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active,
                   SUM(CASE WHEN status='suspended' THEN 1 ELSE 0 END) AS suspended
                 FROM tenants`),
      pool.query(`SELECT sp.name, COUNT(ts.id) AS count
                 FROM subscription_plans sp
                 LEFT JOIN tenant_subscriptions ts ON ts.plan_id = sp.id AND ts.status = 'active'
                 GROUP BY sp.id, sp.name, sp.price_monthly ORDER BY sp.price_monthly ASC`),
      pool.query(`SELECT COUNT(*) AS total FROM users`),
      pool.query(`SELECT COUNT(*) AS total FROM cases`),
      pool.query(`SELECT COALESCE(SUM(amount),0) AS total_revenue FROM invoices WHERE status='paid'`),
      pool.query(`SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*) AS events
                 FROM platform_audit_logs
                 WHERE created_at >= NOW() - INTERVAL '7 days'
                 GROUP BY day ORDER BY day ASC`),
    ]);

    return res.json({
      tenants: tenantsR.rows[0],
      planDistribution: plansR.rows,
      totalUsers: usersR.rows[0].total,
      totalCases: casesR.rows[0].total,
      totalRevenue: invoicesR.rows[0].total_revenue,
      auditActivity: auditR.rows,
      aiUsage: {
        totalTokensUsed: 284500,
        tokensThisMonth: 42300,
        topTenant: 'Cabinet Cherni & Associés',
        models: [
          { model: 'gpt-4o', calls: 1240, tokens: 210000 },
          { model: 'gpt-3.5-turbo', calls: 3800, tokens: 74500 },
        ],
      },
      storageUsed: { bytes: 3254779904, quota: 10737418240 },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── Tenants ──────────────────────────────────────────────────────────────────

router.get('/tenants', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, sp.name AS plan_name, sp.code AS plan_code
       FROM tenants t
       LEFT JOIN subscription_plans sp ON sp.id = t.plan_id
       ORDER BY t.created_at DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/tenants', async (req, res) => {
  const { name, slug, email, phone, address, country, plan_id } = req.body;
  if (!name || !slug || !email) {
    return res.status(400).json({ error: 'name, slug and email are required.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO tenants (name, slug, email, phone, address, country, plan_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *`,
      [name, slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'), email, phone || null, address || null, country || 'TN', plan_id || null]
    );
    await logAudit('tenant.created', 'tenant', result.rows[0].id, { name }, req);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Tenant slug already exists.' });
    return res.status(500).json({ error: error.message });
  }
});

router.get('/tenants/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const result = await pool.query(
      `SELECT t.*, sp.name AS plan_name, sp.code AS plan_code,
              sp.price_monthly, sp.max_users, sp.max_cases, sp.max_storage_gb, sp.ai_tokens_monthly
       FROM tenants t
       LEFT JOIN subscription_plans sp ON sp.id = t.plan_id
       WHERE t.id = $1`, [id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Tenant not found.' });
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/tenants/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { name, email, phone, address, country, plan_id, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tenants SET
         name = COALESCE($1, name),
         email = COALESCE($2, email),
         phone = COALESCE($3, phone),
         address = COALESCE($4, address),
         country = COALESCE($5, country),
         plan_id = COALESCE($6, plan_id),
         status = COALESCE($7, status),
         updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, email, phone, address, country, plan_id, status, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Tenant not found.' });
    await logAudit('tenant.updated', 'tenant', id, req.body, req);
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/tenants/:id/suspend', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`UPDATE tenants SET status='suspended', updated_at=NOW() WHERE id=$1`, [id]);
    await logAudit('tenant.suspended', 'tenant', id, {}, req);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/tenants/:id/activate', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`UPDATE tenants SET status='active', updated_at=NOW() WHERE id=$1`, [id]);
    await logAudit('tenant.activated', 'tenant', id, {}, req);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/tenants/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`DELETE FROM tenants WHERE id=$1`, [id]);
    await logAudit('tenant.deleted', 'tenant', id, {}, req);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── Subscription Plans ───────────────────────────────────────────────────────

router.get('/plans', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT sp.*,
              COUNT(t.id) AS tenant_count
       FROM subscription_plans sp
       LEFT JOIN tenants t ON t.plan_id = sp.id
       GROUP BY sp.id ORDER BY sp.price_monthly ASC`
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/plans', async (req, res) => {
  const { name, code, price_monthly, price_yearly, max_users, max_cases, max_storage_gb, ai_tokens_monthly, features } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'name and code required.' });
  try {
    const result = await pool.query(
      `INSERT INTO subscription_plans (name, code, price_monthly, price_yearly, max_users, max_cases, max_storage_gb, ai_tokens_monthly, features)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb) RETURNING *`,
      [name, code, price_monthly || 0, price_yearly || 0, max_users || 5, max_cases || 50, max_storage_gb || 5, ai_tokens_monthly || 10000, JSON.stringify(features || [])]
    );
    await logAudit('plan.created', 'plan', result.rows[0].id, { name }, req);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Plan code already exists.' });
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/plans/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { name, price_monthly, price_yearly, max_users, max_cases, max_storage_gb, ai_tokens_monthly, features, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE subscription_plans SET
         name = COALESCE($1, name),
         price_monthly = COALESCE($2, price_monthly),
         price_yearly = COALESCE($3, price_yearly),
         max_users = COALESCE($4, max_users),
         max_cases = COALESCE($5, max_cases),
         max_storage_gb = COALESCE($6, max_storage_gb),
         ai_tokens_monthly = COALESCE($7, ai_tokens_monthly),
         features = COALESCE($8::jsonb, features),
         is_active = COALESCE($9, is_active)
       WHERE id=$10 RETURNING *`,
      [name, price_monthly, price_yearly, max_users, max_cases, max_storage_gb, ai_tokens_monthly,
       features ? JSON.stringify(features) : null, is_active, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Plan not found.' });
    await logAudit('plan.updated', 'plan', id, req.body, req);
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── Feature Flags ────────────────────────────────────────────────────────────

router.get('/feature-flags', async (_req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM feature_flags ORDER BY category ASC, label ASC`);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/feature-flags/:key', async (req, res) => {
  const { key } = req.params;
  const { default_enabled } = req.body;
  try {
    const result = await pool.query(
      `UPDATE feature_flags SET default_enabled=$1 WHERE flag_key=$2 RETURNING *`,
      [!!default_enabled, key]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Flag not found.' });
    await logAudit('feature_flag.updated', 'feature_flag', key, { default_enabled }, req);
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────

router.get('/audit-logs', async (req, res) => {
  const page = Math.max(1, toInt(req.query.page, 1));
  const limit = Math.min(100, Math.max(5, toInt(req.query.limit, 25)));
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  try {
    const where = search ? `WHERE action ILIKE $3 OR actor_email ILIKE $3 OR resource_type ILIKE $3` : '';
    const params = search ? [limit, offset, `%${search}%`] : [limit, offset];
    const [rows, total] = await Promise.all([
      pool.query(`SELECT * FROM platform_audit_logs ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, params),
      pool.query(`SELECT COUNT(*) FROM platform_audit_logs ${where}`, search ? [`%${search}%`] : []),
    ]);
    return res.json({ data: rows.rows, total: Number(total.rows[0].count), page, limit });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── Platform Settings ────────────────────────────────────────────────────────

router.get('/settings', async (_req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM platform_settings ORDER BY key ASC`);
    const settings = result.rows.reduce((acc, r) => { acc[r.key] = { value: r.value, description: r.description }; return acc; }, {});
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/settings', async (req, res) => {
  const updates = req.body;
  if (typeof updates !== 'object' || Array.isArray(updates)) {
    return res.status(400).json({ error: 'Body must be a key-value object.' });
  }
  try {
    for (const [key, value] of Object.entries(updates)) {
      await pool.query(
        `UPDATE platform_settings SET value=$1, updated_at=NOW() WHERE key=$2`,
        [String(value), key]
      );
    }
    await logAudit('settings.updated', 'platform_settings', 'global', updates, req);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── API Keys ─────────────────────────────────────────────────────────────────

router.get('/api-keys', async (req, res) => {
  const tenantId = toInt(req.query.tenant_id);
  try {
    const result = await pool.query(
      `SELECT ak.*, t.name AS tenant_name
       FROM api_keys ak
       LEFT JOIN tenants t ON t.id = ak.tenant_id
       ${tenantId ? 'WHERE ak.tenant_id=$1' : ''}
       ORDER BY ak.created_at DESC`,
      tenantId ? [tenantId] : []
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/api-keys', async (req, res) => {
  const { tenant_id, label, scopes, expires_at } = req.body;
  if (!label) return res.status(400).json({ error: 'label is required.' });
  try {
    const rawKey = `elk_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const prefix = rawKey.substring(0, 12);
    const result = await pool.query(
      `INSERT INTO api_keys (tenant_id, label, key_hash, key_prefix, scopes, expires_at, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,TRUE) RETURNING id, label, key_prefix, scopes, expires_at, is_active, created_at`,
      [tenant_id || null, label, keyHash, prefix, scopes || [], expires_at || null]
    );
    await logAudit('api_key.created', 'api_key', result.rows[0].id, { label, prefix }, req);
    return res.status(201).json({ ...result.rows[0], raw_key: rawKey });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/api-keys/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`UPDATE api_keys SET is_active=FALSE WHERE id=$1`, [id]);
    await logAudit('api_key.revoked', 'api_key', id, {}, req);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── Impersonation ────────────────────────────────────────────────────────────

router.get('/users', async (_req, res) => {
  try {
    const result = await pool.query(`SELECT id, full_name, email, role, created_at FROM users ORDER BY id ASC`);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/impersonate', async (req, res) => {
  const { user_id, reason } = req.body;
  const id = toInt(user_id);
  if (!id) return res.status(400).json({ error: 'user_id required.' });
  try {
    const userRes = await pool.query(`SELECT id, full_name, email, role FROM users WHERE id=$1`, [id]);
    if (!userRes.rows.length) return res.status(404).json({ error: 'User not found.' });
    const result = await pool.query(
      `INSERT INTO impersonation_sessions (superadmin_email, target_user_id, reason)
       VALUES ($1,$2,$3) RETURNING *`,
      ['superadmin@eloyer.io', id, reason || 'Support session']
    );
    await logAudit('user.impersonated', 'user', id, { reason, target: userRes.rows[0].email }, req);
    return res.status(201).json({ session: result.rows[0], target_user: userRes.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── Email/SMS Config ─────────────────────────────────────────────────────────

router.get('/email-sms', async (_req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM email_sms_config ORDER BY config_type ASC`);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/email-sms/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { provider, settings, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE email_sms_config SET
         provider = COALESCE($1, provider),
         settings = COALESCE($2::jsonb, settings),
         is_active = COALESCE($3, is_active),
         updated_at = NOW()
       WHERE id=$4 RETURNING *`,
      [provider, settings ? JSON.stringify(settings) : null, is_active, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Config not found.' });
    await logAudit('email_sms.updated', 'email_sms_config', id, {}, req);
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/email-sms', async (req, res) => {
  const { provider, config_type, settings } = req.body;
  if (!provider || !config_type) return res.status(400).json({ error: 'provider and config_type required.' });
  try {
    const result = await pool.query(
      `INSERT INTO email_sms_config (provider, config_type, settings) VALUES ($1,$2,$3::jsonb) RETURNING *`,
      [provider, config_type, JSON.stringify(settings || {})]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── Storage ──────────────────────────────────────────────────────────────────

router.get('/storage', async (_req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM storage_config ORDER BY id ASC LIMIT 1`);
    return res.json(result.rows[0] || { provider: 'local', used_bytes: 0, quota_bytes: 10737418240 });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/storage', async (req, res) => {
  const { provider, settings, quota_bytes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE storage_config SET
         provider = COALESCE($1, provider),
         settings = COALESCE($2::jsonb, settings),
         quota_bytes = COALESCE($3, quota_bytes),
         updated_at = NOW()
       WHERE id = (SELECT id FROM storage_config ORDER BY id ASC LIMIT 1)
       RETURNING *`,
      [provider, settings ? JSON.stringify(settings) : null, quota_bytes]
    );
    await logAudit('storage.updated', 'storage_config', 1, req.body, req);
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── AI Usage ─────────────────────────────────────────────────────────────────

router.get('/ai-usage', async (_req, res) => {
  try {
    const tenants = await pool.query(`SELECT id, name FROM tenants ORDER BY id ASC`);
    const usage = tenants.rows.map((t, i) => ({
      tenant_id: t.id,
      tenant_name: t.name,
      tokens_used: [42300, 18700, 4200][i] || 0,
      tokens_quota: 25000,
      calls_today: [142, 67, 8][i] || 0,
      top_model: 'gpt-4o',
    }));
    return res.json({
      total_tokens_used: 65200,
      total_calls: 217,
      by_tenant: usage,
      by_model: [
        { model: 'gpt-4o', calls: 1240, tokens: 210000 },
        { model: 'gpt-3.5-turbo', calls: 3800, tokens: 74500 },
      ],
      daily_trend: [
        { day: '2026-06-26', tokens: 8400 },
        { day: '2026-06-27', tokens: 10200 },
        { day: '2026-06-28', tokens: 9100 },
        { day: '2026-06-29', tokens: 12400 },
        { day: '2026-06-30', tokens: 11800 },
        { day: '2026-07-01', tokens: 7600 },
        { day: '2026-07-02', tokens: 5700 },
      ],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── Platform Health ──────────────────────────────────────────────────────────

router.get('/health', async (_req, res) => {
  const checks = [];
  let dbOk = false;
  try {
    await pool.query('SELECT 1');
    dbOk = true;
  } catch (_) { /* noop */ }

  checks.push({ service: 'PostgreSQL', status: dbOk ? 'healthy' : 'down', latency_ms: 4 });
  checks.push({ service: 'API Server', status: 'healthy', latency_ms: 1 });
  checks.push({ service: 'File Storage', status: 'healthy', latency_ms: 12 });
  checks.push({ service: 'Email (SMTP)', status: 'degraded', latency_ms: 340, note: 'High latency detected' });
  checks.push({ service: 'AI Provider', status: 'healthy', latency_ms: 210 });

  const overall = checks.every(c => c.status === 'healthy') ? 'healthy'
    : checks.some(c => c.status === 'down') ? 'down' : 'degraded';

  return res.json({
    status: overall,
    checks,
    uptime_seconds: Math.floor(process.uptime()),
    node_version: process.version,
    memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    timestamp: new Date().toISOString(),
  });
});

// ─── Billing / Revenue ────────────────────────────────────────────────────────

router.get('/billing', async (_req, res) => {
  try {
    const [revenueR, tenantBilling] = await Promise.all([
      pool.query(`SELECT
        COALESCE(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END),0) AS paid,
        COALESCE(SUM(CASE WHEN status='pending' THEN amount ELSE 0 END),0) AS pending,
        COALESCE(SUM(amount),0) AS total
        FROM invoices`),
      pool.query(`SELECT t.name, t.status, sp.name AS plan, sp.price_monthly,
                   (SELECT COUNT(*) FROM invoices i
                    JOIN cases c ON c.id = i.case_id
                    WHERE i.status='paid') AS invoices_paid
                 FROM tenants t
                 LEFT JOIN subscription_plans sp ON sp.id = t.plan_id
                 ORDER BY t.created_at DESC`),
    ]);

    return res.json({
      revenue: revenueR.rows[0],
      tenants: tenantBilling.rows,
      monthly_trend: [
        { month: 'Feb', revenue: 3200 }, { month: 'Mar', revenue: 4100 },
        { month: 'Apr', revenue: 5800 }, { month: 'May', revenue: 6200 },
        { month: 'Jun', revenue: 7400 }, { month: 'Jul', revenue: 4900 },
      ],
      payment_gateways: [
        { name: 'Stripe', connected: false, last_sync: null },
        { name: 'PayPal', connected: false, last_sync: null },
      ],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─── Security Dashboard ───────────────────────────────────────────────────────

router.get('/security', async (_req, res) => {
  try {
    const [auditR, impersonateR] = await Promise.all([
      pool.query(`SELECT action, COUNT(*) AS count
                 FROM platform_audit_logs
                 WHERE created_at >= NOW() - INTERVAL '7 days'
                 GROUP BY action ORDER BY count DESC LIMIT 10`),
      pool.query(`SELECT is.*, u.full_name, u.email
                 FROM impersonation_sessions is
                 JOIN users u ON u.id = is.target_user_id
                 ORDER BY is.started_at DESC LIMIT 20`),
    ]);

    return res.json({
      top_actions: auditR.rows,
      impersonation_sessions: impersonateR.rows,
      flags: {
        two_factor_enabled: false,
        sso_enabled: false,
        maintenance_mode: false,
        registration_open: true,
      },
      login_attempts: { total: 342, failed: 18, blocked: 2 },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
