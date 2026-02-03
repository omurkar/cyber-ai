## AI Threat Detector

A full-stack, educational cybersecurity dashboard demonstrating multi-agent threat detection with a Python FastAPI backend and a React (Vite + TypeScript + Tailwind) frontend. All detections are simulated and safe for demos.

### Features
- Multi-agent architecture (URL, Device, Network, File, Vulnerability)
- FastAPI REST API and WebSocket live updates
- SQLite storage for scan results
- React dashboard with charts, dark UI, and live event feed
- Dockerized deployment

---

## Backend (FastAPI)

### Requirements
- Python 3.11+

### Setup
1. Copy env: `cp backend/.env.template backend/.env`
2. Create venv and install deps:
   - `python -m venv .venv && source .venv/bin/activate` (PowerShell: `./.venv/Scripts/Activate.ps1`)
   - `pip install -r backend/requirements.txt`
3. Run server:
   - `cd backend`
   - `uvicorn main:app --reload`

API base: `http://localhost:8000`

### API Endpoints
- POST `/api/scan/url` body: `{ "url": "https://example.com" }`
- POST `/api/scan/device`
- POST `/api/scan/network`
- POST `/api/scan/file` form-data: `file: <binary>`
- GET `/api/agents/status`
- WebSocket: `/ws/threats` (JSON messages with `{ type, data }`)

### Notes
- Database path: `backend/data/threat_detector.db` (auto-created)
- All detections are mocked to avoid unsafe operations

---

## Frontend (Vite + React + TS)

### Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Vite at `http://localhost:5173`)

The dev server proxies `/api` and `/ws` to the backend.

---

## Docker Deployment

### Build and run
```
docker compose up --build
```
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

### Environment
- Customize `backend/.env` (see `backend/.env.template`).

---

## Folder Structure
```
backend/
  agents/
  api/
  models/
  utils/
  main.py
  requirements.txt
frontend/
  src/
    components/
    pages/
    services/
    store/
    types/
  index.html
  package.json
```

---

## Safety & Educational Focus
- No dangerous command execution
- Simulated threat detection
- Clear logging

---

## License
MIT
