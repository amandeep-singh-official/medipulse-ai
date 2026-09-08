'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Lock,
  Database,
  Upload,
  Brain,
  TrendingUp,
  Zap,
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './page.module.css'

// ── Data ─────────────────────────────────────────────────────────────

const PANELS = [
  {
    title: 'Complete Blood Count',
    code: 'PANEL: CBC_v4',
    description:
      'Cellular architecture evaluating immune defense, erythrocyte oxygen carry capacity, and platelet integrity.',
    markers: ['Hemoglobin', 'RBC Count', 'Platelet Count', 'TLC / WBC', 'Hematocrit', 'MCV / MCH'],
    color: '#3b82f6',
  },
  {
    title: 'Lipid & Cardiovascular',
    code: 'PANEL: LIPID_v2',
    description:
      'Atherogenic lipoprotein fractions, triglyceride metabolism, and cardiovascular risk ratios.',
    markers: ['Total Cholesterol', 'HDL-C', 'LDL-C', 'Triglycerides', 'VLDL-C', 'Total/HDL Ratio'],
    color: '#f59e0b',
  },
  {
    title: 'Thyroid Function',
    code: 'PANEL: THYROID_v3',
    description:
      'Endocrine gland regulation governing metabolic rate, cellular turnover, and energy homeostasis.',
    markers: ['TSH', 'Free T3', 'Free T4', 'Total T3', 'Total T4', 'Anti-TPO'],
    color: '#8b5cf6',
  },
  {
    title: 'Metabolic & Glycemic',
    code: 'PANEL: METABOLIC_v1',
    description:
      'Carbohydrate processing efficiency, glycated hemoglobin, and insulin resistance trajectory.',
    markers: ['Fasting Glucose', 'Post-Prandial', 'HbA1c', 'Fasting Insulin', 'HOMA-IR'],
    color: '#10b981',
  },
  {
    title: 'Hepatic & Renal (LFT / KFT)',
    code: 'PANEL: ORGAN_v2',
    description:
      'Enzymatic clearance, glomerular filtration efficiency, electrolyte balance, and systemic detoxification.',
    markers: ['ALT (SGPT)', 'AST (SGOT)', 'Serum Creatinine', 'BUN', 'eGFR', 'Total Bilirubin'],
    color: '#f43f5e',
  },
]

const STEPS = [
  {
    step: '01',
    Icon: Upload,
    title: 'Upload Your Lab Report',
    description:
      'Drag & drop any diagnostic PDF or smartphone photo. Compatible with Dr. Lal PathLabs, Metropolis, Arogyam, and more.',
  },
  {
    step: '02',
    Icon: Brain,
    title: 'AI Extracts Biomarkers',
    description:
      'Groq LLM + Gemini Vision extract all quantitative values in under 5 seconds, normalized to clinical reference intervals.',
  },
  {
    step: '03',
    Icon: TrendingUp,
    title: 'View Longitudinal Trends',
    description:
      'See your biomarker trajectories plotted over years with color-coded status badges and physician-aligned precautions.',
  },
]

const WHY_PILLARS = [
  {
    Icon: Zap,
    title: 'Sub-5s Extraction',
    desc: 'Groq + Gemini Vision pipeline extracts any PDF or smartphone photo instantly.',
  },
  {
    Icon: Lock,
    title: 'Private by Design',
    desc: 'PostgreSQL Row-Level Security. Your data is mathematically isolated per user.',
  },
  {
    Icon: TrendingUp,
    title: 'Longitudinal Intelligence',
    desc: 'Multi-year trend curves, variance flags, and physician-aligned precautions.',
  },
  {
    Icon: Database,
    title: 'Permanent Vault',
    desc: 'Original PDFs stored in encrypted private object storage, permanently retrievable.',
  },
]

// ── Hero Animated SVG Chart ───────────────────────────────────────────

