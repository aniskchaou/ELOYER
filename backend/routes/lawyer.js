const express = require('express');
const pool = require('../db');

const router = express.Router();

function toInt(value, fallback = null) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function toFloat(value, fallback = null) {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function normalizeDate(value) {
  return value || new Date().toISOString();
}

async function logActivity(lawyerId, caseId, activityType, meta = {}) {
  if (!lawyerId || !activityType) {
    return;
  }

  try {
    await pool.query(
      `INSERT INTO activity_logs (lawyer_id, case_id, activity_type, meta)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [lawyerId, caseId || null, activityType, JSON.stringify(meta)]
    );
  } catch (_error) {
    // Non-blocking telemetry.
  }
}

router.post('/auth/lawyer-login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const result = await pool.query(
      'SELECT id, full_name, email, role FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (!result.rows.length || result.rows[0].role !== 'lawyer') {
      return res.status(401).json({ error: 'Invalid lawyer account.' });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed.', details: error.message });
  }
});

router.get('/lawyer/clients', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, full_name, email, phone FROM clients ORDER BY full_name');
    return res.json({ clients: result.rows });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch clients.', details: error.message });
  }
});

router.get('/lawyer/templates', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, category, premium
       FROM document_templates
       ORDER BY premium ASC, name ASC`
    );
    return res.json({ templates: result.rows });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch templates.', details: error.message });
  }
});

