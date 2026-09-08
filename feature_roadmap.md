# MediPulse AI — Feature Roadmap

Feature suggestions organized by **impact** and **portfolio value**. Each feature is rated on:
- 🎓 **Academic value** — will it impress your PBL evaluator?
- 💼 **Freelance value** — will it land you clients?
- ⏱️ **Effort** — how long to build?

---

## 🔴 Tier 1 — High Impact (Must-Haves for Both Audiences)

### 1. PDF Report Download / Share
> Generate a beautiful, branded PDF summary of a patient's health dashboard that can be shared with a doctor.

**What it does:**
- A "Download Report" button on the dashboard generates a clean PDF with all biomarkers, trends, AI recommendations, and health score
- Include your MediPulse AI branding, date range, and patient name

**Why it matters:**
- 🎓 Demonstrates end-to-end utility — data in, intelligence out, printable artifact
- 💼 Every SaaS product needs export/share — clients will ask "can I print this?"
- ⏱️ ~4–6 hours (use `@react-pdf/renderer` or `html2canvas` + `jspdf`)

---

### 2. Family Members / Multi-Profile Support
> A single user account can manage health records for family members (parents, children, spouse).

**What it does:**
- Add a `family_members` table linked to `profiles`
- A dropdown in the Navbar to switch active profile context
- All dashboard, reports, and trends scope to the selected family member

**Why it matters:**
- 🎓 Shows you can design multi-tenant data isolation — evaluators love this
- 💼 Real health apps serve families, not just individuals. This is a differentiator
- ⏱️ ~8–12 hours (schema change + frontend context provider + scoped API calls)

---

### 3. Biomarker Comparison Across Reports
> Side-by-side view of the same biomarker from two different dates.

**What it does:**
- On the dashboard or a dedicated "Compare" page, pick two report dates
- Show a dual-column table: "Jan 2026 vs Jul 2026" with delta values (`+12%`, `-3%`)
- Highlight improvements in green, regressions in red

**Why it matters:**
- 🎓 Demonstrates longitudinal analysis — the core thesis of your project
- 💼 Doctors/patients ask "am I getting better or worse?" — this answers it visually
- ⏱️ ~6–8 hours

---

### 4. Profile / Settings Page
> Users currently have no way to view/edit their profile, manage their account, or configure preferences.

**What it does:**
- `/settings` page with: Full Name, Age, Gender, Email (read-only), Avatar
- Theme preference (persist dark/light mode choice)
- Password change via Supabase
- "Delete my account" with confirmation

**Why it matters:**
- 🎓 Every complete project needs account management
- 💼 Missing settings page = looks like a prototype, not a product
- ⏱️ ~4–5 hours

---

## 🟡 Tier 2 — Medium Impact (Strong Portfolio Differentiators)

### 5. Email / Push Notifications
> Remind users to upload follow-up reports and alert them about expiring health checkup windows.

**What it does:**
- "It's been 3 months since your last thyroid panel — upload your latest results"
- Configurable notification preferences in Settings
- Use Supabase Edge Functions + Resend/SendGrid for email delivery

**Why it matters:**
- 🎓 Shows you understand retention and user engagement loops
- 💼 Notification systems are the #1 feature clients request
- ⏱️ ~8–10 hours (Edge Function + email template + scheduling)

---

### 6. AI Chat Assistant (Conversational Health Q&A)
> Instead of static AI recommendations, let users ask questions about their data in natural language.

**What it does:**
- A chat interface in the sidebar or a dedicated `/chat` page
- "Why is my MCHC elevated?" → AI responds with context from *their* actual values
- Powered by Gemini/Groq with the user's biomarker history injected as context

**Why it matters:**
- 🎓 Demonstrates RAG-like (Retrieval-Augmented Generation) architecture — hot topic in AI evaluation
- 💼 Conversational AI is the highest-demand feature in health tech right now
- ⏱️ ~10–14 hours (streaming chat API + frontend chat UI + context injection)

> [!WARNING]
> Include a clear disclaimer: "This is not medical advice. Consult your doctor."

---

### 7. Report History Timeline
> A visual timeline / activity log of all health events.

**What it does:**
- A vertical timeline on the Reports page showing:
  - "📄 Thyroid Panel uploaded — Jan 15, 2026"
  - "🟢 All biomarkers normal"
  - "⚠️ TSH moved from Normal to Borderline — Mar 8, 2026"
- Acts as a health journal / audit trail

**Why it matters:**
- 🎓 Shows temporal data modeling and event-driven design
- 💼 Timeline UIs are visually impressive in demos and portfolios
- ⏱️ ~5–7 hours

---

### 8. Doctor / Clinic Sharing (Read-Only Link)
> Generate a shareable, time-limited, read-only link that a patient can send to their doctor.

