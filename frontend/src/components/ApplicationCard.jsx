import React from 'react'
import { useNavigate } from 'react-router-dom'
import { IconGitBranch, IconClock } from './Icons.jsx'

export default function ApplicationCard({ application }) {
  const navigate = useNavigate()

  return (
    <div className="app-card" onClick={() => navigate(`/applications/${application.id}`)}>
      <div className="app-card-header">
        <div className="app-card-name">{application.name}</div>
        {application.currentVersion && (
          <span className="version-chip">{application.currentVersion}</span>
        )}
      </div>
      {application.description && (
        <div className="app-card-desc">{application.description}</div>
      )}
      <div className="app-card-meta">
        <span className="app-card-meta-item">
          <IconGitBranch width={13} height={13} />
          {application.gitBranch}
        </span>
        {application.environmentName && (
          <span className="app-card-meta-item">{application.environmentName}</span>
        )}
      </div>
      <div className="app-card-footer">
        <span className="text-tertiary" style={{ fontSize: 12 }}>
          {application.totalDeployments} deployment{application.totalDeployments === 1 ? '' : 's'}
        </span>
        <span className="text-tertiary flex items-center gap-8" style={{ fontSize: 11.5 }}>
          <IconClock width={13} height={13} />
          {new Date(application.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
