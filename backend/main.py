from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import reports, users, chat

app = FastAPI(
    title="MediPulse AI API",
    description="AI-powered health report analysis and biomarker tracking backend",
    version="1.0.0"
)

import os

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Allow Next.js frontend (localhost in dev, Netlify/Vercel previews and production, or custom domain)
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
custom_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
] + custom_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*(\.netlify\.app|\.vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ────────────────────────────────────────────────────────────────────
app.include_router(reports.router)
app.include_router(users.router)
app.include_router(chat.router)

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "service": "MediPulse AI Backend",
        "status": "healthy",
        "version": "1.0.0"
    }
