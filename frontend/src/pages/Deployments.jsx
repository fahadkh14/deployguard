import React, { useEffect, useMemo, useState } from 'react'
import { getDeployments, getApplications, getEnvironments, startDeployment } from '../services/api.js'
import DeploymentCard from '../components/DeploymentCard.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage, { EmptyState } from '../components/ErrorMessage.jsx'
import Modal from '../components/Modal.jsx'
import { IconPlus } from '../components/Icons.jsx'
import { useNavigate } from 'react-router-dom'

const STATUS_OPTIONS = ['ALL', 'QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'ROLLED_BACK']

export default function Deployments() {
  const navigate = useNavigate()
  const [deployments, setDeployments] = useState([])
  const [applications, setApplications] = useState([])
  const [environments, setEnvironments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [envFilter, setEnvFilter] = useState('ALL')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ applicationId: '', environmentId: '', version: '', branch: '', commitSha: '', deploymentMessage: '' })
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([getDeployments(), getApplications(), getEnvironments()])
      .then(([deps, apps, envs]) => {
        setDeployments(deps)
        setApplications(apps)
        setEnvironments(envs)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(() => {
    return deployments.filter((d) => {
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false
      if (envFilter !== 'ALL' && String(d.environmentId) !== envFilter) return false
      return true
    })
  }, [deployments, statusFilter, envFilter])

  const openModal = () => {
    setForm({
      applicationId: applications[0]?.id || '',
      environmentId: environments[0]?.id || '',
      version: '',
      branch: '',
      commitSha: '',
      deploymentMessage: '',
    })
    setFormError(null)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const created = await startDeployment({
        applicationId: Number(form.applicationId),
        environmentId: Number(form.environmentId),
        version: form.version,
        branch: form.branch,
        commitSha: form.commitSha,
        deploymentMessage: form.deploymentMessage,
      })
      setModalOpen(false)
      navigate(`/deployments/${created.id}`)
    } catch (err) {
      setFormError(err.details?.join(', ') || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading deployments…" />
  if (error) return <ErrorMessage message={error} onRetry={load} />

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">Deployments</div>
          <div className="page-header-desc">{filtered.length} of {deployments.length} shown</div>
        </div>
        <div className="toolbar">
          <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</option>)}
          </select>
          <select className="form-control" style={{ width: 170 }} value={envFilter} onChange={(e) => setEnvFilter(e.target.value)}>
            <option value="ALL">All environments</option>
            {environments.map((env) => <option key={env.id} value={env.id}>{env.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openModal} disabled={applications.length === 0 || environments.length === 0}>
            <IconPlus width={15} height={15} /> New deployment
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No deployments found"
          message={deployments.length === 0
            ? 'Start your first deployment to see it appear here.'
            : 'Try adjusting your filters.'}
          action={deployments.length === 0 && (
            <button className="btn btn-primary" onClick={openModal}>
              <IconPlus width={15} height={15} /> New deployment
            </button>
          )}
        />
      ) : (
        <div className="flex flex-col gap-12">
          {filtered.map((d) => (
            <DeploymentCard key={d.id} deployment={d} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} title="Start a new deployment" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Application</label>
            <select className="form-control" required value={form.applicationId}
              onChange={(e) => setForm({ ...form, applicationId: e.target.value })}>
              {applications.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Environment</label>
            <select className="form-control" required value={form.environmentId}
              onChange={(e) => setForm({ ...form, environmentId: e.target.value })}>
              {environments.map((env) => <option key={env.id} value={env.id}>{env.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Version</label>
              <input className="form-control mono" required value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="v1.5.0" />
            </div>
            <div className="form-group">
              <label className="form-label">Branch</label>
              <input className="form-control" value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="main" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Commit SHA</label>
            <input className="form-control mono" value={form.commitSha}
              onChange={(e) => setForm({ ...form, commitSha: e.target.value })} placeholder="a1b2c3d" />
          </div>
          <div className="form-group">
            <label className="form-label">Deployment message</label>
            <textarea className="form-control" value={form.deploymentMessage}
              onChange={(e) => setForm({ ...form, deploymentMessage: e.target.value })} placeholder="What's in this release?" />
          </div>
          {formError && <div className="form-error mb-16">{formError}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Deploying…' : 'Start deployment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
