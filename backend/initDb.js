const pool = require('./db');

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Core tables ───────────────────────────────────────────────────────────

    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY, full_name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL, password_hash TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY, full_name TEXT NOT NULL, email TEXT, phone TEXT,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS cases (
      id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, case_type TEXT,
      status TEXT DEFAULT 'open', lawyer_id INTEGER NOT NULL REFERENCES users(id),
      risk_level TEXT DEFAULT 'medium', outcome_prediction NUMERIC(5,2),
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS case_clients (
      case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      PRIMARY KEY (case_id, client_id))`);

    await client.query(`CREATE TABLE IF NOT EXISTS case_notes (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      lawyer_id INTEGER NOT NULL REFERENCES users(id), note_content TEXT NOT NULL,
      strategy TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS case_evidence (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      title TEXT NOT NULL, file_url TEXT, description TEXT, uploaded_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS case_events (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL, event_date TIMESTAMP NOT NULL, description TEXT,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS case_documents (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      title TEXT NOT NULL, document_url TEXT, contract_ref TEXT,
      content_text TEXT, source_type TEXT DEFAULT 'uploaded', is_external BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS case_hearings (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      hearing_date TIMESTAMP NOT NULL, court_name TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled', notes TEXT,
      reminder_enabled BOOLEAN DEFAULT TRUE, calendar_synced BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS task_items (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
      lawyer_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      due_date TIMESTAMP, status TEXT DEFAULT 'pending', priority TEXT DEFAULT 'normal',
      assigned_to TEXT, progress_pct INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY, lawyer_id INTEGER NOT NULL REFERENCES users(id),
      client_id INTEGER REFERENCES clients(id), case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
      subject TEXT, body TEXT, is_read BOOLEAN DEFAULT FALSE,
      message_type TEXT DEFAULT 'message', direction TEXT DEFAULT 'outgoing',
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      amount NUMERIC(12,2) NOT NULL, status TEXT DEFAULT 'pending', due_date TIMESTAMP,
      sent_at TIMESTAMP, paid_at TIMESTAMP, paid_amount NUMERIC(12,2) DEFAULT 0,
      remind_count INTEGER DEFAULT 0, billing_rule TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS time_logs (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      lawyer_id INTEGER NOT NULL REFERENCES users(id), hours NUMERIC(6,2) NOT NULL,
      description TEXT, source TEXT DEFAULT 'manual', suggestion TEXT,
      log_date TIMESTAMP DEFAULT NOW(), created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS meetings (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      lawyer_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      meeting_date TIMESTAMP NOT NULL, notes TEXT, status TEXT DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS document_templates (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
      body_text TEXT NOT NULL, premium BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS document_versions (
      id SERIAL PRIMARY KEY, case_document_id INTEGER NOT NULL REFERENCES case_documents(id) ON DELETE CASCADE,
      version_no INTEGER NOT NULL, content_text TEXT, change_summary TEXT,
      created_by INTEGER REFERENCES users(id), created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS esign_requests (
      id SERIAL PRIMARY KEY, case_document_id INTEGER NOT NULL REFERENCES case_documents(id) ON DELETE CASCADE,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      provider TEXT DEFAULT 'internal', status TEXT DEFAULT 'pending',
      sent_at TIMESTAMP, completed_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS timers (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      lawyer_id INTEGER NOT NULL REFERENCES users(id), start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP, duration_minutes NUMERIC(8,2), activity_note TEXT,
      is_running BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS retainers (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      amount NUMERIC(12,2) NOT NULL, balance NUMERIC(12,2) NOT NULL,
      status TEXT DEFAULT 'active', created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS court_decisions (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      decision_date TIMESTAMP NOT NULL, outcome TEXT NOT NULL, summary TEXT,
      document_url TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS case_research_refs (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      title TEXT NOT NULL, citation TEXT, url TEXT, notes TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY, lawyer_id INTEGER NOT NULL REFERENCES users(id),
      case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
      activity_type TEXT NOT NULL, meta JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT NOW())`);

    // ── Navigation / Role tables ───────────────────────────────────────────────

    await client.query(`CREATE TABLE IF NOT EXISTS app_roles (
      id SERIAL PRIMARY KEY, role_key TEXT NOT NULL UNIQUE, label TEXT NOT NULL,
      color TEXT, icon TEXT, sort_order INTEGER DEFAULT 0)`);

    await client.query(`CREATE TABLE IF NOT EXISTS navigation_sections (
      id SERIAL PRIMARY KEY, section_key TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
      icon TEXT, sort_order INTEGER DEFAULT 0)`);

    await client.query(`CREATE TABLE IF NOT EXISTS navigation_items (
      id SERIAL PRIMARY KEY, section_id INTEGER NOT NULL REFERENCES navigation_sections(id) ON DELETE CASCADE,
      title TEXT NOT NULL, path TEXT NOT NULL, sort_order INTEGER DEFAULT 0,
      UNIQUE (section_id, path))`);

    await client.query(`CREATE TABLE IF NOT EXISTS role_section_access (
      role_id INTEGER NOT NULL REFERENCES app_roles(id) ON DELETE CASCADE,
      section_id INTEGER NOT NULL REFERENCES navigation_sections(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, section_id))`);

    // ── SaaS / Super Admin tables ─────────────────────────────────────────────

    await client.query(`CREATE TABLE IF NOT EXISTS subscription_plans (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, code TEXT NOT NULL UNIQUE,
      price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0, price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
      max_users INTEGER DEFAULT 5, max_cases INTEGER DEFAULT 50,
      max_storage_gb INTEGER DEFAULT 5, ai_tokens_monthly INTEGER DEFAULT 10000,
      features JSONB DEFAULT '[]'::jsonb, is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS tenants (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL, phone TEXT, address TEXT, country TEXT DEFAULT 'TN',
      status TEXT DEFAULT 'active', plan_id INTEGER REFERENCES subscription_plans(id),
      logo_url TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS tenant_subscriptions (
      id SERIAL PRIMARY KEY, tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
      billing_cycle TEXT DEFAULT 'monthly', status TEXT DEFAULT 'active',
      current_period_start TIMESTAMP DEFAULT NOW(),
      current_period_end TIMESTAMP DEFAULT NOW() + INTERVAL '30 days',
      stripe_subscription_id TEXT, stripe_customer_id TEXT, cancelled_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS feature_flags (
      id SERIAL PRIMARY KEY, flag_key TEXT NOT NULL UNIQUE, label TEXT NOT NULL,
      description TEXT, default_enabled BOOLEAN DEFAULT FALSE,
      category TEXT DEFAULT 'general', created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS tenant_feature_flags (
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      flag_key TEXT NOT NULL, enabled BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMP DEFAULT NOW(), PRIMARY KEY (tenant_id, flag_key))`);

    await client.query(`CREATE TABLE IF NOT EXISTS platform_audit_logs (
      id SERIAL PRIMARY KEY, actor_email TEXT NOT NULL, actor_role TEXT DEFAULT 'superadmin',
      action TEXT NOT NULL, resource_type TEXT, resource_id TEXT,
      details JSONB DEFAULT '{}'::jsonb, ip_address TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY, value TEXT, description TEXT, updated_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY, tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
      label TEXT NOT NULL, key_hash TEXT NOT NULL UNIQUE, key_prefix TEXT NOT NULL,
      scopes TEXT[] DEFAULT '{}', last_used_at TIMESTAMP, expires_at TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS impersonation_sessions (
      id SERIAL PRIMARY KEY, superadmin_email TEXT NOT NULL,
      target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL,
      reason TEXT, started_at TIMESTAMP DEFAULT NOW(), ended_at TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE)`);

    await client.query(`CREATE TABLE IF NOT EXISTS email_sms_config (
      id SERIAL PRIMARY KEY, provider TEXT NOT NULL, config_type TEXT NOT NULL,
      settings JSONB DEFAULT '{}'::jsonb, is_active BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS storage_config (
      id SERIAL PRIMARY KEY, provider TEXT NOT NULL DEFAULT 'local',
      settings JSONB DEFAULT '{}'::jsonb, used_bytes BIGINT DEFAULT 0,
      quota_bytes BIGINT DEFAULT 10737418240, updated_at TIMESTAMP DEFAULT NOW())`);

    // ── Firm Admin / HR tables ─────────────────────────────────────────────────

    await client.query(`CREATE TABLE IF NOT EXISTS departments (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL,
      head_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      description TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS office_locations (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, address TEXT, city TEXT,
      country TEXT DEFAULT 'TN', phone TEXT, is_hq BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS staff_invitations (
      id SERIAL PRIMARY KEY, email TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'lawyer',
      invited_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      token TEXT NOT NULL UNIQUE, status TEXT DEFAULT 'pending',
      expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
      accepted_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS firm_profile (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, tagline TEXT, email TEXT, phone TEXT,
      address TEXT, website TEXT, logo_url TEXT, bar_number TEXT, founded_year INTEGER,
      specializations TEXT[], updated_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS workflows (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT, trigger_event TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS workflow_steps (
      id SERIAL PRIMARY KEY, workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
      step_order INTEGER NOT NULL, step_type TEXT NOT NULL, label TEXT NOT NULL,
      config JSONB DEFAULT '{}'::jsonb, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS pricing_config (
      id SERIAL PRIMARY KEY, service_name TEXT NOT NULL,
      billing_type TEXT DEFAULT 'hourly', rate NUMERIC(10,2) NOT NULL DEFAULT 0,
      currency TEXT DEFAULT 'TND', notes TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    // ── Senior Lawyer tables ──────────────────────────────────────────────────

    await client.query(`CREATE TABLE IF NOT EXISTS approvals (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      requested_by INTEGER NOT NULL REFERENCES users(id),
      assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
      approval_type TEXT NOT NULL, title TEXT NOT NULL, description TEXT,
      status TEXT DEFAULT 'pending', decision TEXT, decision_notes TEXT,
      decided_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS legal_strategies (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      lawyer_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      strategy_type TEXT DEFAULT 'defense', description TEXT, strengths TEXT,
      weaknesses TEXT, recommendations TEXT, status TEXT DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS settlements (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      proposed_by INTEGER NOT NULL REFERENCES users(id),
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      amount NUMERIC(12,2), terms TEXT, status TEXT DEFAULT 'proposed',
      approved_at TIMESTAMP, rejected_reason TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS collaboration_threads (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      title TEXT NOT NULL, created_by INTEGER NOT NULL REFERENCES users(id),
      participants INTEGER[], created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS collaboration_messages (
      id SERIAL PRIMARY KEY, thread_id INTEGER NOT NULL REFERENCES collaboration_threads(id) ON DELETE CASCADE,
      sender_id INTEGER NOT NULL REFERENCES users(id), body TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`);

    // ── Attorney / Lawyer tools ───────────────────────────────────────────────

    await client.query(`CREATE TABLE IF NOT EXISTS pleadings (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      lawyer_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      pleading_type TEXT DEFAULT 'motion', content TEXT, status TEXT DEFAULT 'draft',
      filed_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS ocr_documents (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      uploaded_by INTEGER NOT NULL REFERENCES users(id), original_filename TEXT NOT NULL,
      file_url TEXT, extracted_text TEXT, status TEXT DEFAULT 'pending',
      language TEXT DEFAULT 'fr', created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS ai_drafts (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      lawyer_id INTEGER NOT NULL REFERENCES users(id), draft_type TEXT NOT NULL,
      prompt TEXT NOT NULL, generated_content TEXT, edited_content TEXT,
      status TEXT DEFAULT 'generated', created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS email_integrations (
      id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL DEFAULT 'gmail', email_address TEXT NOT NULL,
      access_token TEXT, refresh_token TEXT, is_active BOOLEAN DEFAULT FALSE,
      last_synced_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS deadlines (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      lawyer_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      deadline_date TIMESTAMP NOT NULL, reminder_days INTEGER DEFAULT 3,
      status TEXT DEFAULT 'upcoming', priority TEXT DEFAULT 'normal',
      notes TEXT, completed_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS billable_hours (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      lawyer_id INTEGER NOT NULL REFERENCES users(id), date DATE NOT NULL DEFAULT CURRENT_DATE,
      hours NUMERIC(5,2) NOT NULL, rate NUMERIC(10,2) DEFAULT 0, activity TEXT NOT NULL,
      is_billed BOOLEAN DEFAULT FALSE,
      invoice_id INTEGER REFERENCES invoices(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS research_notes (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      content TEXT, sources TEXT[], tags TEXT[],
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);

    // ── Reception / Secretary tables ──────────────────────────────────────────

    await client.query(`CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY, client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, title TEXT NOT NULL,
      appointment_date TIMESTAMP NOT NULL, duration_minutes INTEGER DEFAULT 60,
      location TEXT, appointment_type TEXT DEFAULT 'consultation',
      status TEXT DEFAULT 'scheduled', notes TEXT,
      reminder_sent BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS visitors (
      id SERIAL PRIMARY KEY, full_name TEXT NOT NULL, company TEXT, phone TEXT,
      email TEXT, purpose TEXT, host_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      check_in_at TIMESTAMP DEFAULT NOW(), check_out_at TIMESTAMP,
      badge_number TEXT, status TEXT DEFAULT 'checked_in', created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS intake_forms (
      id SERIAL PRIMARY KEY, client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      form_type TEXT DEFAULT 'new_client',
      submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      data JSONB DEFAULT '{}'::jsonb, status TEXT DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS queue_entries (
      id SERIAL PRIMARY KEY, visitor_id INTEGER REFERENCES visitors(id) ON DELETE CASCADE,
      queue_number INTEGER NOT NULL, service_type TEXT DEFAULT 'consultation',
      assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'waiting', called_at TIMESTAMP, served_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS filing_checklists (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      created_by INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      court TEXT, filing_deadline TIMESTAMP, status TEXT DEFAULT 'in_progress',
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS filing_checklist_items (
      id SERIAL PRIMARY KEY, checklist_id INTEGER NOT NULL REFERENCES filing_checklists(id) ON DELETE CASCADE,
      label TEXT NOT NULL, is_required BOOLEAN DEFAULT TRUE, is_done BOOLEAN DEFAULT FALSE,
      done_at TIMESTAMP, notes TEXT, sort_order INTEGER DEFAULT 0)`);

    await client.query(`CREATE TABLE IF NOT EXISTS email_templates (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, subject TEXT NOT NULL,
      body TEXT NOT NULL, category TEXT DEFAULT 'general', variables TEXT[],
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS sms_reminders (
      id SERIAL PRIMARY KEY, recipient_phone TEXT NOT NULL, recipient_name TEXT,
      message TEXT NOT NULL, send_at TIMESTAMP NOT NULL, sent_at TIMESTAMP,
      status TEXT DEFAULT 'pending', related_type TEXT, related_id INTEGER,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY, full_name TEXT NOT NULL, company TEXT, email TEXT,
      phone TEXT, mobile TEXT, role TEXT DEFAULT 'contact', address TEXT,
      notes TEXT, is_starred BOOLEAN DEFAULT FALSE,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW())`);

    // ── Finance tables ────────────────────────────────────────────────────────

    await client.query(`CREATE TABLE IF NOT EXISTS trust_accounts (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      account_name TEXT NOT NULL, account_number TEXT, bank_name TEXT,
      balance NUMERIC(12,2) DEFAULT 0, currency TEXT DEFAULT 'TND',
      status TEXT DEFAULT 'active', created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS trust_transactions (
      id SERIAL PRIMARY KEY,
      trust_account_id INTEGER NOT NULL REFERENCES trust_accounts(id) ON DELETE CASCADE,
      transaction_type TEXT NOT NULL, amount NUMERIC(12,2) NOT NULL,
      description TEXT, reference TEXT, balance_after NUMERIC(12,2),
      recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      transaction_date DATE DEFAULT CURRENT_DATE, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS payroll (
      id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pay_period_start DATE NOT NULL, pay_period_end DATE NOT NULL,
      base_salary NUMERIC(10,2) NOT NULL DEFAULT 0,
      bonus NUMERIC(10,2) DEFAULT 0, deductions NUMERIC(10,2) DEFAULT 0,
      net_pay NUMERIC(10,2) GENERATED ALWAYS AS (base_salary + bonus - deductions) STORED,
      status TEXT DEFAULT 'pending', paid_at TIMESTAMP, notes TEXT,
      created_at TIMESTAMP DEFAULT NOW())`);

    // ── HR tables ─────────────────────────────────────────────────────────────

    await client.query(`CREATE TABLE IF NOT EXISTS employee_records (
      id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      job_title TEXT, contract_type TEXT DEFAULT 'permanent',
      start_date DATE, end_date DATE, salary NUMERIC(10,2),
      national_id TEXT, bank_account TEXT,
      emergency_contact_name TEXT, emergency_contact_phone TEXT, notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS leave_requests (
      id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      leave_type TEXT NOT NULL DEFAULT 'annual',
      start_date DATE NOT NULL, end_date DATE NOT NULL,
      days_count INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
      reason TEXT, status TEXT DEFAULT 'pending',
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      review_notes TEXT, reviewed_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS attendance_records (
      id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL DEFAULT CURRENT_DATE, check_in TIMESTAMP, check_out TIMESTAMP,
      status TEXT DEFAULT 'present', notes TEXT, UNIQUE(user_id, date))`);

    await client.query(`CREATE TABLE IF NOT EXISTS recruitment_postings (
      id SERIAL PRIMARY KEY, title TEXT NOT NULL,
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      job_type TEXT DEFAULT 'full_time', description TEXT, requirements TEXT,
      salary_range TEXT, status TEXT DEFAULT 'open',
      posted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      closes_at DATE, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS recruitment_applications (
      id SERIAL PRIMARY KEY,
      posting_id INTEGER NOT NULL REFERENCES recruitment_postings(id) ON DELETE CASCADE,
      applicant_name TEXT NOT NULL, applicant_email TEXT NOT NULL,
      resume_url TEXT, cover_letter TEXT, status TEXT DEFAULT 'applied',
      interviewed_at TIMESTAMP, score INTEGER, notes TEXT,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS hr_performance_reviews (
      id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reviewer_id INTEGER NOT NULL REFERENCES users(id), review_period TEXT NOT NULL,
      overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 10),
      goals_met BOOLEAN DEFAULT FALSE, strengths TEXT, improvements TEXT,
      comments TEXT, status TEXT DEFAULT 'draft', submitted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW())`);

    // ── Client Portal tables ──────────────────────────────────────────────────

    await client.query(`CREATE TABLE IF NOT EXISTS client_case_updates (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      title TEXT NOT NULL, body TEXT, update_type TEXT DEFAULT 'general',
      is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS client_payments (
      id SERIAL PRIMARY KEY, client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      invoice_id INTEGER REFERENCES invoices(id) ON DELETE SET NULL,
      amount NUMERIC(12,2) NOT NULL, currency TEXT DEFAULT 'TND',
      payment_method TEXT DEFAULT 'bank_transfer', gateway_ref TEXT,
      status TEXT DEFAULT 'pending', paid_at TIMESTAMP, notes TEXT,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS video_meetings (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      lawyer_id INTEGER NOT NULL REFERENCES users(id),
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      title TEXT NOT NULL, scheduled_at TIMESTAMP NOT NULL,
      duration_minutes INTEGER DEFAULT 60, meeting_url TEXT,
      provider TEXT DEFAULT 'internal', status TEXT DEFAULT 'scheduled',
      notes TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS faq_entries (
      id SERIAL PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL,
      category TEXT DEFAULT 'general', is_active BOOLEAN DEFAULT TRUE,
      views INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`);

    // ── Corporate Client tables ───────────────────────────────────────────────

    await client.query(`CREATE TABLE IF NOT EXISTS corporate_clients (
      id SERIAL PRIMARY KEY, company_name TEXT NOT NULL,
      registration_number TEXT, industry TEXT, contact_name TEXT,
      contact_email TEXT NOT NULL, contact_phone TEXT, address TEXT,
      website TEXT, status TEXT DEFAULT 'active', plan TEXT DEFAULT 'standard',
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS corporate_legal_requests (
      id SERIAL PRIMARY KEY,
      corporate_id INTEGER NOT NULL REFERENCES corporate_clients(id) ON DELETE CASCADE,
      title TEXT NOT NULL, description TEXT,
      request_type TEXT DEFAULT 'consultation', priority TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'submitted',
      assigned_lawyer INTEGER REFERENCES users(id) ON DELETE SET NULL,
      resolved_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS corporate_approvals (
      id SERIAL PRIMARY KEY,
      corporate_id INTEGER NOT NULL REFERENCES corporate_clients(id) ON DELETE CASCADE,
      title TEXT NOT NULL, description TEXT, requested_by TEXT NOT NULL,
      approved_by TEXT, status TEXT DEFAULT 'pending', priority TEXT DEFAULT 'normal',
      decided_at TIMESTAMP, notes TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS corporate_contracts (
      id SERIAL PRIMARY KEY,
      corporate_id INTEGER NOT NULL REFERENCES corporate_clients(id) ON DELETE CASCADE,
      title TEXT NOT NULL, contract_type TEXT DEFAULT 'service',
      status TEXT DEFAULT 'active', signed_at DATE, expires_at DATE,
      value NUMERIC(12,2), document_url TEXT, notes TEXT,
      created_at TIMESTAMP DEFAULT NOW())`);

    // ── External Expert / Court Liaison / Investigator / Compliance tables ────

    await client.query(`CREATE TABLE IF NOT EXISTS expert_reports (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      submitted_by INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      report_type TEXT DEFAULT 'expert_opinion', content TEXT, file_url TEXT,
      status TEXT DEFAULT 'draft', submitted_at TIMESTAMP,
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      review_notes TEXT, created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS court_notices (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      uploaded_by INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      notice_type TEXT DEFAULT 'general', court_name TEXT, notice_date DATE,
      file_url TEXT, content TEXT, is_urgent BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'received', created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS filing_tracker (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      managed_by INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      filing_type TEXT DEFAULT 'motion', court_name TEXT, filed_at TIMESTAMP,
      deadline TIMESTAMP, status TEXT DEFAULT 'pending', reference_number TEXT,
      notes TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS court_communication_log (
      id SERIAL PRIMARY KEY, case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      logged_by INTEGER NOT NULL REFERENCES users(id),
      communication_type TEXT DEFAULT 'call', court_name TEXT,
      contact_person TEXT, summary TEXT NOT NULL, outcome TEXT,
      follow_up_date DATE, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS investigation_findings (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      investigator_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      finding_type TEXT DEFAULT 'general', description TEXT, location TEXT,
      gps_lat NUMERIC(10,7), gps_lng NUMERIC(10,7), media_urls TEXT[],
      is_confidential BOOLEAN DEFAULT FALSE, status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS interview_records (
      id SERIAL PRIMARY KEY, case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      investigator_id INTEGER NOT NULL REFERENCES users(id),
      interviewee_name TEXT NOT NULL, interviewee_role TEXT,
      interview_date TIMESTAMP NOT NULL, location TEXT, summary TEXT,
      key_points TEXT[], recording_url TEXT, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS evidence_chain_of_custody (
      id SERIAL PRIMARY KEY, evidence_id INTEGER REFERENCES case_evidence(id) ON DELETE CASCADE,
      case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      handler_id INTEGER NOT NULL REFERENCES users(id), action TEXT NOT NULL,
      from_location TEXT, to_location TEXT, notes TEXT,
      timestamp TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS compliance_reviews (
      id SERIAL PRIMARY KEY,
      case_document_id INTEGER REFERENCES case_documents(id) ON DELETE CASCADE,
      reviewer_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
      review_type TEXT DEFAULT 'contract', overall_risk TEXT DEFAULT 'medium',
      summary TEXT, compliance_score INTEGER, status TEXT DEFAULT 'pending',
      approved_at TIMESTAMP, rejected_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS compliance_flags (
      id SERIAL PRIMARY KEY,
      review_id INTEGER NOT NULL REFERENCES compliance_reviews(id) ON DELETE CASCADE,
      flag_type TEXT NOT NULL, severity TEXT DEFAULT 'medium',
      description TEXT NOT NULL, clause_reference TEXT, recommendation TEXT,
      is_resolved BOOLEAN DEFAULT FALSE, resolved_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS clause_comparisons (
      id SERIAL PRIMARY KEY,
      review_id INTEGER NOT NULL REFERENCES compliance_reviews(id) ON DELETE CASCADE,
      clause_title TEXT NOT NULL, original_text TEXT, standard_text TEXT,
      similarity_pct INTEGER, risk_level TEXT DEFAULT 'low', notes TEXT,
      created_at TIMESTAMP DEFAULT NOW())`);

    // ── Enterprise tables ─────────────────────────────────────────────────────

    await client.query(`CREATE TABLE IF NOT EXISTS webhooks (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL,
      secret TEXT, events TEXT[] DEFAULT '{}', is_active BOOLEAN DEFAULT TRUE,
      last_triggered_at TIMESTAMP, last_status INTEGER, failure_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS webhook_deliveries (
      id SERIAL PRIMARY KEY, webhook_id INTEGER NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL, payload JSONB DEFAULT '{}'::jsonb,
      response_status INTEGER, response_body TEXT, duration_ms INTEGER,
      delivered_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS automation_rules (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT,
      trigger_event TEXT NOT NULL, conditions JSONB DEFAULT '[]'::jsonb,
      is_active BOOLEAN DEFAULT TRUE,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      run_count INTEGER DEFAULT 0, last_run_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS automation_actions (
      id SERIAL PRIMARY KEY, rule_id INTEGER NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
      action_type TEXT NOT NULL, config JSONB DEFAULT '{}'::jsonb,
      step_order INTEGER DEFAULT 1)`);

    await client.query(`CREATE TABLE IF NOT EXISTS retention_policies (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, document_type TEXT,
      retention_days INTEGER NOT NULL DEFAULT 2555,
      action_on_expiry TEXT DEFAULT 'archive',
      applies_to_roles TEXT[] DEFAULT '{}',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS data_exports (
      id SERIAL PRIMARY KEY, requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      export_type TEXT NOT NULL, status TEXT DEFAULT 'pending',
      file_url TEXT, row_count INTEGER, file_size_bytes BIGINT,
      filters JSONB DEFAULT '{}'::jsonb,
      started_at TIMESTAMP, completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS crm_integrations (
      id SERIAL PRIMARY KEY, provider TEXT NOT NULL, label TEXT NOT NULL,
      api_key TEXT, instance_url TEXT, settings JSONB DEFAULT '{}'::jsonb,
      is_active BOOLEAN DEFAULT FALSE, last_synced_at TIMESTAMP,
      sync_count INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS custom_domains (
      id SERIAL PRIMARY KEY, domain TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'pending', ssl_enabled BOOLEAN DEFAULT FALSE,
      verified_at TIMESTAMP, dns_txt_record TEXT,
      created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS sso_configs (
      id SERIAL PRIMARY KEY, provider TEXT NOT NULL DEFAULT 'saml',
      entity_id TEXT, sso_url TEXT, certificate TEXT,
      attribute_mapping JSONB DEFAULT '{}'::jsonb,
      is_active BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS bi_saved_reports (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT,
      report_type TEXT NOT NULL, config JSONB DEFAULT '{}'::jsonb,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      is_pinned BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`);

    await client.query(`CREATE TABLE IF NOT EXISTS disaster_recovery_logs (
      id SERIAL PRIMARY KEY, backup_type TEXT NOT NULL DEFAULT 'full',
      status TEXT DEFAULT 'completed', file_url TEXT,
      size_bytes BIGINT, duration_seconds INTEGER,
      initiated_by TEXT DEFAULT 'scheduler', created_at TIMESTAMP DEFAULT NOW())`);

    await client.query('COMMIT');

    // ── Seed data (separate transaction) ─────────────────────────────────────
    await seedData(pool);

    console.log('Database initialised successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function seedData(pool) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');

    // ── Users ─────────────────────────────────────────────────────────────────
    await c.query(`INSERT INTO users (full_name, email, role) VALUES
      ('Ahmed Cherni',    'lawyer@eloyer.local',        'lawyer'),
      ('System Admin',    'admin@eloyer.local',          'admin'),
      ('Sonia Belhaj',    'sonia.belhaj@eloyer.local',   'senior_lawyer'),
      ('Karim Ferjani',   'karim.ferjani@eloyer.local',  'attorney'),
      ('Nadia Trabelsi',  'nadia.trabelsi@eloyer.local', 'paralegal'),
      ('Youssef Hamdi',   'youssef.hamdi@eloyer.local',  'legal_secretary'),
      ('Fatma Khelil',    'fatma.khelil@eloyer.local',   'hr_manager'),
      ('Omar Sfar',       'omar.sfar@eloyer.local',      'accountant'),
      ('Ines Zouari',     'ines.zouari@eloyer.local',    'receptionist'),
      ('Hedi Maaouia',    'hedi.maaouia@eloyer.local',   'investigator'),
      ('Leila Dridi',     'leila.dridi@eloyer.local',    'compliance_officer'),
      ('Tarek Bouzid',    'tarek.bouzid@eloyer.local',   'consultant')
      ON CONFLICT (email) DO NOTHING`);

    // ── Clients ───────────────────────────────────────────────────────────────
    await c.query(`INSERT INTO clients (full_name, email, phone) VALUES
      ('Ahmed Ben Ali',         'ahmed.benali@mail.tn',       '+216 20 100 001'),
      ('Société ABC SARL',      'contact@abc-sarl.tn',         '+216 71 777 777'),
      ('Leila Mansour',         'leila.mansour@mail.tn',       '+216 20 100 003'),
      ('Mohamed Gharbi',        'mohamed.gharbi@mail.tn',      '+216 20 200 001'),
      ('Rim Bouazizi',          'rim.bouazizi@mail.tn',        '+216 20 200 002'),
      ('Hichem Sfax Industries','hichem@sfaxindustries.tn',    '+216 74 300 400'),
      ('Amira Jebali',          'amira.jebali@mail.tn',        '+216 20 200 003'),
      ('Karim El Adem',         'karim.eladem@mail.tn',        '+216 20 200 004'),
      ('Société Delta SARL',    'contact@delta-sarl.tn',       '+216 71 500 600'),
      ('Fatima Zahra Ben Said', 'fatima.bensaid@mail.tn',      '+216 20 200 005')
      ON CONFLICT DO NOTHING`);

    const { rows: users }   = await c.query(`SELECT id, email FROM users ORDER BY id`);
    const { rows: clients } = await c.query(`SELECT id, email FROM clients ORDER BY id`);
    const uid = (e) => (users.find(r => r.email === e) || {}).id || 1;
    const cid = (e) => (clients.find(r => r.email === e) || {}).id || null;

    const lid = uid('lawyer@eloyer.local');
    const sid = uid('sonia.belhaj@eloyer.local');
    const jid = uid('karim.ferjani@eloyer.local');

    // ── Cases ─────────────────────────────────────────────────────────────────
    await c.query(`INSERT INTO cases (title, description, case_type, status, lawyer_id) VALUES
      ('Property Dispute – Ben Ali',              'Land ownership dispute and title verification.',       'Civil',      'in_progress', ${lid}),
      ('Labour Dispute – Ben Said v. Delta SARL', 'Wrongful termination and unpaid overtime.',            'Labor',      'in_progress', ${sid}),
      ('Contract Breach – Gharbi Import/Export',  'Non-delivery of goods per supply agreement.',          'Commercial', 'open',        ${lid}),
      ('Divorce Proceedings – Jebali / El Adem',  'Child custody and asset division.',                    'Family',     'in_progress', ${lid}),
      ('Corporate Merger – Sfax Industries',      'Due diligence and regulatory compliance.',             'Corporate',  'open',        ${sid}),
      ('Criminal Defence – Bouazizi',             'Alleged fraud and embezzlement charges.',              'Criminal',   'in_progress', ${jid})
      ON CONFLICT DO NOTHING`);

    const { rows: cases } = await c.query(`SELECT id, title FROM cases ORDER BY id`);
    const csid = (t) => (cases.find(r => r.title === t) || {}).id || null;

    const c0 = csid('Property Dispute – Ben Ali');
    const c1 = csid('Labour Dispute – Ben Said v. Delta SARL');
    const c2 = csid('Contract Breach – Gharbi Import/Export');
    const c3 = csid('Divorce Proceedings – Jebali / El Adem');
    const c4 = csid('Corporate Merger – Sfax Industries');
    const c5 = csid('Criminal Defence – Bouazizi');

    // ── case_clients ──────────────────────────────────────────────────────────
    if (c0 && cid('ahmed.benali@mail.tn'))   await c.query(`INSERT INTO case_clients VALUES (${c0},${cid('ahmed.benali@mail.tn')}) ON CONFLICT DO NOTHING`);
    if (c1 && cid('fatima.bensaid@mail.tn')) await c.query(`INSERT INTO case_clients VALUES (${c1},${cid('fatima.bensaid@mail.tn')}) ON CONFLICT DO NOTHING`);
    if (c2 && cid('mohamed.gharbi@mail.tn')) await c.query(`INSERT INTO case_clients VALUES (${c2},${cid('mohamed.gharbi@mail.tn')}) ON CONFLICT DO NOTHING`);
    if (c3 && cid('amira.jebali@mail.tn'))   await c.query(`INSERT INTO case_clients VALUES (${c3},${cid('amira.jebali@mail.tn')}) ON CONFLICT DO NOTHING`);
    if (c4 && cid('hichem@sfaxindustries.tn')) await c.query(`INSERT INTO case_clients VALUES (${c4},${cid('hichem@sfaxindustries.tn')}) ON CONFLICT DO NOTHING`);
    if (c5 && cid('rim.bouazizi@mail.tn'))   await c.query(`INSERT INTO case_clients VALUES (${c5},${cid('rim.bouazizi@mail.tn')}) ON CONFLICT DO NOTHING`);

    // ── Case notes ────────────────────────────────────────────────────────────
    const notes = [
      [c0, lid, 'Initial consultation completed. Client provided property deed and survey maps.', 'Gather documentary evidence before filing.'],
      [c1, sid, 'Reviewed employment contract. Termination clause is ambiguous — strong grounds for reinstatement.', 'Request full disclosure from employer.'],
      [c2, lid, 'Contract for goods delivery signed 2024-11-01. Non-delivery confirmed by shipment records.', 'File for breach and seek consequential damages.'],
    ];
    for (const [ci, li, nc, st] of notes) {
      if (ci) await c.query(`INSERT INTO case_notes (case_id, lawyer_id, note_content, strategy)
        SELECT ${ci},${li},$$${nc}$$,$$${st}$$
        WHERE NOT EXISTS (SELECT 1 FROM case_notes WHERE case_id=${ci} AND lawyer_id=${li} LIMIT 1)`);
    }

    // ── Case hearings ─────────────────────────────────────────────────────────
    const hearings = [
      [c0, 7,  'Tribunal de Première Instance de Tunis'],
      [c1, 14, 'Tribunal du Travail de Tunis'],
      [c2, 21, 'Tribunal de Commerce de Sfax'],
    ];
    for (const [ci, days, court] of hearings) {
      if (ci) await c.query(`INSERT INTO case_hearings (case_id, hearing_date, court_name, status, notes)
        SELECT ${ci}, NOW() + INTERVAL '${days} days', $$${court}$$, 'scheduled', 'Bring all certified copies of documents.'
        WHERE NOT EXISTS (SELECT 1 FROM case_hearings WHERE case_id=${ci} AND court_name=$$${court}$$)`);
    }

    // ── Case evidence ─────────────────────────────────────────────────────────
    const evidences = [
      [c0, 'Property Deed (Original)',   'Notarised property deed showing chain of title.'],
      [c1, 'Signed Employment Contract', 'Employment agreement with termination clause highlighted.'],
      [c2, 'Purchase Order #2024-189',   'Signed purchase order for goods delivery.'],
    ];
    for (const [ci, title, desc] of evidences) {
      if (ci) await c.query(`INSERT INTO case_evidence (case_id, title, description)
        SELECT ${ci},$$${title}$$,$$${desc}$$
        WHERE NOT EXISTS (SELECT 1 FROM case_evidence WHERE case_id=${ci} AND title=$$${title}$$)`);
    }

    // ── Task items ────────────────────────────────────────────────────────────
    const tasks = [
      [c0, lid, 'Review property deed bundle',         3,  'high'],
      [c1, sid, 'Draft motion for reinstatement',      6,  'high'],
      [c2, lid, 'Request opposing party disclosures',  9,  'normal'],
      [c3, lid, 'Research child custody precedents',   12, 'normal'],
      [c4, sid, 'Prepare due diligence checklist',     15, 'normal'],
      [c5, jid, 'Research criminal fraud statutes',    18, 'high'],
    ];
    for (const [ci, li, title, days, priority] of tasks) {
      if (ci) await c.query(`INSERT INTO task_items (case_id, lawyer_id, title, due_date, status, priority, assigned_to, progress_pct)
        SELECT ${ci},${li},$$${title}$$, NOW() + INTERVAL '${days} days', 'pending', '${priority}', 'self', 0
        WHERE NOT EXISTS (SELECT 1 FROM task_items WHERE case_id=${ci} AND title=$$${title}$$)`);
    }

    // ── Invoices ──────────────────────────────────────────────────────────────
    const invoices = [
      [c0, cid('ahmed.benali@mail.tn'),       1800, 'pending', 10],
      [c1, cid('fatima.bensaid@mail.tn'),      1200, 'paid',   5 ],
      [c2, cid('mohamed.gharbi@mail.tn'),      2500, 'pending', 15],
      [c3, cid('amira.jebali@mail.tn'),        850,  'pending', 20],
      [c4, cid('hichem@sfaxindustries.tn'),   3200, 'pending', 25],
      [c5, cid('rim.bouazizi@mail.tn'),        1750, 'overdue', 30],
    ];
    for (const [ci, client_id, amount, status, days] of invoices) {
      if (ci) await c.query(`INSERT INTO invoices (case_id, client_id, amount, status, due_date)
        SELECT ${ci},${client_id || 'NULL'},${amount},'${status}', NOW() + INTERVAL '${days} days'
        WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE case_id=${ci} AND amount=${amount})`);
    }

    // ── Time logs ─────────────────────────────────────────────────────────────
    const timeLogs = [
      [c0, lid, 3.5, 'Legal research and title analysis'],
      [c1, sid, 2.0, 'Client consultation and strategy'],
      [c2, lid, 4.0, 'Document drafting and review'],
      [c3, lid, 2.5, 'Research family law precedents'],
      [c4, sid, 5.0, 'Due diligence document review'],
      [c5, jid, 3.0, 'Criminal law research'],
    ];
    for (const [ci, li, hours, desc] of timeLogs) {
      if (ci) await c.query(`INSERT INTO time_logs (case_id, lawyer_id, hours, description, source)
        SELECT ${ci},${li},${hours},$$${desc}$$,'manual'
        WHERE NOT EXISTS (SELECT 1 FROM time_logs WHERE case_id=${ci} AND lawyer_id=${li} LIMIT 1)`);
    }

    // ── Meetings ──────────────────────────────────────────────────────────────
    for (const [ci, days] of [[c0,4],[c1,8],[c2,12]]) {
      if (ci) await c.query(`INSERT INTO meetings (case_id, lawyer_id, title, meeting_date, status, notes)
        SELECT ${ci},${lid},'Case Strategy Review', NOW() + INTERVAL '${days} days','scheduled','Discuss upcoming hearings and evidence preparation.'
        WHERE NOT EXISTS (SELECT 1 FROM meetings WHERE case_id=${ci} AND lawyer_id=${lid} LIMIT 1)`);
    }

    // ── Document templates ────────────────────────────────────────────────────
    await c.query(`INSERT INTO document_templates (name, category, body_text, premium)
      SELECT 'Standard Engagement Letter','engagement','Dear {{client_name}}, this letter confirms our representation for {{case_title}}.',FALSE
      WHERE NOT EXISTS (SELECT 1 FROM document_templates WHERE name='Standard Engagement Letter')`);
    await c.query(`INSERT INTO document_templates (name, category, body_text, premium)
      SELECT 'Court Motion Draft','motion','IN THE COURT OF {{court_name}}. Motion for relief in case {{case_title}}.',TRUE
      WHERE NOT EXISTS (SELECT 1 FROM document_templates WHERE name='Court Motion Draft')`);

    // ── Retainers ─────────────────────────────────────────────────────────────
    if (c0 && cid('ahmed.benali@mail.tn')) await c.query(`INSERT INTO retainers (case_id, client_id, amount, balance, status)
      SELECT ${c0},${cid('ahmed.benali@mail.tn')},3000,2200,'active'
      WHERE NOT EXISTS (SELECT 1 FROM retainers WHERE case_id=${c0})`);

    // ── Case research refs ────────────────────────────────────────────────────
    const refs = [
      [c0, 'Land Ownership Appeal Precedent','CA-TN-2019-0442','Supports chain-of-title arguments.'],
      [c1, 'Code du Travail – Art. 14',      'CT-14',          'Governs termination notice periods.'],
      [c2, 'Code des Obligations – Art. 275', 'COC-275',        'Contract breach remedies.'],
    ];
    for (const [ci, title, citation, notes] of refs) {
      if (ci) await c.query(`INSERT INTO case_research_refs (case_id, title, citation, notes)
        SELECT ${ci},$$${title}$$,'${citation}',$$${notes}$$
        WHERE NOT EXISTS (SELECT 1 FROM case_research_refs WHERE case_id=${ci} AND citation='${citation}')`);
    }

    // ── Court decisions ───────────────────────────────────────────────────────
    if (c0) await c.query(`INSERT INTO court_decisions (case_id, decision_date, outcome, summary)
      SELECT ${c0}, NOW()-INTERVAL '5 days','interim_order',$$Court granted interim injunction preventing dismissal pending full hearing.$$
      WHERE NOT EXISTS (SELECT 1 FROM court_decisions WHERE case_id=${c0})`);

    // ── Messages ──────────────────────────────────────────────────────────────
    if (c0 && cid('ahmed.benali@mail.tn')) await c.query(`INSERT INTO messages (lawyer_id, client_id, case_id, subject, body, is_read, message_type, direction)
      SELECT ${lid},${cid('ahmed.benali@mail.tn')},${c0},
        'New evidence uploaded','I have uploaded additional survey photos for review.',FALSE,'update','outgoing'
      WHERE NOT EXISTS (SELECT 1 FROM messages WHERE lawyer_id=${lid} AND subject='New evidence uploaded')`);

    // ── Legal strategies ──────────────────────────────────────────────────────
    const strategies = [
      [c0, lid, 'Challenge title documentation via procedural objections', 'defense'],
      [c1, sid, 'Build compensation claim based on lost earnings evidence', 'offense'],
      [c2, lid, 'Negotiate early settlement to avoid protracted litigation', 'settlement'],
    ];
    for (const [ci, li, title, type] of strategies) {
      if (ci) await c.query(`INSERT INTO legal_strategies (case_id, lawyer_id, title, strategy_type, description, strengths, weaknesses, status)
        SELECT ${ci},${li},$$${title}$$,'${type}',
          'Strategy based on thorough analysis of applicable statutes and precedent cases.',
          'Strong documentary evidence and credible witness testimony.',
          'Opposing counsel has prior precedent in similar cases.','active'
        WHERE NOT EXISTS (SELECT 1 FROM legal_strategies WHERE case_id=${ci} LIMIT 1)`);
    }

    // ── Approvals ─────────────────────────────────────────────────────────────
    if (c1) await c.query(`INSERT INTO approvals (case_id, requested_by, assigned_to, approval_type, title, description, status)
      SELECT ${c1},${lid},${sid},'filing',$$Approve Court Filing – Labour Case$$,
        'Request to approve motion for summary judgment before court deadline.','pending'
      WHERE NOT EXISTS (SELECT 1 FROM approvals WHERE title=$$Approve Court Filing – Labour Case$$)`);

    // ── Settlements ───────────────────────────────────────────────────────────
    if (c3) await c.query(`INSERT INTO settlements (case_id, proposed_by, amount, terms, status)
      SELECT ${c3},${lid},15000,
        'Payment of 15,000 TND in lieu of divorce proceedings. Child custody shared equally.','proposed'
      WHERE NOT EXISTS (SELECT 1 FROM settlements WHERE case_id=${c3})`);

    // ── Collaboration threads & messages ──────────────────────────────────────
    const { rows: thr } = await c.query(`INSERT INTO collaboration_threads (case_id, title, created_by, participants)
      SELECT ${c1 || 'NULL'},'Strategy Alignment – Labour Case',${lid},ARRAY[${lid},${sid}]
      WHERE NOT EXISTS (SELECT 1 FROM collaboration_threads WHERE title='Strategy Alignment – Labour Case')
      RETURNING id`);
    if (thr.length) {
      await c.query(`INSERT INTO collaboration_messages (thread_id, sender_id, body) VALUES
        (${thr[0].id},${lid},$$I reviewed the employment contract. The termination clause is ambiguous — strong grounds.$$),
        (${thr[0].id},${sid},$$Agreed. Let's also request payroll records for the past 12 months.$$)`);
    }

    // ── Pleadings ─────────────────────────────────────────────────────────────
    if (c5) await c.query(`INSERT INTO pleadings (case_id, lawyer_id, title, pleading_type, content, status)
      SELECT ${c5},${lid},'Motion to Dismiss – Lack of Jurisdiction','motion',
        'IN THE COURT OF TUNIS\nFor the reasons stated herein, Defendant moves this Court to dismiss all counts for lack of jurisdiction.',
        'filed'
      WHERE NOT EXISTS (SELECT 1 FROM pleadings WHERE case_id=${c5} LIMIT 1)`);

    // ── Deadlines ─────────────────────────────────────────────────────────────
    const deadlines = [
      [c0, lid, 'File Response to Counterclaim', 14, 'critical'],
      [c1, lid, 'Submit Expert Report',          21, 'high'],
      [c2, lid, 'Serve Discovery Requests',      28, 'normal'],
      [c3, lid, 'Appeal Deadline',               60, 'high'],
    ];
    for (const [ci, li, title, days, priority] of deadlines) {
      if (ci) await c.query(`INSERT INTO deadlines (case_id, lawyer_id, title, deadline_date, priority, status)
        SELECT ${ci},${li},$$${title}$$, NOW() + INTERVAL '${days} days','${priority}','upcoming'
        WHERE NOT EXISTS (SELECT 1 FROM deadlines WHERE case_id=${ci} AND title=$$${title}$$)`);
    }

    // ── Billable hours ────────────────────────────────────────────────────────
    const billHours = [
      [c0, lid, 0,  1.5, 'Legal research',      true],
      [c1, lid, 2,  2.0, 'Client consultation', false],
      [c2, lid, 4,  3.0, 'Court preparation',   false],
      [c3, lid, 6,  2.5, 'Document drafting',   false],
      [c4, lid, 8,  4.0, 'Evidence review',     false],
      [c5, jid, 10, 3.0, 'Strategy session',    false],
    ];
    for (const [ci, li, daysAgo, hours, activity, isBilled] of billHours) {
      if (ci) await c.query(`INSERT INTO billable_hours (case_id, lawyer_id, date, hours, rate, activity, is_billed)
        SELECT ${ci},${li}, CURRENT_DATE - INTERVAL '${daysAgo} days', ${hours}, 150, $$${activity}$$, ${isBilled}
        WHERE NOT EXISTS (SELECT 1 FROM billable_hours WHERE case_id=${ci} AND activity=$$${activity}$$)`);
    }

    // ── OCR document ──────────────────────────────────────────────────────────
    if (c3) await c.query(`INSERT INTO ocr_documents (case_id, uploaded_by, original_filename, language, status, extracted_text)
      SELECT ${c3},${lid},'acte-mariage-jebali.pdf','fr','completed',
        $$ACTE DE MARIAGE\nNom: JEBALI Amira\nPrénom du conjoint: EL ADEM Karim\nDate: 12 mars 2018\nLieu: Tunis$$
      WHERE NOT EXISTS (SELECT 1 FROM ocr_documents WHERE original_filename='acte-mariage-jebali.pdf')`);

    // ── AI draft ──────────────────────────────────────────────────────────────
    if (c1) await c.query(`INSERT INTO ai_drafts (case_id, lawyer_id, draft_type, prompt, generated_content, status)
      SELECT ${c1},${lid},'pleading','Motion for reinstatement pending final hearing',
        $$MÉMOIRE EN DÉFENSE\nPour: Madame Fatima Zahra Ben Said\nContre: Société Delta SARL\nNous sollicitons la réintégration provisoire de notre cliente conformément à l''article 14 du Code du Travail.$$,
        'saved'
      WHERE NOT EXISTS (SELECT 1 FROM ai_drafts WHERE case_id=${c1} AND draft_type='pleading')`);

    // ── Research notes ────────────────────────────────────────────────────────
    if (c2 && jid) await c.query(`INSERT INTO research_notes (case_id, user_id, title, content, sources, tags)
      SELECT ${c2},${jid},'Contract Breach – Applicable Law',
        $$COC Article 275 provides for full damages in breach of delivery obligations. Three precedents support our claim.$$,
        ARRAY['COC Art 275','CA Tunis 2019-0774'], ARRAY['breach','damages','delivery']
      WHERE NOT EXISTS (SELECT 1 FROM research_notes WHERE case_id=${c2} AND user_id=${jid} LIMIT 1)`);

    // ── Firm profile & admin ──────────────────────────────────────────────────
    await c.query(`INSERT INTO firm_profile (name, tagline, email, phone, address, website, bar_number, founded_year, specializations)
      SELECT 'Cabinet Cherni & Associés','Excellence juridique depuis 2005',
        'contact@cherni-law.tn','+216 71 100 200','12 Rue de la République, Tunis',
        'https://cherni-law.tn','BAR-TN-2005-042',2005,
        ARRAY['Civil Law','Corporate Law','Real Estate','Labour Law']
      WHERE NOT EXISTS (SELECT 1 FROM firm_profile)`);

    await c.query(`INSERT INTO departments (name, description) VALUES
      ('Civil Litigation','Handles civil dispute cases'),
      ('Corporate Law','Corporate transactions and compliance'),
      ('Family Law','Divorce, custody and family matters'),
      ('Administration','HR and office administration')
      ON CONFLICT DO NOTHING`);

    await c.query(`INSERT INTO office_locations (name, address, city, country, phone, is_hq) VALUES
      ('Tunis HQ','12 Rue de la République','Tunis','TN','+216 71 100 200',TRUE),
      ('Sousse Branch','45 Avenue Habib Bourguiba','Sousse','TN','+216 73 200 300',FALSE)
      ON CONFLICT DO NOTHING`);

    await c.query(`INSERT INTO pricing_config (service_name, billing_type, rate, currency) VALUES
      ('Legal Consultation','hourly',150,'TND'),
      ('Court Representation','daily',600,'TND'),
      ('Contract Drafting','fixed',350,'TND'),
      ('Document Review','hourly',100,'TND')
      ON CONFLICT DO NOTHING`);

    await c.query(`INSERT INTO workflows (name, description, trigger_event, is_active) VALUES
      ('New Case Onboarding','Steps when a new case is created','case.created',TRUE),
      ('Invoice Approval','Review and approve invoice before sending','invoice.created',TRUE),
      ('Document Review','Multi-step review for legal documents','document.uploaded',FALSE)
      ON CONFLICT DO NOTHING`);

    // ── SaaS seeds ────────────────────────────────────────────────────────────
    await c.query(`INSERT INTO subscription_plans (name, code, price_monthly, price_yearly, max_users, max_cases, max_storage_gb, ai_tokens_monthly, features)
      VALUES
        ('Starter',   'starter',    49,  490,   3,  30,   5,   5000, '["cases","documents","billing"]'::jsonb),
        ('Pro',       'pro',        99,  990,  10, 200,  20,  25000, '["cases","documents","billing","ai","legalresearch"]'::jsonb),
        ('Business',  'business',  199, 1990,  25, 999,  50,  75000, '["all"]'::jsonb),
        ('Enterprise','enterprise',  0,    0, 999,9999, 500, 500000, '["all","custom"]'::jsonb)
      ON CONFLICT (code) DO NOTHING`);

    await c.query(`INSERT INTO tenants (name, slug, email, phone, country, status, plan_id)
      SELECT 'Cabinet Cherni & Associés','cherni-associes','contact@cherni-law.tn','+216 71 100 200','TN','active',p.id
      FROM subscription_plans p WHERE p.code='pro'
      AND NOT EXISTS (SELECT 1 FROM tenants WHERE slug='cherni-associes')`);

    await c.query(`INSERT INTO tenants (name, slug, email, phone, country, status, plan_id)
      SELECT 'Lex Solutions SARL','lex-solutions','info@lexsolutions.tn','+216 71 200 300','TN','active',p.id
      FROM subscription_plans p WHERE p.code='business'
      AND NOT EXISTS (SELECT 1 FROM tenants WHERE slug='lex-solutions')`);

    await c.query(`INSERT INTO tenants (name, slug, email, phone, country, status, plan_id)
      SELECT 'Maison du Droit','maison-du-droit','contact@maisondudroit.tn','+216 71 300 400','TN','suspended',p.id
      FROM subscription_plans p WHERE p.code='starter'
      AND NOT EXISTS (SELECT 1 FROM tenants WHERE slug='maison-du-droit')`);

    await c.query(`INSERT INTO feature_flags (flag_key, label, description, default_enabled, category) VALUES
      ('ai_predictions',     'AI Predictions',        'AI-powered case outcome predictions',    TRUE, 'ai'),
      ('ai_document_summary','AI Document Summary',   'Auto-summarize uploaded documents',      TRUE, 'ai'),
      ('esignature',         'E-Signature',           'DocuSign / internal e-signing workflow', TRUE, 'documents'),
      ('billing_automation', 'Billing Automation',    'Automatic invoice generation',           FALSE,'billing'),
      ('multi_tenancy',      'Multi-Tenancy',         'Full SaaS multi-tenant mode',            TRUE, 'platform'),
      ('stripe_billing',     'Stripe Billing',        'Stripe payment gateway',                 FALSE,'billing'),
      ('paypal_billing',     'PayPal Billing',        'PayPal payment gateway',                 FALSE,'billing'),
      ('blockchain_docs',    'Blockchain Documents',  'Immutable document hashing',             FALSE,'documents'),
      ('two_factor_auth',    '2FA Required',          'Enforce 2FA for all users',              FALSE,'security'),
      ('sso_saml',           'SSO / SAML',            'Enterprise SSO via SAML 2.0',            FALSE,'security'),
      ('api_access',         'API Access',            'Allow tenants to use REST API',          TRUE, 'platform'),
      ('custom_branding',    'Custom Branding',       'Per-tenant logo and color scheme',       TRUE, 'platform'),
      ('audit_logs_export',  'Audit Log Export',      'Export audit logs to CSV/PDF',           TRUE, 'compliance'),
      ('gdpr_tools',         'GDPR Tools',            'Data export and erasure tools',          FALSE,'compliance'),
      ('advanced_analytics', 'Advanced Analytics',    'KPI dashboards and custom reports',      TRUE, 'reports')
      ON CONFLICT (flag_key) DO NOTHING`);

    await c.query(`INSERT INTO platform_settings (key, value, description) VALUES
      ('platform_name',     'ELoyer SaaS',        'Name of the SaaS platform'),
      ('support_email',     'support@eloyer.io',  'Support email address'),
      ('max_tenants',       '500',                'Maximum tenants allowed'),
      ('default_plan',      'starter',            'Default plan for new tenants'),
      ('smtp_host',         '',                   'SMTP host for email delivery'),
      ('smtp_port',         '587',                'SMTP port'),
      ('sms_provider',      'twilio',             'SMS provider name'),
      ('storage_provider',  'local',              'File storage provider'),
      ('ai_provider',       'openai',             'AI provider name'),
      ('backup_schedule',   'daily',              'Database backup schedule'),
      ('maintenance_mode',  'false',              'Platform maintenance mode'),
      ('registration_open', 'true',              'Allow new tenant self-registration')
      ON CONFLICT (key) DO NOTHING`);

    await c.query(`INSERT INTO storage_config (provider, used_bytes, quota_bytes)
      SELECT 'local',0,10737418240 WHERE NOT EXISTS (SELECT 1 FROM storage_config)`);

    await c.query(`INSERT INTO email_sms_config (provider, config_type, settings, is_active)
      SELECT 'smtp','email','{"host":"","port":587,"tls":true}'::jsonb,FALSE
      WHERE NOT EXISTS (SELECT 1 FROM email_sms_config WHERE provider='smtp')`);

    // ── HR seeds ──────────────────────────────────────────────────────────────
    await c.query(`INSERT INTO employee_records (user_id, job_title, contract_type, start_date, salary, national_id)
      SELECT u.id,'Senior Partner','permanent','2018-01-15',4500,'TN-2018-00101'
      FROM users u WHERE u.email='sonia.belhaj@eloyer.local'
      AND NOT EXISTS (SELECT 1 FROM employee_records WHERE user_id=u.id)`);

    await c.query(`INSERT INTO employee_records (user_id, job_title, contract_type, start_date, salary, national_id)
      SELECT u.id,'Associate Attorney','permanent','2024-09-01',2800,'TN-2024-00421'
      FROM users u WHERE u.email='karim.ferjani@eloyer.local'
      AND NOT EXISTS (SELECT 1 FROM employee_records WHERE user_id=u.id)`);

    await c.query(`INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status)
      SELECT u.id,'annual','2026-07-14','2026-07-18','Annual family vacation.','pending'
      FROM users u WHERE u.email='karim.ferjani@eloyer.local'
      AND NOT EXISTS (SELECT 1 FROM leave_requests WHERE user_id=u.id LIMIT 1)`);

    await c.query(`INSERT INTO hr_performance_reviews (user_id, reviewer_id, review_period, overall_score, goals_met, strengths, improvements, status, submitted_at)
      SELECT u.id,rv.id,'Q1 2026',8,TRUE,
        'Excellent case research and client communication.',
        'Should improve court filing turnaround time.','submitted',NOW()
      FROM users u, users rv
      WHERE u.email='karim.ferjani@eloyer.local' AND rv.email='sonia.belhaj@eloyer.local'
      AND NOT EXISTS (SELECT 1 FROM hr_performance_reviews WHERE user_id=u.id LIMIT 1)`);

    await c.query(`INSERT INTO recruitment_postings (title, job_type, description, requirements, status) VALUES
      ('Junior Associate Lawyer','full_time','Join our growing civil litigation team.','2+ years experience, Bar admission','open'),
      ('Legal Secretary','full_time','Administrative support for senior partners.','Legal software proficiency, bilingual','open')
      ON CONFLICT DO NOTHING`);

    await c.query(`INSERT INTO recruitment_applications (posting_id, applicant_name, applicant_email, cover_letter, status, score)
      SELECT rp.id,'Yasmine Boughanmi','yasmine.b@mail.tn',
        'Qualified attorney with 3 years post-bar experience in civil litigation.','screening',7
      FROM recruitment_postings rp WHERE rp.title='Junior Associate Lawyer'
      AND NOT EXISTS (SELECT 1 FROM recruitment_applications WHERE applicant_email='yasmine.b@mail.tn') LIMIT 1`);

    await c.query(`INSERT INTO payroll (user_id, pay_period_start, pay_period_end, base_salary, bonus, deductions, status, paid_at)
      SELECT u.id,'2026-06-01','2026-06-30',2800,200,350,'paid',NOW()-INTERVAL '2 days'
      FROM users u WHERE u.email='karim.ferjani@eloyer.local'
      AND NOT EXISTS (SELECT 1 FROM payroll WHERE user_id=u.id AND pay_period_start='2026-06-01')`);

    await c.query(`INSERT INTO payroll (user_id, pay_period_start, pay_period_end, base_salary, bonus, deductions, status)
      SELECT u.id,'2026-06-01','2026-06-30',1800,0,270,'pending'
      FROM users u WHERE u.email='nadia.trabelsi@eloyer.local'
      AND NOT EXISTS (SELECT 1 FROM payroll WHERE user_id=u.id AND pay_period_start='2026-06-01')`);

    // ── Contacts ──────────────────────────────────────────────────────────────
    await c.query(`INSERT INTO contacts (full_name, company, email, phone, role, notes) VALUES
      ('Juge Mohamed Ksontini','Tribunal de Tunis','ksontini@tribunal.tn','+216 71 111 001','judge','Presiding judge, civil division 3'),
      ('Greffier Amina Saidani','Tribunal de Commerce','saidani@tcom.tn','+216 71 111 002','court_clerk','Commercial division clerk'),
      ('Notaire Habib Chaari','Étude Notariale Chaari','chaari@notaire.tn','+216 71 333 444','notary','Handles property transactions'),
      ('Maître Riadh Ben Mrad','Cabinet Ben Mrad','riadh@benmrad.tn','+216 71 444 555','lawyer','Opposing counsel in multiple cases'),
      ('Dr. Salma Triki','Clinique Hannibal','striki@hannibal.tn','+216 71 555 666','other','Medical expert for personal injury cases')
      ON CONFLICT DO NOTHING`);

    // ── Appointments ──────────────────────────────────────────────────────────
    await c.query(`INSERT INTO appointments (client_id, title, appointment_date, duration_minutes, appointment_type, location, status)
      SELECT c.id,'Initial Consultation – Labour Case',NOW()+INTERVAL '2 days',60,'consultation','Office – Room 2','scheduled'
      FROM clients c WHERE c.email='fatima.bensaid@mail.tn'
      AND NOT EXISTS (SELECT 1 FROM appointments WHERE title='Initial Consultation – Labour Case')`);

    await c.query(`INSERT INTO appointments (client_id, title, appointment_date, duration_minutes, appointment_type, location, status)
      SELECT c.id,'Contract Review Meeting',NOW()+INTERVAL '5 days',90,'meeting','Client Office – Sfax','scheduled'
      FROM clients c WHERE c.email='hichem@sfaxindustries.tn'
      AND NOT EXISTS (SELECT 1 FROM appointments WHERE title='Contract Review Meeting')`);

    // ── Email templates ───────────────────────────────────────────────────────
    await c.query(`INSERT INTO email_templates (name, subject, body, category, variables)
      SELECT 'Appointment Confirmation','Appointment Confirmed',
        'Dear {{client_name}}, your appointment is confirmed for {{date}} at {{time}}.','appointments',
        ARRAY['client_name','date','time','firm_name']
      WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name='Appointment Confirmation')`);

    await c.query(`INSERT INTO email_templates (name, subject, body, category, variables)
      SELECT 'Invoice Due Reminder','Invoice Payment Due',
        'Dear {{client_name}}, invoice #{{invoice_number}} for {{amount}} TND is due on {{due_date}}.','billing',
        ARRAY['client_name','invoice_number','amount','due_date','firm_name']
      WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name='Invoice Due Reminder')`);

    await c.query(`INSERT INTO email_templates (name, subject, body, category, variables)
      SELECT 'Hearing Reminder','Upcoming Hearing',
        'Dear {{client_name}}, your hearing is scheduled for {{hearing_date}} at {{court_name}}.','hearings',
        ARRAY['client_name','hearing_date','court_name','firm_name']
      WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE name='Hearing Reminder')`);

    // ── Trust account ─────────────────────────────────────────────────────────
    if (c0 && cid('ahmed.benali@mail.tn')) {
      const { rows: ta } = await c.query(`INSERT INTO trust_accounts (case_id, client_id, account_name, bank_name, balance, currency)
        SELECT ${c0},${cid('ahmed.benali@mail.tn')},'Trust – Property Dispute','Banque Nationale Agricole',5500,'TND'
        WHERE NOT EXISTS (SELECT 1 FROM trust_accounts WHERE case_id=${c0}) RETURNING id`);
      if (ta.length) await c.query(`INSERT INTO trust_transactions (trust_account_id, transaction_type, amount, description, reference, balance_after, recorded_by, transaction_date) VALUES
        (${ta[0].id},'deposit',3000,'Initial retainer payment','REF-2026-0101',3000,${lid},'2026-01-15'),
        (${ta[0].id},'deposit',2500,'Additional funds for court fees','REF-2026-0244',5500,${lid},'2026-03-10')`);
    }

    // ── Client portal seeds ───────────────────────────────────────────────────
    if (c1 && cid('fatima.bensaid@mail.tn')) await c.query(`INSERT INTO client_case_updates (case_id, client_id, title, body, update_type, is_read)
      SELECT ${c1},${cid('fatima.bensaid@mail.tn')},'Interim Order Granted',
        'The court has granted an interim order in your favour. The employer is prohibited from proceeding with dismissal pending the full hearing.',
        'court_order',FALSE
      WHERE NOT EXISTS (SELECT 1 FROM client_case_updates WHERE case_id=${c1})`);

    if (c0 && cid('ahmed.benali@mail.tn')) await c.query(`INSERT INTO video_meetings (case_id, lawyer_id, client_id, title, scheduled_at, duration_minutes, meeting_url, status)
      SELECT ${c0},${lid},${cid('ahmed.benali@mail.tn')},'Case Update – Property Dispute',NOW()+INTERVAL '3 days',45,
        'https://meet.eloyer.io/property-dispute-update','scheduled'
      WHERE NOT EXISTS (SELECT 1 FROM video_meetings WHERE case_id=${c0})`);

    // ── FAQ ───────────────────────────────────────────────────────────────────
    await c.query(`INSERT INTO faq_entries (question, answer, category) VALUES
      ('How do I check the status of my case?',
       'Log in to the client portal and navigate to "My Cases". You will see real-time updates from your lawyer.','cases'),
      ('How can I pay my invoice online?',
       'In the client portal, go to "Invoices" and click "Pay Now". We accept bank transfer, credit card and PayPal.','billing'),
      ('Can I upload documents from my phone?',
       'Yes. The document vault supports uploads from any device. Accepted formats: PDF, JPG, PNG, DOCX (max 20MB).','documents'),
      ('How do I schedule an appointment?',
       'In the portal, click "Schedule Appointment", choose your preferred lawyer and time slot, then confirm.','appointments'),
      ('Is my data secure?',
       'All data is encrypted in transit (TLS) and at rest. We comply with local data protection laws.','security'),
      ('How do I sign a document electronically?',
       'When a document requires your signature you will receive a notification. Open it under "Documents to Sign" and click "Sign Now".','esignature')
      ON CONFLICT DO NOTHING`);

    // ── Corporate client ──────────────────────────────────────────────────────
    await c.query(`INSERT INTO corporate_clients (company_name, registration_number, industry, contact_name, contact_email, contact_phone)
      SELECT 'Société ABC SARL','RNE-2015-0042','Manufacturing','Mohamed Gharbi','contact@abc-sarl.tn','+216 71 777 777'
      WHERE NOT EXISTS (SELECT 1 FROM corporate_clients WHERE contact_email='contact@abc-sarl.tn')`);

    const { rows: corp } = await c.query(`SELECT id FROM corporate_clients LIMIT 1`);
    if (corp.length) {
      const corpId = corp[0].id;
      await c.query(`INSERT INTO corporate_legal_requests (corporate_id, title, description, request_type, priority, status) VALUES
        (${corpId},'Review Supplier Agreement – Q3 2026','Annual supplier contract requires legal review before renewal.','contract_review','normal','submitted'),
        (${corpId},'Employment Policy – GDPR Compliance','Update HR handbook to comply with new data protection regulations.','compliance','high','in_progress')
        ON CONFLICT DO NOTHING`);
      await c.query(`INSERT INTO corporate_contracts (corporate_id, title, contract_type, status, signed_at, expires_at, value) VALUES
        (${corpId},'Annual Legal Retainer 2026','service','active','2026-01-01','2026-12-31',24000),
        (${corpId},'NDA – Technology Partner','nda','active','2026-03-15','2028-03-15',0)
        ON CONFLICT DO NOTHING`);
      await c.query(`INSERT INTO corporate_approvals (corporate_id, title, description, requested_by, priority, status) VALUES
        (${corpId},'Approve Supplier Contract Renewal','Renew three-year contract with primary supplier.','Legal Department','normal','pending'),
        (${corpId},'Authorise Settlement Offer','Authorise legal team to accept settlement offer of 15,000 TND.','CEO Office','urgent','approved')
        ON CONFLICT DO NOTHING`);
    }

    // ── External / expert / investigator / compliance ─────────────────────────
    const { rows: consultant } = await c.query(`SELECT id FROM users WHERE email='tarek.bouzid@eloyer.local' LIMIT 1`);
    if (consultant.length && c5) await c.query(`INSERT INTO expert_reports (case_id, submitted_by, title, report_type, content, status, submitted_at)
      SELECT ${c5},${consultant[0].id},'Forensic Accounting Report – Bouazizi Case','forensic',
        'Executive Summary: An independent forensic review identified 14 suspicious transfers totalling 48,000 TND. Detailed analysis in Annex A.',
        'submitted',NOW()
      WHERE NOT EXISTS (SELECT 1 FROM expert_reports WHERE submitted_by=${consultant[0].id} AND case_id=${c5})`);

    if (c0) {
      await c.query(`INSERT INTO court_notices (case_id, uploaded_by, title, notice_type, court_name, notice_date, content, is_urgent, status)
        SELECT ${c0},${lid},'Hearing Summons – 2026-07-15','summons',
          'Tribunal de Première Instance de Tunis','2026-07-15',
          'You are hereby summoned to appear on 15 July 2026 at 09:00 for the preliminary hearing.',FALSE,'received'
        WHERE NOT EXISTS (SELECT 1 FROM court_notices WHERE case_id=${c0} AND notice_type='summons')`);

      await c.query(`INSERT INTO court_communication_log (case_id, logged_by, communication_type, court_name, contact_person, summary, outcome)
        SELECT ${c0},${lid},'call','Tribunal de Tunis','Greffier Saidani',
          'Called to confirm hearing date. Requested updated docket number.',
          'Hearing confirmed 15 July 2026. Docket # HRG-2026-114.'
        WHERE NOT EXISTS (SELECT 1 FROM court_communication_log WHERE case_id=${c0} LIMIT 1)`);
    }

    if (c5) await c.query(`INSERT INTO filing_tracker (case_id, managed_by, title, filing_type, court_name, deadline, status, reference_number)
      SELECT ${c5},${lid},'Motion to Dismiss','motion',
        'Tribunal de Première Instance de Tunis', NOW()+INTERVAL '10 days','filed','REF-MTD-2026-042'
      WHERE NOT EXISTS (SELECT 1 FROM filing_tracker WHERE case_id=${c5} LIMIT 1)`);

    const { rows: inv } = await c.query(`SELECT id FROM users WHERE email='hedi.maaouia@eloyer.local' LIMIT 1`);
    if (inv.length && c5) {
      await c.query(`INSERT INTO investigation_findings (case_id, investigator_id, title, finding_type, description, location, is_confidential, status)
        SELECT ${c5},${inv[0].id},'Bank Statement Analysis – Suspicious Transfers','forensic',
          'Analysis reveals 14 unaccounted wire transfers totalling 48,000 TND over 6 months.',
          'Client premises – Tunis',FALSE,'active'
        WHERE NOT EXISTS (SELECT 1 FROM investigation_findings WHERE case_id=${c5} LIMIT 1)`);
      await c.query(`INSERT INTO interview_records (case_id, investigator_id, interviewee_name, interviewee_role, interview_date, location, summary, key_points)
        SELECT ${c5},${inv[0].id},'Karim Mansour','Former Finance Director',NOW()-INTERVAL '10 days',
          'Cabinet Offices – Tunis',
          'Subject confirmed awareness of internal fund transfers but denied authorisation.',
          ARRAY['Transfers not authorised by board','CFO had sole signatory access','Records partially deleted']
        WHERE NOT EXISTS (SELECT 1 FROM interview_records WHERE case_id=${c5} LIMIT 1)`);
    }

    const { rows: compUser } = await c.query(`SELECT id FROM users WHERE email='leila.dridi@eloyer.local' LIMIT 1`);
    if (compUser.length) {
      const { rows: cr } = await c.query(`INSERT INTO compliance_reviews (reviewer_id, title, review_type, overall_risk, compliance_score, status)
        SELECT ${compUser[0].id},'NDA Review – Sfax Industries Merger','nda','medium',72,'approved'
        WHERE NOT EXISTS (SELECT 1 FROM compliance_reviews WHERE reviewer_id=${compUser[0].id} LIMIT 1)
        RETURNING id`);
      if (cr.length) await c.query(`INSERT INTO compliance_flags (review_id, flag_type, severity, description, recommendation)
        VALUES (${cr[0].id},'informational','low','No critical risk clauses detected.','Standard review complete. Document appears compliant.')`);
    }

    // ── Navigation roles & sections ───────────────────────────────────────────

    const rolesSeed = [
      { key:'superadmin',        label:'Super Admin',         color:'deep-purple darken-3', icon:'mdi-shield-star',           sort:0  },
      { key:'admin',             label:'Admin',               color:'red darken-1',          icon:'mdi-shield-crown',          sort:1  },
      { key:'firm_admin',        label:'Firm Admin',          color:'red lighten-1',         icon:'mdi-office-building',       sort:2  },
      { key:'lawyer',            label:'Lawyer',              color:'blue darken-1',         icon:'mdi-briefcase',             sort:3  },
      { key:'senior_lawyer',     label:'Senior Lawyer',       color:'indigo darken-1',       icon:'mdi-account-tie',           sort:4  },
      { key:'attorney',          label:'Attorney',            color:'blue darken-2',         icon:'mdi-gavel',                 sort:5  },
      { key:'junior_associate',  label:'Junior Associate',    color:'cyan darken-1',         icon:'mdi-school',                sort:6  },
      { key:'paralegal',         label:'Paralegal',           color:'green darken-1',        icon:'mdi-file-document-multiple',sort:7  },
      { key:'legal_secretary',   label:'Legal Secretary',     color:'pink darken-1',         icon:'mdi-briefcase-edit',        sort:8  },
      { key:'receptionist',      label:'Receptionist',        color:'teal darken-1',         icon:'mdi-desk-lamp',             sort:9  },
      { key:'hr_manager',        label:'HR Manager',          color:'brown darken-1',        icon:'mdi-account-hard-hat',      sort:10 },
      { key:'accountant',        label:'Accountant',          color:'orange darken-2',       icon:'mdi-calculator',            sort:11 },
      { key:'client',            label:'Client',              color:'teal darken-1',         icon:'mdi-account',               sort:12 },
      { key:'corporate_client',  label:'Corporate Client',    color:'deep-orange darken-1',  icon:'mdi-domain',                sort:13 },
      { key:'consultant',        label:'Consultant',          color:'blue-grey darken-1',    icon:'mdi-account-star',          sort:14 },
      { key:'court_liaison',     label:'Court Liaison',       color:'purple darken-1',       icon:'mdi-scale-balance',         sort:15 },
      { key:'investigator',      label:'Investigator',        color:'amber darken-3',        icon:'mdi-magnify-scan',          sort:16 },
      { key:'compliance_officer',label:'Compliance Officer',  color:'red darken-3',          icon:'mdi-shield-check',          sort:17 },
    ];

    for (const r of rolesSeed) {
      await c.query(`INSERT INTO app_roles (role_key, label, color, icon, sort_order) VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (role_key) DO UPDATE SET label=EXCLUDED.label,color=EXCLUDED.color,icon=EXCLUDED.icon,sort_order=EXCLUDED.sort_order`,
        [r.key, r.label, r.color, r.icon, r.sort]);
    }

    const sectionsSeed = [
      { key:'superadmin',  title:'Super Admin',          icon:'mdi-shield-star',       sort:0,  items:[
        {title:'Platform Overview',      path:'/superadmin/dashboard'},   {title:'Law Firms (Tenants)',  path:'/superadmin/tenants'},
        {title:'Subscription Plans',     path:'/superadmin/plans'},       {title:'Billing Management',  path:'/superadmin/billing'},
        {title:'Feature Flags',          path:'/superadmin/feature-flags'},{title:'Audit Logs',          path:'/superadmin/audit-logs'},
        {title:'API Management',         path:'/superadmin/api-keys'},    {title:'Email / SMS Config',   path:'/superadmin/email-sms'},
        {title:'Storage Management',     path:'/superadmin/storage'},     {title:'AI Usage Monitor',     path:'/superadmin/ai-usage'},
        {title:'Security Dashboard',     path:'/superadmin/security'},    {title:'Platform Health',      path:'/superadmin/health'},
        {title:'Global Settings',        path:'/superadmin/settings'},
      ]},
      { key:'dashboard',   title:'Dashboard',            icon:'mdi-view-dashboard',    sort:1,  items:[
        {title:'Overview / Key Metrics', path:'/dashboard'},              {title:'Active Cases',         path:'/active-cases'},
        {title:'Upcoming Hearings',      path:'/upcoming-hearings'},      {title:'Recent Payments',      path:'/recent-payments'},
      ]},
      { key:'lawyerportal',title:'Lawyer Portal',        icon:'mdi-briefcase-account', sort:2,  items:[
        {title:'Start Day Dashboard',    path:'/lawyer/portal'},          {title:'Open Case Workspace',  path:'/lawyer/portal'},
      ]},
      { key:'cases',       title:'Cases / Matters',      icon:'mdi-folder',            sort:3,  items:[
        {title:'Timeline & Tasks',       path:'/affair/timeline'},        {title:'Case Studies',         path:'/case-study'},
        {title:'Hearing Dates',          path:'/hearing-dates'},          {title:'Predictive Outcomes',  path:'/affair/predictive'},
        {title:'Legal Notes & Memos',    path:'/cases/legal-notes'},      {title:'Evidence Management',  path:'/cases/evidence'},
      ]},
      { key:'clients',     title:'Clients',              icon:'mdi-account-group',     sort:4,  items:[
        {title:'Client List',            path:'/clients'},                {title:'Client Profiles',      path:'/clients/profiles'},
        {title:'Contracts',              path:'/clients/contracts'},      {title:'Client Portal Access', path:'/clients/portal'},
        {title:'Feedback',               path:'/clients/feedback'},
      ]},
      { key:'documents',   title:'Documents',            icon:'mdi-file-document',     sort:5,  items:[
        {title:'All Documents',          path:'/documents'},              {title:'Legal Templates',      path:'/documents/templates'},
        {title:'Contract Generator',     path:'/documents/contract-generator'},{title:'E-Signature',   path:'/documents/esignature'},
        {title:'Document Versioning',    path:'/documents/versioning'},
      ]},
      { key:'tasks',       title:'Tasks & Calendar',     icon:'mdi-calendar-check',    sort:6,  items:[
        {title:'Assign Tasks',           path:'/tasks/assign'},           {title:'Calendar Sync',        path:'/calendar/sync'},
        {title:'Automatic Reminders',    path:'/calendar/reminders'},     {title:'Meeting Scheduling',   path:'/calendar/meetings'},
        {title:'Daily/Weekly Planner',   path:'/calendar/planner'},
      ]},
      { key:'court',       title:'Courts & Proceedings', icon:'mdi-bank',              sort:7,  items:[
        {title:'Court Categories',       path:'/court/categories'},       {title:'Hearings & Schedules', path:'/court/hearings'},
        {title:'E-filing',               path:'/court/efiling'},          {title:'Case Status Tracking', path:'/court/status'},
        {title:'Legal Notices',          path:'/court/notices'},
      ]},
      { key:'billing',     title:'Finance',              icon:'mdi-credit-card',       sort:8,  items:[
        {title:'Time Logs / Billing',    path:'/billing/timelogs'},       {title:'Invoices & Payments',  path:'/billing/invoices'},
        {title:'Retainers',              path:'/billing/retainers'},      {title:'Expenses',             path:'/billing/expenses'},
        {title:'Financial Reports',      path:'/billing/reports'},        {title:'Tax & Compliance',     path:'/billing/tax'},
      ]},
      { key:'legalresearch',title:'Legal Research',      icon:'mdi-magnify',           sort:9,  items:[
        {title:'Case Law Search',        path:'/legalresearch/caselaw'},  {title:'Precedents Database',  path:'/legalresearch/precedents'},
        {title:'Statutes & Regulations', path:'/legalresearch/statutes'}, {title:'AI Legal Insights',    path:'/legalresearch/ai-insights'},
        {title:'Research Notes',         path:'/legalresearch/notes'},
      ]},
      { key:'marketing',   title:'Marketing & Leads',   icon:'mdi-bullhorn',          sort:10, items:[
        {title:'Lead Capture',           path:'/marketing/leads'},        {title:'Email Campaigns',      path:'/marketing/email'},
        {title:'Client Acquisition',     path:'/marketing/acquisition'},  {title:'Referral Management',  path:'/marketing/referrals'},
      ]},
      { key:'reports',     title:'Reports & Analytics',  icon:'mdi-chart-bar',         sort:11, items:[
        {title:'Case Success Rate',      path:'/reports/case-success'},   {title:'Client Retention',     path:'/reports/client-retention'},
        {title:'Financial Analytics',    path:'/reports/financial'},      {title:'Employee Performance', path:'/reports/performance'},
        {title:'KPI Dashboard',          path:'/reports/kpi'},
      ]},
      { key:'team',        title:'Team / HR',            icon:'mdi-account-multiple',  sort:12, items:[
        {title:'Roles & Permissions',    path:'/team/roles'},             {title:'Staff Directory',      path:'/team/directory'},
        {title:'Workload Assignment',    path:'/team/workload'},          {title:'Attendance Management',path:'/team/attendance'},
        {title:'Performance Reviews',    path:'/team/performance'},
      ]},
      { key:'configuration',title:'Settings',            icon:'mdi-cog',               sort:13, items:[
        {title:'System Preferences',     path:'/configuration/preferences'},{title:'Roles & Permissions',path:'/configuration/roles'},
        {title:'Branding / Theme',       path:'/configuration/branding'}, {title:'Integrations',        path:'/configuration/integrations'},
        {title:'Security Settings',      path:'/configuration/security'},
      ]},
      { key:'ai',          title:'AI & Advanced',        icon:'mdi-brain',             sort:14, items:[
        {title:'AI Predictions',         path:'/ai/predictions'},         {title:'Document Summarization',path:'/ai/summarization'},
        {title:'Smart Tasks',            path:'/ai/smart-tasks'},         {title:'AI Analytics',         path:'/ai/analytics'},
        {title:'Case Probability',       path:'/ai/case-probability'},    {title:'Litigation Risk',      path:'/ai/litigation-risk'},
        {title:'Billing Trends',         path:'/ai/billing-trends'},      {title:'Performance Dashboard',path:'/ai/performance'},
        {title:'Research Suggestions',   path:'/ai/research-suggestions'},
      ]},
      { key:'firmadmin',   title:'Firm Administration',  icon:'mdi-office-building',   sort:15, items:[
        {title:'Admin Dashboard',        path:'/firmadmin/dashboard'},    {title:'Firm Profile',         path:'/firmadmin/profile'},
        {title:'Departments',            path:'/firmadmin/departments'},  {title:'Office Locations',     path:'/firmadmin/locations'},
        {title:'Staff Invitations',      path:'/firmadmin/invitations'},  {title:'Workflow Builder',     path:'/firmadmin/workflows'},
        {title:'Revenue Analytics',      path:'/firmadmin/revenue'},      {title:'Pricing Config',       path:'/firmadmin/pricing'},
        {title:'Permissions Matrix',     path:'/firmadmin/permissions'},  {title:'Notifications Config', path:'/firmadmin/notifications'},
      ]},
      { key:'seniorpartner',title:'Senior / Partner',    icon:'mdi-account-tie',       sort:16, items:[
        {title:'Partner Dashboard',      path:'/senior/dashboard'},       {title:'Approvals',            path:'/senior/approvals'},
        {title:'Case Assignment',        path:'/senior/case-assignment'}, {title:'Legal Strategies',     path:'/senior/strategies'},
        {title:'Settlement Management',  path:'/senior/settlements'},     {title:'Invoice Review',       path:'/senior/invoice-review'},
        {title:'Team Collaboration',     path:'/senior/collaboration'},
      ]},
      { key:'attorney',    title:'Attorney Tools',       icon:'mdi-gavel',             sort:17, items:[
        {title:'AI Drafting',            path:'/attorney/ai-drafting'},   {title:'AI Contract Review',   path:'/attorney/contract-review'},
        {title:'Pleadings',              path:'/attorney/pleadings'},     {title:'OCR Scanning',         path:'/attorney/ocr'},
        {title:'Deadline Tracker',       path:'/attorney/deadlines'},     {title:'Billable Hours',       path:'/attorney/billable-hours'},
        {title:'Client Communication',   path:'/attorney/client-comms'},  {title:'Email Integration',    path:'/attorney/email-integration'},
      ]},
      { key:'junior',      title:'Junior Associate',     icon:'mdi-school',            sort:18, items:[
        {title:'Task Dashboard',         path:'/junior/dashboard'},       {title:'Research Workspace',   path:'/junior/research'},
        {title:'Case Documents',         path:'/documents'},              {title:'AI Legal Search',      path:'/legalresearch/caselaw'},
        {title:'Time Tracker',           path:'/attorney/billable-hours'},{title:'Team Chat',            path:'/senior/collaboration'},
      ]},
      { key:'paralegal_tools',title:'Paralegal Tools',  icon:'mdi-file-check',        sort:19, items:[
        {title:'Filing Checklists',      path:'/paralegal/checklists'},   {title:'Workflow Tracker',     path:'/paralegal/workflows'},
        {title:'Court Deadlines',        path:'/attorney/deadlines'},     {title:'OCR Scanner',          path:'/attorney/ocr'},
        {title:'Calendar',               path:'/calendar/planner'},       {title:'Document Management',  path:'/documents'},
      ]},
      { key:'secretary',   title:'Legal Secretary',      icon:'mdi-briefcase-edit',    sort:20, items:[
        {title:'Reception Dashboard',    path:'/secretary/dashboard'},    {title:'Appointments',         path:'/secretary/appointments'},
        {title:'Email Templates',        path:'/secretary/email-templates'},{title:'SMS Reminders',      path:'/secretary/sms-reminders'},
        {title:'Contact Management',     path:'/secretary/contacts'},     {title:'Calendar Sync',        path:'/calendar/sync'},
      ]},
      { key:'reception',   title:'Reception',            icon:'mdi-desk-lamp',         sort:21, items:[
        {title:'Reception Desk',         path:'/reception/dashboard'},    {title:'Visitor Management',   path:'/reception/visitors'},
        {title:'Appointment Booking',    path:'/reception/booking'},      {title:'Intake Forms',         path:'/reception/intake'},
        {title:'Client Lookup',          path:'/reception/client-lookup'},{title:'Queue Management',     path:'/reception/queue'},
      ]},
      { key:'finance',     title:'Finance & Accounting', icon:'mdi-bank',              sort:22, items:[
        {title:'Finance Dashboard',      path:'/finance/dashboard'},      {title:'Payment Tracking',     path:'/finance/payments'},
        {title:'Trust Account Ledger',   path:'/finance/trust'},          {title:'Payroll',              path:'/finance/payroll'},
        {title:'Profit Reports',         path:'/finance/reports'},        {title:'Accounting Integrations',path:'/finance/integrations'},
      ]},
      { key:'hr_tools',    title:'HR Management',        icon:'mdi-account-hard-hat',  sort:23, items:[
        {title:'HR Dashboard',           path:'/hr/dashboard'},           {title:'Attendance',           path:'/hr/attendance'},
        {title:'Leave Management',       path:'/hr/leave'},               {title:'Recruitment',          path:'/hr/recruitment'},
        {title:'Performance Reviews',    path:'/hr/performance'},         {title:'Employee Records',     path:'/hr/employees'},
      ]},
      { key:'client_portal',title:'My Portal',           icon:'mdi-account-circle',    sort:24, items:[
        {title:'My Cases',               path:'/client/cases'},           {title:'Document Vault',       path:'/client/documents'},
        {title:'My Invoices',            path:'/client/invoices'},        {title:'Appointments',         path:'/client/appointments'},
        {title:'Chat with Lawyer',       path:'/client/chat'},            {title:'Sign Documents',       path:'/client/esignature'},
        {title:'Video Meetings',         path:'/client/meetings'},        {title:'Help & FAQ',           path:'/client/faq'},
      ]},
      { key:'corporate_portal',title:'Corporate Portal', icon:'mdi-domain',            sort:25, items:[
        {title:'Company Dashboard',      path:'/corporate/dashboard'},    {title:'Legal Requests',       path:'/corporate/requests'},
        {title:'All Cases',              path:'/corporate/cases'},        {title:'Approvals',            path:'/corporate/approvals'},
        {title:'Contract Repository',    path:'/corporate/contracts'},    {title:'Spending Analytics',   path:'/corporate/spending'},
      ]},
      { key:'consultant_portal',title:'Consultant Portal',icon:'mdi-account-star',     sort:26, items:[
        {title:'My Dashboard',           path:'/consultant/dashboard'},   {title:'Expert Reports',       path:'/consultant/reports'},
        {title:'Evidence Review',        path:'/consultant/evidence'},    {title:'My Calendar',          path:'/consultant/calendar'},
        {title:'Messaging',              path:'/consultant/messages'},    {title:'My Invoices',          path:'/consultant/invoices'},
      ]},
      { key:'court_liaison_tools',title:'Court Liaison', icon:'mdi-scale-balance',     sort:27, items:[
        {title:'Liaison Dashboard',      path:'/court-liaison/dashboard'},{title:'Court Notices',        path:'/court-liaison/notices'},
        {title:'Filing Tracker',         path:'/court-liaison/filings'},  {title:'Deadline Monitor',     path:'/court-liaison/deadlines'},
        {title:'Communication Log',      path:'/court-liaison/communications'},
      ]},
      { key:'investigator_tools',title:'Investigator',   icon:'mdi-magnify-scan',      sort:28, items:[
        {title:'Investigation Board',    path:'/investigator/dashboard'}, {title:'Findings',             path:'/investigator/findings'},
        {title:'Evidence & Custody',     path:'/investigator/custody'},   {title:'Interview Records',    path:'/investigator/interviews'},
        {title:'GPS Location Logs',      path:'/investigator/gps'},
      ]},
      { key:'compliance_tools',title:'Compliance',       icon:'mdi-shield-check',      sort:29, items:[
        {title:'Compliance Dashboard',   path:'/compliance/dashboard'},   {title:'AI Compliance Checker',path:'/compliance/ai-checker'},
        {title:'Clause Comparison',      path:'/compliance/clauses'},     {title:'Risk Analysis',        path:'/compliance/risk'},
        {title:'Approval Workflow',      path:'/compliance/approvals'},   {title:'Flagged Issues',       path:'/compliance/flags'},
      ]},
      { key:'ai_premium', title:'Premium AI', icon:'mdi-robot-excited', sort:30, items:[
        {title:'AI Hub',                  path:'/ai-premium'},
        {title:'Legal Research',          path:'/ai-premium/legal-research'},
        {title:'Contract Generation',     path:'/ai-premium/contract-generation'},
        {title:'Clause Suggestions',      path:'/ai-premium/clause-suggestions'},
        {title:'Document Summary',        path:'/ai-premium/document-summary'},
        {title:'Citation Generator',      path:'/ai-premium/citation-generation'},
        {title:'Hearing Preparation',     path:'/ai-premium/hearing-preparation'},
        {title:'Deposition Prep',         path:'/ai-premium/deposition-preparation'},
        {title:'Evidence Summary',        path:'/ai-premium/evidence-summary'},
        {title:'Meeting Transcription',   path:'/ai-premium/meeting-transcription'},
        {title:'Translation',             path:'/ai-premium/translation'},
        {title:'Client Intake',           path:'/ai-premium/client-intake'},
        {title:'Risk Analysis',           path:'/ai-premium/risk-analysis'},
        {title:'Invoice Generation',      path:'/ai-premium/invoice-generation'},
        {title:'Email Drafting',          path:'/ai-premium/email-drafting'},
        {title:'Task Recommendations',    path:'/ai-premium/task-recommendations'},
        {title:'Deadline Prediction',     path:'/ai-premium/deadline-prediction'},
        {title:'Conflict Detection',      path:'/ai-premium/conflict-detection'},
        {title:'Litigation Strategy',     path:'/ai-premium/litigation-strategy'},
        {title:'Document Comparison',     path:'/ai-premium/document-comparison'},
        {title:'Knowledge Search',        path:'/ai-premium/knowledge-search'},
      ]},
    ];

    for (const section of sectionsSeed) {
      const { rows: sr } = await c.query(
        `INSERT INTO navigation_sections (section_key, title, icon, sort_order) VALUES ($1,$2,$3,$4)
         ON CONFLICT (section_key) DO UPDATE SET title=EXCLUDED.title,icon=EXCLUDED.icon,sort_order=EXCLUDED.sort_order
         RETURNING id`,
        [section.key, section.title, section.icon, section.sort]);
      const sectionId = sr[0].id;
      for (let i = 0; i < section.items.length; i++) {
        await c.query(
          `INSERT INTO navigation_items (section_id, title, path, sort_order) VALUES ($1,$2,$3,$4)
           ON CONFLICT (section_id, path) DO UPDATE SET title=EXCLUDED.title,sort_order=EXCLUDED.sort_order`,
          [sectionId, section.items[i].title, section.items[i].path, i + 1]);
      }
    }

    await c.query('DELETE FROM role_section_access');
    const roleAccessSeed = {
      superadmin:        ['superadmin','dashboard'],
      admin:             ['dashboard','lawyerportal','cases','clients','documents','tasks','court','billing','legalresearch','marketing','reports','team','configuration','ai','ai_premium'],
      firm_admin:        ['firmadmin','dashboard','cases','clients','documents','tasks','billing','reports','team','configuration','ai_premium'],
      lawyer:            ['dashboard','lawyerportal','cases','clients','documents','tasks','court','legalresearch','ai','attorney','ai_premium'],
      senior_lawyer:     ['seniorpartner','dashboard','lawyerportal','cases','clients','documents','tasks','court','billing','legalresearch','ai','attorney','ai_premium'],
      attorney:          ['attorney','dashboard','lawyerportal','cases','clients','documents','tasks','court','billing','legalresearch','ai','ai_premium'],
      junior_associate:  ['junior','attorney','dashboard','cases','documents','tasks','legalresearch','ai','ai_premium'],
      paralegal:         ['paralegal_tools','dashboard','cases','documents','tasks','court'],
      legal_secretary:   ['secretary','dashboard','clients'],
      receptionist:      ['reception','dashboard'],
      hr_manager:        ['hr_tools','dashboard','team'],
      accountant:        ['finance','billing','reports','dashboard'],
      client:            ['client_portal'],
      corporate_client:  ['corporate_portal','client_portal'],
      consultant:        ['consultant_portal','dashboard','ai_premium'],
      court_liaison:     ['court_liaison_tools','dashboard','cases','court'],
      investigator:      ['investigator_tools','dashboard','cases'],
      compliance_officer:['compliance_tools','dashboard','documents','cases','ai_premium'],
    };

    // enterprise nav section
    await c.query(`INSERT INTO navigation_sections (section_key, title, icon, sort_order)
      VALUES ('enterprise','Enterprise','mdi-domain',31)
      ON CONFLICT (section_key) DO UPDATE SET title=EXCLUDED.title,icon=EXCLUDED.icon,sort_order=EXCLUDED.sort_order`);

    const { rows: entSec } = await c.query(`SELECT id FROM navigation_sections WHERE section_key='enterprise' LIMIT 1`);
    if (entSec.length) {
      const entItems = [
        {title:'Enterprise Hub',             path:'/enterprise/dashboard'},
        {title:'Multi-Office Management',    path:'/enterprise/offices'},
        {title:'Multi-Country Support',      path:'/enterprise/countries'},
        {title:'White-Label & Branding',     path:'/enterprise/branding'},
        {title:'Custom Domains',             path:'/enterprise/domains'},
        {title:'SSO Configuration',          path:'/enterprise/sso'},
        {title:'Two-Factor Auth (2FA)',       path:'/enterprise/2fa'},
        {title:'Advanced RBAC',              path:'/enterprise/rbac'},
        {title:'Webhooks',                   path:'/enterprise/webhooks'},
        {title:'Automation Rules',           path:'/enterprise/automation'},
        {title:'Document Retention',         path:'/enterprise/retention'},
        {title:'Data Export / Import',       path:'/enterprise/data-export'},
        {title:'Business Intelligence',      path:'/enterprise/bi'},
        {title:'CRM Integration',            path:'/enterprise/crm'},
        {title:'Accounting Integration',     path:'/enterprise/accounting'},
        {title:'Court E-Filing',             path:'/enterprise/court-efiling'},
        {title:'Mobile Applications',        path:'/enterprise/mobile'},
        {title:'Offline Access',             path:'/enterprise/offline'},
        {title:'Disaster Recovery',          path:'/enterprise/disaster-recovery'},
        {title:'Compliance (GDPR / SOC2)',   path:'/enterprise/compliance'},
        {title:'Audit Logs',                 path:'/enterprise/audit-logs'},
        {title:'API & Webhooks Dashboard',   path:'/enterprise/api-dashboard'},
      ];
      for (let i = 0; i < entItems.length; i++) {
        await c.query(`INSERT INTO navigation_items (section_id, title, path, sort_order)
          VALUES ($1,$2,$3,$4) ON CONFLICT (section_id, path) DO UPDATE SET title=EXCLUDED.title,sort_order=EXCLUDED.sort_order`,
          [entSec[0].id, entItems[i].title, entItems[i].path, i + 1]);
      }
    }

    // grant enterprise access to admin/superadmin/firm_admin
    const entRoles = ['superadmin','admin','firm_admin'];
    for (const rk of entRoles) {
      await c.query(`INSERT INTO role_section_access (role_id, section_id)
        SELECT r.id, s.id FROM app_roles r, navigation_sections s
        WHERE r.role_key=$1 AND s.section_key='enterprise'
        ON CONFLICT DO NOTHING`, [rk]);
    }
    for (const [roleKey, sectionKeys] of Object.entries(roleAccessSeed)) {
      const { rows: roleRow } = await c.query(`SELECT id FROM app_roles WHERE role_key=$1 LIMIT 1`, [roleKey]);
      if (!roleRow.length) continue;
      for (const sectionKey of sectionKeys) {
        const { rows: secRow } = await c.query(`SELECT id FROM navigation_sections WHERE section_key=$1 LIMIT 1`, [sectionKey]);
        if (!secRow.length) continue;
        await c.query(`INSERT INTO role_section_access (role_id, section_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [roleRow[0].id, secRow[0].id]);
      }
    }

    await c.query('COMMIT');
  } catch (err) {
    await c.query('ROLLBACK');
    console.error('Seed error:', err.message);
    throw err;
  } finally {
    c.release();
  }
}

module.exports = initDb;
