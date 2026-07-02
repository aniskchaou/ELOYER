const express = require('express');
const pool = require('../db');
const router = express.Router();

function toInt(v, fb = null) { const n = Number.parseInt(v, 10); return Number.isNaN(n) ? fb : n; }

// ─── Corporate Dashboard ──────────────────────────────────────────────────────

router.get('/dashboard/:corpId', async (req, res) => {
  const corpId = toInt(req.params.corpId);
  if (!corpId) return res.status(400).json({ error: 'Invalid corpId.' });
  try {
    const [corpR, requestsR, contractsR, approvalsR, spendR] = await Promise.all([
      pool.query(`SELECT * FROM corporate_clients WHERE id=$1`, [corpId]),
      pool.query(`SELECT status, COUNT(*) AS count FROM corporate_legal_requests WHERE corporate_id=$1 GROUP BY status`, [corpId]),
      pool.query(`SELECT status, COUNT(*) AS count FROM corporate_contracts WHERE corporate_id=$1 GROUP BY status`, [corpId]),
      pool.query(`SELECT COUNT(*) AS pending FROM corporate_approvals WHERE corporate_id=$1 AND status='pending'`, [corpId]),
      pool.query(`SELECT COALESCE(SUM(value),0) AS total_value FROM corporate_contracts WHERE corporate_id=$1 AND status='active'`, [corpId]),
    ]);
    return res.json({
      company: corpR.rows[0] || {},
      requests: requestsR.rows,
      contracts: contractsR.rows,
      pending_approvals: approvalsR.rows[0].pending,
      active_contract_value: spendR.rows[0].total_value,
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Legal Requests ───────────────────────────────────────────────────────────

router.get('/requests/:corpId', async (req, res) => {
  const corpId = toInt(req.params.corpId);
  if (!corpId) return res.status(400).json({ error: 'Invalid corpId.' });
  try {
    const r = await pool.query(
      `SELECT clr.*, u.full_name AS lawyer_name FROM corporate_legal_requests clr
       LEFT JOIN users u ON u.id=clr.assigned_lawyer
       WHERE clr.corporate_id=$1 ORDER BY clr.created_at DESC`,
      [corpId]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/requests', async (req, res) => {
  const { corporate_id, title, description, request_type, priority } = req.body;
  if (!corporate_id || !title) return res.status(400).json({ error: 'corporate_id and title required.' });
  try {
    const r = await pool.query(
      `INSERT INTO corporate_legal_requests (corporate_id, title, description, request_type, priority)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [corporate_id, title, description||null, request_type||'consultation', priority||'normal']
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/requests/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { status, assigned_lawyer } = req.body;
  try {
    const r = await pool.query(
      `UPDATE corporate_legal_requests SET
         status=COALESCE($1,status), assigned_lawyer=COALESCE($2,assigned_lawyer),
         resolved_at=CASE WHEN $1='resolved' THEN NOW() ELSE resolved_at END
       WHERE id=$3 RETURNING *`,
      [status, assigned_lawyer, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Corporate Approvals ──────────────────────────────────────────────────────

router.get('/approvals/:corpId', async (req, res) => {
  const corpId = toInt(req.params.corpId);
  if (!corpId) return res.status(400).json({ error: 'Invalid corpId.' });
  const status = req.query.status;
  try {
    const r = await pool.query(
      `SELECT * FROM corporate_approvals WHERE corporate_id=$1
       ${status ? 'AND status=$2' : ''}
       ORDER BY created_at DESC`,
      status ? [corpId, status] : [corpId]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/approvals', async (req, res) => {
  const { corporate_id, title, description, requested_by, priority } = req.body;
  if (!corporate_id || !title || !requested_by) return res.status(400).json({ error: 'corporate_id, title, requested_by required.' });
  try {
    const r = await pool.query(
      `INSERT INTO corporate_approvals (corporate_id, title, description, requested_by, priority)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [corporate_id, title, description||null, requested_by, priority||'normal']
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/approvals/:id/decide', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { status, approved_by, notes } = req.body;
  if (!['approved','rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  try {
    const r = await pool.query(
      `UPDATE corporate_approvals SET status=$1, approved_by=$2, notes=$3, decided_at=NOW()
       WHERE id=$4 RETURNING *`,
      [status, approved_by||null, notes||null, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Corporate Contracts ──────────────────────────────────────────────────────

router.get('/contracts/:corpId', async (req, res) => {
  const corpId = toInt(req.params.corpId);
  if (!corpId) return res.status(400).json({ error: 'Invalid corpId.' });
  try {
    const r = await pool.query(
      `SELECT * FROM corporate_contracts WHERE corporate_id=$1 ORDER BY created_at DESC`,
      [corpId]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/contracts', async (req, res) => {
  const { corporate_id, title, contract_type, status, signed_at, expires_at, value, document_url, notes } = req.body;
  if (!corporate_id || !title) return res.status(400).json({ error: 'corporate_id and title required.' });
  try {
    const r = await pool.query(
      `INSERT INTO corporate_contracts (corporate_id, title, contract_type, status, signed_at, expires_at, value, document_url, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [corporate_id, title, contract_type||'service', status||'active', signed_at||null, expires_at||null, value||null, document_url||null, notes||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Spending Analytics ───────────────────────────────────────────────────────

router.get('/spending/:corpId', async (req, res) => {
  const corpId = toInt(req.params.corpId);
  if (!corpId) return res.status(400).json({ error: 'Invalid corpId.' });
  try {
    const [contractsR, requestsR] = await Promise.all([
      pool.query(`SELECT contract_type, SUM(COALESCE(value,0)) AS total, COUNT(*) AS count
                 FROM corporate_contracts WHERE corporate_id=$1 GROUP BY contract_type`, [corpId]),
      pool.query(`SELECT request_type, COUNT(*) AS count FROM corporate_legal_requests
                 WHERE corporate_id=$1 GROUP BY request_type`, [corpId]),
    ]);
    return res.json({
      by_contract_type: contractsR.rows,
      by_request_type: requestsR.rows,
      total_contract_value: contractsR.rows.reduce((s, r) => s + Number(r.total), 0),
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
