# MediPulse AI 🩺⚡

> **Intelligent Clinical Biomarker Tracking & Longitudinal Health Analytics**  
> *Final Year B.E. CSE-AI Capstone Project (2026) | Chitkara University*  
> **Student:** Amandeep Singh (Roll No. 22AI026) &nbsp;|&nbsp; **Guide:** Dr. Manu Midha

---

## 🌟 About The Project

**MediPulse AI** is a full-stack clinical intelligence platform designed to solve a major problem in healthcare: **fragmented, disconnected laboratory reports**. 

Most patients receive multi-page PDF blood reports that are filed away and forgotten. A doctor in 2026 cannot easily spot a gradual 15% increase in cholesterol or a drifting thyroid marker over several years without tedious manual transcription.

MediPulse AI automatically:
1. **Ingests & Decodes:** Extracts quantitative lab values directly from multi-page PDFs or smartphone photos in **under 5 seconds** using a hybrid high-throughput AI extraction engine (PyMuPDF + Groq LLM + Google Gemini Vision).
2. **Standardizes:** Normalizes biomarker units and clinical reference intervals across five foundational panels (CBC, Lipid, Thyroid, Metabolic, LFT/KFT).
3. **Visualizes Trajectories:** Plots multi-year historical trend charts so patients and physicians can immediately spot anomalies before they become critical.
4. **Physician-Aligned Insights:** Generates actionable dietary and lifestyle precautions tailored to your specific out-of-range biomarkers.
5. **Secure Vault:** Isolates all medical records using strict PostgreSQL Row-Level Security (RLS).

---

## 🧱 Architecture & Tech Stack

```
PBL-7/
├── frontend/             # Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts, Framer Motion
├── backend/              # Python FastAPI, PyMuPDF, Groq SDK, Google Generative AI, Supabase Client
│   └── supabase_schema.sql # Database schema with tables, triggers, and RLS security policies
└── README.md             # Complete project guide and setup instructions
```

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend UI** | **Next.js 14 (React)** + TypeScript | Modern, responsive interface with Dark/Light modes |
| **Styling & Motion** | **Tailwind CSS** + CSS Modules + Framer Motion | High-trust clinical aesthetic and fluid animations |
| **Data Visualization** | **Recharts** | Interactive longitudinal biomarker trend line charts |
| **Backend API** | **FastAPI (Python 3.10+)** | Asynchronous REST endpoints, PDF parsing, AI orchestration |
| **PDF Extraction** | **PyMuPDF (fitz)** | Instant (<10ms) digital text extraction from report PDFs |
| **Primary AI Engine** | **Groq Cloud (`openai/gpt-oss-120b`)** | Sub-4s ultra-fast structured biomarker extraction |
| **Fallback AI Engine** | **Google Gemini (`gemini-2.5-flash`)** | Multi-modal OCR fallback for scanned camera photos |
| **Database & Auth** | **Supabase (PostgreSQL 15)** | User authentication (JWT) + Row-Level Security (RLS) |
| **File Storage** | **Supabase Storage** | Encrypted private bucket for original lab PDF reports |

---

## 🚀 Prerequisites

