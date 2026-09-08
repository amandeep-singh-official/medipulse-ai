'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { BiomarkerInfo } from '@/lib/biomarkerInfo'
import styles from './BiomarkerTooltip.module.css'

interface Props {
  info: BiomarkerInfo
}

export default function BiomarkerTooltip({ info }: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top')

  useEffect(() => {
    if (tooltipRef.current) {
      const parent = tooltipRef.current.parentElement
      if (parent) {
        const rect = parent.getBoundingClientRect()
        // If row is too close to the top of the viewport (< 230px), flip to bottom
        // Otherwise, always show on the upper side (top) as requested
        if (rect.top < 230) {
          setPlacement('bottom')
        } else {
          setPlacement('top')
        }
      }
    }
  }, [])

  const isTop = placement === 'top'

  return (
    <motion.div
      ref={tooltipRef}
      className={`${styles.tooltip} ${isTop ? styles.tooltipTop : styles.tooltipBottom}`}
      role="tooltip"
      initial={{ opacity: 0, scale: 0.95, y: isTop ? 6 : -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: isTop ? 4 : -4 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* System badge */}
      <div className={styles.systemBadge}>
        <span className={styles.systemIcon}>{info.systemIcon}</span>
        <span className={styles.systemName}>{info.system}</span>
      </div>

      {/* Full clinical name */}
      <div className={styles.fullName}>{info.fullName}</div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Plain-English description */}
      <p className={styles.description}>{info.description}</p>

      {/* Clinical significance */}
      <div className={styles.significance}>
        <span className={styles.significanceLabel}>Clinical significance</span>
        <p className={styles.significanceText}>{info.significance}</p>
      </div>

      {/* Arrow pointer (CSS-only) */}
      <div
        className={`${styles.arrow} ${isTop ? styles.arrowTop : styles.arrowBottom}`}
        aria-hidden="true"
      />
    </motion.div>
  )
}
