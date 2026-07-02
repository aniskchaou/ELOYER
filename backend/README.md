# Eloyer Backend (Node.js + Express + PostgreSQL)

## What this provides
- Express API under `/api`
- PostgreSQL connection via `pg`
- Auto schema initialization and seed data on startup
- Lawyer workflow endpoints for:
  - Start-day dashboard
  - Case creation and assignment
  - Case status updates
  - Legal notes / strategy
  - Evidence upload metadata
  - Timeline events
  - Documents / contracts linking
  - Court hearings
  - Time logs
  - Meeting scheduling
  - AI next-step and risk suggestions
  - Document templates, version compare, e-sign, AI summary
  - Timer start/stop, task assignment/progress, deadline alerts
  - Court decisions and calendar sync
  - Client messaging, document requests, case updates
  - Invoice generation, payment tracking, retainers, reminders
  - Legal research attach/search and AI law suggestions
  - Performance analytics and advanced AI case insights

## Environment
Copy `.env.example` to `.env` and set your database values.

## Run options
- Combined SPA + API server:
  - `npm start`
- API-only server:
  - `npm run start:api`

## Main endpoints
- `GET /api/health`
- `POST /api/auth/lawyer-login`
- `GET /api/lawyer/dashboard/:lawyerId`
- `GET /api/lawyer/clients`
- `GET /api/cases?lawyerId=1`
- `POST /api/cases`
- `GET /api/cases/:caseId`
- `PATCH /api/cases/:caseId/status`
- `POST /api/cases/:caseId/notes`
- `POST /api/cases/:caseId/evidence`
- `POST /api/cases/:caseId/events`
- `POST /api/cases/:caseId/documents`
- `POST /api/cases/:caseId/hearings`
- `POST /api/cases/:caseId/log-time`
- `POST /api/cases/:caseId/meetings`
- `GET /api/cases/:caseId/ai-suggestions`
- `POST /api/cases/:caseId/documents/from-template`
- `POST /api/cases/:caseId/documents/:documentId/versions`
- `GET /api/cases/:caseId/documents/:documentId/compare`
- `POST /api/cases/:caseId/documents/:documentId/esign`
- `POST /api/cases/:caseId/documents/ai-summarize`
- `POST /api/cases/:caseId/timer/start`
- `POST /api/cases/:caseId/timer/stop`
- `POST /api/cases/:caseId/tasks`
- `PATCH /api/tasks/:taskId/progress`
- `POST /api/cases/:caseId/hearings/:hearingId/sync-calendar`
- `GET /api/cases/:caseId/deadline-alerts`
- `POST /api/cases/:caseId/court-decisions`
- `POST /api/cases/:caseId/messages`
- `POST /api/cases/:caseId/request-documents`
- `POST /api/cases/:caseId/share-update`
- `POST /api/cases/:caseId/invoices/from-time`
- `POST /api/invoices/:invoiceId/send`
- `PATCH /api/invoices/:invoiceId/payment`
- `POST /api/invoices/:invoiceId/remind`
- `POST /api/cases/:caseId/retainers`
- `GET /api/research/search?q=...`
- `POST /api/cases/:caseId/research`
- `GET /api/cases/:caseId/research-ai-suggestions`
- `GET /api/lawyer/performance/:lawyerId`
- `GET /api/cases/:caseId/ai-advanced`
