import React, { useEffect, useState } from 'react'
import { getDashboardSummary } from '../services/api.js'
import MetricCard from '../components/MetricCard.jsx'
import DeploymentCard from '../components/DeploymentCard.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { EmptyState } from '../components/ErrorMessage.jsx'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading) return <LoadingSpinner fullPage label="Loading dashboard…" />
  if (error) return <ErrorMessage message={error} onRetry={load} />
  if (!summary) return null

  return (
    <div>
      <div className="metric-grid">
        <MetricCard label="Total applications" value={summary.totalApplications} accent="var(--accent)" />
        <MetricCard label="Total deployments" value={summary.totalDeployments} accent="var(--status-running)" />
        <MetricCard label="Successful" value={summary.successfulDeployments} accent="var(--status-success)" />
        <MetricCard label="Failed" value={summary.failedDeployments} accent="var(--status-failed)" />
        <MetricCard label="Running now" value={summary.runningDeployments} accent="var(--status-running)" />
        <MetricCard
          label="Success rate"
          value={`${summary.successRate}%`}
          mono
          accent="var(--status-success)"
          sub={`${summary.queuedDeployments} queued`}
        />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent deployment activity</div>
        </div>
        {summary.recentDeployments.length === 0 ? (
          <EmptyState
            title="No deployments yet"
            message="Once you start a deployment, it will show up here with live status."
          />
        ) : (
          <div className="flex flex-col gap-12">
            {summary.recentDeployments.map((d) => (
              <DeploymentCard key={d.id} deployment={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