Before getting started, make sure you have the following installed on your machine:
- **Node.js** (v18.0 or higher) → [Download Node.js](https://nodejs.org)
- **Python** (v3.10 or higher) → [Download Python](https://www.python.org)
- **Git** → [Download Git](https://git-scm.com)
- Free accounts for external services:
  - [Supabase](https://supabase.com) (Database, Auth, Storage)
  - [Groq Console](https://console.groq.com) (Fast AI inference)
  - [Google AI Studio](https://aistudio.google.com) (Gemini API)

---

## 🛠️ Step-by-Step Setup Guide

Follow these 4 simple steps to run the complete project locally.

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/PBL-7.git
cd PBL-7
```

---

### Step 2: Set Up Supabase (Database & Storage)

1. Log in to [supabase.com](https://supabase.com) and create a **New Project** (choose any name and strong database password).
2. **Run the Database Schema:**
   - In your Supabase project dashboard, click **SQL Editor** on the left menu.
   - Click **New Query**.
   - Open the file [`backend/supabase_schema.sql`](backend/supabase_schema.sql) from this project, copy all its contents, paste them into the SQL editor, and click **Run**.
   - This will automatically create the `profiles`, `reports`, and `biomarkers` tables with Row-Level Security (RLS).
3. **Create the Storage Bucket:**
   - In Supabase, click **Storage** on the left menu.
   - Click **New Bucket**.
   - Set the bucket name to exactly: `lab-reports`
   - Toggle **Public bucket** to **OFF** (keep it **Private** for medical data privacy).
   - Click **Save bucket**.
4. **Add Storage Access Policies:**
   - Click on the `lab-reports` bucket → **Policies** (or go to **Configuration → Policies → Storage**).
   - Add the following 3 policies for the `authenticated` role so logged-in users can access their own files:
     - **Upload Policy:** Allowed operation: `INSERT` (Target role: `authenticated`).
     - **View/Download Policy:** Allowed operation: `SELECT` (Target role: `authenticated`).
     - **Delete Policy:** Allowed operation: `DELETE` (Target role: `authenticated`).
5. **Copy Your Supabase API Keys:**
   - Go to **Project Settings** (gear icon) → **API**.
   - Note down:
     - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
     - **Project API Anon Key** (`anon` `public`)
     - **Project Service Role Key** (`service_role` `secret`)

---

### Step 3: Configure & Run the Backend (FastAPI)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate

   # On Windows:
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install all dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your environment configuration file:
   ```bash
   cp .env.example .env
   ```

5. Open `.env` in any text editor and fill in your keys:
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # AI Extraction APIs
   GEMINI_API_KEY=your_google_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here

   # Application Port & CORS
   PORT=8000
   ALLOWED_ORIGINS=http://localhost:3000
   ```

6. Start the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   - Backend is live at: `http://localhost:8000`
   - Interactive Swagger API Documentation: `http://localhost:8000/docs`

---

### Step 4: Configure & Run the Frontend (Next.js)

1. Open a **new terminal tab** and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Configure your frontend environment variables in `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   *(If `.env.local.example` doesn't exist, create `.env.local` directly):*
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 How to Test the Application

1. **Sign Up:** Click **Launch Vault** on the homepage and create a new account with your email and password.
2. **Ingest a Lab Report:**
   - Click **Ingest Report** in the navigation bar.
   - Choose a diagnostic panel (e.g., *Thyroid Panel*, *Complete Blood Count*, or *Lipid Profile*).
   - Drag & drop any lab report PDF or photo (you can use real diagnostic reports from Dr. Lal PathLabs, Arogyam, Metropolis, etc.).
   - Click **Analyze Report**.
3. **Verification Screen:**
   - In 3–5 seconds, the AI will extract all biomarkers (e.g., TSH, Total T3, Total T4) along with their values, units, and reference ranges.
   - Review or edit any value, or click **+ Add Biomarker** if needed.
   - Click **Save to Clinical Vault**.
4. **Inspect Dashboard & Trends:**
   - Visit the **Dashboard** to see color-coded status badges:
     - 🟢 **Optimal / Normal**
     - 🟡 **Borderline Attention**
     - 🔴 **Action Required / Out of Range**
   - Click on any biomarker to view its **interactive historical trend chart** across all your uploaded test dates.
   - Read the automated **Clinical AI Recommendations** summarizing dietary and lifestyle precautions.

---

## 🩺 Supported Diagnostic Panels

| Panel Code | Name | Common Biomarkers Tracked |
|---|---|---|
| `CBC` | **Complete Blood Count** | Hemoglobin, RBC Count, Platelets, Total Leukocyte Count (WBC), Hematocrit, MCV, MCH |
| `LIPID` | **Lipid & Cardiovascular Profile** | Total Cholesterol, HDL (Good), LDL (Bad), Triglycerides, VLDL, Total/HDL Ratio |
| `THYROID` | **Thyroid Function Panel** | TSH (Thyroid Stimulating Hormone), Total T3, Total T4, Free T3, Free T4 |
| `METABOLIC` | **Metabolic & Glycemic Panel** | Fasting Blood Sugar (FBS), Post-Prandial (PPBS), HbA1c (Glycated Hemoglobin) |
| `LFT_KFT` | **Hepatic & Renal Panel** | SGPT (ALT), SGOT (AST), Serum Bilirubin, Serum Creatinine, Blood Urea Nitrogen (BUN), eGFR |

---

## 🛡️ Security & Privacy Architecture

- **Row-Level Security (RLS):** Every row in PostgreSQL is linked to `auth.uid()`. Even if an attacker knew another user's report ID, the database mathematically rejects unauthorized queries.
- **Private Storage:** Original PDF files are stored in a private Supabase bucket and are only accessible via short-lived, signed tokens.
- **Zero Third-Party Training:** Patient health data is processed ephemerally for extraction and is never used to train public machine learning models.

---

## ❓ Troubleshooting & FAQs

<details>
<summary><b>Q: When uploading, I get "Failed to fetch" or a network error.</b></summary>
<b>Solution:</b> Ensure your FastAPI backend is running on port 8000 (<code>uvicorn main:app --port 8000</code>) and that <code>NEXT_PUBLIC_API_URL=http://localhost:8000</code> is present in <code>frontend/.env.local</code>.
</details>

<details>
<summary><b>Q: PDF extraction hangs or takes a long time.</b></summary>
<b>Solution:</b> MediPulse AI uses PyMuPDF to extract text in 0.01 seconds, then queries Groq's high-speed endpoint. Ensure your <code>GROQ_API_KEY</code> is correctly set in <code>backend/.env</code>.
</details>

<details>
<summary><b>Q: Error 403 or Storage upload fails.</b></summary>
<b>Solution:</b> Ensure your Supabase bucket is named exactly <code>lab-reports</code> and that you added the 3 Storage policies for <code>INSERT</code>, <code>SELECT</code>, and <code>DELETE</code> to the <code>authenticated</code> role in Supabase Storage settings.
</details>

---

## 🎓 Academic Information

- **Institution:** Chitkara University Institute of Engineering & Technology, Punjab
- **Degree:** Bachelor of Engineering in Computer Science & Engineering (AI Specialization)
- **Course Code:** PBL-7 (Project Based Learning - Final Year Capstone)
- **Academic Year:** 2025–2026
- **Project Title:** MediPulse AI: Automated Clinical Laboratory Ingestion, Biomarker Standardization, and Longitudinal Health Intelligence
- **Developer:** Amandeep Singh (Roll No. 22AI026)
- **Project Mentor:** Dr. Manu Midha

---

## 📄 License

This project is developed for academic evaluation under Chitkara University. All rights reserved.
