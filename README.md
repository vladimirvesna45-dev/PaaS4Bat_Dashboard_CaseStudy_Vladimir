# PaaS4Bat Dashboard

Predictive Analysis as a Service for Battery degradation — case study dashboard for Grunuss.

Upload early-cycle battery CSV data, run mock ML predictions, and visualize capacity fade, cycle life, confidence intervals, and degradation mechanism breakdown.

## Live URL

> https://paas4batdf37ae7e-container-web.functions.fnc.fr-par.scw.cloud/

See [docs/testing.md](docs/testing.md) for the manual test checklist (T-01–T-10).

## Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Chart.js, TanStack Query, Zustand
- **Backend:** FastAPI (mock prediction API)
- **Deploy:** Docker + Scaleway Serverless Containers (documented below)

## Quick start (local)

### Prerequisites

- Node.js 20+
- Python 3.12+
- npm

### 1. Backend API

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the Vite dev server proxies `/api` to port 8000.

### 3. Docker (optional)

local:
```bash
docker compose build --build-arg NGINX_CONF=nginx.local.conf
```
prod:
```bash
docker compose build
```
then
```bash
docker compose up
```

- Frontend: http://localhost:8080
- API: http://localhost:8000

## Environment variables

Copy `.env.example` to `.env` and adjust:

| Variable | Description |
|----------|-------------|
| `CORS_ORIGINS` | Comma-separated allowed origins for the API |
| `VITE_API_URL` | API base URL for production builds (empty = same origin via proxy) |

## CSV format

Required columns: `cycle`, `capacity_ah`

Optional: `voltage_avg`, `temperature_c`, `coulomb_efficiency`

Sample files: `frontend/public/sample/sample_battery.csv`

## Features

- Drag-and-drop CSV upload with validation
- Sample data demo (Cell_001_LFP)
- Capacity degradation chart with confidence bands and 80% EOL line
- Cycle life, capacity @500/@1000 metrics
- Degradation breakdown (chemical, mechanical, electrical, coulombic)
- Text explanation of predictions
- Side-by-side battery comparison
- Export CSV and PDF
- Dark mode and demo login

## Scaleway deployment

1. Create a **Container Registry** namespace and log in:
   ```bash
   scw registry login
   ```
2. Build and push images:
   ```bash
   docker build -t rg.<region>.scw.cloud/<namespace>/paas4bat-api:latest ./backend
   docker build -t rg.<region>.scw.cloud/<namespace>/paas4bat-web:latest --build-arg VITE_API_URL=https://<api-url> ./frontend
   docker push rg.<region>.scw.cloud/<namespace>/paas4bat-api:latest
   docker push rg.<region>.scw.cloud/<namespace>/paas4bat-web:latest
   ```
3. Deploy **Serverless Containers** for API (port 8000) and web (port 80).
4. Set `CORS_ORIGINS` on the API to your frontend public URL.
5. Record the live URL in this README.

## Project structure

```
PaaS4Bat/
├── frontend/     React dashboard
├── backend/      FastAPI mock predictor
├── docs/         API docs and technical report
└── docker-compose.yml
```

## Submission

Repository name: `PaaS4Bat_Dashboard_CaseStudy_Vladimir`

See `docs/technical-report.md` for the full technical document (export to PDF for submission).
