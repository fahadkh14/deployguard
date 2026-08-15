import React, { useEffect, useState } from 'react'
import {
  getEnvironments,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
} from '../services/api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage, { EmptyState } from '../components/ErrorMessage.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { IconPlus, IconEdit, IconTrash, IconLayers } from '../components/Icons.jsx'

const EMPTY_FORM = { name: '', description: '', status: 'ACTIVE' }

const STATUS_BADGE = {
  ACTIVE: 'badge-success',
  INACTIVE: 'badge-queued',
  MAINTENANCE: 'badge-failed',
}

export default function Environments() {
  const [environments, setEnvironments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    getEnvironments()
      .then(setEnvironments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (env) => {
    setEditingId(env.id)
    setForm({ name: env.name, description: env.description || '', status: env.status })
    setFormError(null)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (editingId) {
        const updated = await updateEnvironment(editingId, form)
        setEnvironments((prev) => prev.map((env) => (env.id === editingId ? updated : env)))
      } else {
        const created = await createEnvironment(form)
        setEnvironments((prev) => [...prev, created])
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(err.details?.join(', ') || err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteEnvironment(deleteTarget.id)
      setEnvironments((prev) => prev.filter((env) => env.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading environments…" />
  if (error) return <ErrorMessage message={error} onRetry={load} />

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">Environments</div>
          <div className="page-header-desc">{environments.length} configured</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <IconPlus width={15} height={15} /> New environment
        </button>
      </div>

      {environments.length === 0 ? (
        <EmptyState
          title="No environments yet"
          message="Create Development, Staging, and Production environments to start deploying applications."
          action={
            <button className="btn btn-primary" onClick={openCreate}>
              <IconPlus width={15} height={15} /> New environment
            </button>
          }
        />
      ) : (
        <div className="card-grid">
          {environments.map((env) => (
            <div className="card" key={env.id}>
              <div className="card-header">
                <div className="flex items-center gap-8">
                  <IconLayers width={16} height={16} className="text-tertiary" />
                  <div className="card-title">{env.name}</div>
                </div>
                <span className={`badge ${STATUS_BADGE[env.status] || 'badge-queued'}`}>
                  <span className="badge-dot" /> {env.status}
                </span>
              </div>
              {env.description && <div className="text-secondary mb-16" style={{ fontSize: 13 }}>{env.description}</div>}
              <div className="flex gap-8">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(env)}>
                  <IconEdit width={13} height={13} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(env)}>
                  <IconTrash width={13} height={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editingId ? 'Edit environment' : 'New environment'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-control" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Production" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this environment used for?" />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
          {formError && <div className="form-error mb-16">{formError}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create environment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this environment?"
        description={deleteTarget ? `This will permanently remove "${deleteTarget.name}". Applications and deployments referencing it may be affected.` : ''}
        confirmLabel="Delete environment"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
