# Changelog

All notable changes to ELoyer are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] — 2026-07-02

### Added — Front Office (Public Website)

- **`/home`** — Full landing page: hero section with dashboard mockup, stats bar, 6-feature grid, AI features highlight, 3-step how-it-works, testimonials, pricing preview, final CTA
- **`/services`** — 9 practice area cards + 8 platform capability tiles
- **`/pricing`** — 3-tier pricing cards with monthly/yearly toggle (20% saving), full feature comparison table, 6-item FAQ accordion
- **`/about`** — Mission statement, company values, 4-person team grid, 7-milestone timeline
- **`/contact`** — Multi-type contact form (demo / sales / support / general), office locations, map section
- **`FrontOfficeNav.vue`** — Sticky navbar with scroll-aware style change (transparent → white), mobile drawer
- **`FrontOfficeFooter.vue`** — Dark footer with newsletter sign-up, social links, trust badges, multi-column link grid
- `meta: { frontOffice: true }` on all public routes to suppress app shell (nav + headerbar)

### Added — Login Page Redesign

- Complete redesign of `Login.vue` with split-screen professional layout
- Left panel: brand logo, headline, SSL/SOC2/GDPR trust badges, testimonial card (dark navy `#0A1628`)
- Right panel: email + password fields with inline validation, show/hide password toggle, "Forgot password?" link, animated loading state, "Remember me" checkbox
- Quick demo access chips: Super Admin, Lawyer, Firm Admin, Client, HR Manager — one click login
- "← Back to website" link

### Changed — Routing

- `/` now redirects to `/home` (was: Login component)
- Login moved to `/login` route with `meta: { frontOffice: true }`
- Removed unused `HomePage` import
- Renamed `enterprise/ComplianceDashboard` import to `EntComplianceDashboard` to resolve naming conflict with `compliance/ComplianceDashboard`
- Fixed stray `]` at end of routes array (was `},]` + separate `]`)
- `/public` redirects to `/home`

---

## [1.9.0] — 2026-06 (Enterprise Module)

### Added

- **Enterprise Hub** (`/enterprise/hub`) — Central dashboard for enterprise features
- Webhooks manager, automation rules engine
- BI dashboard with data export
- CRM integration panel
- Disaster recovery configuration
- Enterprise compliance dashboard
- SSO configuration + 2FA settings
- Data retention policies
- Custom domain management
- Advanced RBAC editor
- Multi-office / multi-country management
- Court e-filing integration
- Mobile app management + offline access settings
- Accounting integration
- Enterprise audit logs
- `backend/routes/enterprise.js` — All enterprise API endpoints
- `src/services/enterpriseApi.js`

---

## [1.8.0] — 2026-06 (AI Premium Module)

### Added — 20 AI Premium Features

| Feature | Route |
|---|---|
| Legal Research | `/ai/legal-research` |
| Contract Generation | `/ai/contract-gen` |
| Clause Suggestions | `/ai/clause-suggestions` |
| Document Summary | `/ai/doc-summary` |
| Citation Generator | `/ai/citation-gen` |
| Hearing Preparation | `/ai/hearing-prep` |
| Deposition Preparation | `/ai/deposition-prep` |
| Evidence Summary | `/ai/evidence-summary` |
| Transcription | `/ai/transcription` |
| Translation | `/ai/translation` |
| Client Intake | `/ai/client-intake` |
| Risk Analysis | `/ai/risk-analysis` |
| Invoice Generation | `/ai/invoice-gen` |
| Email Drafting | `/ai/email-drafting` |
| Task Recommendations | `/ai/task-recommendations` |
| Deadline Prediction | `/ai/deadline-prediction` |
| Conflict Detection | `/ai/conflict-detection` |
| Litigation Strategy | `/ai/litigation-strategy` |
| Document Comparison | `/ai/doc-comparison` |
| Knowledge Search | `/ai/knowledge-search` |

- `backend/routes/ai_premium.js`
- `src/services/aiPremiumApi.js`

---

## [1.7.0] — 2026-06 (External Role Portals)

### Added

- **Compliance Officer** portal: dashboard, AI compliance checker, risk analysis, approvals workflow
- **Investigator** portal: dashboard, findings log, chain of custody, interview records
- **Court Liaison** portal: dashboard, court notices tracker, filing tracker, communication log
- **Consultant** portal: dashboard, expert reports, chain of custody
- `backend/routes/external.js`
- `src/services/externalApi.js`

---

## [1.6.0] — 2026-06 (Client & Corporate Portals)

### Added

- **Client Portal**: dashboard, case timeline, document vault, invoices, appointments, video meetings, e-signature, FAQ
- **Corporate Client Portal**: dashboard, legal requests, approvals queue, contracts, spending analytics
- `backend/routes/client.js`, `backend/routes/corporate.js`
- `src/services/portalApi.js`

---

## [1.5.0] — 2026-05 (HR, Finance, Reception, Secretary)

### Added

- **HR Manager**: dashboard, attendance tracker, leave management, recruitment pipeline, performance reviews, employee records
- **Finance / Accountant**: dashboard, trust ledger, payroll, profit & loss reports
- **Receptionist**: dashboard, visitor log, queue management, intake forms, client lookup
- **Legal Secretary**: dashboard, appointments, email templates, SMS reminders, contacts
- `backend/routes/hr.js`, `backend/routes/staff.js`
- `src/services/staffApi.js`, `src/services/hrApi.js`

---

## [1.4.0] — 2026-05 (Paralegal, Junior Associate, Attorney, Senior Lawyer)

### Added

- **Paralegal**: filing checklists, workflow tracker
- **Junior Associate**: task dashboard, research workspace
- **Attorney**: AI drafting, contract review, pleadings manager, OCR processing, deadlines, billable hours, client communications, email integration
- **Senior Lawyer**: approvals dashboard, case assignment, legal strategies, settlements, invoice review, collaboration hub
- `backend/routes/lawyer.js` (extended)
- `src/services/firmadminApi.js`

---

## [1.3.0] — 2026-05 (Firm Admin Module)

### Added

- **Firm Admin** portal: dashboard, firm profile, departments, office locations, staff invitations, approval workflows, revenue analytics, plan & pricing management, permissions matrix, notification settings
- `backend/routes/firmadmin.js`
- `src/services/firmadminApi.js`

---

## [1.2.0] — 2026-04 (Super Admin Module)

### Added

- **Super Admin** portal: platform analytics, tenant management, subscription plans, feature flags, global audit logs, API key management, system health monitoring
- `backend/routes/superadmin.js`
- `src/services/superadminApi.js`
- Navigation role-access seed data for all 18 roles

---

## [1.1.0] — 2026-04 (Backend Rebuild)

### Added

- Complete PostgreSQL schema in `backend/initDb.js` (50+ tables)
- Seed data: 12 users, 10 clients, 6 cases, tasks, billing records, court dates, documents
- Navigation sections table with role-access mappings
- Express proxy configured in `vue.config.js` (`/api` → `http://localhost:8080`)
- All route modules mounted in `server.js`

### Fixed

- Removed broken `.bin` symlinks caused by OneDrive sync (re-ran `npm install`)
- Fixed PostgreSQL type inference errors in seed data (switched from `$N` parameters to template literals)
- Fixed `INTERVAL` syntax (`INTERVAL '${n} days'` instead of `$N * INTERVAL`)

---

## [1.0.0] — 2020-11

### Initial Release

- Basic Vue 2 + Express scaffold
- Simple case list, client list, document viewer
- Login page (Bootstrap-based)
- Core lawyer portal with hearing dates, tasks, billing
