import React from 'react'

const LABELS = {
  SUCCESS: 'Success',
  FAILED: 'Failed',
  RUNNING: 'Running',
  QUEUED: 'Queued',
  ROLLED_BACK: 'Rolled back',
}

export default function DeploymentStatus({ status }) {
  const cls = (status || 'QUEUED').toLowerCase()
  return (
    <span className={`badge badge-${cls}`}>
      <span className="badge-dot" />
      {LABELS[status] || status}
    </span>
  )
}