**What it does:**
- Click "Share with Doctor" → generates a unique URL valid for 7 days
- Doctor opens link (no login required) → sees a read-only dashboard with that patient's biomarker history
- Uses Supabase signed tokens or a separate `shared_links` table

**Why it matters:**
- 🎓 Demonstrates secure data sharing with expiring tokens — a real-world privacy pattern
- 💼 This is a **killer feature** for health startups — shows you understand the care ecosystem
- ⏱️ ~8–10 hours

---

## 🟢 Tier 3 — Portfolio Polish (What Makes Clients Say "Wow")

### 9. Landing Page Upgrade with Live Demo
> Your current landing page is functional. A portfolio-grade landing page should sell the product.

**What it does:**
- Hero section with animated biomarker extraction demo (pre-recorded or mocked)
- Feature showcase with scroll-driven animations
- Testimonials section (mock data is fine)
- "Try Demo" button that logs into a pre-seeded demo account

**Why it matters:**
- 💼 **This is what clients see first.** A stunning landing page = instant credibility
- ⏱️ ~6–8 hours

---

### 10. Onboarding Flow (First-Time User)
> When a new user signs up, guide them through the product with a step-by-step tutorial.

**What it does:**
- A multi-step onboarding modal: "Welcome → Complete your profile → Upload first report"
- Highlight key UI areas with spotlight/tooltip overlays (like product tours)
- Skip option for returning users

**Why it matters:**
- 🎓 Shows UX maturity
- 💼 Every SaaS client expects onboarding — you can demonstrate you know how to build it
- ⏱️ ~5–6 hours

---

### 11. PWA (Progressive Web App) Support
> Make MediPulse installable on mobile phones as a native-like app.

**What it does:**
- Add `manifest.json`, service worker, and app icons
- Users can "Add to Home Screen" on mobile
- Works offline for viewing cached dashboard data

**Why it matters:**
- 🎓 Shows you understand progressive enhancement
- 💼 Clients love hearing "it works on mobile without an app store"
- ⏱️ ~3–4 hours

---

### 12. Admin Analytics Dashboard (Meta-Dashboard)
> A separate `/admin` route showing platform-level stats.

**What it does:**
- Total users, reports uploaded this week, most common biomarkers tracked
- AI extraction success rate, average extraction time
- Requires `service_role` authentication

**Why it matters:**
- 🎓 Shows you understand operational monitoring
- 💼 Clients always ask "how do I see platform-wide metrics?"
- ⏱️ ~6–8 hours

---

## 📊 Priority Matrix

| # | Feature | Academic | Freelance | Effort | Recommendation |
|---|---|---|---|---|---|
| 1 | PDF Report Download | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 4-6h | **Do first** |
| 4 | Profile / Settings | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 4-5h | **Do first** |
| 3 | Comparison View | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 6-8h | **Do second** |
| 6 | AI Chat Assistant | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 10-14h | **Do second** (flagship feature) |
| 2 | Multi-Profile / Family | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 8-12h | Do third |
| 8 | Doctor Sharing | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 8-10h | Do third |
| 9 | Landing Page Upgrade | ⭐⭐ | ⭐⭐⭐⭐⭐ | 6-8h | Do when demoing to clients |
| 7 | Report Timeline | ⭐⭐⭐ | ⭐⭐⭐⭐ | 5-7h | Nice to have |
| 5 | Notifications | ⭐⭐⭐ | ⭐⭐⭐⭐ | 8-10h | Nice to have |
| 10 | Onboarding Flow | ⭐⭐ | ⭐⭐⭐⭐ | 5-6h | Nice to have |
| 11 | PWA Support | ⭐⭐ | ⭐⭐⭐ | 3-4h | Easy win |
| 12 | Admin Dashboard | ⭐⭐⭐ | ⭐⭐⭐ | 6-8h | Nice to have |

---

## 🎯 Suggested Implementation Order

```
WEEK 1:  #1 (PDF Export) + #4 (Settings Page)         ← foundation
WEEK 2:  #6 (AI Chat Assistant)                        ← flagship feature
WEEK 3:  #3 (Comparison View) + #7 (Timeline)          ← analytical depth
WEEK 4:  #8 (Doctor Sharing) + #9 (Landing Page)       ← client-ready polish
```

> [!TIP]
> For your PBL evaluation, **#6 (AI Chat)** and **#3 (Comparison View)** will have the most impact because they demonstrate AI integration depth and longitudinal analysis — the core thesis of your project.
> 
> For freelance portfolio, **#1 (PDF Export)**, **#8 (Doctor Sharing)**, and **#9 (Landing Page)** are what will make potential clients take you seriously.
