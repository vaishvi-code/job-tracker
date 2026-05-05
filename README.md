# 🎯 Job Application Tracker

A full-stack web app to track your job applications with a Kanban board and AI-powered email generation.

**Stack:** FastAPI · PostgreSQL · React · Claude AI · Railway · Vercel

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Fill in DATABASE_URL and ANTHROPIC_API_KEY in .env

uvicorn app.main:app --reload
```

API runs at `http://localhost:8000`  
Docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:8000

npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs/` | List all applications |
| POST | `/jobs/` | Create new application |
| PATCH | `/jobs/{id}` | Update application |
| DELETE | `/jobs/{id}` | Delete application |
| POST | `/ai/generate-email` | Generate email draft |

---

## Deploy

See deployment guides:
- **Backend + DB:** [Railway](https://railway.app)
- **Frontend:** [Vercel](https://vercel.com)
