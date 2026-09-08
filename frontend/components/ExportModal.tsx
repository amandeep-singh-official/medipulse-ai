'use client'
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Copy, Check, FileSpreadsheet, ShieldAlert, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import ClinicalDossier, { ClinicalDossierProps } from './ClinicalDossier'
import styles from './ExportModal.module.css'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  dossierProps: Omit<ClinicalDossierProps, 'includeAi' | 'isPrintPortal'>
}

export default function ExportModal({ isOpen, onClose, dossierProps }: ExportModalProps) {
  const [includeAi, setIncludeAi] = useState(true)
  const [onlyAnomalies, setOnlyAnomalies] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter biomarkers if onlyAnomalies is active
  const displayedBiomarkers = onlyAnomalies
    ? dossierProps.biomarkers.filter(b => b.status === 'OUT_OF_RANGE' || b.status === 'BORDERLINE')
    : dossierProps.biomarkers

  // Trigger Native Vector PDF Print
  const handlePrint = () => {
    const originalTitle = document.title
    const safeDate = (dossierProps.reportDate || new Date().toISOString().split('T')[0]).replace(/-/g, '')
    document.title = `MediPulse_Clinical_Dossier_${safeDate}`

    // Trigger print
    window.print()

    // Restore title
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

  // Copy Structured Markdown Clinical Summary to Clipboard
  const handleCopySummary = async () => {
    const lines = [
      `MEDIPULSE AI // CLINICAL TELEMETRY DOSSIER`,
      `===========================================`,
      `Patient: ${dossierProps.patientName || 'Subject // Primary Vault User'}`,
      `Report Date: ${dossierProps.reportDate || new Date().toISOString().split('T')[0]}`,
      `Diagnostic Scope: ${dossierProps.category || 'Clinical Vault'}`,
      `Source Laboratory: ${dossierProps.labName || 'Standardized Laboratory'}`,
      ``,
      `EXECUTIVE STATUS:`,
      `- Normal Parameters: ${dossierProps.biomarkers.filter(b => b.status === 'NORMAL').length}`,
      `- Borderline Flags: ${dossierProps.biomarkers.filter(b => b.status === 'BORDERLINE').length}`,
      `- Action Required (OOR): ${dossierProps.biomarkers.filter(b => b.status === 'OUT_OF_RANGE').length}`,
      ``,
      `QUANTITATIVE BIOMARKER READINGS:`,
      ...displayedBiomarkers.map(
        b => `• ${b.name}: ${b.value} ${b.unit} [Ref: ${b.ref_min ?? 'N/A'} - ${b.ref_max ?? 'N/A'}] → ${b.status}`
      ),
    ]

    if (includeAi && dossierProps.recommendations?.summary) {
      lines.push(
        ``,
        `CLINICAL AI ASSESSMENT:`,
        `"${dossierProps.recommendations.summary}"`
      )
      if (dossierProps.recommendations.risk_flags?.length) {
        lines.push(
          `Risk Flags:`,
          ...dossierProps.recommendations.risk_flags.map(rf => `  - ${rf.biomarker}: ${rf.message}`)
        )
      }
    }

    lines.push(
      ``,
      `===========================================`,
      `Generated via MediPulse AI Clinical Vault.`
    )

    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      toast.success('Clinical summary copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Failed to copy to clipboard.')
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="export-modal-overlay"
            className={`${styles.overlay} no-print`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              key="export-modal-content"
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <div className={styles.header}>
                <div className={styles.headerTitle}>
                  <FileSpreadsheet size={18} color="var(--bio-emerald)" />
                  Clinical Dossier Studio // Export &amp; Share
                </div>
                <button onClick={onClose} className={styles.closeBtn} title="Close Studio">
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className={styles.body}>
                {/* Left Control Panel */}
                <div className={styles.sidebar}>
                  <div className={styles.section}>
                    <span className={styles.sectionLabel}>Dossier Configuration</span>
                    <div className={styles.controlGroup}>
                      <label className={styles.toggleLabel}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Sparkles size={14} color="var(--bio-emerald)" />
                          Include AI Intelligence
                        </span>
                        <input
                          type="checkbox"
                          checked={includeAi}
                          onChange={e => setIncludeAi(e.target.checked)}
                          className={styles.checkbox}
                        />
                      </label>

                      <label className={styles.toggleLabel}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ShieldAlert size={14} color="var(--diagnostic-amber)" />
                          Highlight Anomalies Only
                        </span>
                        <input
                          type="checkbox"
                          checked={onlyAnomalies}
                          onChange={e => setOnlyAnomalies(e.target.checked)}
                          className={styles.checkbox}
                        />
                      </label>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <span className={styles.sectionLabel}>Dossier Summary</span>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <div>• <strong>{displayedBiomarkers.length}</strong> parameters included</div>
                      <div>• Vector PDF resolution (300+ DPI)</div>
                      <div>• Formatted for standard A4 clinical print</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.actionButtons}>
                    <button
                      onClick={handlePrint}
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%', gap: 8 }}
                      id="btn-download-pdf"
                    >
                      <Download size={16} /> Download PDF Dossier
                    </button>

                    <button
                      onClick={handleCopySummary}
                      className="btn btn-secondary"
                      style={{ width: '100%', gap: 8 }}
                      id="btn-copy-summary"
                    >
                      {copied ? <Check size={16} color="var(--bio-emerald)" /> : <Copy size={16} />}
                      {copied ? 'Summary Copied!' : 'Copy Physician Summary'}
                    </button>
                  </div>
                </div>

                {/* Right Live Preview Area */}
                <div className={styles.previewArea}>
                  <div className={styles.paperSheet}>
                    <ClinicalDossier
                      {...dossierProps}
                      biomarkers={displayedBiomarkers}
                      includeAi={includeAi}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Print Portal (Mounted directly to document.body, isolated from webpage during @media print) */}
      {mounted && isOpen && createPortal(
        <div id="dossier-print-portal">
          <ClinicalDossier
            {...dossierProps}
            biomarkers={displayedBiomarkers}
            includeAi={includeAi}
            isPrintPortal={true}
          />
        </div>,
        document.body
      )}
    </>
  )
}
