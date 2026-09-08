import { CheckCircle, Minus, AlertCircle } from 'lucide-react'

type Status = 'NORMAL' | 'BORDERLINE' | 'OUT_OF_RANGE'

interface StatusBadgeProps {
  status: Status
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'NORMAL') {
    return (
      <span className="badge badge-normal">
        <CheckCircle size={11} />
        Normal
      </span>
    )
  }
  if (status === 'BORDERLINE') {
    return (
      <span className="badge badge-borderline">
        <Minus size={11} />
        Borderline
      </span>
    )
  }
  return (
    <span className="badge badge-danger">
      <AlertCircle size={11} />
      Out of Range
    </span>
  )
}
