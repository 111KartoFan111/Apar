Apar Intelligent Transportation System
======================================

Monorepo for a fleet management diploma project with FastAPI + PostgreSQL backend, React + Vite frontend, and Dockerized infra.

Features
- Fleet dashboard: vehicles, statuses, costs, health, fuel metrics, maintenance alerts.
- Financial analytics: fuel, repairs, parts, fines with CSV export/import.
- Operations: waybills, inspections with attachments, maintenance schedules and work orders.
- Warehouses & parts: stationary/mobile warehouses, stock movements, orders, CSV import/export.
- Fines, tires (inventory, assignments, tread alerts), fuel anomaly flags.
- Reports with custom templates and CSV export, AI helpers (mocked if no GEMINI_API_KEY).
- Auth via JWT, seeded admin (admin/admin123), i18n RU/KZ frontend.

Tech Stack
- Frontend: React 18, TypeScript, Vite, React Router, TanStack Query, TailwindCSS, i18next.
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT auth, plain SQL migrations (no Alembic).
- DB: PostgreSQL. Tests run on SQLite for speed.
- Infra: Docker + docker-compose, .env support.

Getting Started
1) Copy env and adjust as needed:
   ```
   cp .env.example .env
   ```
2) Run with Docker:
   ```
   docker-compose up --build
   ```
   - Backend: http://localhost:8000
   - Frontend: http://localhost:5173
3) Seeded credentials: username `admin`, password `admin123`.

Local Development (optional)
- Backend: `cd backend && uvicorn app.main:app --reload`
- Frontend: `cd frontend && npm install && npm run dev`

Migrations
- Plain SQL files in `backend/db/migrations/*.sql`.
- `app.migrations.apply_migrations()` creates `schema_migrations` and applies files idempotently on startup.

CSV Flows
- Import/export vehicles, fuel entries, parts via corresponding endpoints/pages.
- Backend returns validation errors with row numbers for bad rows.

AI Integration
- Endpoints under `/ai/*` use GEMINI_API_KEY from env; mock responses are returned when the key is absent.

Testing
- Backend tests (pytest) use SQLite: `DATABASE_URL=sqlite:///./test.db pytest`.

Repository Layout
- `backend/` FastAPI app, migrations, seeds, tests.
- `frontend/` Vite React app with i18n, Tailwind UI.
- `docker-compose.yml` services for db, backend, frontend.
