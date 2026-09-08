'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, Calendar, FlaskConical, ChevronRight, Upload, Download } from 'lucide-react'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/StatusBadge'
import ExportModal from '@/components/ExportModal'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import styles from './page.module.css'

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  CBC:      { emoji: '🩸', label: 'Complete Blood Count' },
  LIPID:    { emoji: '🫀', label: 'Lipid Profile' },
  THYROID:  { emoji: '🦋', label: 'Thyroid Panel' },
  METABOLIC:{ emoji: '🧪', label: 'Metabolic & Diabetes' },
  LFT_KFT:  { emoji: '🫁', label: 'Liver & Kidney (LFT/KFT)' },
}

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports]       = useState<any[]>([])
  const [biomarkers, setBiomarkers] = useState<Record<string, any[]>>({})
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)
  const [selectedReportForExport, setSelectedReportForExport] = useState<{ report: any; bms: any[] } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth/login'); return }
      const { data: reps } = await supabase
        .from('reports')
        .select('*')
        .order('report_date', { ascending: false })
      setReports(reps || [])
      setLoading(false)
    })
  }, [])

  const loadBiomarkers = async (reportId: string) => {
    if (biomarkers[reportId]) {
      setExpanded(expanded === reportId ? null : reportId)
      return
    }
    const supabase = createClient()
    const { data } = await supabase.from('biomarkers').select('*').eq('report_id', reportId)
    setBiomarkers(prev => ({ ...prev, [reportId]: data || [] }))
    setExpanded(reportId)
  }

  const handleExportReport = async (report: any, e: React.MouseEvent) => {
    e.stopPropagation()
    let bms = biomarkers[report.id]
    if (!bms) {
      const supabase = createClient()
      const { data } = await supabase.from('biomarkers').select('*').eq('report_id', report.id)
      bms = data || []
      setBiomarkers(prev => ({ ...prev, [report.id]: bms }))
    }
    setSelectedReportForExport({ report, bms })
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '28px 24px 48px' }}>

        {/* ── Header ── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Telemetry Vault</h1>
            <p className={styles.pageSubtitle}>All your uploaded lab reports</p>
          </div>
          <Link href="/upload" className="btn btn-primary" id="upload-new">
            <Upload size={15} /> Upload New
          </Link>
        </div>

        {/* ── Loading skeletons ── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 76, borderRadius: 16 }} />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && reports.length === 0 && (
          <div className={styles.emptyState} id="empty-state">
            <div className={styles.emptyIcon}>
              <FileText size={32} color="var(--bio-emerald)" />
            </div>
            <h2>No reports yet</h2>
            <p>Upload your first lab report to start building your health history.</p>
            <Link href="/upload" className="btn btn-primary" id="empty-upload-cta">
              <Upload size={15} /> Upload First Report
            </Link>
          </div>
        )}

        {/* ── Report list ── */}
        <div className={styles.reportList}>
          {reports.map((report, i) => {
            const meta  = CATEGORY_META[report.category] || { emoji: '📄', label: report.category }
            const isOpen = expanded === report.id
            const bms   = biomarkers[report.id] || []

            return (
              <motion.div
                key={report.id}
                className={styles.reportCard}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                {/* Report row */}
                <div
                  className={styles.reportHeader}
                  onClick={() => loadBiomarkers(report.id)}
                  id={`report-${report.id}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      loadBiomarkers(report.id)
                    }
                  }}
                >
                  <span className={styles.reportEmoji}>{meta.emoji}</span>
                  <div className={styles.reportInfo}>
                    <div className={styles.reportTitle}>{meta.label}</div>
                    <div className={styles.reportMeta}>
                      <span><Calendar size={11} /> {report.report_date}</span>
                      <span><FlaskConical size={11} /> {report.lab_name || 'Unknown Lab'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 10px', fontSize: '11px', gap: 4 }}
                      onClick={(e) => handleExportReport(report, e)}
                      title="Export this lab report as PDF Dossier"
                      id={`export-pdf-${report.id}`}
                    >
                      <Download size={12} /> PDF
                    </button>
                    <ChevronRight
                      size={16}
                      className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                    />
                  </div>
                </div>

                {/* Expanded biomarker list */}
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={styles.bioList}
                  >
                    <div className={styles.bioListHeader}>
                      <span>Biomarker</span>
                      <span>Value</span>
                      <span>Unit</span>
                      <span>Status</span>
                    </div>
                    {bms.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
                        No biomarkers found for this report.
                      </p>
                    )}
                    {bms.map((bm: any) => (
                      <div key={bm.id} className={styles.bioRow}>
                        <span className={styles.bioName}>{bm.name}</span>
                        <span className={styles.bioVal}>{bm.value}</span>
                        <span className={styles.bioUnit}>{bm.unit}</span>
                        <span><StatusBadge status={bm.status} /></span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

      </div>

      {/* ── Individual Clinical Dossier Export Studio ── */}
      {selectedReportForExport && (
        <ExportModal
          isOpen={!!selectedReportForExport}
          onClose={() => setSelectedReportForExport(null)}
          dossierProps={{
            patientName: 'Subject // Primary Vault User',
            reportDate: selectedReportForExport.report.report_date,
            labName: selectedReportForExport.report.lab_name || 'Standardized Laboratory',
            category: CATEGORY_META[selectedReportForExport.report.category]?.label || selectedReportForExport.report.category,
            biomarkers: selectedReportForExport.bms,
            stats: {
              total_reports: 1,
              normal: selectedReportForExport.bms.filter((b: any) => b.status === 'NORMAL').length,
              borderline: selectedReportForExport.bms.filter((b: any) => b.status === 'BORDERLINE').length,
              out_of_range: selectedReportForExport.bms.filter((b: any) => b.status === 'OUT_OF_RANGE').length,
            },
          }}
        />
      )}
    </div>
  )
}
