<p align="center">
  <img src="screenshots/logo.png" alt="ELoyer Logo" />
</p>

<h1 align="center">ELoyer — Legal Practice Management Platform</h1>

<p align="center">
  A full-featured SaaS platform for law firms — case management, billing, AI-assisted drafting, client portals, HR, enterprise compliance and more.
</p>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Running](#setup--running)
- [User Roles](#user-roles)
- [Feature Modules](#feature-modules)
- [Front Office Pages](#front-office-pages)
- [Database](#database)
- [Screenshots](#screenshots)
- [Status](#status)
- [License](#license)

---

## Overview

| | |
|---|---|
| **Status** | Active development |
| **Version** | 2.0.0 |
| **Created** | November 2020 |
| **Last Updated** | July 2026 |
| **Sector** | LegalTech / SaaS |

ELoyer is a comprehensive legal practice management system supporting **18 distinct user roles**, **20 premium AI features**, **enterprise multi-firm capabilities**, and a professional public-facing front office.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 2 + Vuetify 2 |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | Session-based (JWT-ready) |
| AI Features | REST API integration layer |
| Testing | Playwright (E2E) |

---

## Project Structure

```
eloyer/
├── backend/           # Express API server
│   ├── server.js      # Entry point (port 8080)
│   ├── db.js          # PostgreSQL pool
│   ├── initDb.js      # Schema creation + seed data
│   └── routes/        # Route modules per role
├── src/               # Vue 2 frontend
│   ├── main.js
│   ├── App.vue
│   ├── router/        # Vue Router (all 18 roles)
│   ├── services/      # Axios API service modules
│   └── components/    # All Vue components
│       ├── frontoffice/   # Public marketing pages
│       ├── superadmin/
│       ├── firmadmin/
│       ├── lawyer/
│       ├── attorney/
│       ├── enterprise/
│       ├── ai/
│       └── ...        # All other role modules
├── server.js          # Root server entry
├── vue.config.js      # Proxy config (API → :8080)
└── package.json
```

---

## Setup & Running

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14 (running locally)

### Environment

Create a `.env` file in the project root:

```env
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=admin
PGDATABASE=eloyer
DATABASE_URL=postgresql://postgres:admin@localhost:5432/eloyer
```

### Install

```bash
npm install
```

### Run

**Backend** (port 8080):
```bash
node server.js
```

**Frontend** (port 8081):
```bash
npm run serve
```

Then open **http://localhost:8081** — you will be redirected to the landing page.  
Login at **http://localhost:8081/login**.

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@eloyer.com | admin |
| Lawyer / Admin | admin@admin.com | admin |
| Firm Admin | firmadmin@eloyer.com | admin |
| Client | client@eloyer.com | admin |
| HR Manager | hr@eloyer.com | admin |

---

## User Roles

The platform supports **18 user roles**, each with a dedicated portal and navigation:

| # | Role | Portal Path |
|---|---|---|
| 1 | Super Admin | `/superadmin/dashboard` |
| 2 | Firm Admin | `/firmadmin/dashboard` |
| 3 | Lawyer / Admin | `/dashboard` |
| 4 | Senior Lawyer | `/senior/dashboard` |
| 5 | Attorney | `/attorney/dashboard` |
| 6 | Junior Associate | `/junior/dashboard` |
| 7 | Paralegal | `/paralegal/dashboard` |
| 8 | Legal Secretary | `/secretary/dashboard` |
| 9 | Receptionist | `/reception/dashboard` |
| 10 | Finance / Accountant | `/finance/dashboard` |
| 11 | HR Manager | `/hr/dashboard` |
| 12 | Client | `/client/portal` |
| 13 | Corporate Client | `/corporate/portal` |
| 14 | Consultant | `/consultant/portal` |
| 15 | Court Liaison | `/court-liaison/dashboard` |
| 16 | Investigator | `/investigator/dashboard` |
| 17 | Compliance Officer | `/compliance/dashboard` |
| 18 | Enterprise Admin | `/enterprise/hub` |

---

## Feature Modules

### Core Legal
- Case & matter management, document vault, task tracker
- Hearing dates, court filing, evidence management
- Billing, invoicing, payment tracking, trust ledger

### AI Premium (20 Features)
Legal research · Contract generation · Clause suggestions · Document summary · Citation generator · Hearing prep · Deposition prep · Evidence summary · Transcription · Translation · Client intake · Risk analysis · Invoice generation · Email drafting · Task recommendations · Deadline prediction · Conflict detection · Litigation strategy · Document comparison · Knowledge search

### Enterprise
Multi-office · Multi-country · SSO / 2FA · Advanced RBAC · Webhooks · Automation rules · BI dashboard · Data export · CRM integration · Court e-filing · Disaster recovery · Compliance dashboard · Audit logs · Custom domains · Retention policies · Accounting integration · Mobile apps · Offline access

---

## Front Office Pages

| Route | Page |
|---|---|
| `/home` | Landing Page |
| `/services` | Services |
| `/pricing` | Pricing (3 tiers + comparison table) |
| `/about` | About Us |
| `/contact` | Contact / Demo Request |
| `/login` | Sign In |

---

## Database

50+ PostgreSQL tables initialised automatically on first run via `backend/initDb.js`.  
Seed data includes 12 users, 10 clients, 6 cases, navigation sections and role-access mappings for all 18 roles.

---

## Screenshots

<p align="center">
  <img src="screenshots/screenshot.png" alt="Dashboard screenshot" />
</p>

---

## Status

Active development — v2.0.0

---

## License

<a href="license.txt">MIT License</a>  
© 2020-2026 Delta Dev Software — contact@delta-dev-software.com
