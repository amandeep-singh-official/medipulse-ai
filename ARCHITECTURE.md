# MediPulse AI — System Architecture

> **Status:** Validated ✅  
> **Date:** September 2026  
> **Author:** Amandeep Singh (22AI026)  
> **Project:** Co-Op I, Chitkara University, B.E. CSE-AI, Batch B2023  

---

## Understanding Summary

- **What:** A web app where users upload lab reports (PDF/image), select the report category, AI extracts biomarkers, user verifies/edits values, and a personal health dashboard shows historical trend charts + holistic AI recommendations & precautions.
- **Why:** Patients can't track biomarker trends across reports. Medical jargon is hard to understand. No proactive early warning exists in personal health record management.
- **Who:** ~10 users (student, classmates, professor/evaluators) — college final year project demo.
- **Key Constraints:** All free tiers only (Supabase, Gemini, Groq, Vercel, Render). Single developer. Public deployment on Vercel required.
- **MVP Scope:** Upload → AI Extract (with manual edit) → Dashboard + Trend Charts + Holistic AI Recommendations & Precautions.

### Explicit Non-Goals (MVP)
- ❌ No symptom logger
- ❌ No doctor PDF export
- ❌ No mobile app
- ❌ No real-time collaboration
- ❌ No admin panel
- ❌ No HIPAA/medical compliance

---

## Assumptions

1. Gemini 1.5 Flash handles both PDFs and images natively via its Vision API.
2. Supabase free tier is sufficient for ~10 users and their lab reports.
3. PDFs will be converted to images before sending to Groq (fallback), since Groq only supports images.
4. No medical compliance (HIPAA, GDPR) is required — this is a college project.
5. Single developer — no CI/CD pipeline required for MVP.
6. Users are honest about report dates and category selection.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│              Next.js Frontend (React + Tailwind)            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS REST API calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Python FastAPI Backend                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ /upload      │  │ /extract     │  │ /recommendations  │ │
│  │ (file intake)│  │ (AI parsing) │  │ (holistic AI)     │ │
│  └──────────────┘  └──────────────┘  └───────────────────┘ │
│                           │                                 │
│             ┌─────────────┴──────────────┐                  │
│             ▼                            ▼                  │
│   Gemini 1.5 Flash API          Groq LLaMA Vision API       │
│   (Primary AI)                  (Fallback AI)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE                                │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │    Auth     │  │  PostgreSQL  │  │  Storage (files)   │ │
│  │ (JWT tokens)│  │  (DB + RLS)  │  │  PDFs & Images     │ │
│  └─────────────┘  └──────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Key Separation of Concerns:**
- **Next.js** — UI only. No AI logic, no direct DB access.
- **FastAPI** — All business logic, AI orchestration, PDF processing.
- **Supabase** — Auth, data persistence, file storage.
- **AI APIs** — Stateless, called on-demand only when a report is uploaded or recommendations are requested.

---

## Database Schema (Supabase PostgreSQL)

```sql
-- 1. Users (managed automatically by Supabase Auth)
auth.users
  └── id, email, created_at

-- 2. Profiles (extra user info)
profiles
  ├── id          UUID  → links to auth.users.id
  ├── full_name   TEXT
  ├── age         INTEGER
  ├── gender      TEXT
  └── created_at  TIMESTAMP

-- 3. Reports (each uploaded lab report)
reports
  ├── id          UUID PRIMARY KEY
  ├── user_id     UUID → links to profiles.id
  ├── category    TEXT → 'CBC' | 'LIPID' | 'THYROID' | 'METABOLIC' | 'LFT_KFT'
  ├── report_date DATE → date of the actual lab test
  ├── lab_name    TEXT → e.g. "Lal PathLabs"
  ├── file_url    TEXT → Supabase Storage URL (PDF/image)
  └── created_at  TIMESTAMP

-- 4. Biomarkers (individual extracted values per report)
biomarkers
  ├── id          UUID PRIMARY KEY
  ├── report_id   UUID → links to reports.id
  ├── name        TEXT    → e.g. "Hemoglobin", "LDL Cholesterol"
  ├── value       NUMERIC → e.g. 11.2
  ├── unit        TEXT    → e.g. "g/dL"
  ├── ref_min     NUMERIC → normal range minimum
  ├── ref_max     NUMERIC → normal range maximum
  └── status      TEXT    → 'NORMAL' | 'BORDERLINE' | 'OUT_OF_RANGE'
```

**Row Level Security (RLS):**
- RLS enabled on all tables in Supabase.
- Every query filtered by `WHERE user_id = auth.uid()`.
- No user can ever read or write another user's data.

---

## FastAPI Backend — API Routes

