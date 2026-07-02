const express = require('express');
const pool = require('../db');

const router = express.Router();

function toInt(v, fb = null) { const n = Number.parseInt(v, 10); return Number.isNaN(n) ? fb : n; }
function toDate(v) { return v || new Date().toISOString().slice(0, 10); }

// ─── Appointments ─────────────────────────────────────────────────────────────

router.get('/appointments', async (req, res) => {
  const userId = toInt(req.query.user_id);
  try {
    const r = await pool.query(
      `SELECT a.*, c.full_name AS client_name, u.full_name AS staff_name
       FROM appointments a
       LEFT JOIN clients c ON c.id = a.client_id
       LEFT JOIN users u ON u.id = a.user_id
       ${userId ? 'WHERE a.user_id=$1' : ''}
       ORDER BY a.appointment_date ASC`,
      userId ? [userId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/appointments', async (req, res) => {
  const { client_id, user_id, title, appointment_date, duration_minutes, location, appointment_type, notes } = req.body;
  if (!title || !appointment_date) return res.status(400).json({ error: 'title and appointment_date required.' });
  try {
    const r = await pool.query(
      `INSERT INTO appointments (client_id, user_id, title, appointment_date, duration_minutes, location, appointment_type, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [client_id||null, user_id||null, title, appointment_date, duration_minutes||60, location||null, appointment_type||'consultation', notes||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/appointments/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { title, appointment_date, status, notes, duration_minutes, location } = req.body;
  try {
    const r = await pool.query(
      `UPDATE appointments SET title=COALESCE($1,title), appointment_date=COALESCE($2,appointment_date),
       status=COALESCE($3,status), notes=COALESCE($4,notes),
       duration_minutes=COALESCE($5,duration_minutes), location=COALESCE($6,location)
       WHERE id=$7 RETURNING *`,
      [title, appointment_date, status, notes, duration_minutes, location, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/appointments/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try { await pool.query(`DELETE FROM appointments WHERE id=$1`, [id]); return res.json({ success: true }); }
  catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Visitors ─────────────────────────────────────────────────────────────────

router.get('/visitors', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  try {
    const r = await pool.query(
      `SELECT v.*, u.full_name AS host_name FROM visitors v
       LEFT JOIN users u ON u.id = v.host_user_id
       WHERE v.check_in_at::date = $1::date
       ORDER BY v.check_in_at DESC`,
      [date]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/visitors', async (req, res) => {
  const { full_name, company, phone, email, purpose, host_user_id } = req.body;
  if (!full_name) return res.status(400).json({ error: 'full_name required.' });
  try {
    const countR = await pool.query(`SELECT COUNT(*)+1 AS badge FROM visitors WHERE check_in_at::date = CURRENT_DATE`);
    const badge = String(countR.rows[0].badge).padStart(4, '0');
    const r = await pool.query(
      `INSERT INTO visitors (full_name, company, phone, email, purpose, host_user_id, badge_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [full_name, company||null, phone||null, email||null, purpose||null, host_user_id||null, badge]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/visitors/:id/checkout', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const r = await pool.query(
      `UPDATE visitors SET check_out_at=NOW(), status='checked_out' WHERE id=$1 RETURNING *`, [id]
    );
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Intake Forms ─────────────────────────────────────────────────────────────

router.get('/intake-forms', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT f.*, c.full_name AS client_name, u.full_name AS submitted_by_name
       FROM intake_forms f LEFT JOIN clients c ON c.id=f.client_id
       LEFT JOIN users u ON u.id=f.submitted_by
       ORDER BY f.created_at DESC`
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/intake-forms', async (req, res) => {
  const { client_id, form_type, submitted_by, data } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO intake_forms (client_id, form_type, submitted_by, data, status)
       VALUES ($1,$2,$3,$4::jsonb,'submitted') RETURNING *`,
      [client_id||null, form_type||'new_client', submitted_by||null, JSON.stringify(data||{})]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Queue ────────────────────────────────────────────────────────────────────

router.get('/queue', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT q.*, v.full_name AS visitor_name, v.purpose, u.full_name AS assigned_to_name
       FROM queue_entries q
       LEFT JOIN visitors v ON v.id=q.visitor_id
       LEFT JOIN users u ON u.id=q.assigned_to
       WHERE q.status IN ('waiting','called')
       ORDER BY q.created_at ASC`
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/queue', async (req, res) => {
  const { visitor_id, service_type, assigned_to } = req.body;
  if (!visitor_id) return res.status(400).json({ error: 'visitor_id required.' });
  try {
    const numR = await pool.query(`SELECT COALESCE(MAX(queue_number),0)+1 AS n FROM queue_entries WHERE created_at::date=CURRENT_DATE`);
    const r = await pool.query(
      `INSERT INTO queue_entries (visitor_id, queue_number, service_type, assigned_to)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [visitor_id, numR.rows[0].n, service_type||'consultation', assigned_to||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/queue/:id/call', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const r = await pool.query(`UPDATE queue_entries SET status='called', called_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/queue/:id/serve', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const r = await pool.query(`UPDATE queue_entries SET status='served', served_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Filing Checklists ────────────────────────────────────────────────────────

router.get('/checklists', async (req, res) => {
  const caseId = toInt(req.query.case_id);
  try {
    const [clR, itemsR] = await Promise.all([
      pool.query(
        `SELECT fc.*, c.title AS case_title, u.full_name AS creator_name
         FROM filing_checklists fc LEFT JOIN cases c ON c.id=fc.case_id
         LEFT JOIN users u ON u.id=fc.created_by
         ${caseId ? 'WHERE fc.case_id=$1' : ''} ORDER BY fc.created_at DESC`,
        caseId ? [caseId] : []
      ),
      pool.query(`SELECT * FROM filing_checklist_items ORDER BY checklist_id, sort_order ASC`),
    ]);
    const checklists = clR.rows.map(cl => ({
      ...cl,
      items: itemsR.rows.filter(i => i.checklist_id === cl.id),
    }));
    return res.json(checklists);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/checklists', async (req, res) => {
  const { case_id, created_by, title, court, filing_deadline, items } = req.body;
  if (!created_by || !title) return res.status(400).json({ error: 'created_by and title required.' });
  try {
    const r = await pool.query(
      `INSERT INTO filing_checklists (case_id, created_by, title, court, filing_deadline)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [case_id||null, created_by, title, court||null, filing_deadline||null]
    );
    const cl = r.rows[0];
    if (Array.isArray(items)) {
      for (let i = 0; i < items.length; i++) {
        await pool.query(
          `INSERT INTO filing_checklist_items (checklist_id, label, is_required, sort_order) VALUES ($1,$2,$3,$4)`,
          [cl.id, items[i].label, items[i].is_required !== false, i + 1]
        );
      }
    }
    return res.status(201).json(cl);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/checklists/items/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { is_done, notes } = req.body;
  try {
    const r = await pool.query(
      `UPDATE filing_checklist_items SET is_done=COALESCE($1,is_done),
       done_at=CASE WHEN $1=TRUE THEN NOW() ELSE done_at END,
       notes=COALESCE($2,notes) WHERE id=$3 RETURNING *`,
      [is_done, notes, id]
    );
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Email Templates ──────────────────────────────────────────────────────────

router.get('/email-templates', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM email_templates ORDER BY category ASC, name ASC`);
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/email-templates', async (req, res) => {
  const { name, subject, body, category, variables } = req.body;
  if (!name || !subject || !body) return res.status(400).json({ error: 'name, subject and body required.' });
  try {
    const r = await pool.query(
      `INSERT INTO email_templates (name, subject, body, category, variables)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, subject, body, category||'general', variables||[]]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/email-templates/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { name, subject, body, category } = req.body;
  try {
    const r = await pool.query(
      `UPDATE email_templates SET name=COALESCE($1,name), subject=COALESCE($2,subject),
       body=COALESCE($3,body), category=COALESCE($4,category) WHERE id=$5 RETURNING *`,
      [name, subject, body, category, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/email-templates/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try { await pool.query(`DELETE FROM email_templates WHERE id=$1`, [id]); return res.json({ success: true }); }
  catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── SMS Reminders ────────────────────────────────────────────────────────────

router.get('/sms-reminders', async (req, res) => {
  const status = req.query.status;
  try {
    const r = await pool.query(
      `SELECT sr.*, u.full_name AS created_by_name FROM sms_reminders sr
       LEFT JOIN users u ON u.id=sr.created_by
       ${status ? 'WHERE sr.status=$1' : ''}
       ORDER BY sr.send_at DESC`,
      status ? [status] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/sms-reminders', async (req, res) => {
  const { recipient_phone, recipient_name, message, send_at, related_type, related_id, created_by } = req.body;
  if (!recipient_phone || !message || !send_at) {
    return res.status(400).json({ error: 'recipient_phone, message and send_at required.' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO sms_reminders (recipient_phone, recipient_name, message, send_at, related_type, related_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [recipient_phone, recipient_name||null, message, send_at, related_type||null, related_id||null, created_by||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/sms-reminders/:id/cancel', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`UPDATE sms_reminders SET status='cancelled' WHERE id=$1`, [id]);
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Contacts ─────────────────────────────────────────────────────────────────

router.get('/contacts', async (req, res) => {
  const search = req.query.search;
  try {
    const r = await pool.query(
      `SELECT * FROM contacts
       ${search ? "WHERE full_name ILIKE $1 OR company ILIKE $1 OR email ILIKE $1" : ''}
       ORDER BY is_starred DESC, full_name ASC`,
      search ? [`%${search}%`] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/contacts', async (req, res) => {
  const { full_name, company, email, phone, mobile, role, address, notes } = req.body;
  if (!full_name) return res.status(400).json({ error: 'full_name required.' });
  try {
    const r = await pool.query(
      `INSERT INTO contacts (full_name, company, email, phone, mobile, role, address, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [full_name, company||null, email||null, phone||null, mobile||null, role||'contact', address||null, notes||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/contacts/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { full_name, company, email, phone, mobile, address, notes, is_starred } = req.body;
  try {
    const r = await pool.query(
      `UPDATE contacts SET full_name=COALESCE($1,full_name), company=COALESCE($2,company),
       email=COALESCE($3,email), phone=COALESCE($4,phone), mobile=COALESCE($5,mobile),
       address=COALESCE($6,address), notes=COALESCE($7,notes), is_starred=COALESCE($8,is_starred)
       WHERE id=$9 RETURNING *`,
      [full_name, company, email, phone, mobile, address, notes, is_starred, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.delete('/contacts/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try { await pool.query(`DELETE FROM contacts WHERE id=$1`, [id]); return res.json({ success: true }); }
  catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Research Notes ───────────────────────────────────────────────────────────

router.get('/research-notes', async (req, res) => {
  const userId = toInt(req.query.user_id);
  try {
    const r = await pool.query(
      `SELECT rn.*, u.full_name AS user_name, c.title AS case_title
       FROM research_notes rn LEFT JOIN users u ON u.id=rn.user_id
       LEFT JOIN cases c ON c.id=rn.case_id
       ${userId ? 'WHERE rn.user_id=$1' : ''} ORDER BY rn.updated_at DESC`,
      userId ? [userId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/research-notes', async (req, res) => {
  const { case_id, user_id, title, content, sources, tags } = req.body;
  if (!user_id || !title) return res.status(400).json({ error: 'user_id and title required.' });
  try {
    const r = await pool.query(
      `INSERT INTO research_notes (case_id, user_id, title, content, sources, tags)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [case_id||null, user_id, title, content||null, sources||[], tags||[]]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/research-notes/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { title, content, sources, tags } = req.body;
  try {
    const r = await pool.query(
      `UPDATE research_notes SET title=COALESCE($1,title), content=COALESCE($2,content),
       sources=COALESCE($3,sources), tags=COALESCE($4,tags), updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [title, content, sources, tags, id]
    );
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Trust Accounts ───────────────────────────────────────────────────────────

router.get('/trust-accounts', async (_req, res) => {
  try {
    const [accountsR, txR] = await Promise.all([
      pool.query(`SELECT ta.*, c.full_name AS client_name, cs.title AS case_title
                 FROM trust_accounts ta LEFT JOIN clients c ON c.id=ta.client_id
                 LEFT JOIN cases cs ON cs.id=ta.case_id ORDER BY ta.created_at DESC`),
      pool.query(`SELECT * FROM trust_transactions ORDER BY transaction_date DESC, created_at DESC LIMIT 50`),
    ]);
    return res.json({ accounts: accountsR.rows, recent_transactions: txR.rows });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/trust-transactions', async (req, res) => {
  const { trust_account_id, transaction_type, amount, description, reference, recorded_by } = req.body;
  if (!trust_account_id || !transaction_type || !amount) {
    return res.status(400).json({ error: 'trust_account_id, transaction_type, and amount required.' });
  }
  try {
    const accR = await pool.query(`SELECT balance FROM trust_accounts WHERE id=$1`, [trust_account_id]);
    if (!accR.rows.length) return res.status(404).json({ error: 'Trust account not found.' });
    const currentBalance = Number(accR.rows[0].balance);
    const amt = Number(amount);
    const newBalance = transaction_type === 'deposit' ? currentBalance + amt : currentBalance - amt;
    await pool.query(`UPDATE trust_accounts SET balance=$1 WHERE id=$2`, [newBalance, trust_account_id]);
    const r = await pool.query(
      `INSERT INTO trust_transactions (trust_account_id, transaction_type, amount, description, reference, balance_after, recorded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [trust_account_id, transaction_type, amt, description||null, reference||null, newBalance, recorded_by||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Payroll ──────────────────────────────────────────────────────────────────

router.get('/payroll', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.*, u.full_name AS employee_name, u.role AS employee_role
       FROM payroll p LEFT JOIN users u ON u.id=p.user_id
       ORDER BY p.pay_period_start DESC`
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/payroll', async (req, res) => {
  const { user_id, pay_period_start, pay_period_end, base_salary, bonus, deductions, notes } = req.body;
  if (!user_id || !pay_period_start || !pay_period_end || base_salary === undefined) {
    return res.status(400).json({ error: 'user_id, pay_period_start, pay_period_end, base_salary required.' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO payroll (user_id, pay_period_start, pay_period_end, base_salary, bonus, deductions, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [user_id, pay_period_start, pay_period_end, base_salary, bonus||0, deductions||0, notes||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/payroll/:id/pay', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const r = await pool.query(
      `UPDATE payroll SET status='paid', paid_at=NOW() WHERE id=$1 RETURNING *`, [id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Finance Dashboard ────────────────────────────────────────────────────────

router.get('/finance-summary', async (_req, res) => {
  try {
    const [invoicesR, expensesR, trustR, payrollR, monthlyR] = await Promise.all([
      pool.query(`SELECT
        COALESCE(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END),0) AS paid,
        COALESCE(SUM(CASE WHEN status='pending' THEN amount ELSE 0 END),0) AS pending,
        COALESCE(SUM(CASE WHEN status='overdue' THEN amount ELSE 0 END),0) AS overdue,
        COUNT(*) AS total_count FROM invoices`),
      pool.query(`SELECT COALESCE(SUM(amount),0) AS total_expenses FROM invoices WHERE status='paid' AND created_at >= DATE_TRUNC('month', NOW())`),
      pool.query(`SELECT COALESCE(SUM(balance),0) AS total_trust FROM trust_accounts WHERE status='active'`),
      pool.query(`SELECT COALESCE(SUM(net_pay),0) AS total_payroll FROM payroll WHERE status='paid' AND created_at >= DATE_TRUNC('month', NOW())`),
      pool.query(`SELECT TO_CHAR(created_at,'Mon YYYY') AS month,
        SUM(CASE WHEN status='paid' THEN amount ELSE 0 END) AS revenue,
        COUNT(*) AS invoice_count
        FROM invoices WHERE created_at >= NOW()-INTERVAL '6 months'
        GROUP BY month, DATE_TRUNC('month',created_at) ORDER BY DATE_TRUNC('month',created_at) ASC`),
    ]);
    return res.json({
      invoices: invoicesR.rows[0],
      expenses_this_month: expensesR.rows[0].total_expenses,
      trust_balance: trustR.rows[0].total_trust,
      payroll_this_month: payrollR.rows[0].total_payroll,
      monthly: monthlyR.rows,
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
