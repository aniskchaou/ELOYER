const express = require('express');
const pool = require('../db');
const router = express.Router();

function toInt(v, fb = null) { const n = Number.parseInt(v, 10); return Number.isNaN(n) ? fb : n; }

// ─── Expert Reports ───────────────────────────────────────────────────────────

router.get('/expert-reports', async (req, res) => {
  const userId = toInt(req.query.user_id), caseId = toInt(req.query.case_id);
  try {
    const r = await pool.query(
      `SELECT er.*, u.full_name AS submitted_by_name, c.title AS case_title,
              rv.full_name AS reviewed_by_name
       FROM expert_reports er
       JOIN users u ON u.id=er.submitted_by
       LEFT JOIN cases c ON c.id=er.case_id
       LEFT JOIN users rv ON rv.id=er.reviewed_by
       WHERE ($1::int IS NULL OR er.submitted_by=$1) AND ($2::int IS NULL OR er.case_id=$2)
       ORDER BY er.created_at DESC`,
      [userId, caseId]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/expert-reports', async (req, res) => {
  const { case_id, submitted_by, title, report_type, content, file_url } = req.body;
  if (!submitted_by || !title) return res.status(400).json({ error: 'submitted_by and title required.' });
  try {
    const r = await pool.query(
      `INSERT INTO expert_reports (case_id, submitted_by, title, report_type, content, file_url, status, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,'submitted',NOW()) RETURNING *`,
      [case_id||null, submitted_by, title, report_type||'expert_opinion', content||null, file_url||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/expert-reports/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { title, content, status, review_notes, reviewed_by } = req.body;
  try {
    const r = await pool.query(
      `UPDATE expert_reports SET title=COALESCE($1,title), content=COALESCE($2,content),
       status=COALESCE($3,status), review_notes=COALESCE($4,review_notes),
       reviewed_by=COALESCE($5,reviewed_by), updated_at=NOW() WHERE id=$6 RETURNING *`,
      [title, content, status, review_notes, reviewed_by, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Court Notices ────────────────────────────────────────────────────────────

router.get('/court-notices', async (req, res) => {
  const caseId = toInt(req.query.case_id);
  try {
    const r = await pool.query(
      `SELECT cn.*, u.full_name AS uploaded_by_name, c.title AS case_title
       FROM court_notices cn JOIN users u ON u.id=cn.uploaded_by
       LEFT JOIN cases c ON c.id=cn.case_id
       ${caseId ? 'WHERE cn.case_id=$1' : ''}
       ORDER BY cn.notice_date DESC, cn.created_at DESC`,
      caseId ? [caseId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/court-notices', async (req, res) => {
  const { case_id, uploaded_by, title, notice_type, court_name, notice_date, content, file_url, is_urgent } = req.body;
  if (!uploaded_by || !title) return res.status(400).json({ error: 'uploaded_by and title required.' });
  try {
    const r = await pool.query(
      `INSERT INTO court_notices (case_id, uploaded_by, title, notice_type, court_name, notice_date, content, file_url, is_urgent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [case_id||null, uploaded_by, title, notice_type||'general', court_name||null, notice_date||null, content||null, file_url||null, !!is_urgent]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/court-notices/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { status } = req.body;
  try {
    const r = await pool.query(`UPDATE court_notices SET status=COALESCE($1,status) WHERE id=$2 RETURNING *`, [status, id]);
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Filing Tracker ───────────────────────────────────────────────────────────

router.get('/filings', async (req, res) => {
  const caseId = toInt(req.query.case_id), userId = toInt(req.query.user_id);
  try {
    const r = await pool.query(
      `SELECT ft.*, u.full_name AS manager_name, c.title AS case_title
       FROM filing_tracker ft JOIN users u ON u.id=ft.managed_by
       LEFT JOIN cases c ON c.id=ft.case_id
       WHERE ($1::int IS NULL OR ft.case_id=$1) AND ($2::int IS NULL OR ft.managed_by=$2)
       ORDER BY ft.deadline ASC NULLS LAST, ft.created_at DESC`,
      [caseId, userId]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/filings', async (req, res) => {
  const { case_id, managed_by, title, filing_type, court_name, deadline, reference_number, notes } = req.body;
  if (!managed_by || !title) return res.status(400).json({ error: 'managed_by and title required.' });
  try {
    const r = await pool.query(
      `INSERT INTO filing_tracker (case_id, managed_by, title, filing_type, court_name, deadline, reference_number, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [case_id||null, managed_by, title, filing_type||'motion', court_name||null, deadline||null, reference_number||null, notes||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/filings/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { status, filed_at, reference_number, notes } = req.body;
  try {
    const r = await pool.query(
      `UPDATE filing_tracker SET status=COALESCE($1,status), filed_at=COALESCE($2,filed_at),
       reference_number=COALESCE($3,reference_number), notes=COALESCE($4,notes), updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [status, filed_at, reference_number, notes, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Court Communication Log ──────────────────────────────────────────────────

router.get('/court-comms', async (req, res) => {
  const caseId = toInt(req.query.case_id);
  try {
    const r = await pool.query(
      `SELECT cc.*, u.full_name AS logged_by_name, c.title AS case_title
       FROM court_communication_log cc JOIN users u ON u.id=cc.logged_by
       LEFT JOIN cases c ON c.id=cc.case_id
       ${caseId ? 'WHERE cc.case_id=$1' : ''}
       ORDER BY cc.created_at DESC`,
      caseId ? [caseId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/court-comms', async (req, res) => {
  const { case_id, logged_by, communication_type, court_name, contact_person, summary, outcome, follow_up_date } = req.body;
  if (!logged_by || !summary) return res.status(400).json({ error: 'logged_by and summary required.' });
  try {
    const r = await pool.query(
      `INSERT INTO court_communication_log (case_id, logged_by, communication_type, court_name, contact_person, summary, outcome, follow_up_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [case_id||null, logged_by, communication_type||'call', court_name||null, contact_person||null, summary, outcome||null, follow_up_date||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Investigation Findings ───────────────────────────────────────────────────

router.get('/findings', async (req, res) => {
  const caseId = toInt(req.query.case_id), invId = toInt(req.query.investigator_id);
  try {
    const r = await pool.query(
      `SELECT f.*, u.full_name AS investigator_name, c.title AS case_title
       FROM investigation_findings f JOIN users u ON u.id=f.investigator_id
       LEFT JOIN cases c ON c.id=f.case_id
       WHERE ($1::int IS NULL OR f.case_id=$1) AND ($2::int IS NULL OR f.investigator_id=$2)
       ORDER BY f.created_at DESC`,
      [caseId, invId]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/findings', async (req, res) => {
  const { case_id, investigator_id, title, finding_type, description, location, gps_lat, gps_lng, is_confidential } = req.body;
  if (!case_id || !investigator_id || !title) return res.status(400).json({ error: 'case_id, investigator_id, title required.' });
  try {
    const r = await pool.query(
      `INSERT INTO investigation_findings (case_id, investigator_id, title, finding_type, description, location, gps_lat, gps_lng, is_confidential)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [case_id, investigator_id, title, finding_type||'general', description||null, location||null, gps_lat||null, gps_lng||null, !!is_confidential]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Interview Records ────────────────────────────────────────────────────────

router.get('/interviews', async (req, res) => {
  const caseId = toInt(req.query.case_id);
  try {
    const r = await pool.query(
      `SELECT ir.*, u.full_name AS investigator_name, c.title AS case_title
       FROM interview_records ir JOIN users u ON u.id=ir.investigator_id
       LEFT JOIN cases c ON c.id=ir.case_id
       ${caseId ? 'WHERE ir.case_id=$1' : ''}
       ORDER BY ir.interview_date DESC`,
      caseId ? [caseId] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/interviews', async (req, res) => {
  const { case_id, investigator_id, interviewee_name, interviewee_role, interview_date, location, summary, key_points } = req.body;
  if (!case_id || !investigator_id || !interviewee_name || !interview_date) {
    return res.status(400).json({ error: 'case_id, investigator_id, interviewee_name, interview_date required.' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO interview_records (case_id, investigator_id, interviewee_name, interviewee_role, interview_date, location, summary, key_points)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [case_id, investigator_id, interviewee_name, interviewee_role||null, interview_date, location||null, summary||null, key_points||[]]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Chain of Custody ─────────────────────────────────────────────────────────

router.get('/custody/:caseId', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  if (!caseId) return res.status(400).json({ error: 'Invalid caseId.' });
  try {
    const r = await pool.query(
      `SELECT ecc.*, u.full_name AS handler_name, ce.title AS evidence_title
       FROM evidence_chain_of_custody ecc
       JOIN users u ON u.id=ecc.handler_id
       LEFT JOIN case_evidence ce ON ce.id=ecc.evidence_id
       WHERE ecc.case_id=$1 ORDER BY ecc.timestamp DESC`,
      [caseId]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/custody', async (req, res) => {
  const { evidence_id, case_id, handler_id, action, from_location, to_location, notes } = req.body;
  if (!case_id || !handler_id || !action) return res.status(400).json({ error: 'case_id, handler_id, action required.' });
  try {
    const r = await pool.query(
      `INSERT INTO evidence_chain_of_custody (evidence_id, case_id, handler_id, action, from_location, to_location, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [evidence_id||null, case_id, handler_id, action, from_location||null, to_location||null, notes||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Compliance Reviews ───────────────────────────────────────────────────────

router.get('/compliance', async (req, res) => {
  const reviewerId = toInt(req.query.reviewer_id);
  try {
    const r = await pool.query(
      `SELECT cr.*, u.full_name AS reviewer_name, cd.title AS document_title
       FROM compliance_reviews cr JOIN users u ON u.id=cr.reviewer_id
       LEFT JOIN case_documents cd ON cd.id=cr.case_document_id
       ${reviewerId ? 'WHERE cr.reviewer_id=$1' : ''}
       ORDER BY cr.created_at DESC`,
      reviewerId ? [reviewerId] : []
    );
    const ids = r.rows.map(row => row.id);
    let flags = [], clauses = [];
    if (ids.length) {
      [flags, clauses] = await Promise.all([
        pool.query(`SELECT * FROM compliance_flags WHERE review_id = ANY($1) ORDER BY severity DESC`, [ids]),
        pool.query(`SELECT * FROM clause_comparisons WHERE review_id = ANY($1) ORDER BY risk_level DESC`, [ids]),
      ]);
    }
    const reviews = r.rows.map(row => ({
      ...row,
      flags: flags.rows.filter(f => f.review_id === row.id),
      clauses: clauses.rows.filter(c => c.review_id === row.id),
    }));
    return res.json(reviews);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/compliance', async (req, res) => {
  const { case_document_id, reviewer_id, title, review_type, content_text } = req.body;
  if (!reviewer_id || !title) return res.status(400).json({ error: 'reviewer_id and title required.' });
  // Run AI compliance analysis (simulated)
  const riskKeywords = ['unlimited liability', 'automatic renewal', 'unilateral termination', 'no refund', 'binding arbitration', 'jurisdiction waiver'];
  const text = (content_text || '').toLowerCase();
  const flagsFound = riskKeywords.filter(k => text.includes(k));
  const score = Math.max(20, 100 - flagsFound.length * 15);
  const risk = score >= 80 ? 'low' : score >= 60 ? 'medium' : 'high';

  try {
    const r = await pool.query(
      `INSERT INTO compliance_reviews (case_document_id, reviewer_id, title, review_type, overall_risk, compliance_score, status)
       VALUES ($1,$2,$3,$4,$5,$6,'completed') RETURNING *`,
      [case_document_id||null, reviewer_id, title, review_type||'contract', risk, score]
    );
    const reviewId = r.rows[0].id;
    for (const kw of flagsFound) {
      await pool.query(
        `INSERT INTO compliance_flags (review_id, flag_type, severity, description, recommendation)
         VALUES ($1,'contractual','high',$2,$3)`,
        [reviewId, `Detected clause: "${kw}"`, `Review and negotiate "${kw}" clause before signing.`]
      );
    }
    if (!flagsFound.length && text.length > 100) {
      await pool.query(
        `INSERT INTO compliance_flags (review_id, flag_type, severity, description, recommendation)
         VALUES ($1,'informational','low','No critical risk clauses detected.','Document appears compliant. Standard review recommended.')`,
        [reviewId]
      );
    }
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/compliance/:id/approve', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const r = await pool.query(`UPDATE compliance_reviews SET status='approved', approved_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/compliance/:id/reject', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const r = await pool.query(`UPDATE compliance_reviews SET status='rejected', rejected_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/compliance/flags/:id/resolve', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  try {
    const r = await pool.query(`UPDATE compliance_flags SET is_resolved=TRUE, resolved_at=NOW() WHERE id=$1 RETURNING *`, [id]);
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
