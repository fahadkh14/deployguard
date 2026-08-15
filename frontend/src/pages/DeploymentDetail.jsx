import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDeployment, rollbackDeployment } from '../services/api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import DeploymentStatus from '../components/DeploymentStatus.jsx'
import DeploymentTimeline from '../components/DeploymentTimeline.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { IconBack, IconUndo, IconClock } from '../components/Icons.jsx'

export default function DeploymentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [deployment, setDeployment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [rollbackOpen, setRollbackOpen] = useState(false)
  const [rollingBack, setRollingBack] = useState(false)
  const [rollbackError, setRollbackError] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getDeployment(id)
      .then(setDeployment)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const handleRollback = async () => {
    setRollingBack(true)
    setRollbackError(null)
    try {
      const rolledBackTo = await rollbackDeployment(id)
      setRollbackOpen(false)
      navigate(`/deployments/${rolledBackTo.id}`)
    } catch (err) {
      setRollbackError(err.message)
      setRollingBack(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading deployment…" />
  if (error) return <ErrorMessage message={error} onRetry={load} />
  if (!deployment) return null

  const canRollback = deployment.status === 'SUCCESS' || deployment.status === 'FAILED'

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate('/deployments')}>
        <IconBack width={15} height={15} /> Back to deployments
      </button>

      <div className="page-header">
        <div>
          <div className="page-header-title">
            {deployment.applicationName} <span className="text-tertiary">→</span> {deployment.environmentName}
          </div>
          <div className="page-header-desc mono" style={{ marginTop: 6 }}>
            {deployment.version} · {deployment.branch}
            {deployment.commitSha ? ` · ${deployment.commitSha}` : ''}
          </div>
        </div>
        <div className="toolbar">
          <DeploymentStatus status={deployment.status} />
          {canRollback && (
            <button className="btn btn-secondary" onClick={() => { setRollbackError(null); setRollbackOpen(true) }}>
              <IconUndo width={15} height={15} /> Rollback
            </button>
          )}
        </div>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-label">Application</div>
          <div className="metric-value" style={{ fontSize: 20 }}>{deployment.applicationName}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Environment</div>
          <div className="metric-value" style={{ fontSize: 20 }}>{deployment.environmentName}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Version</div>
          <div className="metric-value mono" style={{ fontSize: 20 }}>{deployment.version}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Status</div>
          <div style={{ marginTop: 10 }}><DeploymentStatus status={deployment.status} /></div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header">
          <div className="card-title">Deployment timeline</div>
          <span className="text-tertiary flex items-center gap-8" style={{ fontSize: 12 }}>
            <IconClock width={13} height={13} />
            {deployment.startedAt ? new Date(deployment.startedAt).toLocaleString() : 'Not started'}
          </span>
        </div>
        <DeploymentTimeline stages={deployment.stages} />
      </div>

      {deployment.deploymentMessage && (
        <div className="card">
          <div className="card-title mb-16">Deployment message</div>
          <div className="text-secondary">{deployment.deploymentMessage}</div>
        </div>
      )}

      <ConfirmDialog
        open={rollbackOpen}
        title="Rollback this deployment?"
        description={rollbackError
          ? rollbackError
          : `This will redeploy the last successful version of ${deployment.applicationName} to ${deployment.environmentName} and mark this deployment as rolled back.`}
        confirmLabel="Rollback"
        loading={rollingBack}
        onConfirm={handleRollback}
        onCancel={() => setRollbackOpen(false)}
      />
    </div>
  )
}
