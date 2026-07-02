const express = require('express');
const pool = require('../db');
const router = express.Router();

function toInt(v, fb = null) { const n = Number.parseInt(v, 10); return Number.isNaN(n) ? fb : n; }

// ─── Client Dashboard (cases + updates) ──────────────────────────────────────

router.get('/dashboard/:clientId', async (req, res) => {
  const clientId = toInt(req.params.clientId);
  if (!clientId) return res.status(400).json({ error: 'Invalid clientId.' });
  try {
    const [casesR, updatesR, invoicesR, docsR, apptR] = await Promise.all([
      pool.query(`SELECT c.id, c.title, c.status, c.case_type, c.created_at,
                         u.full_name AS lawyer_name
                  FROM cases c
                  JOIN case_clients cc ON cc.case_id=c.id
                  JOIN users u ON u.id=c.lawyer_id
                  WHERE cc.client_id=$1 ORDER BY c.created_at DESC`, [clientId]),
      pool.query(`SELECT * FROM client_case_updates WHERE client_id=$1 AND is_read=FALSE ORDER BY created_at DESC LIMIT 5`, [clientId]),
      pool.query(`SELECT * FROM invoices WHERE client_id=$1 ORDER BY created_at DESC LIMIT 5`, [clientId]),
      pool.query(`SELECT COUNT(*) AS total FROM case_documents cd JOIN cases c ON c.id=cd.case_id JOIN case_clients cc ON cc.case_id=c.id WHERE cc.client_id=$1`, [clientId]),
      pool.query(`SELECT * FROM appointments WHERE client_id=$1 AND appointment_date >= NOW() ORDER BY appointment_date ASC LIMIT 3`, [clientId]),
    ]);
    return res.json({
      cases: casesR.rows,
      unread_updates: updatesR.rows,
      invoices: invoicesR.rows,
      document_count: docsR.rows[0].total,
      upcoming_appointments: apptR.rows,
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Client Cases ─────────────────────────────────────────────────────────────

router.get('/cases/:clientId', async (req, res) => {
  const clientId = toInt(req.params.clientId);
  if (!clientId) return res.status(400).json({ error: 'Invalid clientId.' });
  try {
    const r = await pool.query(
      `SELECT c.*, u.full_name AS lawyer_name,
              (SELECT COUNT(*) FROM case_documents cd WHERE cd.case_id=c.id) AS doc_count,
              (SELECT COUNT(*) FROM case_hearings ch WHERE ch.case_id=c.id) AS hearing_count,
              (SELECT ch2.hearing_date FROM case_hearings ch2 WHERE ch2.case_id=c.id AND ch2.hearing_date > NOW() ORDER BY ch2.hearing_date ASC LIMIT 1) AS next_hearing
       FROM cases c
       JOIN case_clients cc ON cc.case_id=c.id
       JOIN users u ON u.id=c.lawyer_id
       WHERE cc.client_id=$1 ORDER BY c.updated_at DESC`,
      [clientId]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.get('/cases/:clientId/:caseId/timeline', async (req, res) => {
  const clientId = toInt(req.params.clientId);
  const caseId = toInt(req.params.caseId);
  if (!clientId || !caseId) return res.status(400).json({ error: 'Invalid ids.' });
  try {
    const [eventsR, hearingsR, updatesR] = await Promise.all([
      pool.query(`SELECT event_date AS date, event_type AS type, description AS title, 'event' AS source FROM case_events WHERE case_id=$1 ORDER BY event_date DESC`, [caseId]),
      pool.query(`SELECT hearing_date AS date, 'hearing' AS type, court_name AS title, 'hearing' AS source FROM case_hearings WHERE case_id=$1 ORDER BY hearing_date DESC`, [caseId]),
      pool.query(`SELECT created_at AS date, update_type AS type, title, 'update' AS source FROM client_case_updates WHERE case_id=$1 AND client_id=$2 ORDER BY created_at DESC`, [caseId, clientId]),
    ]);
    const timeline = [...eventsR.rows, ...hearingsR.rows, ...updatesR.rows]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.json(timeline);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Client Documents ─────────────────────────────────────────────────────────

router.get('/documents/:clientId', async (req, res) => {
  const clientId = toInt(req.params.clientId);
  if (!clientId) return res.status(400).json({ error: 'Invalid clientId.' });
  try {
    const r = await pool.query(
      `SELECT cd.*, c.title AS case_title FROM case_documents cd
       JOIN cases c ON c.id=cd.case_id
       JOIN case_clients cc ON cc.case_id=c.id
       WHERE cc.client_id=$1 ORDER BY cd.created_at DESC`,
      [clientId]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/documents/:clientId/upload', async (req, res) => {
  const clientId = toInt(req.params.clientId);
  if (!clientId) return res.status(400).json({ error: 'Invalid clientId.' });
  const { case_id, title, document_url } = req.body;
  if (!case_id || !title) return res.status(400).json({ error: 'case_id and title required.' });
  try {
    const r = await pool.query(
      `INSERT INTO case_documents (case_id, title, document_url, source_type)
       VALUES ($1,$2,$3,'client_upload') RETURNING *`,
      [case_id, title, document_url||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Client Invoices & Payments ───────────────────────────────────────────────

router.get('/invoices/:clientId', async (req, res) => {
  const clientId = toInt(req.params.clientId);
  if (!clientId) return res.status(400).json({ error: 'Invalid clientId.' });
  try {
    const r = await pool.query(
      `SELECT i.*, c.title AS case_title FROM invoices i
       LEFT JOIN cases c ON c.id=i.case_id
       WHERE i.client_id=$1 ORDER BY i.created_at DESC`,
      [clientId]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/payments', async (req, res) => {
  const { client_id, invoice_id, amount, payment_method, notes } = req.body;
  if (!client_id || !amount) return res.status(400).json({ error: 'client_id and amount required.' });
  try {
    const gatewayRef = `PAY-${Date.now()}`;
    const r = await pool.query(
      `INSERT INTO client_payments (client_id, invoice_id, amount, payment_method, gateway_ref, status, paid_at, notes)
       VALUES ($1,$2,$3,$4,$5,'completed',NOW(),$6) RETURNING *`,
      [client_id, invoice_id||null, amount, payment_method||'bank_transfer', gatewayRef, notes||null]
    );
    if (invoice_id) {
      await pool.query(`UPDATE invoices SET status='paid', paid_at=NOW() WHERE id=$1`, [invoice_id]);
    }
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Video Meetings ───────────────────────────────────────────────────────────

router.get('/meetings/:clientId', async (req, res) => {
  const clientId = toInt(req.params.clientId);
  if (!clientId) return res.status(400).json({ error: 'Invalid clientId.' });
  try {
    const r = await pool.query(
      `SELECT vm.*, u.full_name AS lawyer_name FROM video_meetings vm
       LEFT JOIN users u ON u.id=vm.lawyer_id
       WHERE vm.client_id=$1 ORDER BY vm.scheduled_at DESC`,
      [clientId]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/meetings', async (req, res) => {
  const { case_id, lawyer_id, client_id, title, scheduled_at, duration_minutes, notes } = req.body;
  if (!lawyer_id || !title || !scheduled_at) return res.status(400).json({ error: 'lawyer_id, title, scheduled_at required.' });
  try {
    const meetingUrl = `https://meet.eloyer.io/${Date.now()}`;
    const r = await pool.query(
      `INSERT INTO video_meetings (case_id, lawyer_id, client_id, title, scheduled_at, duration_minutes, meeting_url, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [case_id||null, lawyer_id, client_id||null, title, scheduled_at, duration_minutes||60, meetingUrl, notes||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── FAQ ──────────────────────────────────────────────────────────────────────

router.get('/faq', async (req, res) => {
  const search = req.query.q;
  try {
    const r = await pool.query(
      `SELECT * FROM faq_entries WHERE is_active=TRUE
       ${search ? "AND (question ILIKE $1 OR answer ILIKE $1)" : ''}
       ORDER BY views DESC, category ASC`,
      search ? [`%${search}%`] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/faq/:id/view', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    await pool.query(`UPDATE faq_entries SET views=views+1 WHERE id=$1`, [id]);
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── E-Signatures for Client ──────────────────────────────────────────────────

router.get('/esignature/:clientId', async (req, res) => {
  const clientId = toInt(req.params.clientId);
  if (!clientId) return res.status(400).json({ error: 'Invalid clientId.' });
  try {
    const r = await pool.query(
      `SELECT er.*, cd.title AS document_title, c.title AS case_title
       FROM esign_requests er
       JOIN case_documents cd ON cd.id=er.case_document_id
       JOIN cases c ON c.id=cd.case_id
       JOIN case_clients cc ON cc.case_id=c.id
       WHERE er.client_id=$1 ORDER BY er.created_at DESC`,
      [clientId]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/esignature/:id/sign', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const r = await pool.query(
      `UPDATE esign_requests SET status='signed', completed_at=NOW() WHERE id=$1 RETURNING *`, [id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
