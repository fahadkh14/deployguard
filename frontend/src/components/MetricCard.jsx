import React from 'react'

export default function MetricCard({ label, value, sub, accent, mono }) {
  return (
    <div className="metric-card" style={accent ? { '--metric-accent': accent } : undefined}>
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${mono ? 'mono' : ''}`}>{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  )
}