```
POST   /api/reports/upload
       → Receives: file + category + report_date + JWT token
       → Uploads file to Supabase Storage
       → Creates record in reports table
       → Returns: report_id

POST   /api/reports/{report_id}/extract
       → Fetches file from Supabase Storage
       → Converts PDF pages to images (if PDF, using PyMuPDF / pdf2image)
       → Calls Gemini 1.5 Flash Vision with category-specific extraction prompt
       → On failure → auto-fallback to Groq LLaMA Vision
       → Returns: extracted biomarkers as JSON (NOT saved — user verifies first)

POST   /api/reports/{report_id}/confirm
       → Receives: user-edited biomarker list
       → Calculates status (NORMAL / BORDERLINE / OUT_OF_RANGE) per value
       → Saves all biomarkers to biomarkers table
       → Returns: success

GET    /api/dashboard
       → Returns: latest status card data for each biomarker category

GET    /api/trends/{biomarker_name}
       → Returns: all historical values for one biomarker (for trend chart)

GET    /api/recommendations
       → Fetches ALL user biomarkers across ALL reports
       → Sends full history to Gemini with holistic analysis prompt
       → Returns: structured recommendations, precautions, risk flags
```

**AI Fallback Logic:**
```python
try:
    result = call_gemini(file_bytes, category_prompt)
except (GeminiError, QuotaExceeded):
    result = call_groq(image_bytes, category_prompt)  # PDF converted to image first
```

---

## Frontend — Pages & Routes (Next.js App Router)

```
/                     → Landing page (hero, features, Get Started CTA)
/auth/login           → Supabase Auth login form
/auth/signup          → Supabase Auth signup form

/dashboard            → Main dashboard (PROTECTED)
                        ├── Biomarker status cards (🟢 Normal / 🟡 Borderline / 🔴 Out of Range)
                        ├── Trend charts (Recharts line graphs per biomarker)
                        └── AI Recommendations panel

/upload               → Upload flow (PROTECTED)
                        ├── Step 1: Category selector
                        ├── Step 2: File drag-and-drop + report date picker
                        ├── Step 3: AI extraction loading state
                        └── Step 4: Verification table (editable) → Save

/reports              → Report history list (PROTECTED)
                        └── Click any report → view individual biomarker breakdown
```

**Upload → Dashboard Data Flow:**
```
User selects category
        ↓
User drops file → POST /api/reports/upload → file stored in Supabase Storage
        ↓
POST /api/reports/{id}/extract → Gemini/Groq parses file → returns JSON
        ↓
Verification table shown (editable by user)
        ↓
User confirms → POST /api/reports/{id}/confirm → biomarkers saved to DB
        ↓
Redirect to /dashboard
        ↓
GET /api/dashboard + GET /api/trends/* + GET /api/recommendations → UI refreshes
```

**Protected Routes:** `/dashboard`, `/upload`, `/reports` require a valid Supabase Auth JWT session. No session → redirect to `/auth/login`.

---

## Error Handling & Edge Cases

| Scenario | Handling |
|---|---|
| Gemini API quota exceeded | Auto-fallback to Groq silently |
| Groq also fails | Return error: "AI extraction unavailable, try again" |
| Blurry / unreadable scan | AI returns partial data → user fills missing values manually |
| PDF has multiple pages | Convert all pages to images → send each to AI → merge results |
| Wrong file type uploaded | Frontend validates (PDF/JPG/PNG only) before upload |
| JWT token expired | Frontend detects 401 → redirect to login |
| Supabase Storage upload fails | Show retry button — don't create DB record until file is safely stored |
| User uploads same report twice | Allowed — user manages their own reports |
| Biomarker name differs across labs | AI normalizes names using category-specific prompt schema |
| User has only 1 report | Trend chart shows single data point (acceptable) |
| Reference ranges differ across labs | AI extracts the lab's own reference range, stored per-report |

---

## Deployment

```
Frontend (Next.js)     → Vercel (free tier) — auto-deploy from GitHub
Backend (FastAPI)      → Render.com or Railway.app (free tier)
DB + Auth + Storage    → Supabase (free tier, fully managed)
```

**Environment Variables:**
```bash
# Backend (.env)
GEMINI_API_KEY=
GROQ_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=        # FastAPI backend public URL
```

---

## Decision Log

| # | Decision | Alternatives Considered | Why Chosen |
|---|---|---|---|
| 1 | Next.js + FastAPI (separate backend) | Monolithic Next.js, Supabase Edge Functions | Python = better PDF libraries, no serverless timeout limits |
| 2 | User selects report category manually | Auto-detect via AI | Simpler, more accurate extraction, user stays in control |
| 3 | Gemini 1.5 Flash as primary AI | GPT-4o Vision, Tesseract | Best free tier, supports PDF natively, highest accuracy |
| 4 | Groq LLaMA Vision as fallback | Tesseract OCR, Ollama local | Free, fast, no local setup overhead |
| 5 | Supabase for Auth + DB + Storage | Firebase, PlanetScale + S3 | Single platform for all three, free tier, RLS built-in |
| 6 | AI Extract → User Verify → Save | Auto-save without verification | Prevents inaccurate data from corrupting the system |
| 7 | Holistic AI Recommendations | Per-report only | Trend-based insights are the unique selling point of this project |
| 8 | Permanent file storage | Discard after extraction | Users can re-download original lab reports |
| 9 | Vercel + Render/Railway deployment | Local demo only | Public URL allows evaluators to access from any device |
