# HMS - Hospital Management System

Hospital Management System (HMS) built with FastAPI + React (Vite + TypeScript) for managing patients, doctors, staff, appointments, pharmacy inventory, attendance, and operational insights.

Maintained by **Dipin Raj**.

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- Frontend: React 18, TypeScript, Vite, React Query, shadcn/ui
- Auth: JWT-based role auth (admin, doctor, staff, patient, pharmacy)
- Deployment: Render (Web Service + Postgres + Static Site)

## Repository Structure

```text
backend/      FastAPI app, models, routers, alembic migrations
frontend/     React + Vite frontend
docker/       Dockerfiles and compose files
scripts/      Utility scripts (seed/migrate helpers)
docs/         Architecture and design notes
```

## Features

- Role-based login and dashboards
- Patient, doctor, staff, appointment, and pharmacy modules
- Admin analytics and operational pages
- Invite-based doctor/staff onboarding with password setup link
- Admin-configurable SMTP profile (stored in DB) for invite emails

## Local Development Setup

## 1) Clone and create environment

```bash
git clone https://github.com/Dipin-Raj/HMS.git
cd HMS
```

## 2) Backend setup

```bash
python -m venv .venv
```

Windows (PowerShell):

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

Linux/macOS:

```bash
source .venv/bin/activate
pip install -r backend/requirements.txt
```

Create `.env` in repo root:

```env
SECRET_KEY=replace_with_strong_secret
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256

DATABASE_URL1=postgresql+psycopg2://postgres:password@localhost:5432/hms_ai_db

DOCTOR_INVITE_BASE_URL=http://localhost:8080/set-password
DOCTOR_INVITE_EXPIRY_HOURS=24
```

Run migrations:

```bash
python -m alembic -c backend/alembic.ini upgrade head
```

Run backend:

```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

## 3) Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Run frontend:

```bash
npm run dev
```

App URLs:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8000`

## API Base Path

All API routes are mounted under:

`/api/v1`

Examples:

- `/api/v1/login`
- `/api/v1/patients`
- `/api/v1/doctors`
- `/api/v1/admin/me/email-settings`

## Email / Invite Flow

- Invite and test emails use **Admin Email Settings** saved in DB (`admin_email_settings` table), not root `.env` SMTP values.
- Configure mail from Admin settings page before sending doctor/staff invites.

## Deployment (Render)

## Backend (Web Service)

- Environment: `Python`
- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`

Required env vars:

```env
SECRET_KEY=replace_with_strong_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL1=<render_internal_database_url>
DOCTOR_INVITE_BASE_URL=<https://your-frontend-domain/set-password>
DOCTOR_INVITE_EXPIRY_HOURS=24
```

## Database (Render Postgres)

- Use **Internal DB URL** in Render backend env
- Use **External DB URL** from local tools (pgAdmin/psql), with SSL

Run migrations from local machine against Render DB (if not running on startup):

```powershell
$env:PYTHONPATH='D:\Projects_OT\HMS_Test'
$env:DATABASE_URL1='postgresql://USER:PASS@HOST:5432/DB?sslmode=require'
python -m alembic -c backend/alembic.ini upgrade head
```

## Frontend (Render Static Site)

- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Env: `VITE_API_URL=https://<your-backend-domain>/api/v1`

## Troubleshooting

- `Failed to fetch` from frontend:
  - Verify `VITE_API_URL` points to backend `/api/v1`
  - Check backend service logs for 4xx/5xx errors

- `column ... does not exist` errors:
  - DB schema is behind code; run `alembic upgrade head`

- Invite link opens localhost in production:
  - Set `DOCTOR_INVITE_BASE_URL` to deployed frontend URL (`/set-password`)

## Security Notes

- Never commit `.env` with real secrets.
- Rotate credentials immediately if exposed (DB, SMTP, JWT secret).

## License

Private project unless specified otherwise by repository owner.
