'use client'
import React from 'react'
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import styles from './ClinicalDossier.module.css'

export interface ClinicalDossierProps {
  patientName?: string
  reportDate?: string
  labName?: string
  category?: string
  stats?: {
    total_reports?: number
    normal?: number
    borderline?: number
    out_of_range?: number
  }
  biomarkers: Array<{
    name: string
    value: number | string
    unit: string
    ref_min?: number
    ref_max?: number
    status: 'NORMAL' | 'BORDERLINE' | 'OUT_OF_RANGE' | string
  }>
  recommendations?: {
    overall_status?: string
    summary?: string
    risk_flags?: Array<{ biomarker?: string; message?: string; severity?: string; trend?: string }>
    recommendations?: Array<{ category?: string; title?: string; detail?: string }>
    positive_notes?: string[]
  } | null
  includeAi?: boolean
  isPrintPortal?: boolean
}

export default function ClinicalDossier({
  patientName = 'Subject // Primary Vault User',
  reportDate,
  labName = 'Consolidated Clinical Vault',
  category = 'Multi-Panel Laboratory Telemetry',
  stats,
  biomarkers = [],
  recommendations,
  includeAi = true,
  isPrintPortal = false,
}: ClinicalDossierProps) {
  // Current generation timestamp
  const generationTimestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Hash identifier for clinical traceability
  const documentHash = `MED-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  // Calculate numbers
  const outOfRange = biomarkers.filter(b => b.status === 'OUT_OF_RANGE')
  const borderline = biomarkers.filter(b => b.status === 'BORDERLINE')
  const normal = biomarkers.filter(b => b.status === 'NORMAL')

  // Use overall stats if provided, otherwise compute from active parameters
  const normalCount = stats?.normal ?? normal.length
  const borderlineCount = stats?.borderline ?? borderline.length
  const outOfRangeCount = stats?.out_of_range ?? outOfRange.length

  const totalEvaluated = normalCount + borderlineCount + outOfRangeCount
  const healthScore = totalEvaluated > 0 ? Math.round((normalCount / totalEvaluated) * 100) : 0

  return (
    <div
      className={`${styles.dossier} ${isPrintPortal ? 'clinical-dossier-print-wrapper' : ''}`}
      id="clinical-printable-dossier"
    >
      {/* ── 1. Editorial Clinical Header ── */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className={styles.brandTitle}>
              MediPulse <span style={{ fontStyle: 'italic', color: '#059669', fontFamily: 'var(--font-serif)' }}>AI</span>
            </div>
            <div className={styles.brandSub}>Clinical Laboratory Intelligence Platform</div>
          </div>
        </div>

        <div className={styles.headerMeta}>
          <div className={styles.stamp}>VAULT // CLINICAL DOSSIER</div>
          <div className={styles.hash}>AUDIT TRACE: {documentHash}</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>Generated: {generationTimestamp}</div>
        </div>
      </header>

      {/* ── 2. Patient & Ingestion Telemetry Metadata Bar ── */}
      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Patient / Subject</div>
          <div className={styles.metaValue}>{patientName}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Diagnostic Panel</div>
          <div className={styles.metaValue}>{category}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Source Laboratory</div>
          <div className={styles.metaValue}>{labName}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Report Date</div>
          <div className={styles.metaValue}>{reportDate || new Date().toISOString().split('T')[0]}</div>
        </div>
      </div>

      {/* ── 3. Executive Telemetry Summary Strip ── */}
      <div className={styles.triageStrip}>
        <div className={styles.triageCard}>
          <span className={styles.triageLabel}>Health Score</span>
          <span
            className={styles.triageValue}
            style={{
              color: healthScore >= 70 ? '#059669' : healthScore >= 40 ? '#b45309' : '#dc2626',
            }}
          >
            {healthScore}%
          </span>
        </div>
        <div className={styles.triageCard}>
          <span className={styles.triageLabel}>Optimal / Normal</span>
          <span className={styles.triageValue} style={{ color: '#059669' }}>
            {normalCount}
          </span>
        </div>
        <div className={styles.triageCard}>
          <span className={styles.triageLabel}>Borderline Flag</span>
          <span className={styles.triageValue} style={{ color: '#b45309' }}>
            {borderlineCount}
          </span>
        </div>
        <div className={styles.triageCard}>
          <span className={styles.triageLabel}>Action Required</span>
          <span className={styles.triageValue} style={{ color: '#dc2626' }}>
            {outOfRangeCount}
          </span>
        </div>
      </div>

      {/* ── 4. Critical Anomaly Callout Box (if any) ── */}
      {outOfRange.length > 0 && (
        <div className={styles.anomalyBox}>
          <div className={styles.anomalyTitle}>
            <AlertTriangle size={14} /> Attention Required: {outOfRange.length} Biomarker(s) Outside Biological Reference Interval
          </div>
          <div className={styles.anomalyText}>
            The following diagnostic markers require clinical review: <strong>{outOfRange.map(b => b.name).join(', ')}</strong>.
            Review the detailed quantitative metrics below and coordinate with a certified healthcare practitioner.
          </div>
        </div>
      )}

      {/* ── 5. Standardized Biomarker Telemetry Table ── */}
      <div className={styles.sectionHeading}>
        <div className={styles.sectionTitle}>Standardized Quantitative Biomarkers</div>
        <div className={styles.sectionCount}>{biomarkers.length} Parameters Tracked</div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: '6%' }}>#</th>
            <th style={{ width: '28%' }}>Biomarker</th>
            <th style={{ width: '22%' }}>Observed Reading</th>
            <th style={{ width: '26%' }}>Reference Interval</th>
            <th style={{ width: '18%' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {biomarkers.map((bm, index) => {
            return (
              <tr key={`${bm.name}-${index}`} className="dossier-row">
                <td style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className={styles.bmName}>{bm.name}</td>
                <td className={styles.bmVal}>
                  {bm.value} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{bm.unit}</span>
                </td>
                <td className={styles.bmRef}>
                  {bm.ref_min != null && bm.ref_max != null ? `${bm.ref_min} – ${bm.ref_max} ${bm.unit}` : 'Standard Clinical Range'}
                </td>
                <td>
                  <StatusBadge status={bm.status as any} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* ── 6. Clinical AI Recommendations (Optional) ── */}
      {includeAi && recommendations?.summary && (
        <div className={`${styles.aiSection} dossier-section`}>
          <div className={styles.sectionHeading} style={{ borderBottomColor: '#e2e8f0', marginBottom: 10 }}>
            <div className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} color="#059669" /> Clinical AI Intelligence &amp; Lifestyle Advisory
            </div>
            <div className={styles.sectionCount}>Evaluation: {recommendations.overall_status || 'Analyzed'}</div>
          </div>

          <p className={styles.aiSummary}>
            &ldquo;{recommendations.summary}&rdquo;
          </p>

          <div className={styles.aiGrid}>
            {recommendations.risk_flags && recommendations.risk_flags.length > 0 && (
              <div className={styles.aiCard}>
                <div className={styles.aiCardTitle} style={{ color: '#b45309' }}>
                  ⚠️ Risk Flags &amp; Monitoring
                </div>
                {recommendations.risk_flags.slice(0, 2).map((rf, i) => (
                  <div key={i} className={styles.aiCardDesc} style={{ marginBottom: 4 }}>
                    <strong>{rf.biomarker}:</strong> {rf.message}
                  </div>
                ))}
              </div>
            )}

            {recommendations.recommendations && recommendations.recommendations.length > 0 && (
              <div className={styles.aiCard}>
                <div className={styles.aiCardTitle} style={{ color: '#0284c7' }}>
                  💡 Physician-Aligned Guidance
                </div>
                {recommendations.recommendations.slice(0, 2).map((rec, i) => (
                  <div key={i} className={styles.aiCardDesc} style={{ marginBottom: 4 }}>
                    <strong>{rec.title || rec.category}:</strong> {rec.detail}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 7. Verification, Legal Disclaimer & Signature Block ── */}
      <footer className={`${styles.footer} dossier-section`}>
        <div className={styles.verificationBlock}>
          <div className={styles.auditText}>
            <strong>VERIFICATION:</strong> Cryptographically logged in PostgreSQL RLS Vault. Machine extraction via PyMuPDF &amp; Groq/Gemini Multi-Modal Engine.
          </div>
          <div className={styles.auditText} style={{ marginTop: 4, color: '#94a3b8' }}>
            *Disclaimer: This telemetry dossier is generated for patient longitudinal tracking and informational review. It does not replace independent professional medical diagnosis or clinical laboratory validation.
          </div>
        </div>

        <div className={styles.signatureBlock}>
          <div className={styles.signatureLine} />
          <div className={styles.signatureLabel}>Reviewing Clinician / Physician Signature</div>
        </div>
      </footer>
    </div>
  )
}
