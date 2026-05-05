from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import jobs, ai

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Job Tracker API",
    description="Track job applications and generate AI-powered emails",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://job-tracker-kappa-eight.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Job Tracker API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
