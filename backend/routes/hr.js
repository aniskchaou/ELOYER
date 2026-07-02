const express = require('express');
const pool = require('../db');
const router = express.Router();

function toInt(v, fb = null) { const n = Number.parseInt(v, 10); return Number.isNaN(n) ? fb : n; }

// ─── HR Dashboard ─────────────────────────────────────────────────────────────

router.get('/dashboard', async (_req, res) => {
  try {
    const [staffR, leaveR, postingsR, reviewsR, attendanceR] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total, role FROM users GROUP BY role ORDER BY role`),
      pool.query(`SELECT status, COUNT(*) AS count FROM leave_requests GROUP BY status`),
      pool.query(`SELECT status, COUNT(*) AS count FROM recruitment_postings GROUP BY status`),
      pool.query(`SELECT status, COUNT(*) AS count FROM hr_performance_reviews GROUP BY status`),
      pool.query(`SELECT status, COUNT(*) AS count FROM attendance_records WHERE date = CURRENT_DATE GROUP BY status`),
    ]);
    return res.json({
      staff: staffR.rows,
      leave: leaveR.rows,
      postings: postingsR.rows,
      reviews: reviewsR.rows,
      todayAttendance: attendanceR.rows,
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Employee Records ─────────────────────────────────────────────────────────

router.get('/employees', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT er.*, u.full_name, u.email, u.role, d.name AS department_name
       FROM employee_records er
       JOIN users u ON u.id = er.user_id
       LEFT JOIN departments d ON d.id = er.department_id
       ORDER BY u.full_name ASC`
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/employees', async (req, res) => {
  const { user_id, department_id, job_title, contract_type, start_date, salary, national_id, bank_account, emergency_contact_name, emergency_contact_phone, notes } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required.' });
  try {
    const r = await pool.query(
      `INSERT INTO employee_records (user_id, department_id, job_title, contract_type, start_date, salary, national_id, bank_account, emergency_contact_name, emergency_contact_phone, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (user_id) DO UPDATE SET
         department_id=EXCLUDED.department_id, job_title=EXCLUDED.job_title,
         contract_type=EXCLUDED.contract_type, start_date=EXCLUDED.start_date,
         salary=EXCLUDED.salary, updated_at=NOW()
       RETURNING *`,
      [user_id, department_id||null, job_title||null, contract_type||'permanent', start_date||null, salary||null, national_id||null, bank_account||null, emergency_contact_name||null, emergency_contact_phone||null, notes||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Leave Requests ───────────────────────────────────────────────────────────

router.get('/leave', async (req, res) => {
  const status = req.query.status;
  try {
    const r = await pool.query(
      `SELECT lr.*, u.full_name AS employee_name, u.role,
              rv.full_name AS reviewer_name
       FROM leave_requests lr
       JOIN users u ON u.id = lr.user_id
       LEFT JOIN users rv ON rv.id = lr.reviewed_by
       ${status ? 'WHERE lr.status=$1' : ''}
       ORDER BY lr.created_at DESC`,
      status ? [status] : []
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/leave', async (req, res) => {
  const { user_id, leave_type, start_date, end_date, reason } = req.body;
  if (!user_id || !start_date || !end_date) return res.status(400).json({ error: 'user_id, start_date, end_date required.' });
  try {
    const r = await pool.query(
      `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [user_id, leave_type||'annual', start_date, end_date, reason||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/leave/:id/review', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { status, reviewed_by, review_notes } = req.body;
  if (!['approved','rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  try {
    const r = await pool.query(
      `UPDATE leave_requests SET status=$1, reviewed_by=$2, review_notes=$3, reviewed_at=NOW()
       WHERE id=$4 RETURNING *`,
      [status, reviewed_by||null, review_notes||null, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Attendance ───────────────────────────────────────────────────────────────

router.get('/attendance', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0,10);
  try {
    const r = await pool.query(
      `SELECT ar.*, u.full_name, u.role FROM attendance_records ar
       JOIN users u ON u.id = ar.user_id
       WHERE ar.date = $1 ORDER BY u.full_name ASC`,
      [date]
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/attendance/checkin', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required.' });
  try {
    const r = await pool.query(
      `INSERT INTO attendance_records (user_id, date, check_in, status)
       VALUES ($1, CURRENT_DATE, NOW(), 'present')
       ON CONFLICT (user_id, date) DO UPDATE SET check_in=NOW(), status='present'
       RETURNING *`,
      [user_id]
    );
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/attendance/checkout', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required.' });
  try {
    const r = await pool.query(
      `UPDATE attendance_records SET check_out=NOW() WHERE user_id=$1 AND date=CURRENT_DATE RETURNING *`,
      [user_id]
    );
    return res.json(r.rows[0] || { message: 'No check-in found for today.' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Recruitment ──────────────────────────────────────────────────────────────

router.get('/recruitment', async (_req, res) => {
  try {
    const [postsR, appsR] = await Promise.all([
      pool.query(`SELECT rp.*, d.name AS department_name,
                        (SELECT COUNT(*) FROM recruitment_applications ra WHERE ra.posting_id=rp.id) AS applicant_count
                 FROM recruitment_postings rp LEFT JOIN departments d ON d.id=rp.department_id
                 ORDER BY rp.created_at DESC`),
      pool.query(`SELECT ra.*, rp.title AS posting_title FROM recruitment_applications ra
                 JOIN recruitment_postings rp ON rp.id=ra.posting_id ORDER BY ra.created_at DESC LIMIT 20`),
    ]);
    return res.json({ postings: postsR.rows, applications: appsR.rows });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/recruitment/postings', async (req, res) => {
  const { title, department_id, job_type, description, requirements, salary_range, closes_at, posted_by } = req.body;
  if (!title) return res.status(400).json({ error: 'title required.' });
  try {
    const r = await pool.query(
      `INSERT INTO recruitment_postings (title, department_id, job_type, description, requirements, salary_range, closes_at, posted_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, department_id||null, job_type||'full_time', description||null, requirements||null, salary_range||null, closes_at||null, posted_by||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/recruitment/postings/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { status } = req.body;
  try {
    const r = await pool.query(`UPDATE recruitment_postings SET status=COALESCE($1,status) WHERE id=$2 RETURNING *`, [status, id]);
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/recruitment/applications', async (req, res) => {
  const { posting_id, applicant_name, applicant_email, cover_letter } = req.body;
  if (!posting_id || !applicant_name || !applicant_email) return res.status(400).json({ error: 'posting_id, name and email required.' });
  try {
    const r = await pool.query(
      `INSERT INTO recruitment_applications (posting_id, applicant_name, applicant_email, cover_letter)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [posting_id, applicant_name, applicant_email, cover_letter||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.patch('/recruitment/applications/:id', async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id.' });
  const { status, score, notes, interviewed_at } = req.body;
  try {
    const r = await pool.query(
      `UPDATE recruitment_applications SET status=COALESCE($1,status), score=COALESCE($2,score),
       notes=COALESCE($3,notes), interviewed_at=COALESCE($4,interviewed_at) WHERE id=$5 RETURNING *`,
      [status, score, notes, interviewed_at, id]
    );
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ─── Performance Reviews ──────────────────────────────────────────────────────

router.get('/performance', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT pr.*, u.full_name AS employee_name, rv.full_name AS reviewer_name
       FROM hr_performance_reviews pr
       JOIN users u ON u.id=pr.user_id
       JOIN users rv ON rv.id=pr.reviewer_id
       ORDER BY pr.created_at DESC`
    );
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

router.post('/performance', async (req, res) => {
  const { user_id, reviewer_id, review_period, overall_score, goals_met, strengths, improvements, comments } = req.body;
  if (!user_id || !reviewer_id || !review_period) return res.status(400).json({ error: 'user_id, reviewer_id, review_period required.' });
  try {
    const r = await pool.query(
      `INSERT INTO hr_performance_reviews (user_id, reviewer_id, review_period, overall_score, goals_met, strengths, improvements, comments, status, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'submitted',NOW()) RETURNING *`,
      [user_id, reviewer_id, review_period, overall_score||null, goals_met||false, strengths||null, improvements||null, comments||null]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

module.exports = router;