router.get('/navigation', async (_req, res) => {
  try {
    const regclassResult = await pool.query(
      `SELECT
         to_regclass('public.app_roles') AS app_roles_tbl,
         to_regclass('public.navigation_sections') AS nav_sections_tbl,
         to_regclass('public.navigation_items') AS nav_items_tbl,
         to_regclass('public.role_section_access') AS role_access_tbl`
    );

    const tables = regclassResult.rows[0] || {};

    const [rolesResult, sectionsResult, itemsResult, accessResult] = await Promise.all([
      tables.app_roles_tbl
        ? pool.query(
            `SELECT id, role_key, label, color, icon
             FROM app_roles
             ORDER BY sort_order ASC, id ASC`
          )
        : Promise.resolve({ rows: [] }),
      tables.nav_sections_tbl
        ? pool.query(
            `SELECT id, section_key, title, icon
             FROM navigation_sections
             ORDER BY sort_order ASC, id ASC`
          )
        : Promise.resolve({ rows: [] }),
      tables.nav_items_tbl
        ? pool.query(
            `SELECT id, section_id, title, path
             FROM navigation_items
             ORDER BY sort_order ASC, id ASC`
          )
        : Promise.resolve({ rows: [] }),
      tables.role_access_tbl && tables.app_roles_tbl && tables.nav_sections_tbl
        ? pool.query(
            `SELECT r.role_key, s.section_key
             FROM role_section_access rsa
             JOIN app_roles r ON r.id = rsa.role_id
             JOIN navigation_sections s ON s.id = rsa.section_id`
          )
        : Promise.resolve({ rows: [] }),
    ]);

    const itemsBySectionId = itemsResult.rows.reduce((acc, item) => {
      const key = item.section_id;
      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push({
        title: item.title,
        path: item.path,
      });
      return acc;
    }, {});

    const sections = sectionsResult.rows.map(section => ({
      key: section.section_key,
      title: section.title,
      icon: section.icon,
      items: itemsBySectionId[section.id] || [],
    }));

    const roleAccessMap = accessResult.rows.reduce((acc, row) => {
      if (!acc[row.role_key]) {
        acc[row.role_key] = [];
      }

      acc[row.role_key].push(row.section_key);
      return acc;
    }, {});

    let roles = rolesResult.rows.map(role => ({
      value: role.role_key,
      label: role.label,
      color: role.color,
      icon: role.icon,
    }));

    // Keep role selector usable even before navigation tables are migrated/seeded.
    if (!roles.length) {
      const fallbackRolesResult = await pool.query(
        `SELECT DISTINCT role
         FROM users
         WHERE role IS NOT NULL AND role <> ''
         ORDER BY role ASC`
      );

      const defaults = {
        admin: { label: 'Admin', color: 'red darken-1', icon: 'mdi-shield-crown' },
        lawyer: { label: 'Lawyer', color: 'blue darken-1', icon: 'mdi-briefcase' },
        client: { label: 'Client', color: 'teal darken-1', icon: 'mdi-account' },
        paralegal: { label: 'Paralegal', color: 'green darken-1', icon: 'mdi-file-document-multiple' },
        accountant: { label: 'Accountant', color: 'orange darken-2', icon: 'mdi-calculator' },
      };

      roles = fallbackRolesResult.rows.map(({ role }) => {
        const key = String(role || '').toLowerCase();
        const meta = defaults[key] || {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          color: 'grey darken-1',
          icon: 'mdi-account-circle',
        };

        return {
          value: key,
          label: meta.label,
          color: meta.color,
          icon: meta.icon,
        };
      });
    }

    return res.json({
      roles,
      sections,
      roleAccessMap,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load navigation data.', details: error.message });
  }
});

router.get('/lawyer/dashboard/:lawyerId', async (req, res) => {
  const lawyerId = toInt(req.params.lawyerId);
  if (!lawyerId) {
    return res.status(400).json({ error: 'Invalid lawyerId.' });
  }

  try {
    const [priorityCases, urgentHearings, todayTasks, newMessages, pendingInvoices] = await Promise.all([
      pool.query(
        `SELECT c.id, c.title, c.case_type, c.status, c.updated_at,
                COALESCE(SUM(t.hours), 0) AS logged_hours
         FROM cases c
         LEFT JOIN time_logs t ON t.case_id = c.id
         WHERE c.lawyer_id = $1 AND c.status <> 'closed'
         GROUP BY c.id
         ORDER BY c.updated_at DESC
         LIMIT 5`,
        [lawyerId]
      ),
      pool.query(
        `SELECT h.id, h.case_id, c.title AS case_title, h.hearing_date, h.court_name, h.status
         FROM case_hearings h
         JOIN cases c ON c.id = h.case_id
         WHERE c.lawyer_id = $1
           AND h.hearing_date <= NOW() + INTERVAL '3 days'
         ORDER BY h.hearing_date ASC
         LIMIT 5`,
        [lawyerId]
      ),
      pool.query(
        `SELECT t.id, t.case_id, c.title AS case_title, t.title, t.due_date, t.status, t.priority, t.progress_pct
         FROM task_items t
         LEFT JOIN cases c ON c.id = t.case_id
         WHERE t.lawyer_id = $1
           AND DATE(t.due_date) = CURRENT_DATE
         ORDER BY t.priority DESC, t.due_date ASC`,
        [lawyerId]
      ),
      pool.query(
        `SELECT m.id, m.case_id, m.subject, m.body, m.created_at, m.message_type, c.full_name AS client_name
         FROM messages m
         LEFT JOIN clients c ON c.id = m.client_id
         WHERE m.lawyer_id = $1 AND m.is_read = FALSE
         ORDER BY m.created_at DESC
         LIMIT 8`,
        [lawyerId]
      ),
      pool.query(
        `SELECT i.id, i.case_id, c.title AS case_title, i.amount, i.status, i.due_date, i.remind_count
         FROM invoices i
         LEFT JOIN cases c ON c.id = i.case_id
         WHERE i.status IN ('pending', 'overdue')
           AND c.lawyer_id = $1
         ORDER BY i.due_date ASC
         LIMIT 8`,
        [lawyerId]
      ),
    ]);

    return res.json({
      priorityCases: priorityCases.rows,
      urgentDeadlinesHearings: urgentHearings.rows,
      todayTasks: todayTasks.rows,
      newClientMessages: newMessages.rows,
      pendingInvoicesPayments: pendingInvoices.rows,
      realDailyWorkflow: [
        'Log in and review dashboard priorities',
        'Open case and review notes/documents',
        'Add updates, evidence, and next hearing/task',
        'Log billable time and communicate with client',
        'Prepare documents and schedule next action',
      ],
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch dashboard data.', details: error.message });
  }
});

router.get('/cases', async (req, res) => {
  const lawyerId = toInt(req.query.lawyerId);
  if (!lawyerId) {
    return res.status(400).json({ error: 'lawyerId query param is required.' });
  }

  try {
    const result = await pool.query(
      `SELECT c.id, c.title, c.description, c.case_type, c.status, c.risk_level, c.outcome_prediction,
              c.created_at, c.updated_at,
              COALESCE(array_agg(cl.full_name) FILTER (WHERE cl.id IS NOT NULL), '{}') AS clients
       FROM cases c
       LEFT JOIN case_clients cc ON cc.case_id = c.id
       LEFT JOIN clients cl ON cl.id = cc.client_id
       WHERE c.lawyer_id = $1
       GROUP BY c.id
       ORDER BY c.updated_at DESC`,
      [lawyerId]
    );

    return res.json({ cases: result.rows });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch cases.', details: error.message });
  }
});

router.post('/cases', async (req, res) => {
  const { title, description, caseType, status, lawyerId, clientIds = [] } = req.body;

  if (!title || !lawyerId) {
    return res.status(400).json({ error: 'title and lawyerId are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const caseResult = await client.query(
      `INSERT INTO cases (title, description, case_type, status, lawyer_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description || '', caseType || 'General', status || 'open', lawyerId]
    );

    const createdCase = caseResult.rows[0];

    for (const rawClientId of clientIds) {
      const clientId = toInt(rawClientId);
      if (!clientId) {
        continue;
      }
      await client.query(
        `INSERT INTO case_clients (case_id, client_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [createdCase.id, clientId]
      );
    }

    await client.query('COMMIT');
    await logActivity(lawyerId, createdCase.id, 'case_created', { title: createdCase.title });
    return res.status(201).json({ case: createdCase });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Failed to create case.', details: error.message });
  } finally {
    client.release();
  }
});

router.patch('/cases/:caseId/status', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { status } = req.body;

  if (!caseId || !status) {
    return res.status(400).json({ error: 'caseId and status are required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE cases
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, caseId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    return res.json({ case: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update case status.', details: error.message });
  }
});

router.get('/cases/:caseId', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  if (!caseId) {
    return res.status(400).json({ error: 'Invalid caseId.' });
  }

  try {
    const [
      caseMeta,
      notes,
      evidence,
      events,
      documents,
      hearings,
      timeLogs,
      meetings,
      tasks,
      decisions,
      conversations,
      invoices,
      retainers,
      research,
      timers,
    ] = await Promise.all([
      pool.query(
        `SELECT c.id, c.title, c.description, c.case_type, c.status, c.lawyer_id, c.risk_level, c.outcome_prediction,
                c.created_at, c.updated_at,
                COALESCE(array_agg(cl.full_name) FILTER (WHERE cl.id IS NOT NULL), '{}') AS clients
         FROM cases c
         LEFT JOIN case_clients cc ON cc.case_id = c.id
         LEFT JOIN clients cl ON cl.id = cc.client_id
         WHERE c.id = $1
         GROUP BY c.id`,
        [caseId]
      ),
      pool.query(
        `SELECT n.id, n.note_content, n.strategy, n.created_at, u.full_name AS author
         FROM case_notes n
         LEFT JOIN users u ON u.id = n.lawyer_id
         WHERE n.case_id = $1
         ORDER BY n.created_at DESC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, title, file_url, description, uploaded_at
         FROM case_evidence
         WHERE case_id = $1
         ORDER BY uploaded_at DESC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, event_type, event_date, description, created_at
         FROM case_events
         WHERE case_id = $1
         ORDER BY event_date DESC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, title, document_url, contract_ref, source_type, is_external, content_text, created_at
         FROM case_documents
         WHERE case_id = $1
         ORDER BY created_at DESC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, hearing_date, court_name, status, notes, reminder_enabled, calendar_synced, created_at
         FROM case_hearings
         WHERE case_id = $1
         ORDER BY hearing_date ASC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, hours, description, log_date, source, suggestion, created_at
         FROM time_logs
         WHERE case_id = $1
         ORDER BY log_date DESC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, title, meeting_date, notes, status, created_at
         FROM meetings
         WHERE case_id = $1
         ORDER BY meeting_date DESC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, title, due_date, status, priority, assigned_to, progress_pct, created_at
         FROM task_items
         WHERE case_id = $1
         ORDER BY due_date ASC NULLS LAST, created_at DESC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, decision_date, outcome, summary, document_url, created_at
         FROM court_decisions
         WHERE case_id = $1
         ORDER BY decision_date DESC`,
        [caseId]
      ),
      pool.query(
        `SELECT m.id, m.subject, m.body, m.message_type, m.direction, m.is_read, m.created_at,
                c.full_name AS client_name
         FROM messages m
         LEFT JOIN clients c ON c.id = m.client_id
         WHERE m.case_id = $1
         ORDER BY m.created_at DESC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, amount, status, due_date, paid_amount, sent_at, paid_at, billing_rule, remind_count, created_at
         FROM invoices
         WHERE case_id = $1
         ORDER BY created_at DESC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, amount, balance, status, created_at
         FROM retainers
         WHERE case_id = $1
         ORDER BY created_at DESC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, title, citation, url, notes, created_at
         FROM case_research_refs
         WHERE case_id = $1
         ORDER BY created_at DESC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, start_time, end_time, duration_minutes, activity_note, is_running, created_at
         FROM timers
         WHERE case_id = $1
         ORDER BY created_at DESC`,
        [caseId]
      ),
    ]);

    if (!caseMeta.rows.length) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    return res.json({
      case: caseMeta.rows[0],
      notes: notes.rows,
      evidence: evidence.rows,
      timeline: events.rows,
      documents: documents.rows,
      hearings: hearings.rows,
      timeLogs: timeLogs.rows,
      meetings: meetings.rows,
      tasks: tasks.rows,
      decisions: decisions.rows,
      conversations: conversations.rows,
      invoices: invoices.rows,
      retainers: retainers.rows,
      research: research.rows,
      timers: timers.rows,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch case workspace.', details: error.message });
  }
});

router.post('/cases/:caseId/notes', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { lawyerId, noteContent, strategy } = req.body;

  if (!caseId || !lawyerId || !noteContent) {
    return res.status(400).json({ error: 'caseId, lawyerId and noteContent are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO case_notes (case_id, lawyer_id, note_content, strategy)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [caseId, lawyerId, noteContent, strategy || '']
    );

    await logActivity(lawyerId, caseId, 'note_added', { noteId: result.rows[0].id });
    return res.status(201).json({ note: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add note.', details: error.message });
  }
});

router.post('/cases/:caseId/evidence', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { title, fileUrl, description } = req.body;

  if (!caseId || !title) {
    return res.status(400).json({ error: 'caseId and title are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO case_evidence (case_id, title, file_url, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [caseId, title, fileUrl || '', description || '']
    );

    return res.status(201).json({ evidence: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add evidence.', details: error.message });
  }
});

router.post('/cases/:caseId/events', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { eventType, eventDate, description } = req.body;

  if (!caseId || !eventType || !eventDate) {
    return res.status(400).json({ error: 'caseId, eventType and eventDate are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO case_events (case_id, event_type, event_date, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [caseId, eventType, eventDate, description || '']
    );

    return res.status(201).json({ event: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add timeline event.', details: error.message });
  }
});

router.post('/cases/:caseId/documents', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { title, documentUrl, contractRef, contentText, sourceType, isExternal } = req.body;

  if (!caseId || !title) {
    return res.status(400).json({ error: 'caseId and title are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO case_documents (case_id, title, document_url, contract_ref, content_text, source_type, is_external)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [caseId, title, documentUrl || '', contractRef || '', contentText || '', sourceType || 'uploaded', !!isExternal]
    );

    return res.status(201).json({ document: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add document.', details: error.message });
  }
});

router.post('/cases/:caseId/documents/from-template', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { templateId, title, lawyerId, premium = false } = req.body;

  if (!caseId || !templateId || !lawyerId) {
    return res.status(400).json({ error: 'caseId, templateId and lawyerId are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const templateResult = await client.query(
      'SELECT id, name, body_text, premium FROM document_templates WHERE id = $1 LIMIT 1',
      [templateId]
    );

    if (!templateResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Template not found.' });
    }

    const template = templateResult.rows[0];
    if (template.premium && !premium) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'This template requires premium features.' });
    }

    const caseResult = await client.query(
      `SELECT c.id, c.title,
              COALESCE(cl.full_name, 'Client') AS client_name
       FROM cases c
       LEFT JOIN case_clients cc ON cc.case_id = c.id
       LEFT JOIN clients cl ON cl.id = cc.client_id
       WHERE c.id = $1
       LIMIT 1`,
      [caseId]
    );

    if (!caseResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Case not found.' });
    }

    const caseRow = caseResult.rows[0];
    let contentText = template.body_text;
    contentText = contentText.replace(/{{client_name}}/g, caseRow.client_name);
    contentText = contentText.replace(/{{case_title}}/g, caseRow.title);
    contentText = contentText.replace(/{{court_name}}/g, 'Court TBD');
    contentText = contentText.replace(/{{facts_summary}}/g, 'Facts to be completed by counsel.');

    const documentResult = await client.query(
      `INSERT INTO case_documents (case_id, title, content_text, source_type, is_external)
       VALUES ($1, $2, $3, 'template', FALSE)
       RETURNING *`,
      [caseId, title || template.name, contentText]
    );

    const documentId = documentResult.rows[0].id;
    await client.query(
      `INSERT INTO document_versions (case_document_id, version_no, content_text, change_summary, created_by)
       VALUES ($1, 1, $2, 'Initial template-generated document', $3)`,
      [documentId, contentText, lawyerId]
    );

    await client.query('COMMIT');
    await logActivity(lawyerId, caseId, 'document_created_from_template', { documentId, templateId });
    return res.status(201).json({ document: documentResult.rows[0], autoFilled: true });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Failed to create document from template.', details: error.message });
  } finally {
    client.release();
  }
});

router.post('/cases/:caseId/documents/:documentId/versions', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const documentId = toInt(req.params.documentId);
  const { lawyerId, contentText, changeSummary } = req.body;

  if (!caseId || !documentId || !lawyerId || !contentText) {
    return res.status(400).json({ error: 'caseId, documentId, lawyerId and contentText are required.' });
  }

  try {
    const versionResult = await pool.query(
      `SELECT COALESCE(MAX(version_no), 0) + 1 AS next_version
       FROM document_versions
       WHERE case_document_id = $1`,
      [documentId]
    );

    const nextVersion = versionResult.rows[0].next_version;

    const result = await pool.query(
      `INSERT INTO document_versions (case_document_id, version_no, content_text, change_summary, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [documentId, nextVersion, contentText, changeSummary || '', lawyerId]
    );

    await pool.query(
      `UPDATE case_documents
       SET content_text = $1, updated_at = NOW()
       WHERE id = $2`,
      [contentText, documentId]
    ).catch(() => null);

    await logActivity(lawyerId, caseId, 'document_version_added', { documentId, versionNo: nextVersion });
    return res.status(201).json({ version: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save document version.', details: error.message });
  }
});

router.get('/cases/:caseId/documents/:documentId/compare', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const documentId = toInt(req.params.documentId);
  const from = toInt(req.query.from);
  const to = toInt(req.query.to);

  if (!caseId || !documentId || !from || !to) {
    return res.status(400).json({ error: 'caseId, documentId, from and to are required.' });
  }

  try {
    const result = await pool.query(
      `SELECT version_no, content_text
       FROM document_versions
       WHERE case_document_id = $1 AND version_no IN ($2, $3)
       ORDER BY version_no ASC`,
      [documentId, from, to]
    );

    if (result.rows.length < 2) {
      return res.status(404).json({ error: 'Requested versions not found.' });
    }

    const older = result.rows[0];
    const newer = result.rows[1];
    const oldWords = (older.content_text || '').split(/\s+/).filter(Boolean);
    const newWords = (newer.content_text || '').split(/\s+/).filter(Boolean);

    const additions = Math.max(newWords.length - oldWords.length, 0);
    const removals = Math.max(oldWords.length - newWords.length, 0);

    return res.json({
      compare: {
        from,
        to,
        additions,
        removals,
        oldLength: oldWords.length,
        newLength: newWords.length,
        summary: `Version ${to} has ${additions} added and ${removals} removed words vs version ${from}.`,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to compare versions.', details: error.message });
  }
});

router.post('/cases/:caseId/documents/:documentId/esign', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const documentId = toInt(req.params.documentId);
  const { clientId, provider } = req.body;

  if (!caseId || !documentId || !clientId) {
    return res.status(400).json({ error: 'caseId, documentId and clientId are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO esign_requests (case_document_id, client_id, provider, status, sent_at)
       VALUES ($1, $2, $3, 'sent', NOW())
       RETURNING *`,
      [documentId, clientId, provider || 'internal']
    );

    return res.status(201).json({ esignRequest: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send e-sign request.', details: error.message });
  }
});

router.post('/cases/:caseId/documents/ai-summarize', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { contentText, premium = false } = req.body;

  if (!caseId || !contentText) {
    return res.status(400).json({ error: 'caseId and contentText are required.' });
  }

  if (!premium) {
    return res.status(403).json({ error: 'AI summarization requires premium.' });
  }

  const words = contentText.split(/\s+/).filter(Boolean);
  const summary = words.slice(0, 80).join(' ');

  return res.json({
    summary: `${summary}${words.length > 80 ? '...' : ''}`,
    wordCount: words.length,
    model: 'ai-summarizer-v1',
  });
});

router.post('/cases/:caseId/hearings', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { hearingDate, courtName, status, notes, reminderEnabled = true } = req.body;

  if (!caseId || !hearingDate || !courtName) {
    return res.status(400).json({ error: 'caseId, hearingDate and courtName are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO case_hearings (case_id, hearing_date, court_name, status, notes, reminder_enabled)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [caseId, hearingDate, courtName, status || 'scheduled', notes || '', !!reminderEnabled]
    );

    return res.status(201).json({ hearing: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add hearing.', details: error.message });
  }
});

router.post('/cases/:caseId/hearings/:hearingId/sync-calendar', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const hearingId = toInt(req.params.hearingId);

  if (!caseId || !hearingId) {
    return res.status(400).json({ error: 'caseId and hearingId are required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE case_hearings
       SET calendar_synced = TRUE
       WHERE id = $1 AND case_id = $2
       RETURNING *`,
      [hearingId, caseId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Hearing not found.' });
    }

    return res.json({ hearing: result.rows[0], synced: true });
  } catch (error) {
    return res.status(500).json({ error: 'Calendar sync failed.', details: error.message });
  }
});

router.get('/cases/:caseId/deadline-alerts', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  if (!caseId) {
    return res.status(400).json({ error: 'Invalid caseId.' });
  }

  try {
    const [hearings, tasks] = await Promise.all([
      pool.query(
        `SELECT id, hearing_date, court_name
         FROM case_hearings
         WHERE case_id = $1
           AND hearing_date <= NOW() + INTERVAL '5 days'
         ORDER BY hearing_date ASC`,
        [caseId]
      ),
      pool.query(
        `SELECT id, title, due_date, priority
         FROM task_items
         WHERE case_id = $1
           AND due_date <= NOW() + INTERVAL '5 days'
           AND status <> 'completed'
         ORDER BY due_date ASC`,
        [caseId]
      ),
    ]);

    return res.json({ alerts: { hearings: hearings.rows, tasks: tasks.rows } });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to compute deadline alerts.', details: error.message });
  }
});

router.post('/cases/:caseId/court-decisions', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { decisionDate, outcome, summary, documentUrl } = req.body;

  if (!caseId || !decisionDate || !outcome) {
    return res.status(400).json({ error: 'caseId, decisionDate and outcome are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO court_decisions (case_id, decision_date, outcome, summary, document_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [caseId, decisionDate, outcome, summary || '', documentUrl || '']
    );

    return res.status(201).json({ decision: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to track court decision.', details: error.message });
  }
});

router.post('/cases/:caseId/log-time', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { lawyerId, hours, description, logDate, source } = req.body;

  if (!caseId || !lawyerId || !hours) {
    return res.status(400).json({ error: 'caseId, lawyerId and hours are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO time_logs (case_id, lawyer_id, hours, description, log_date, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [caseId, lawyerId, hours, description || '', normalizeDate(logDate), source || 'manual']
    );

    await logActivity(lawyerId, caseId, 'time_logged', { hours, source: source || 'manual' });
    return res.status(201).json({ timeLog: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to log time.', details: error.message });
  }
});

router.post('/cases/:caseId/timer/start', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { lawyerId, activityNote } = req.body;

  if (!caseId || !lawyerId) {
    return res.status(400).json({ error: 'caseId and lawyerId are required.' });
  }

  try {
    await pool.query(
      `UPDATE timers
       SET is_running = FALSE, end_time = NOW(),
           duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60
       WHERE case_id = $1 AND lawyer_id = $2 AND is_running = TRUE`,
      [caseId, lawyerId]
    );

    const result = await pool.query(
      `INSERT INTO timers (case_id, lawyer_id, start_time, activity_note, is_running)
       VALUES ($1, $2, NOW(), $3, TRUE)
       RETURNING *`,
      [caseId, lawyerId, activityNote || '']
    );

    return res.status(201).json({ timer: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to start timer.', details: error.message });
  }
});

router.post('/cases/:caseId/timer/stop', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { lawyerId, description } = req.body;

  if (!caseId || !lawyerId) {
    return res.status(400).json({ error: 'caseId and lawyerId are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const timerResult = await client.query(
      `UPDATE timers
       SET is_running = FALSE,
           end_time = NOW(),
           duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60
       WHERE id = (
         SELECT id FROM timers
         WHERE case_id = $1 AND lawyer_id = $2 AND is_running = TRUE
         ORDER BY created_at DESC
         LIMIT 1
       )
       RETURNING *`,
      [caseId, lawyerId]
    );

    if (!timerResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No running timer found.' });
    }

    const timer = timerResult.rows[0];
    const hours = Number((Number(timer.duration_minutes || 0) / 60).toFixed(2));

    const timeLogResult = await client.query(
      `INSERT INTO time_logs (case_id, lawyer_id, hours, description, log_date, source)
       VALUES ($1, $2, $3, $4, NOW(), 'timer')
       RETURNING *`,
      [caseId, lawyerId, hours, description || timer.activity_note || 'Timer session']
    );

    await client.query('COMMIT');
    await logActivity(lawyerId, caseId, 'timer_stopped', { hours });
    return res.json({ timer, timeLog: timeLogResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Failed to stop timer.', details: error.message });
  } finally {
    client.release();
  }
});

router.get('/cases/:caseId/time-suggestions', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  if (!caseId) {
    return res.status(400).json({ error: 'Invalid caseId.' });
  }

  try {
    const [activity, logs] = await Promise.all([
      pool.query(
        `SELECT activity_type, COUNT(*)::int AS count
         FROM activity_logs
         WHERE case_id = $1
           AND created_at >= NOW() - INTERVAL '7 days'
         GROUP BY activity_type
         ORDER BY count DESC
         LIMIT 3`,
        [caseId]
      ),
      pool.query(
        `SELECT COALESCE(AVG(hours), 0)::numeric(6,2) AS avg_hours
         FROM time_logs
         WHERE case_id = $1
           AND created_at >= NOW() - INTERVAL '14 days'`,
        [caseId]
      ),
    ]);

    const topActivity = activity.rows[0] ? activity.rows[0].activity_type : 'document_review';
    const suggestedHours = Number(logs.rows[0].avg_hours || 1.2);

    return res.json({
      suggestions: [
        `Based on recent activity (${topActivity}), consider logging ${suggestedHours || 1.2}h for this session.`,
        'Review unlogged meetings and document edits before day-end billing lock.',
      ],
      model: 'activity-heuristic-v1',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate time suggestions.', details: error.message });
  }
});

router.post('/cases/:caseId/tasks', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { lawyerId, title, dueDate, priority, assignedTo } = req.body;

  if (!caseId || !lawyerId || !title) {
    return res.status(400).json({ error: 'caseId, lawyerId and title are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO task_items (case_id, lawyer_id, title, due_date, status, priority, assigned_to, progress_pct)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, 0)
       RETURNING *`,
      [caseId, lawyerId, title, dueDate || null, priority || 'normal', assignedTo || 'self']
    );

    return res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create task.', details: error.message });
  }
});

router.patch('/tasks/:taskId/progress', async (req, res) => {
  const taskId = toInt(req.params.taskId);
  const { progressPct, status } = req.body;

  if (!taskId) {
    return res.status(400).json({ error: 'Invalid taskId.' });
  }

  const pct = Math.max(0, Math.min(100, toInt(progressPct, 0)));

  try {
    const result = await pool.query(
      `UPDATE task_items
       SET progress_pct = $1,
           status = COALESCE($2, CASE WHEN $1 >= 100 THEN 'completed' ELSE status END)
       WHERE id = $3
       RETURNING *`,
      [pct, status || null, taskId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    return res.json({ task: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update task progress.', details: error.message });
  }
});

router.post('/cases/:caseId/messages', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { lawyerId, clientId, subject, body, messageType, direction } = req.body;

  if (!caseId || !lawyerId || !clientId || !body) {
    return res.status(400).json({ error: 'caseId, lawyerId, clientId and body are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (lawyer_id, client_id, case_id, subject, body, message_type, direction, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
       RETURNING *`,
      [lawyerId, clientId, caseId, subject || 'Message', body, messageType || 'message', direction || 'outgoing']
    );

    return res.status(201).json({ message: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send message.', details: error.message });
  }
});

router.post('/cases/:caseId/request-documents', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { lawyerId, clientId, documentsNeeded } = req.body;

  if (!caseId || !lawyerId || !clientId || !documentsNeeded) {
    return res.status(400).json({ error: 'caseId, lawyerId, clientId and documentsNeeded are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (lawyer_id, client_id, case_id, subject, body, message_type, direction, is_read)
       VALUES ($1, $2, $3, 'Document Request', $4, 'document_request', 'outgoing', FALSE)
       RETURNING *`,
      [lawyerId, clientId, caseId, documentsNeeded]
    );

    return res.status(201).json({ request: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to request documents.', details: error.message });
  }
});

router.post('/cases/:caseId/share-update', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { lawyerId, clientId, updateText } = req.body;

  if (!caseId || !lawyerId || !clientId || !updateText) {
    return res.status(400).json({ error: 'caseId, lawyerId, clientId and updateText are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (lawyer_id, client_id, case_id, subject, body, message_type, direction, is_read)
       VALUES ($1, $2, $3, 'Case Update', $4, 'update', 'outgoing', FALSE)
       RETURNING *`,
      [lawyerId, clientId, caseId, updateText]
    );

    return res.status(201).json({ update: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to share update.', details: error.message });
  }
});

router.post('/cases/:caseId/meetings', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { lawyerId, title, meetingDate, notes } = req.body;

  if (!caseId || !lawyerId || !title || !meetingDate) {
    return res.status(400).json({ error: 'caseId, lawyerId, title and meetingDate are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO meetings (case_id, lawyer_id, title, meeting_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [caseId, lawyerId, title, meetingDate, notes || '']
    );

    return res.status(201).json({ meeting: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to schedule meeting.', details: error.message });
  }
});

router.post('/cases/:caseId/invoices/from-time', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { hourlyRate, dueDate, billingRule } = req.body;

  if (!caseId || !hourlyRate) {
    return res.status(400).json({ error: 'caseId and hourlyRate are required.' });
  }

  try {
    const hoursResult = await pool.query(
      `SELECT COALESCE(SUM(hours), 0)::numeric(12,2) AS total_hours
       FROM time_logs
       WHERE case_id = $1`,
      [caseId]
    );

    const totalHours = Number(hoursResult.rows[0].total_hours || 0);
    const amount = Number((totalHours * Number(hourlyRate)).toFixed(2));

    const clientResult = await pool.query(
      `SELECT client_id
       FROM case_clients
       WHERE case_id = $1
       ORDER BY client_id ASC
       LIMIT 1`,
      [caseId]
    );

    const result = await pool.query(
      `INSERT INTO invoices (case_id, client_id, amount, status, due_date, sent_at, billing_rule)
       VALUES ($1, $2, $3, 'pending', $4, NOW(), $5)
       RETURNING *`,
      [
        caseId,
        clientResult.rows[0] ? clientResult.rows[0].client_id : null,
        amount,
        dueDate || null,
        billingRule || 'time_log_conversion',
      ]
    );

    return res.status(201).json({ invoice: result.rows[0], totalHours, hourlyRate: Number(hourlyRate) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate invoice.', details: error.message });
  }
});

router.post('/invoices/:invoiceId/send', async (req, res) => {
  const invoiceId = toInt(req.params.invoiceId);
  if (!invoiceId) {
    return res.status(400).json({ error: 'Invalid invoiceId.' });
  }

  try {
    const result = await pool.query(
      `UPDATE invoices
       SET sent_at = NOW(),
           status = CASE WHEN status = 'draft' THEN 'pending' ELSE status END
       WHERE id = $1
       RETURNING *`,
      [invoiceId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    return res.json({ invoice: result.rows[0], sent: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send invoice.', details: error.message });
  }
});

router.patch('/invoices/:invoiceId/payment', async (req, res) => {
  const invoiceId = toInt(req.params.invoiceId);
  const amount = toFloat(req.body.amount);

  if (!invoiceId || amount === null) {
    return res.status(400).json({ error: 'invoiceId and numeric amount are required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE invoices
       SET paid_amount = COALESCE(paid_amount, 0) + $1,
           paid_at = NOW(),
           status = CASE
             WHEN COALESCE(paid_amount, 0) + $1 >= amount THEN 'paid'
             ELSE 'partial'
           END
       WHERE id = $2
       RETURNING *`,
      [amount, invoiceId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    return res.json({ invoice: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to register payment.', details: error.message });
  }
});

router.post('/invoices/:invoiceId/remind', async (req, res) => {
  const invoiceId = toInt(req.params.invoiceId);
  if (!invoiceId) {
    return res.status(400).json({ error: 'Invalid invoiceId.' });
  }

  try {
    const result = await pool.query(
      `UPDATE invoices
       SET remind_count = COALESCE(remind_count, 0) + 1
       WHERE id = $1
       RETURNING *`,
      [invoiceId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    return res.json({ invoice: result.rows[0], reminderSent: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send payment reminder.', details: error.message });
  }
});

router.post('/cases/:caseId/retainers', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const clientId = toInt(req.body.clientId);
  const amount = toFloat(req.body.amount);

  if (!caseId || !clientId || amount === null) {
    return res.status(400).json({ error: 'caseId, clientId and amount are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO retainers (case_id, client_id, amount, balance, status)
       VALUES ($1, $2, $3, $3, 'active')
       RETURNING *`,
      [caseId, clientId, amount]
    );

    return res.status(201).json({ retainer: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create retainer.', details: error.message });
  }
});

router.get('/research/search', async (req, res) => {
  const term = (req.query.q || '').toString().trim();
  if (!term) {
    return res.status(400).json({ error: 'q query param is required.' });
  }

  try {
    const canned = [
      {
        title: 'Property Chain of Title Principles',
        citation: 'CIV-LAND-2020-11',
        url: 'https://law.example/CIV-LAND-2020-11',
      },
      {
        title: 'Interim Injunction Requirements',
        citation: 'CIV-RELIEF-2019-24',
        url: 'https://law.example/CIV-RELIEF-2019-24',
      },
      {
        title: 'Contract Breach Damages Guide',
        citation: 'COM-2022-04',
        url: 'https://law.example/COM-2022-04',
      },
    ];

    const results = canned.filter(item =>
      `${item.title} ${item.citation}`.toLowerCase().includes(term.toLowerCase())
    );

    return res.json({ results: results.length ? results : canned.slice(0, 2) });
  } catch (error) {
    return res.status(500).json({ error: 'Research search failed.', details: error.message });
  }
});

router.post('/cases/:caseId/research', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  const { title, citation, url, notes } = req.body;

  if (!caseId || !title) {
    return res.status(400).json({ error: 'caseId and title are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO case_research_refs (case_id, title, citation, url, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [caseId, title, citation || '', url || '', notes || '']
    );

    return res.status(201).json({ reference: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to attach research reference.', details: error.message });
  }
});

router.get('/cases/:caseId/research-ai-suggestions', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  if (!caseId) {
    return res.status(400).json({ error: 'Invalid caseId.' });
  }

  try {
    const caseResult = await pool.query('SELECT title, case_type FROM cases WHERE id = $1 LIMIT 1', [caseId]);
    if (!caseResult.rows.length) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    const caseRow = caseResult.rows[0];
    return res.json({
      suggestions: [
        `Review ${caseRow.case_type} procedural deadlines relevant to ${caseRow.title}.`,
        'Check recent appellate decisions from the same jurisdiction and court level.',
        'Validate burden-of-proof standards against current evidence matrix.',
      ],
      model: 'law-suggest-v1',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate legal research suggestions.', details: error.message });
  }
});

router.get('/lawyer/performance/:lawyerId', async (req, res) => {
  const lawyerId = toInt(req.params.lawyerId);
  if (!lawyerId) {
    return res.status(400).json({ error: 'Invalid lawyerId.' });
  }

  try {
    const [caseStats, revenueStats, hoursStats] = await Promise.all([
      pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'closed')::int AS closed_cases,
          COUNT(*) FILTER (WHERE status = 'closed' AND risk_level = 'low')::int AS successful_closed
         FROM cases
         WHERE lawyer_id = $1`,
        [lawyerId]
      ),
      pool.query(
        `SELECT c.id, c.title,
                COALESCE(SUM(i.paid_amount), 0)::numeric(12,2) AS revenue
         FROM cases c
         LEFT JOIN invoices i ON i.case_id = c.id
         WHERE c.lawyer_id = $1
         GROUP BY c.id
         ORDER BY revenue DESC`,
        [lawyerId]
      ),
      pool.query(
        `SELECT c.id, c.title,
                COALESCE(SUM(t.hours), 0)::numeric(12,2) AS billable_hours
         FROM cases c
         LEFT JOIN time_logs t ON t.case_id = c.id
         WHERE c.lawyer_id = $1
         GROUP BY c.id
         ORDER BY billable_hours DESC`,
        [lawyerId]
      ),
    ]);

    const closedCases = Number(caseStats.rows[0].closed_cases || 0);
    const successfulClosed = Number(caseStats.rows[0].successful_closed || 0);
    const winRate = closedCases ? Number(((successfulClosed / closedCases) * 100).toFixed(2)) : 0;

    return res.json({
      winRate,
      revenuePerCase: revenueStats.rows,
      billableHoursPerCase: hoursStats.rows,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch performance analytics.', details: error.message });
  }
});

router.get('/cases/:caseId/ai-suggestions', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  if (!caseId) {
    return res.status(400).json({ error: 'Invalid caseId.' });
  }

  try {
    const [caseMeta, hearingMeta, pendingInvoices, openTasks] = await Promise.all([
      pool.query('SELECT title, status, risk_level FROM cases WHERE id = $1 LIMIT 1', [caseId]),
      pool.query(
        `SELECT hearing_date
         FROM case_hearings
         WHERE case_id = $1
           AND hearing_date >= NOW()
         ORDER BY hearing_date ASC
         LIMIT 1`,
        [caseId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM invoices
         WHERE case_id = $1 AND status IN ('pending', 'overdue')`,
        [caseId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM task_items
         WHERE case_id = $1 AND status <> 'completed'`,
        [caseId]
      ),
    ]);

    if (!caseMeta.rows.length) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    const suggestions = [];
    const riskFlags = [];

    const nextHearing = hearingMeta.rows[0] && hearingMeta.rows[0].hearing_date;
    if (nextHearing) {
      suggestions.push('Prepare hearing brief and witness checklist before the next court date.');
      riskFlags.push('Upcoming hearing detected. Ensure evidence bundle is finalized.');
    }

    if (pendingInvoices.rows[0].count > 0) {
      suggestions.push('Follow up with client on pending invoice to avoid billing delays.');
      riskFlags.push('Outstanding payment may impact case momentum.');
    }

    if (openTasks.rows[0].count > 5) {
      suggestions.push('Delegate or reprioritize tasks to reduce execution bottlenecks.');
      riskFlags.push('High open task volume increases deadline risk.');
    }

    if (!suggestions.length) {
      suggestions.push('Case is stable. Continue with current strategy and monitor new filings.');
    }

    return res.json({
      caseTitle: caseMeta.rows[0].title,
      caseStatus: caseMeta.rows[0].status,
      suggestions,
      riskFlags,
      model: 'rule-based-v2',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate AI suggestions.', details: error.message });
  }
});

router.get('/cases/:caseId/ai-advanced', async (req, res) => {
  const caseId = toInt(req.params.caseId);
  if (!caseId) {
    return res.status(400).json({ error: 'Invalid caseId.' });
  }

  try {
    const [caseMeta, evidenceCount, noteCount] = await Promise.all([
      pool.query('SELECT id, title, case_type, status FROM cases WHERE id = $1 LIMIT 1', [caseId]),
      pool.query('SELECT COUNT(*)::int AS count FROM case_evidence WHERE case_id = $1', [caseId]),
      pool.query('SELECT COUNT(*)::int AS count FROM case_notes WHERE case_id = $1', [caseId]),
    ]);

    if (!caseMeta.rows.length) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    const evidence = Number(evidenceCount.rows[0].count || 0);
    const notes = Number(noteCount.rows[0].count || 0);
    const confidence = Math.min(95, 40 + evidence * 8 + notes * 4);
    const riskScore = Math.max(10, 75 - evidence * 6 - notes * 3);

    return res.json({
      predictedOutcome: confidence >= 65 ? 'favorable' : 'uncertain',
      confidence,
      riskScore,
      strategySuggestions: [
        'Strengthen chronology with dated exhibits and witness availability matrix.',
        'Prioritize settlement prep while preserving trial-readiness package.',
        'Draft targeted motion based on weakest opposing claim element.',
      ],
      draftGeneratorPreview: `Draft for ${caseMeta.rows[0].title}:\n1) Facts\n2) Issues\n3) Applicable law\n4) Requested relief`,
      model: 'ai-advanced-suite-v1',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate advanced AI output.', details: error.message });
  }
});

module.exports = router;
