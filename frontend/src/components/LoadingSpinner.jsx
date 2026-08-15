import React from 'react'

export default function LoadingSpinner({ label, fullPage }) {
  if (fullPage) {
    return (
      <div className="spinner-page flex-col items-center" style={{ display: 'flex' }}>
        <div className="spinner" />
        {label && <div className="text-tertiary mt-16">{label}</div>}
      </div>
    )
  }
  return (
    <div className="flex items-center gap-8">
      <div className="spinner" />
      {label && <span className="text-tertiary">{label}</span>}
    </div>
  )
}