function HeroChart() {
  const W = 480, H = 300
  const ml = 55, mt = 20, mr = 20, mb = 45
  const cw = W - ml - mr   // 405
  const ch = H - mt - mb   // 235

  // 6 evenly-spaced X positions
  const xs = [0, 1, 2, 3, 4, 5].map(i => ml + (i / 5) * cw)

  // Y scale: value 0 → bottom (mt+ch=255), value 100 → top (mt=20)
  const ys = (v: number) => mt + ch - (v / 100) * ch

  // Normalized biomarker data (0–100 visual scale)
  const tsh   = [42, 58, 52, 65, 72, 68]
  const ldl   = [78, 73, 75, 68, 62, 55]
  const hba1c = [38, 42, 40, 45, 42, 39]

  const pts = (data: number[]) =>
    data.map((v, i) => `${xs[i].toFixed(1)},${ys(v).toFixed(1)}`).join(' ')

  // Grid & reference lines
  const gridVals = [25, 50, 75, 100]
  const xLabels  = ["Jan '23", 'Apr', 'Jul', 'Oct', "Jan '24", 'Apr']

  // TSH normal band approx: value 25–65 on our scale
  const refTop = ys(65)   // ~102
  const refBot = ys(25)   // ~196

  return (
    <div className={styles.chartCard}>
      {/* Chart header */}
      <div className={styles.chartHeader}>
        <span className={styles.chartLabel}>Longitudinal Biomarker View</span>
        <div className={styles.chartLegend}>
          <span className={`${styles.legendItem} ${styles.legendTSH}`}>TSH</span>
          <span className={`${styles.legendItem} ${styles.legendLDL}`}>LDL-C</span>
          <span className={`${styles.legendItem} ${styles.legendHbA1c}`}>HbA1c</span>
        </div>
      </div>

      {/* SVG chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.chartSvg}
        aria-hidden="true"
        role="img"
      >
        {/* Horizontal grid lines */}
        {gridVals.map(v => (
          <line
            key={v}
            x1={ml} y1={ys(v)}
            x2={ml + cw} y2={ys(v)}
            className={styles.gridLine}
          />
        ))}

        {/* TSH reference band (normal range shading) */}
        <rect
          x={ml} y={refTop}
          width={cw} height={refBot - refTop}
          className={styles.refBand}
        />
        <line x1={ml} y1={refTop} x2={ml + cw} y2={refTop} className={styles.refLine} />
        <line x1={ml} y1={refBot} x2={ml + cw} y2={refBot} className={styles.refLine} />

        {/* Y-axis labels */}
        {gridVals.map(v => (
          <text
            key={v}
            x={ml - 8} y={ys(v) + 4}
            className={styles.axisLabel}
            textAnchor="end"
          >
            {v}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, i) => (
          <text
            key={i}
            x={xs[i]} y={H - 10}
            className={styles.axisLabel}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}

        {/* Axis rules */}
        <line x1={ml} y1={mt} x2={ml} y2={mt + ch} className={styles.axisLine} />
        <line x1={ml} y1={mt + ch} x2={ml + cw} y2={mt + ch} className={styles.axisLine} />

        {/* ── Biomarker polylines (animate on load) ── */}
        <polyline points={pts(tsh)}   className={styles.lineTSH}   />
        <polyline points={pts(ldl)}   className={styles.lineLDL}   />
        <polyline points={pts(hba1c)} className={styles.lineHbA1c} />

        {/* Data-point dots (fade in after lines draw) */}
        {tsh.map((v, i)   => <circle key={i} cx={xs[i]} cy={ys(v)} r={3.5} className={styles.dotTSH}   />)}
        {ldl.map((v, i)   => <circle key={i} cx={xs[i]} cy={ys(v)} r={3.5} className={styles.dotLDL}   />)}
        {hba1c.map((v, i) => <circle key={i} cx={xs[i]} cy={ys(v)} r={3.5} className={styles.dotHbA1c} />)}
      </svg>

      {/* Status badges below chart */}
      <div className={styles.chartStatus}>
        <span className="badge badge-action">TSH ↑ High</span>
        <span className="badge badge-borderline">LDL-C → Borderline</span>
        <span className="badge badge-optimal">HbA1c ✓ Optimal</span>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className={styles.wrapper}>

      {/* ── Sticky Header ── */}
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Activity size={17} strokeWidth={2.5} color="#ffffff" />
            </div>
            <span className={styles.brandTitle}>
              MediPulse{' '}
              <span className="serif-italic" style={{ color: 'var(--bio-emerald)' }}>AI</span>
            </span>
          </Link>

          <nav className={styles.navLinks}>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <a href="#panels"       className={styles.navLink}>Diagnostic Panels</a>
            <a href="#why"          className={styles.navLink}>Why MediPulse</a>
          </nav>

          <div className={styles.headerActions}>
            <ThemeToggle />
            <Link href="/auth/login"  className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/auth/signup" className="btn btn-primary btn-sm">
              Launch Vault <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero: Split-Screen ── */}
      <section className={styles.heroSection}>
        {/* Dynamic grid background */}
        <div className={styles.heroBg} aria-hidden="true" />
        {/* Ambient glows */}
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGlowSecondary} aria-hidden="true" />

        <div className={`container ${styles.heroContainer}`}>
          {/* Left: editorial copy */}
          <div className={styles.heroLeft}>
            <motion.div
              className={styles.badgeWrapper}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.telemetryPill}>
                <span className={styles.pulseDot} />
                <span className="mono">CLINICAL TELEMETRY ENGINE v2.4 • HIPAA COMPLIANT</span>
              </div>
            </motion.div>

            <motion.h1
              className={styles.heroHeadline}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Decode the{' '}
              <span className={`serif-italic ${styles.headlineAccent}`}>hidden story</span>
              {' '}of your blood.
            </motion.h1>

            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Transform fragmented, multi-page laboratory PDFs into unified longitudinal
              biomarker telemetry. Automated reference interval normalization, early variance
              detection, and physician-aligned precautions.
            </motion.p>

            <motion.div
              className={styles.ctaGroupWrapper}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.buttonRow}>
                <Link href="/auth/signup" className={`btn btn-primary btn-lg ${styles.primaryCta}`}>
                  Ingest First Report <ArrowRight size={16} />
                </Link>
                <a href="#how-it-works" className={`btn btn-secondary btn-lg`}>
                  See How It Works
                </a>
              </div>

              <div className={styles.socialProof}>
                <div className={styles.starsRow}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={styles.starIcon} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className={styles.socialProofText}>
                  Rated{' '}
                  <strong className={styles.ratingNumber}>4.9/5</strong>
                  {' '}by 450+ Medical Specialists
                </span>
              </div>
            </motion.div>

            <motion.div
              className={styles.highlightsBar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.65, delay: 0.5 }}
            >
              <div className={styles.highlightItem}>
                <CheckCircle2 size={15} color="var(--bio-emerald)" />
                <span>5 Foundational Panels</span>
              </div>
              <div className={styles.highlightDot}>•</div>
              <div className={styles.highlightItem}>
                <Zap size={15} color="var(--bio-emerald)" />
                <span>Sub-5s AI Extraction</span>
              </div>
              <div className={styles.highlightDot}>•</div>
              <div className={styles.highlightItem}>
                <Lock size={15} color="var(--bio-emerald)" />
                <span>100% Private RLS Vault</span>
              </div>
            </motion.div>
          </div>

          {/* Right: animated chart */}
          <motion.div
            className={styles.heroRight}
            initial={{ opacity: 0, x: 30, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroChart />
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className={styles.howSection}>
        <div className="container">
          <div className={styles.sectionLabel}>
            <span className="mono">THE MEDIPULSE PROTOCOL</span>
          </div>
          <h2 className={styles.sectionHeading}>
            From PDF to insight in under 5 seconds.
          </h2>

          <div className={styles.stepsGrid}>
            {STEPS.map(({ step, Icon, title, description }, idx) => (
              <motion.div
                key={step}
                className={styles.stepCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
              >
                <div className={styles.stepNumber}>{step}</div>
                <div className={styles.stepIconBox}>
                  <Icon size={22} color="var(--bio-emerald)" />
                </div>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepDesc}>{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Diagnostic Panels Grid ── */}
      <section id="panels" className={styles.panelsSection}>
        <div className="container">
          <div className={styles.sectionLabel}>
            <span className="mono">STANDARDIZED DIAGNOSTIC TAXONOMY</span>
          </div>
          <h2 className={styles.sectionHeading}>
            Designed for five foundational laboratory panels.
          </h2>
          <p className={styles.sectionSubtitle}>
            Universal ingestion across major pathology centers. From Complete Blood Counts to
            advanced endocrine panels, each marker is normalized to clinical reference intervals.
          </p>

          <div className={styles.panelsGrid}>
            {PANELS.map((panel, idx) => (
              <motion.div
                key={panel.title}
                className={styles.panelCard}
                style={{ '--panel-color': panel.color } as React.CSSProperties}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <div className={styles.panelCardTop}>
                  <span className="mono" style={{ fontSize: 11, color: panel.color }}>
                    {panel.code}
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    0{idx + 1}
                  </span>
                </div>
                <h3 className={styles.panelTitle}>{panel.title}</h3>
                <p className={styles.panelDesc}>{panel.description}</p>
                <div className={styles.markerTagGroup}>
                  {panel.markers.map(m => (
                    <span key={m} className={styles.markerTag}>{m}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why MediPulse (merged comparison + security) ── */}
      <section id="why" className={styles.whySection}>
        <div className="container">
          <motion.div
            className={styles.whyCard}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.whyGrid}>
              {/* Left: The Problem */}
              <div className={styles.whyLeft}>
                <span className="mono" style={{ color: 'var(--diagnostic-amber)', fontSize: 12, fontWeight: 600 }}>
                  THE STATUS QUO
                </span>
                <h3 className={styles.whyColTitle}>Static, Disconnected Lab PDFs</h3>
                <p className={styles.whyColText}>
                  Clinical reports exist as isolated snapshots trapped in opaque PDF tables.
                  A physician cannot spot a gradual 15% LDL shift over four years without manual paper transcription.
                </p>
                <ul className={styles.problemList}>
                  <li>Fragmented across multiple clinical portal logins</li>
                  <li>No cross-panel physiological correlation</li>
                  <li>Zero longitudinal trend tracking</li>
                  <li>No early variance or borderline risk detection</li>
                </ul>
              </div>

              {/* Divider */}
              <div className={styles.whyDivider} aria-hidden />

              {/* Right: Solution Pillars */}
              <div className={styles.whyRight}>
                <span className="mono" style={{ color: 'var(--bio-emerald)', fontSize: 12, fontWeight: 600 }}>
                  THE MEDIPULSE PROTOCOL
                </span>
                <h3 className={styles.whyColTitle}>Dynamic Biological Telemetry</h3>
                <div className={styles.pillarsGrid}>
                  {WHY_PILLARS.map(({ Icon, title, desc }) => (
                    <div key={title} className={styles.pillar}>
                      <div className={styles.pillarIcon}>
                        <Icon size={18} color="var(--bio-emerald)" />
                      </div>
                      <div>
                        <div className={styles.pillarTitle}>{title}</div>
                        <div className={styles.pillarDesc}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA (full-bleed) ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} aria-hidden="true" />
        <div className="container">
          <motion.div
            className={styles.ctaInner}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mono" style={{ color: 'var(--bio-emerald)', fontSize: 12, fontWeight: 600 }}>
              START YOUR PERSONAL REPOSITORY
            </span>
            <h2 className={styles.ctaHeading}>
              Take control of your biological trajectory.
            </h2>
            <p className={styles.ctaSub}>
              Upload your existing lab reports today. View your historical trend charts
              and AI-guided precautions in under two minutes.
            </p>
            <div className={styles.ctaActionRow}>
              <Link href="/auth/signup" className={`btn btn-primary btn-lg ${styles.ctaPrimary}`}>
                Create Free Clinical Vault <ArrowRight size={16} />
              </Link>
              <Link href="/auth/login" className={`btn btn-secondary btn-lg ${styles.ctaSecondary}`}>
                Sign In to Vault
              </Link>
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  )
}
