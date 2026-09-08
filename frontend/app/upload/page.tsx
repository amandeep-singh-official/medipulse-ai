'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Brain, CheckCircle, ChevronRight, ChevronLeft, CloudUpload } from 'lucide-react'
import Navbar from '@/components/Navbar'
import toast from 'react-hot-toast'
import { uploadReport, extractReport, confirmReport } from '@/lib/api'
import styles from './page.module.css'

const CATEGORIES = [
  { id: 'CBC', emoji: '🩸', label: 'Complete Blood Count', desc: 'Hemoglobin, WBC, RBC, Platelets' },
  { id: 'LIPID', emoji: '🫀', label: 'Lipid Profile', desc: 'Cholesterol, HDL, LDL, Triglycerides' },
  { id: 'THYROID', emoji: '🦋', label: 'Thyroid Panel', desc: 'TSH, Free T3, Free T4' },
  { id: 'METABOLIC', emoji: '🧪', label: 'Metabolic & Diabetes', desc: 'Fasting Glucose, HbA1c, Insulin' },
  { id: 'LFT_KFT', emoji: '🫁', label: 'Liver & Kidney (LFT/KFT)', desc: 'ALT, AST, Creatinine, Urea' },
]

const STEPS = ['Select Category', 'Upload File', 'AI Extraction', 'Verify & Save']

export default function UploadPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [reportDate, setReportDate] = useState('')
  const [labName, setLabName] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportId, setReportId] = useState('')
  const [biomarkers, setBiomarkers] = useState<any[]>([])
  const [aiProvider, setAiProvider] = useState('')

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleUploadAndExtract = async () => {
    if (!file || !reportDate) { toast.error('Please select a file and report date'); return }
    setLoading(true)
    setStep(2)
    try {
      const uploaded = await uploadReport(file, category, reportDate, labName || 'Unknown Lab')
      setReportId(uploaded.report_id)
      const extracted = await extractReport(uploaded.report_id)
      setBiomarkers(extracted.biomarkers.map((b: any) => ({ ...b })))
      setAiProvider(extracted.ai_provider)
      setStep(3)
    } catch (err: any) {
      toast.error(err.message || 'Extraction failed')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await confirmReport(reportId, biomarkers)
      toast.success('Report saved! Redirecting to dashboard...')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const updateBiomarker = (idx: number, field: string, value: string) => {
    setBiomarkers(prev => prev.map((b, i) => i === idx ? { ...b, [field]: field === 'name' || field === 'unit' ? value : parseFloat(value) || 0 } : b))
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '28px 24px 48px', maxWidth: 820 }}>
        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Ingest Report</h1>
            <p className={styles.pageSubtitle}>Upload a lab report and let AI extract your biomarker values</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <div key={s} className={styles.stepItem}>
              <div className={`${styles.stepDot} ${i <= step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 0: Category */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className={styles.stepTitle}>Select Report Type</h1>
              <p className={styles.stepDesc}>What kind of lab report are you uploading?</p>
              <div className={styles.categories}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    id={`category-${cat.id}`}
                    className={`${styles.catCard} ${category === cat.id ? styles.catActive : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    <span className={styles.catEmoji}>{cat.emoji}</span>
                    <div>
                      <div className={styles.catLabel}>{cat.label}</div>
                      <div className={styles.catDesc}>{cat.desc}</div>
                    </div>
                    {category === cat.id && <CheckCircle size={18} color="var(--brand)" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button className="btn btn-primary" disabled={!category} onClick={() => setStep(1)} id="next-to-upload">
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Upload */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className={styles.stepTitle}>Upload Your Report</h1>
              <p className={styles.stepDesc}>Supports PDF, JPEG, PNG — max 10MB</p>

              <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${file ? styles.dropzoneDone : ''}`} id="file-dropzone">
                <input {...getInputProps()} id="file-input" />
                <CloudUpload size={40} color={file ? 'var(--success)' : 'var(--brand)'} />
                {file ? (
                  <div>
                    <p className={styles.fileName}>{file.name}</p>
                    <p className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                  </div>
                ) : (
                  <div>
                    <p className={styles.dropText}>{isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}</p>
                    <p className={styles.dropSub}>PDF, JPEG or PNG</p>
                  </div>
                )}
              </div>

              <div className={styles.metaRow}>
                <div className={styles.metaField}>
                  <label className="field-label">Report Date *</label>
                  <input type="date" className="input" value={reportDate} onChange={e => setReportDate(e.target.value)} required id="report-date" />
                </div>
                <div className={styles.metaField}>
                  <label className="field-label">Lab Name (optional)</label>
                  <input type="text" className="input" placeholder="e.g. Lal PathLabs" value={labName} onChange={e => setLabName(e.target.value)} id="lab-name" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button className="btn btn-secondary" onClick={() => setStep(0)}><ChevronLeft size={16} /> Back</button>
                <button className="btn btn-primary" disabled={!file || !reportDate} onClick={handleUploadAndExtract} id="start-extraction">
                  Extract with AI <Brain size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Extracting */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.extractingState}>
              <div className={styles.extractingSpinner} />
              <h2 className={styles.extractingTitle}>AI Analyzing Your Report</h2>
              <p className={styles.extractingDesc}>Gemini Vision is reading your lab report and extracting biomarker values. This usually takes 5–15 seconds.</p>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => { setLoading(false); setStep(1); }}
              >
                Cancel & Try Again
              </button>
            </motion.div>
          )}

          {/* STEP 3: Verify */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h1 className={styles.stepTitle} style={{ margin: 0 }}>Review Extracted Values</h1>
                <span className={styles.providerBadge}>via {aiProvider === 'gemini' ? '✨ Gemini' : '🦙 Groq'}</span>
              </div>
              <p className={styles.stepDesc}>Review and edit values if needed, then save to your dashboard.</p>

              {biomarkers.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 32, marginBottom: 20 }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
                    No specific biomarkers matching <strong>{category}</strong> were auto-detected in this document.
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    You can add your report values manually below, or go back to choose a different category.
                  </p>
                </div>
              ) : null}

              <div className={styles.verifyTable}>
                <div className={styles.tableHeader}>
                  <span>Biomarker</span>
                  <span>Value</span>
                  <span>Unit</span>
                  <span>Ref Min</span>
                  <span>Ref Max</span>
                </div>
                {biomarkers.map((bm, idx) => (
                  <div key={idx} className={styles.tableRow} style={{ position: 'relative' }}>
                    <input className="input" placeholder="e.g. Hemoglobin" value={bm.name} onChange={e => updateBiomarker(idx, 'name', e.target.value)} />
                    <input className="input" type="number" step="any" value={bm.value} onChange={e => updateBiomarker(idx, 'value', e.target.value)} />
                    <input className="input" placeholder="e.g. g/dL" value={bm.unit} onChange={e => updateBiomarker(idx, 'unit', e.target.value)} />
                    <input className="input" type="number" step="any" value={bm.ref_min} onChange={e => updateBiomarker(idx, 'ref_min', e.target.value)} />
                    <input className="input" type="number" step="any" value={bm.ref_max} onChange={e => updateBiomarker(idx, 'ref_max', e.target.value)} />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setBiomarkers(prev => [...prev, { name: '', value: 0, unit: '', ref_min: 0, ref_max: 0 }])}
                >
                  + Add Biomarker
                </button>

                <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={loading || biomarkers.length === 0} id="save-report">
                  {loading ? <span className="spinner" /> : <><CheckCircle size={18} /> Save to Dashboard</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
