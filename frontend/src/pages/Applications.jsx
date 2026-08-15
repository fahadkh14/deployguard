import React, { useEffect, useState } from 'react'
import {
  getApplications,
  createApplication,
  updateApplication,
  getEnvironments,
} from '../services/api.js'
import ApplicationCard from '../components/ApplicationCard.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage, { EmptyState } from '../components/ErrorMessage.jsx'
import Modal from '../components/Modal.jsx'
import { IconPlus } from '../components/Icons.jsx'

const EMPTY_FORM = {
  name: '',
  description: '',
  gitRepositoryUrl: '',
  gitBranch: 'main',
  environmentName: '',
  currentVersion: '',
}

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [environments, setEnvironments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([getApplications(), getEnvironments()])
      .then(([apps, envs]) => {
        setApplications(apps)
        setEnvironments(envs)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreateModal = () => {
    setForm(EMPTY_FORM)
    setFormErrors(null)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormErrors(null)
    try {
      const created = await createApplication(form)
      setApplications((prev) => [created, ...prev])
      setModalOpen(false)
    } catch (err) {
      setFormErrors(err.details?.join(', ') || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading applications…" />
  if (error) return <ErrorMessage message={error} onRetry={load} />

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">Applications</div>
          <div className="page-header-desc">{applications.length} registered</div>
        </div>
        <div className="toolbar">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <IconPlus width={15} height={15} />
            New application
          </button>
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          message="Register your first application to start deploying it to an environment."
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <IconPlus width={15} height={15} />
              New application
            </button>
          }
        />
      ) : (
        <div className="card-grid">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} title="Register a new application" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Application name</label>
            <input
              className="form-control"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. PaymentsAPI"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What does this application do?"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Git repository URL</label>
            <input
              className="form-control"
              required
              value={form.gitRepositoryUrl}
              onChange={(e) => setForm({ ...form, gitRepositoryUrl: e.target.value })}
              placeholder="https://github.com/org/repo"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Git branch</label>
              <input
                className="form-control"
                value={form.gitBranch}
                onChange={(e) => setForm({ ...form, gitBranch: e.target.value })}
                placeholder="main"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Default environment</label>
              <select
                className="form-control"
                value={form.environmentName}
                onChange={(e) => setForm({ ...form, environmentName: e.target.value })}
              >
                <option value="">None</option>
                {environments.map((env) => (
                  <option key={env.id} value={env.name}>{env.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Current version</label>
            <input
              className="form-control mono"
              value={form.currentVersion}
              onChange={(e) => setForm({ ...form, currentVersion: e.target.value })}
              placeholder="v1.0.0"
            />
          </div>
          {formErrors && <div className="form-error mb-16">{formErrors}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
