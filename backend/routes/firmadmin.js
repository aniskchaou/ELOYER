const express = require('express');
const crypto = require('crypto');
const pool = require('../db');

const router = express.Router();

function toInt(v, fallback = null) {
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

// ─── Firm Admin Dashboard ─────────────────────────────────────────────────────

router.get('/dashboard', async (_req, res) => {
  try {
    const [usersR, casesR, clientsR, invoicesR, tasksR] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total, role FROM users GROUP BY role`),
      pool.query(`SELECT COUNT(*) AS total, status FROM cases GROUP BY status`),
      pool.query(`SELECT COUNT(*) AS total FROM clients`),
      pool.query(`SELECT
        COALESCE(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END),0) AS paid,
        COALESCE(SUM(CASE WHEN status='pending' THEN amount ELSE 0 END),0) AS pending
        FROM invoices`),
      pool.query(`SELECT COUNT(*) AS total, status FROM task_items GROUP BY status`),
    ]);

    return res.json({
      staff: usersR.rows,
      cases: casesR.rows,
      totalClients: clientsR.rows[0].total,
      revenue: invoicesR.rows[0],
      tasks: tasksR.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Firm Profile ─────────────────────────────────────────────────────────────

router.get('/profile', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM firm_profile ORDER BY id ASC LIMIT 1`);
    return res.json(r.rows[0] || {});
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/profile', async (req, res) => {
  const { name, tagline, email, phone, address, website, bar_number, founded_year, specializations } = req.body;
  try {
    const existing = await pool.query(`SELECT id FROM firm_profile LIMIT 1`);
    let result;
    if (existing.rows.length) {
      result = await pool.query(
        `UPDATE firm_profile SET
           name = COALESCE($1, name), tagline = COALESCE($2, tagline), email = COALESCE($3, email),
           phone = COALESCE($4, phone), address = COALESCE($5, address), website = COALESCE($6, website),
           bar_number = COALESCE($7, bar_number), founded_year = COALESCE($8, founded_year),
           specializations = COALESCE($9, specializations), updated_at = NOW()
         WHERE id = $10 RETURNING *`,
        [name, tagline, email, phone, address, website, bar_number, founded_year, specializations, existing.rows[0].id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO firm_profile (name, tagline, email, phone, address, website, bar_number, founded_year, specializations)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [name, tagline, email, phone, address, website, bar_number, founded_year, specializations || []]
      );
    }
    return res.json(result.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Departments ──────────────────────────────────────────────────────────────

router.get('/departments', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT d.*, u.full_name AS head_name,
              (SELECT COUNT(*) FROM users WHERE role NOT IN ('admin','superadmin')) AS member_count
       FROM departments d LEFT JOIN users u ON u.id = d.head_user_id ORDER BY d.name ASC`
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/departments', async (req, res) => {
  const { name, description, head_user_id } = req.body;
  if (!name) return res.status(400).json({ error: 'name required.' });
  try {
    const r = await pool.query(
      `INSERT INTO departments (name, description, head_user_id) VALUES ($1,$2,$3) RETURNING *`,
      [name, description || null, head_user_id || null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/departments/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { name, description, head_user_id } = req.body;
  try {
    const r = await pool.query(
      `UPDATE departments SET name=COALESCE($1,name), description=COALESCE($2,description),
       head_user_id=COALESCE($3,head_user_id) WHERE id=$4 RETURNING *`,
      [name, description, head_user_id, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/departments/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`DELETE FROM departments WHERE id=$1`, [id]);
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Office Locations ─────────────────────────────────────────────────────────

router.get('/locations', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM office_locations ORDER BY is_hq DESC, name ASC`);
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/locations', async (req, res) => {
  const { name, address, city, country, phone, is_hq } = req.body;
  if (!name) return res.status(400).json({ error: 'name required.' });
  try {
    if (is_hq) await pool.query(`UPDATE office_locations SET is_hq=FALSE`);
    const r = await pool.query(
      `INSERT INTO office_locations (name, address, city, country, phone, is_hq)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, address || null, city || null, country || 'TN', phone || null, !!is_hq]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/locations/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { name, address, city, country, phone, is_hq } = req.body;
  try {
    if (is_hq) await pool.query(`UPDATE office_locations SET is_hq=FALSE WHERE id<>$1`, [id]);
    const r = await pool.query(
      `UPDATE office_locations SET name=COALESCE($1,name), address=COALESCE($2,address),
       city=COALESCE($3,city), country=COALESCE($4,country), phone=COALESCE($5,phone),
       is_hq=COALESCE($6,is_hq) WHERE id=$7 RETURNING *`,
      [name, address, city, country, phone, is_hq, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/locations/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`DELETE FROM office_locations WHERE id=$1`, [id]);
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Staff Invitations ────────────────────────────────────────────────────────

router.get('/invitations', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT si.*, u.full_name AS invited_by_name, d.name AS department_name
       FROM staff_invitations si
       LEFT JOIN users u ON u.id = si.invited_by
       LEFT JOIN departments d ON d.id = si.department_id
       ORDER BY si.created_at DESC`
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/invitations', async (req, res) => {
  const { email, role, invited_by, department_id } = req.body;
  if (!email) return res.status(400).json({ error: 'email required.' });
  const token = crypto.randomBytes(32).toString('hex');
  try {
    const r = await pool.query(
      `INSERT INTO staff_invitations (email, role, invited_by, department_id, token)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [email, role || 'lawyer', invited_by || null, department_id || null, token]
    );
    return res.status(201).json({ ...r.rows[0], invite_link: `/invite/accept?token=${token}` });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Invitation already sent to this email.' });
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/invitations/:id/resend', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const newToken = crypto.randomBytes(32).toString('hex');
  try {
    await pool.query(
      `UPDATE staff_invitations SET token=$1, status='pending',
       expires_at=NOW()+INTERVAL '7 days' WHERE id=$2`,
      [newToken, id]
    );
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/invitations/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`DELETE FROM staff_invitations WHERE id=$1`, [id]);
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Workflows ────────────────────────────────────────────────────────────────

router.get('/workflows', async (_req, res) => {
  try {
    const [wfR, stepsR] = await Promise.all([
      pool.query(`SELECT w.*, u.full_name AS creator FROM workflows w LEFT JOIN users u ON u.id=w.created_by ORDER BY w.created_at DESC`),
      pool.query(`SELECT * FROM workflow_steps ORDER BY workflow_id ASC, step_order ASC`),
    ]);
    const workflows = wfR.rows.map(wf => ({
      ...wf,
      steps: stepsR.rows.filter(s => s.workflow_id === wf.id),
    }));
    return res.json(workflows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/workflows', async (req, res) => {
  const { name, description, trigger_event, steps } = req.body;
  if (!name) return res.status(400).json({ error: 'name required.' });
  try {
    const wfR = await pool.query(
      `INSERT INTO workflows (name, description, trigger_event) VALUES ($1,$2,$3) RETURNING *`,
      [name, description || null, trigger_event || null]
    );
    const wf = wfR.rows[0];
    if (Array.isArray(steps)) {
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        await pool.query(
          `INSERT INTO workflow_steps (workflow_id, step_order, step_type, label, config)
           VALUES ($1,$2,$3,$4,$5::jsonb)`,
          [wf.id, i + 1, s.step_type || 'task', s.label, JSON.stringify(s.config || {})]
        );
      }
    }
    return res.status(201).json(wf);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/workflows/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { name, description, trigger_event, is_active } = req.body;
  try {
    const r = await pool.query(
      `UPDATE workflows SET name=COALESCE($1,name), description=COALESCE($2,description),
       trigger_event=COALESCE($3,trigger_event), is_active=COALESCE($4,is_active) WHERE id=$5 RETURNING *`,
      [name, description, trigger_event, is_active, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/workflows/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`DELETE FROM workflows WHERE id=$1`, [id]);
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Pricing Config ───────────────────────────────────────────────────────────

router.get('/pricing', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM pricing_config ORDER BY service_name ASC`);
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/pricing', async (req, res) => {
  const { service_name, billing_type, rate, currency, notes } = req.body;
  if (!service_name) return res.status(400).json({ error: 'service_name required.' });
  try {
    const r = await pool.query(
      `INSERT INTO pricing_config (service_name, billing_type, rate, currency, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [service_name, billing_type || 'hourly', rate || 0, currency || 'TND', notes || null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/pricing/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { service_name, billing_type, rate, currency, notes } = req.body;
  try {
    const r = await pool.query(
      `UPDATE pricing_config SET service_name=COALESCE($1,service_name), billing_type=COALESCE($2,billing_type),
       rate=COALESCE($3,rate), currency=COALESCE($4,currency), notes=COALESCE($5,notes) WHERE id=$6 RETURNING *`,
      [service_name, billing_type, rate, currency, notes, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/pricing/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`DELETE FROM pricing_config WHERE id=$1`, [id]);
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Revenue Analytics ────────────────────────────────────────────────────────

router.get('/revenue', async (_req, res) => {
  try {
    const [monthlyR, byStatusR, topCasesR] = await Promise.all([
      pool.query(`SELECT TO_CHAR(created_at,'Mon YYYY') AS month, SUM(amount) AS total
                 FROM invoices WHERE created_at >= NOW()-INTERVAL '6 months'
                 GROUP BY month, DATE_TRUNC('month',created_at)
                 ORDER BY DATE_TRUNC('month',created_at) ASC`),
      pool.query(`SELECT status, COUNT(*) AS count, COALESCE(SUM(amount),0) AS amount FROM invoices GROUP BY status`),
      pool.query(`SELECT c.title, COALESCE(SUM(i.amount),0) AS revenue
                 FROM cases c LEFT JOIN invoices i ON i.case_id=c.id
                 GROUP BY c.id, c.title ORDER BY revenue DESC LIMIT 5`),
    ]);
    return res.json({
      monthly: monthlyR.rows,
      byStatus: byStatusR.rows,
      topCases: topCasesR.rows,
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Approvals ────────────────────────────────────────────────────────────────

router.get('/approvals', async (req, res) => {
  const status = req.query.status;
  try {
    const r = await pool.query(
      `SELECT a.*, c.title AS case_title,
              rb.full_name AS requested_by_name, ab.full_name AS assigned_to_name
       FROM approvals a
       LEFT JOIN cases c ON c.id = a.case_id
       LEFT JOIN users rb ON rb.id = a.requested_by
       LEFT JOIN users ab ON ab.id = a.assigned_to
       ${status ? 'WHERE a.status=$1' : ''}
       ORDER BY a.created_at DESC`,
      status ? [status] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/approvals', async (req, res) => {
  const { case_id, requested_by, assigned_to, approval_type, title, description } = req.body;
  if (!requested_by || !approval_type || !title) {
    return res.status(400).json({ error: 'requested_by, approval_type and title required.' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO approvals (case_id, requested_by, assigned_to, approval_type, title, description)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [case_id || null, requested_by, assigned_to || null, approval_type, title, description || null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/approvals/:id/decide', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { decision, decision_notes } = req.body;
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be approved or rejected.' });
  }
  try {
    const r = await pool.query(
      `UPDATE approvals SET status=$1, decision=$1, decision_notes=$2, decided_at=NOW()
       WHERE id=$3 RETURNING *`,
      [decision, decision_notes || null, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Legal Strategies ─────────────────────────────────────────────────────────

router.get('/strategies', async (req, res) => {
  const caseId = toInt(req.query.case_id);
  try {
    const r = await pool.query(
      `SELECT ls.*, u.full_name AS lawyer_name, c.title AS case_title
       FROM legal_strategies ls
       LEFT JOIN users u ON u.id=ls.lawyer_id
       LEFT JOIN cases c ON c.id=ls.case_id
       ${caseId ? 'WHERE ls.case_id=$1' : ''}
       ORDER BY ls.created_at DESC`,
      caseId ? [caseId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/strategies', async (req, res) => {
  const { case_id, lawyer_id, title, strategy_type, description, strengths, weaknesses, recommendations } = req.body;
  if (!case_id || !lawyer_id || !title) {
    return res.status(400).json({ error: 'case_id, lawyer_id and title required.' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO legal_strategies (case_id, lawyer_id, title, strategy_type, description, strengths, weaknesses, recommendations)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [case_id, lawyer_id, title, strategy_type || 'defense', description || null, strengths || null, weaknesses || null, recommendations || null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/strategies/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { title, strategy_type, description, strengths, weaknesses, recommendations, status } = req.body;
  try {
    const r = await pool.query(
      `UPDATE legal_strategies SET title=COALESCE($1,title), strategy_type=COALESCE($2,strategy_type),
       description=COALESCE($3,description), strengths=COALESCE($4,strengths),
       weaknesses=COALESCE($5,weaknesses), recommendations=COALESCE($6,recommendations),
       status=COALESCE($7,status), updated_at=NOW() WHERE id=$8 RETURNING *`,
      [title, strategy_type, description, strengths, weaknesses, recommendations, status, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Settlements ──────────────────────────────────────────────────────────────

router.get('/settlements', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT s.*, c.title AS case_title, pb.full_name AS proposed_by_name, rb.full_name AS reviewed_by_name
       FROM settlements s
       LEFT JOIN cases c ON c.id=s.case_id
       LEFT JOIN users pb ON pb.id=s.proposed_by
       LEFT JOIN users rb ON rb.id=s.reviewed_by
       ORDER BY s.created_at DESC`
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/settlements', async (req, res) => {
  const { case_id, proposed_by, amount, terms } = req.body;
  if (!case_id || !proposed_by) return res.status(400).json({ error: 'case_id and proposed_by required.' });
  try {
    const r = await pool.query(
      `INSERT INTO settlements (case_id, proposed_by, amount, terms) VALUES ($1,$2,$3,$4) RETURNING *`,
      [case_id, proposed_by, amount || null, terms || null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/settlements/:id/review', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { reviewed_by, status, rejected_reason } = req.body;
  if (!['approved', 'rejected', 'counter_proposed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  try {
    const r = await pool.query(
      `UPDATE settlements SET reviewed_by=$1, status=$2, rejected_reason=$3,
       approved_at=CASE WHEN $2='approved' THEN NOW() ELSE NULL END WHERE id=$4 RETURNING *`,
      [reviewed_by || null, status, rejected_reason || null, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Team Collaboration ───────────────────────────────────────────────────────

router.get('/collaboration/threads', async (req, res) => {
  const caseId = toInt(req.query.case_id);
  try {
    const r = await pool.query(
      `SELECT ct.*, u.full_name AS created_by_name, c.title AS case_title,
              (SELECT COUNT(*) FROM collaboration_messages cm WHERE cm.thread_id=ct.id) AS message_count
       FROM collaboration_threads ct
       LEFT JOIN users u ON u.id=ct.created_by
       LEFT JOIN cases c ON c.id=ct.case_id
       ${caseId ? 'WHERE ct.case_id=$1' : ''}
       ORDER BY ct.created_at DESC`,
      caseId ? [caseId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/collaboration/threads', async (req, res) => {
  const { case_id, title, created_by, participants } = req.body;
  if (!title || !created_by) return res.status(400).json({ error: 'title and created_by required.' });
  try {
    const r = await pool.query(
      `INSERT INTO collaboration_threads (case_id, title, created_by, participants)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [case_id || null, title, created_by, participants || []]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/collaboration/threads/:id/messages', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const r = await pool.query(
      `SELECT cm.*, u.full_name AS sender_name FROM collaboration_messages cm
       LEFT JOIN users u ON u.id=cm.sender_id
       WHERE cm.thread_id=$1 ORDER BY cm.created_at ASC`,
      [id]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/collaboration/threads/:id/messages', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { sender_id, body } = req.body;
  if (!sender_id || !body) return res.status(400).json({ error: 'sender_id and body required.' });
  try {
    const r = await pool.query(
      `INSERT INTO collaboration_messages (thread_id, sender_id, body) VALUES ($1,$2,$3) RETURNING *`,
      [id, sender_id, body]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Pleadings ────────────────────────────────────────────────────────────────

router.get('/pleadings', async (req, res) => {
  const caseId = toInt(req.query.case_id);
  try {
    const r = await pool.query(
      `SELECT p.*, u.full_name AS lawyer_name, c.title AS case_title
       FROM pleadings p
       LEFT JOIN users u ON u.id=p.lawyer_id
       LEFT JOIN cases c ON c.id=p.case_id
       ${caseId ? 'WHERE p.case_id=$1' : ''}
       ORDER BY p.created_at DESC`,
      caseId ? [caseId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/pleadings', async (req, res) => {
  const { case_id, lawyer_id, title, pleading_type, content } = req.body;
  if (!case_id || !lawyer_id || !title) {
    return res.status(400).json({ error: 'case_id, lawyer_id and title required.' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO pleadings (case_id, lawyer_id, title, pleading_type, content)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [case_id, lawyer_id, title, pleading_type || 'motion', content || null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/pleadings/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { title, pleading_type, content, status } = req.body;
  try {
    const r = await pool.query(
      `UPDATE pleadings SET title=COALESCE($1,title), pleading_type=COALESCE($2,pleading_type),
       content=COALESCE($3,content), status=COALESCE($4,status), updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [title, pleading_type, content, status, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── OCR Documents ────────────────────────────────────────────────────────────

router.get('/ocr', async (req, res) => {
  const lawyerId = toInt(req.query.lawyer_id);
  try {
    const r = await pool.query(
      `SELECT od.*, u.full_name AS uploaded_by_name, c.title AS case_title
       FROM ocr_documents od
       LEFT JOIN users u ON u.id=od.uploaded_by
       LEFT JOIN cases c ON c.id=od.case_id
       ${lawyerId ? 'WHERE od.uploaded_by=$1' : ''}
       ORDER BY od.created_at DESC`,
      lawyerId ? [lawyerId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/ocr', async (req, res) => {
  const { case_id, uploaded_by, original_filename, language } = req.body;
  if (!uploaded_by || !original_filename) {
    return res.status(400).json({ error: 'uploaded_by and original_filename required.' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO ocr_documents (case_id, uploaded_by, original_filename, language, status)
       VALUES ($1,$2,$3,$4,'processing') RETURNING *`,
      [case_id || null, uploaded_by, original_filename, language || 'fr']
    );
    // Simulate OCR extraction result
    setTimeout(async () => {
      const mockText = `[OCR RESULT] Extracted from ${original_filename}.\n\nParties: Monsieur Ahmed Ben Ali (Demandeur) contre Société ABC SARL (Défendeur).\n\nFaits: Le contrat signé le 15 janvier 2025 stipule une livraison dans les 30 jours.\n\nDemandes: Indemnisation de 5000 TND pour préjudice subi.`;
      await pool.query(`UPDATE ocr_documents SET extracted_text=$1, status='completed' WHERE id=$2`, [mockText, r.rows[0].id]).catch(() => {});
    }, 2000);
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── AI Drafts ────────────────────────────────────────────────────────────────

router.get('/ai-drafts', async (req, res) => {
  const lawyerId = toInt(req.query.lawyer_id);
  try {
    const r = await pool.query(
      `SELECT ad.*, u.full_name AS lawyer_name, c.title AS case_title
       FROM ai_drafts ad
       LEFT JOIN users u ON u.id=ad.lawyer_id
       LEFT JOIN cases c ON c.id=ad.case_id
       ${lawyerId ? 'WHERE ad.lawyer_id=$1' : ''}
       ORDER BY ad.created_at DESC`,
      lawyerId ? [lawyerId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/ai-drafts', async (req, res) => {
  const { case_id, lawyer_id, draft_type, prompt } = req.body;
  if (!lawyer_id || !draft_type || !prompt) {
    return res.status(400).json({ error: 'lawyer_id, draft_type and prompt required.' });
  }
  const templates = {
    contract: `CONTRAT DE PRESTATION DE SERVICES\n\nEntre les soussignés :\n- [PARTIE A] …\n- [PARTIE B] …\n\nIl est convenu ce qui suit :\n\nArticle 1 – Objet\n${prompt}\n\nArticle 2 – Durée\nLe présent contrat prend effet à la date de signature pour une durée de [DURÉE].\n\nArticle 3 – Rémunération\nLe montant convenu est de [MONTANT] TND.\n\nFait à Tunis, le [DATE]\n\n_____________    _____________\n[PARTIE A]       [PARTIE B]`,
    pleading: `MÉMOIRE EN DÉFENSE\n\nDevant le Tribunal de Première Instance de Tunis\n\nAffaire N° : [NUMÉRO]\n\nPour : [CLIENT]\nContre : [PARTIE ADVERSE]\n\nEn réponse à la requête introductive d'instance, nous exposons :\n\n${prompt}\n\nPar ces motifs, il est demandé au Tribunal de :\n1. Déclarer la requête irrecevable.\n2. À titre subsidiaire, la rejeter.\n3. Condamner le demandeur aux dépens.`,
    letter: `Tunis, le [DATE]\n\nCabinet Cherni & Associés\n12 Rue de la République, Tunis\n\nObjet : ${prompt}\n\nMaître,\n\nNous vous informons par la présente que …\n\nNous demeurons à votre disposition pour tout renseignement complémentaire.\n\nVeuillez agréer, Maître, l'expression de nos salutations distinguées.\n\nMaître Ahmed Cherni\nAvocat au Barreau de Tunis`,
    summary: `RÉSUMÉ JURIDIQUE\n\nDossier : [RÉFÉRENCE]\n\nContexte :\n${prompt}\n\nAnalyse :\nAu regard des éléments factuels et du droit applicable, la situation se caractérise par :\n1. …\n2. …\n3. …\n\nConclusion :\nIl est recommandé de …`,
  };
  const content = templates[draft_type] || `Brouillon AI (${draft_type})\n\n${prompt}\n\n[Contenu généré automatiquement]`;
  try {
    const r = await pool.query(
      `INSERT INTO ai_drafts (case_id, lawyer_id, draft_type, prompt, generated_content, status)
       VALUES ($1,$2,$3,$4,$5,'generated') RETURNING *`,
      [case_id || null, lawyer_id, draft_type, prompt, content]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/ai-drafts/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { edited_content, status } = req.body;
  try {
    const r = await pool.query(
      `UPDATE ai_drafts SET edited_content=COALESCE($1,edited_content),
       status=COALESCE($2,status) WHERE id=$3 RETURNING *`,
      [edited_content, status, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Deadlines ────────────────────────────────────────────────────────────────

router.get('/deadlines', async (req, res) => {
  const lawyerId = toInt(req.query.lawyer_id);
  try {
    const r = await pool.query(
      `SELECT d.*, u.full_name AS lawyer_name, c.title AS case_title
       FROM deadlines d
       LEFT JOIN users u ON u.id=d.lawyer_id
       LEFT JOIN cases c ON c.id=d.case_id
       ${lawyerId ? 'WHERE d.lawyer_id=$1' : ''}
       ORDER BY d.deadline_date ASC`,
      lawyerId ? [lawyerId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/deadlines', async (req, res) => {
  const { case_id, lawyer_id, title, deadline_date, reminder_days, priority, notes } = req.body;
  if (!lawyer_id || !title || !deadline_date) {
    return res.status(400).json({ error: 'lawyer_id, title and deadline_date required.' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO deadlines (case_id, lawyer_id, title, deadline_date, reminder_days, priority, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [case_id || null, lawyer_id, title, deadline_date, reminder_days || 3, priority || 'normal', notes || null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/deadlines/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { title, deadline_date, status, priority, notes, completed_at } = req.body;
  try {
    const r = await pool.query(
      `UPDATE deadlines SET title=COALESCE($1,title), deadline_date=COALESCE($2,deadline_date),
       status=COALESCE($3,status), priority=COALESCE($4,priority), notes=COALESCE($5,notes),
       completed_at=COALESCE($6,completed_at) WHERE id=$7 RETURNING *`,
      [title, deadline_date, status, priority, notes, completed_at, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Billable Hours ───────────────────────────────────────────────────────────

router.get('/billable-hours', async (req, res) => {
  const lawyerId = toInt(req.query.lawyer_id);
  try {
    const r = await pool.query(
      `SELECT bh.*, u.full_name AS lawyer_name, c.title AS case_title
       FROM billable_hours bh
       LEFT JOIN users u ON u.id=bh.lawyer_id
       LEFT JOIN cases c ON c.id=bh.case_id
       ${lawyerId ? 'WHERE bh.lawyer_id=$1' : ''}
       ORDER BY bh.date DESC`,
      lawyerId ? [lawyerId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/billable-hours', async (req, res) => {
  const { case_id, lawyer_id, date, hours, rate, activity } = req.body;
  if (!lawyer_id || !hours || !activity) {
    return res.status(400).json({ error: 'lawyer_id, hours and activity required.' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO billable_hours (case_id, lawyer_id, date, hours, rate, activity)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [case_id || null, lawyer_id, date || new Date().toISOString().slice(0, 10), hours, rate || 0, activity]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Email Integrations ───────────────────────────────────────────────────────

router.get('/email-integrations', async (req, res) => {
  const userId = toInt(req.query.user_id);
  try {
    const r = await pool.query(
      `SELECT ei.*, u.full_name AS user_name FROM email_integrations ei
       LEFT JOIN users u ON u.id=ei.user_id
       ${userId ? 'WHERE ei.user_id=$1' : ''}
       ORDER BY ei.created_at DESC`,
      userId ? [userId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/email-integrations', async (req, res) => {
  const { user_id, provider, email_address } = req.body;
  if (!user_id || !email_address) {
    return res.status(400).json({ error: 'user_id and email_address required.' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO email_integrations (user_id, provider, email_address)
       VALUES ($1,$2,$3)
       ON CONFLICT DO NOTHING RETURNING *`,
      [user_id, provider || 'gmail', email_address]
    );
    return res.status(201).json(r.rows[0] || { message: 'Already connected.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/email-integrations/:id/toggle', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const r = await pool.query(
      `UPDATE email_integrations SET is_active = NOT is_active WHERE id=$1 RETURNING *`,
      [id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
