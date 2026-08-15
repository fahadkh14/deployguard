import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getApplication,
  updateApplication,
  deleteApplication,
  getApplicationDeployments,
  getEnvironments,
  startDeployment,
} from '../services/api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage, { EmptyState } from '../components/ErrorMessage.jsx'
import DeploymentCard from '../components/DeploymentCard.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Modal from '../components/Modal.jsx'
import { IconBack, IconEdit, IconTrash, IconRocket, IconGitBranch } from '../components/Icons.jsx'

export default function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [application, setApplication] = useState(null)
  const [deployments, setDeployments] = useState([])
  const [environments, setEnvironments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [deployOpen, setDeployOpen] = useState(false)
  const [deployForm, setDeployForm] = useState({ environmentId: '', version: '', branch: '', commitSha: '', deploymentMessage: '' })
  const [deploying, setDeploying] = useState(false)
  const [deployError, setDeployError] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([getApplication(id), getApplicationDeployments(id), getEnvironments()])
      .then(([app, deps, envs]) => {
        setApplication(app)
        setDeployments(deps)
        setEnvironments(envs)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const openEdit = () => {
    setEditForm({
      name: application.name,
      description: application.description || '',
      gitRepositoryUrl: application.gitRepositoryUrl,
      gitBranch: application.gitBranch,
      environmentName: application.environmentName || '',
      currentVersion: application.currentVersion || '',
    })
    setFormError(null)
    setEditOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const updated = await updateApplication(id, editForm)
      setApplication(updated)
      setEditOpen(false)
    } catch (err) {
      setFormError(err.details?.join(', ') || err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteApplication(id)
      navigate('/applications')
    } catch (err) {
      setDeleting(false)
      setError(err.message)
    }
  }

  const openDeploy = () => {
    setDeployForm({
      environmentId: environments[0]?.id || '',
      version: application.currentVersion || '',
      branch: application.gitBranch,
      commitSha: '',
      deploymentMessage: '',
    })
    setDeployError(null)
    setDeployOpen(true)
  }

  const handleDeploySubmit = async (e) => {
    e.preventDefault()
    setDeploying(true)
    setDeployError(null)
    try {
      const created = await startDeployment({
        applicationId: Number(id),
        environmentId: Number(deployForm.environmentId),
        version: deployForm.version,
        branch: deployForm.branch,
        commitSha: deployForm.commitSha,
        deploymentMessage: deployForm.deploymentMessage,
      })
      setDeployOpen(false)
      navigate(`/deployments/${created.id}`)
    } catch (err) {
      setDeployError(err.details?.join(', ') || err.message)
    } finally {
      setDeploying(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading application…" />
  if (error) return <ErrorMessage message={error} onRetry={load} />
  if (!application) return null

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate('/applications')}>
        <IconBack width={15} height={15} /> Back to applications
      </button>

      <div className="page-header">
        <div>
          <div className="page-header-title">{application.name}</div>
          <div className="page-header-desc flex items-center gap-8" style={{ marginTop: 6 }}>
            <IconGitBranch width={13} height={13} /> {application.gitBranch}
            <span>·</span>
            <span className="mono">{application.gitRepositoryUrl}</span>
          </div>
        </div>
        <div className="toolbar">
          <button className="btn btn-primary" onClick={openDeploy} disabled={environments.length === 0}>
            <IconRocket width={15} height={15} /> Deploy
          </button>
          <button className="btn btn-secondary" onClick={openEdit}>
            <IconEdit width={15} height={15} /> Edit
          </button>
          <button className="btn btn-danger" onClick={() => setDeleteOpen(true)}>
            <IconTrash width={15} height={15} />
          </button>
        </div>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-label">Current version</div>
          <div className="metric-value mono" style={{ fontSize: 22 }}>{application.currentVersion || '—'}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Default environment</div>
          <div className="metric-value" style={{ fontSize: 22 }}>{application.environmentName || '—'}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total deployments</div>
          <div className="metric-value" style={{ fontSize: 22 }}>{application.totalDeployments}</div>
        </div>
      </div>

      {application.description && (
        <div className="card mb-16">
          <div className="card-title mb-16">Description</div>
          <div className="text-secondary">{application.description}</div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Deployment history</div>
        </div>
        {deployments.length === 0 ? (
          <EmptyState
            title="No deployments yet"
            message="Deploy this application to an environment to see history here."
            action={
              <button className="btn btn-primary" onClick={openDeploy} disabled={environments.length === 0}>
                <IconRocket width={15} height={15} /> Deploy now
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-12">
            {deployments.map((d) => (
              <DeploymentCard key={d.id} deployment={d} />
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} title="Edit application" onClose={() => setEditOpen(false)}>
        {editForm && (
          <form onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label className="form-label">Application name</label>
              <input className="form-control" required value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Git repository URL</label>
              <input className="form-control" required value={editForm.gitRepositoryUrl}
                onChange={(e) => setEditForm({ ...editForm, gitRepositoryUrl: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Git branch</label>
                <input className="form-control" value={editForm.gitBranch}
                  onChange={(e) => setEditForm({ ...editForm, gitBranch: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Default environment</label>
                <select className="form-control" value={editForm.environmentName}
                  onChange={(e) => setEditForm({ ...editForm, environmentName: e.target.value })}>
                  <option value="">None</option>
                  {environments.map((env) => (
                    <option key={env.id} value={env.name}>{env.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Current version</label>
              <input className="form-control mono" value={editForm.currentVersion}
                onChange={(e) => setEditForm({ ...editForm, currentVersion: e.target.value })} />
            </div>
            {formError && <div className="form-error mb-16">{formError}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Deploy modal */}
      <Modal open={deployOpen} title={`Deploy ${application.name}`} onClose={() => setDeployOpen(false)}>
        <form onSubmit={handleDeploySubmit}>
          <div className="form-group">
            <label className="form-label">Environment</label>
            <select className="form-control" required value={deployForm.environmentId}
              onChange={(e) => setDeployForm({ ...deployForm, environmentId: e.target.value })}>
              {environments.map((env) => (
                <option key={env.id} value={env.id}>{env.name}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Version</label>
              <input className="form-control mono" required value={deployForm.version}
                onChange={(e) => setDeployForm({ ...deployForm, version: e.target.value })} placeholder="v1.5.0" />
            </div>
            <div className="form-group">
              <label className="form-label">Branch</label>
              <input className="form-control" value={deployForm.branch}
                onChange={(e) => setDeployForm({ ...deployForm, branch: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Commit SHA</label>
            <input className="form-control mono" value={deployForm.commitSha}
              onChange={(e) => setDeployForm({ ...deployForm, commitSha: e.target.value })} placeholder="a1b2c3d" />
          </div>
          <div className="form-group">
            <label className="form-label">Deployment message</label>
            <textarea className="form-control" value={deployForm.deploymentMessage}
              onChange={(e) => setDeployForm({ ...deployForm, deploymentMessage: e.target.value })}
              placeholder="What's in this release?" />
          </div>
          {deployError && <div className="form-error mb-16">{deployError}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setDeployOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={deploying}>
              {deploying ? 'Deploying…' : 'Start deployment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this application?"
        description={`This will permanently remove "${application.name}" and all of its deployment history. This cannot be undone.`}
        confirmLabel="Delete application"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
