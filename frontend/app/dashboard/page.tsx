'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, AlertCircle, CheckCircle, Upload, Brain,
  Activity, Minus, RefreshCw, X, ChevronRight, Zap, Heart, Download
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/StatusBadge'
import ExportModal from '@/components/ExportModal'
import BiomarkerTooltip from '@/components/BiomarkerTooltip'
import ChatWidget from '@/components/ChatWidget'
import { getBiomarkerInfo } from '@/lib/biomarkerInfo'
import { getDashboard, getTrends, getRecommendations } from '@/lib/api'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import styles from './page.module.css'

// ── Health Score Gauge ────────────────────────────────────────────
function HealthGauge({ score }: { score: number }) {
  const radius = 54
  const stroke = 8
  const circumference = Math.PI * radius
  const clampedScore = Math.min(100, Math.max(0, score))
  const offset = circumference - (clampedScore / 100) * circumference
  const color = clampedScore >= 70 ? 'var(--bio-emerald)' : clampedScore >= 40 ? 'var(--diagnostic-amber)' : 'var(--diagnostic-crimson)'
  const label = clampedScore >= 70 ? 'Good' : clampedScore >= 40 ? 'Moderate' : 'Needs Attention'

  return (
    <div className={styles.gaugeWrap} id="health-gauge">
      <svg width="128" height="72" viewBox="0 0 128 72">
        <path
          d={`M 12,64 A ${radius},${radius} 0 0,1 116,64`}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M 12,64 A ${radius},${radius} 0 0,1 116,64`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1), stroke 0.4s ease' }}
        />
      </svg>
      <div className={styles.gaugeCenter}>
        <span className={styles.gaugeScore} style={{ color }}>{clampedScore}%</span>
        <span className={styles.gaugeLabel}>{label}</span>
      </div>
    </div>
  )
}

// ── Biomarker Filter Tabs ─────────────────────────────────────────
type TabFilter = 'all' | 'normal' | 'borderline' | 'out_of_range'

const TAB_LABELS: Record<TabFilter, string> = {
  all: 'All',
  normal: 'Normal',
  borderline: 'Borderline',
  out_of_range: 'Out of Range',
}

// ── Main Dashboard Page ───────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()

  // Data state
  const [dashData, setDashData] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recoLoading, setRecoLoading] = useState(true)

  // Error state
  const [dashError, setDashError] = useState<string | null>(null)
  const [recoError, setRecoError] = useState<string | null>(null)

  // Hero chart state
  const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(null)
  const [heroData, setHeroData] = useState<any[]>([])
  const [heroLoading, setHeroLoading] = useState(false)
  const [heroError, setHeroError] = useState<string | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [showAllRisk, setShowAllRisk] = useState(false)
  const [showAllReco, setShowAllReco] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [hoveredBiomarker, setHoveredBiomarker] = useState<string | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  // ── Data fetching ─────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setDashError(null)
    try {
      const [dash, reco] = await Promise.all([
        getDashboard(),
        getRecommendations().catch(() => null),
      ])
      setDashData(dash)
      setRecommendations(reco)
    } catch (err: any) {
      setDashError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRecoLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/auth/login')
    })
    fetchDashboard()
  }, [fetchDashboard, router])

  // ── Auto-select best biomarker for hero chart ─────────────────
  useEffect(() => {
    if (!dashData?.biomarkers?.length) return
    const biomarkers = dashData.biomarkers
    const best =
      biomarkers.find((b: any) => b.status === 'OUT_OF_RANGE') ||
      biomarkers.find((b: any) => b.status === 'BORDERLINE') ||
      biomarkers[0]
    if (best) setSelectedBiomarker(best.name)
  }, [dashData])

  // ── Fetch hero chart data on biomarker selection ──────────────
  useEffect(() => {
    if (!selectedBiomarker) return
    setHeroLoading(true)
    setHeroError(null)
    getTrends(selectedBiomarker)
      .then(res => setHeroData(res.trend || []))
      .catch(err => setHeroError(err.message || 'Failed to load trend'))
      .finally(() => setHeroLoading(false))
  }, [selectedBiomarker])

  // ── Derived data ──────────────────────────────────────────────
  // Deduplicate by name — API returns all readings across all reports,
  // newest first. We keep only the first (latest) reading per biomarker.
  const biomarkers: any[] = (() => {
    const all: any[] = dashData?.biomarkers || []
    const seen = new Set<string>()
    return all.filter((b: any) => {
      if (seen.has(b.name)) return false
      seen.add(b.name)
      return true
    })
  })()

  const outOfRange = biomarkers.filter(b => b.status === 'OUT_OF_RANGE')
  const borderline = biomarkers.filter(b => b.status === 'BORDERLINE')
  const normal = biomarkers.filter(b => b.status === 'NORMAL')
  const isEmpty = !loading && dashData?.stats?.total_reports === 0

  const uniqueNames: string[] = biomarkers.map((b: any) => b.name) // already unique

  const filteredBiomarkers = (() => {
    if (activeTab === 'normal') return normal
    if (activeTab === 'borderline') return borderline
    if (activeTab === 'out_of_range') return outOfRange
    return biomarkers
  })()

  const healthScore = biomarkers.length > 0
    ? Math.round((normal.length / biomarkers.length) * 100)
    : 0

  const statCards = [
    { label: 'Total Reports', value: dashData?.stats?.total_reports ?? 0, color: 'var(--bio-emerald)', icon: <Activity size={18} />, bg: 'var(--bio-emerald-glow)' },
    { label: 'Normal', value: dashData?.stats?.normal ?? 0, color: 'var(--bio-emerald)', icon: <CheckCircle size={18} />, bg: 'var(--bio-emerald-glow)' },
    { label: 'Borderline', value: dashData?.stats?.borderline ?? 0, color: 'var(--diagnostic-amber)', icon: <TrendingUp size={18} />, bg: 'var(--diagnostic-amber-glow)' },
    { label: 'Out of Range', value: dashData?.stats?.out_of_range ?? 0, color: 'var(--diagnostic-crimson)', icon: <AlertCircle size={18} />, bg: 'var(--diagnostic-crimson-glow)' },
  ]

  const heroUnit = heroData[0]?.unit || ''
  const heroRefMin = heroData[0]?.ref_min
  const heroRefMax = heroData[0]?.ref_max

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '28px 24px 48px' }}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Health Dashboard</h1>
            <p className={styles.pageSubtitle}>Your personal biomarker tracking &amp; AI insights</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setExportModalOpen(true)}
              className="btn btn-secondary"
              id="export-dossier-cta"
              disabled={loading || biomarkers.length === 0}
              title="Generate publication-grade PDF Dossier"
            >
              <Download size={15} /> Export Dossier
            </button>
            <Link href="/upload" className="btn btn-primary" id="upload-cta">
              <Upload size={15} /> Upload Report
            </Link>
          </div>
        </div>

        {/* ── Global Error ── */}
        {dashError && (
          <div className={styles.errorBanner} id="dashboard-error">
            <AlertCircle size={18} color="var(--diagnostic-crimson)" />
            <span>{dashError}</span>
            <button onClick={fetchDashboard} className={`btn btn-sm ${styles.retryBtn}`} id="retry-dashboard">
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {/* ── Empty State (full-width, bypasses grid) ── */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.emptyState}
            id="empty-state"
          >
            <div className={styles.emptyIcon}>
              <Activity size={40} color="var(--bio-emerald)" />
            </div>
            <h2>No reports yet</h2>
            <p>Upload your first lab report to start tracking your health metrics and get AI-powered insights.</p>
            <Link href="/upload" className="btn btn-primary btn-lg" id="first-upload">
              <Upload size={18} /> Upload First Report
            </Link>
          </motion.div>
        )}

        {/* ── Alert Banner ── */}
        {!isEmpty && !loading && outOfRange.length > 0 && !alertDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={styles.alertBanner}
            id="alert-banner"
          >
            <AlertCircle size={16} color="var(--diagnostic-crimson)" />
            <span>
              <strong>{outOfRange.length} biomarker{outOfRange.length > 1 ? 's' : ''}</strong> out of normal range:{' '}
              {outOfRange.length <= 3
                ? outOfRange.map((b: any) => b.name).join(', ')
                : `${outOfRange.slice(0, 3).map((b: any) => b.name).join(', ')} and ${outOfRange.length - 3} more`
              }
            </span>
            <button
              onClick={() => setAlertDismissed(true)}
              className={styles.alertDismiss}
              id="alert-dismiss"
              aria-label="Dismiss alert"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}

        {/* ── 2-Column Dashboard Grid ── */}
        {!isEmpty && !dashError && (
          <div className={styles.dashboardGrid}>

            {/* ── LEFT: Main Column ── */}
            <main className={styles.mainColumn}>

              {/* Stat Cards */}
              {loading ? (
                <div className="grid-4" style={{ marginBottom: 24 }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 88 }} />
                  ))}
                </div>
              ) : (
                <motion.div
                  className={styles.statsGrid}
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
                >
                  {statCards.map(s => (
                    <motion.div
                      key={s.label}
                      className={`card ${styles.statCard}`}
                      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                      id={`stat-${s.label.toLowerCase().replace(/ /g, '-')}`}
                    >
                      <div className={styles.statIcon} style={{ color: s.color, background: s.bg }}>
                        {s.icon}
                      </div>
                      <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
                      <div className={styles.statLabel}>{s.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Hero Chart */}
              {!loading && biomarkers.length > 0 && (
                <motion.div
                  className={`card ${styles.heroChartCard}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  id="hero-chart"
                  ref={heroRef}
                >
                  <div className={styles.heroChartHeader}>
                    <div>
                      <h2 className={styles.heroChartTitle}>Biomarker Trend</h2>
                      <p className={styles.heroChartSubtitle}>Historical values across reports</p>
                    </div>
                    {selectedBiomarker && (
                      <span className={styles.heroChartUnit}>{heroUnit}</span>
                    )}
                  </div>

                  {/* Biomarker Switcher Pills */}
                  <div className={styles.pillScroller} id="biomarker-switcher">
                    {uniqueNames.map(name => {
                      const bm = biomarkers.find((b: any) => b.name === name)
                      const pillColor =
                        bm?.status === 'OUT_OF_RANGE' ? 'var(--diagnostic-crimson)' :
                        bm?.status === 'BORDERLINE' ? 'var(--diagnostic-amber)' :
                        'var(--bio-emerald)'
                      return (
                        <button
                          key={name}
                          onClick={() => {
                            setSelectedBiomarker(name)
                            heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                          }}
                          className={`${styles.pill} ${selectedBiomarker === name ? styles.pillActive : ''}`}
                          style={{ '--pill-color': pillColor } as React.CSSProperties}
                          id={`pill-${name.toLowerCase().replace(/ /g, '-')}`}
                        >
                          <span className={styles.pillDot} style={{ background: pillColor }} />
                          {name}
                        </button>
                      )
                    })}
                  </div>

                  {/* Chart Area */}
                  {heroLoading && (
                    <div className="skeleton" style={{ height: 200, marginTop: 16 }} />
                  )}
                  {heroError && !heroLoading && (
                    <div className={styles.heroChartError} id="hero-chart-error">
                      <AlertCircle size={16} color="var(--diagnostic-crimson)" />
                      <span>Could not load trend for <strong>{selectedBiomarker}</strong></span>
                      <button
                        onClick={() => setSelectedBiomarker(s => s ? s + '' : s)}
                        className={`btn btn-sm ${styles.retryBtn}`}
                        id="retry-hero-chart"
                      >
                        <RefreshCw size={12} /> Retry
                      </button>
                    </div>
                  )}
                  {!heroLoading && !heroError && heroData.length === 0 && (
                    <div className={styles.heroChartEmpty}>
                      No historical data available yet. Upload more reports to see trends.
                    </div>
                  )}
                  {!heroLoading && !heroError && heroData.length === 1 && (
                    <div className={styles.heroChartEmpty}>
                      Only one data point. Upload more reports to visualise the trend.
                    </div>
                  )}
                  {!heroLoading && !heroError && heroData.length > 1 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={heroData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--bio-emerald)" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="var(--bio-emerald)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                        <Tooltip
                          contentStyle={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            fontSize: 12,
                            boxShadow: 'var(--shadow-card)',
                          }}
                          labelStyle={{ color: 'var(--text-secondary)' }}
                        />
                        {heroRefMin && <ReferenceLine y={heroRefMin} stroke="var(--diagnostic-amber)" strokeDasharray="4 4" label={{ value: 'Min', fill: 'var(--text-muted)', fontSize: 10 }} />}
                        {heroRefMax && <ReferenceLine y={heroRefMax} stroke="var(--diagnostic-crimson)" strokeDasharray="4 4" label={{ value: 'Max', fill: 'var(--text-muted)', fontSize: 10 }} />}
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="var(--bio-emerald)"
                          strokeWidth={2.5}
                          fill="url(#heroGrad)"
                          dot={{ fill: 'var(--bio-emerald)', r: 4, strokeWidth: 2, stroke: 'var(--bg-card)' }}
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>
              )}

              {/* Biomarker Section — Tabs + Cards */}
              {!loading && biomarkers.length > 0 && (
                <section className={styles.bioSection} id="biomarker-section">
                  <div className={styles.bioSectionHeader}>
                    <h2 className="section-title" style={{ margin: 0 }}>Latest Biomarkers</h2>
                    {/* Filter Tabs */}
                    <div className={styles.tabs} role="tablist" id="biomarker-tabs">
                      {(['all', 'normal', 'borderline', 'out_of_range'] as TabFilter[]).map(tab => {
                        const counts = { all: biomarkers.length, normal: normal.length, borderline: borderline.length, out_of_range: outOfRange.length }
                        return (
                          <button
                            key={tab}
                            role="tab"
                            aria-selected={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                            id={`tab-${tab}`}
                          >
                            {TAB_LABELS[tab]}
                            <span className={styles.tabCount}>{counts[tab]}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {filteredBiomarkers.length === 0 ? (
                        <p className={styles.tabEmpty} id="tab-empty">No biomarkers in this category.</p>
                      ) : (
                        <div className={styles.bioTable}>
                          {/* Table Header */}
                          <div className={styles.bioTableHead}>
                            <span>Biomarker</span>
                            <span>Value</span>
                            <span>Reference Range</span>
                            <span>Status</span>
                            <span></span>
                          </div>
                          {/* Table Rows */}
                          {filteredBiomarkers.map((bm: any, i: number) => {
                            const dotColor =
                              bm.status === 'OUT_OF_RANGE' ? 'var(--diagnostic-crimson)' :
                              bm.status === 'BORDERLINE' ? 'var(--diagnostic-amber)' :
                              'var(--bio-emerald)'
                            const isActive = selectedBiomarker === bm.name
                            return (
                              <motion.button
                                key={`${bm.name}-${i}`}
                                className={`${styles.bioRow} ${isActive ? styles.bioRowActive : ''}`}
                                style={{ zIndex: hoveredBiomarker === bm.name ? 100 : undefined }}
                                onClick={() => {
                                  setSelectedBiomarker(bm.name)
                                  heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.025 }}
                                aria-label={`View trend for ${bm.name}`}
                                id={`biorow-${bm.name.toLowerCase().replace(/ /g, '-')}`}
                              >
                                {/* Status dot + Name — hover triggers tooltip */}
                                <span
                                  className={styles.bioRowNameWrap}
                                  onMouseEnter={() => setHoveredBiomarker(bm.name)}
                                  onMouseLeave={() => setHoveredBiomarker(null)}
                                >
                                  <span className={styles.bioRowName}>
                                    <span className={styles.bioRowDot} style={{ background: dotColor }} />
                                    {bm.name}
                                    {getBiomarkerInfo(bm.name) && (
                                      <span className={styles.infoIcon} aria-hidden="true">ⓘ</span>
                                    )}
                                  </span>
                                  {/* Tooltip — rendered inside name cell for correct positioning */}
                                  <AnimatePresence>
                                    {hoveredBiomarker === bm.name && getBiomarkerInfo(bm.name) && (
                                      <BiomarkerTooltip info={getBiomarkerInfo(bm.name)!} />
                                    )}
                                  </AnimatePresence>
                                </span>
                                {/* Value */}
                                <span className={styles.bioRowValue}>
                                  {bm.value}
                                  <span className={styles.bioRowUnit}> {bm.unit}</span>
                                </span>
                                {/* Reference */}
                                <span className={styles.bioRowRef}>
                                  {bm.ref_min} – {bm.ref_max} {bm.unit}
                                </span>
                                {/* Status Badge */}
                                <span>
                                  <StatusBadge status={bm.status} />
                                </span>
                                {/* View trend hint */}
                                <span className={styles.bioRowAction}>
                                  <TrendingUp size={13} />
                                  <span>Trend</span>
                                </span>
                              </motion.button>
                            )
                          })}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </section>
              )}
            </main>

            {/* ── RIGHT: AI Sidebar ── */}
            <aside className={styles.sideColumn} id="ai-sidebar">

              {/* Health Score Gauge */}
              {!loading && biomarkers.length > 0 && (
                <motion.div
                  className={`card ${styles.sideCard}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className={styles.sideCardTitle}>
                    <Heart size={15} color="var(--bio-emerald)" />
                    Health Score
                  </div>
                  <HealthGauge score={healthScore} />
                  <p className={styles.gaugeSub}>
                    {normal.length} of {biomarkers.length} biomarkers within normal range
                  </p>
                </motion.div>
              )}

              {/* Sidebar skeleton during load */}
              {recoLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[100, 120, 100].map((h, i) => (
                    <div key={i} className="skeleton" style={{ height: h }} />
                  ))}
                </div>
              )}

              {/* Reco error */}
              {recoError && !recoLoading && (
                <div className={`card ${styles.sideCard} ${styles.sideError}`} id="reco-error">
                  <AlertCircle size={16} color="var(--diagnostic-crimson)" />
                  <span>AI insights unavailable</span>
                  <button
                    onClick={() => {
                      setRecoLoading(true)
                      setRecoError(null)
                      getRecommendations()
                        .then(setRecommendations)
                        .catch(e => setRecoError(e.message))
                        .finally(() => setRecoLoading(false))
                    }}
                    className={`btn btn-sm ${styles.retryBtn}`}
                    id="retry-reco"
                  >
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              )}

              {/* No reports yet → sidebar empty state */}
              {!recoLoading && !recoError && !recommendations?.summary && (
                <motion.div
                  className={`card ${styles.sideCard} ${styles.sideEmpty}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  id="sidebar-empty"
                >
                  <Brain size={28} color="var(--bio-emerald)" style={{ opacity: 0.6 }} />
                  <p className={styles.sideEmptyText}>Upload a report to unlock AI health insights.</p>
                  <Link href="/upload" className="btn btn-primary btn-sm" id="sidebar-upload-cta">
                    <Upload size={13} /> Upload Report
                  </Link>
                </motion.div>
              )}

              {/* AI Recommendations */}
              {!recoLoading && recommendations?.summary && (
                <>
                  {/* Overall Summary */}
                  <motion.div
                    className={`card ${styles.sideCard}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    id="ai-summary"
                  >
                    <div className={styles.sideCardTitle}>
                      <Brain size={15} color="var(--bio-emerald)" />
                      AI Assessment
                    </div>
                    <span className={`badge ${
                      recommendations.overall_status === 'Good' ? 'badge-normal' :
                      recommendations.overall_status === 'Moderate' ? 'badge-borderline' : 'badge-danger'
                    }`} style={{ marginBottom: 10, display: 'inline-flex' }}>
                      {recommendations.overall_status}
                    </span>
                    <p className={styles.summaryText}>{recommendations.summary}</p>
                  </motion.div>

                  {/* Risk Flags */}
                  {recommendations.risk_flags?.length > 0 && (
                    <motion.div
                      className={`card ${styles.sideCard}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.28 }}
                      id="risk-flags"
                    >
                      <div className={styles.sideCardTitle}>
                        <AlertCircle size={15} color="var(--diagnostic-amber)" />
                        Risk Flags
                      </div>
                      <div className={styles.recoList}>
                        {(showAllRisk ? recommendations.risk_flags : recommendations.risk_flags.slice(0, 3))
                          .map((flag: any, i: number) => (
                            <div
                              key={i}
                              className={styles.recoItem}
                              style={{ borderLeft: `3px solid ${flag.severity === 'high' ? 'var(--diagnostic-crimson)' : 'var(--diagnostic-amber)'}` }}
                            >
                              <div className={styles.recoItemTitle}>
                                {flag.biomarker}
                                <span className={`badge badge-${flag.severity === 'high' ? 'danger' : 'borderline'}`}>{flag.trend}</span>
                              </div>
                              <p className={styles.recoItemDesc}>{flag.message}</p>
                            </div>
                          ))}
                        {recommendations.risk_flags.length > 3 && (
                          <button onClick={() => setShowAllRisk(v => !v)} className={styles.showMoreBtn} id="show-more-risk">
                            {showAllRisk ? 'Show less' : `Show ${recommendations.risk_flags.length - 3} more`}
                            <ChevronRight size={12} style={{ transform: showAllRisk ? 'rotate(270deg)' : 'rotate(90deg)' }} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Recommendations */}
                  {recommendations.recommendations?.length > 0 && (
                    <motion.div
                      className={`card ${styles.sideCard}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.36 }}
                      id="ai-recommendations"
                    >
                      <div className={styles.sideCardTitle}>
                        <Zap size={15} color="var(--diagnostic-cobalt)" />
                        Recommendations
                      </div>
                      <div className={styles.recoList}>
                        {(showAllReco ? recommendations.recommendations : recommendations.recommendations.slice(0, 3))
                          .map((rec: any, i: number) => (
                            <div key={i} className={styles.recoItem} style={{ borderLeft: '3px solid var(--diagnostic-cobalt)' }}>
                              <div className={styles.recoItemTitle}>{rec.category}: {rec.title}</div>
                              <p className={styles.recoItemDesc}>{rec.detail}</p>
                            </div>
                          ))}
                        {recommendations.recommendations.length > 3 && (
                          <button onClick={() => setShowAllReco(v => !v)} className={styles.showMoreBtn} id="show-more-reco">
                            {showAllReco ? 'Show less' : `Show ${recommendations.recommendations.length - 3} more`}
                            <ChevronRight size={12} style={{ transform: showAllReco ? 'rotate(270deg)' : 'rotate(90deg)' }} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Positive Notes */}
                  {recommendations.positive_notes?.length > 0 && (
                    <motion.div
                      className={`card ${styles.sideCard}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.44 }}
                      id="positive-notes"
                    >
                      <div className={styles.sideCardTitle}>
                        <CheckCircle size={15} color="var(--bio-emerald)" />
                        What&apos;s Looking Good
                      </div>
                      <div className={styles.positiveList}>
                        {recommendations.positive_notes.map((note: string, i: number) => (
                          <div key={i} className={styles.positiveNote}>{note}</div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </aside>
          </div>
        )}
      </div>

      {/* ── Clinical Dossier Export Studio Modal ── */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        dossierProps={{
          patientName: 'Subject // Primary Vault User',
          reportDate: new Date().toISOString().split('T')[0],
          labName: 'Consolidated Longitudinal Vault',
          category: 'Consolidated Health Telemetry',
          stats: dashData?.stats,
          biomarkers: biomarkers,
          recommendations: recommendations,
        }}
      />

      {/* ── Health Chatbot Widget ── */}
      <ChatWidget biomarkers={biomarkers} />
    </div>
  )
}
