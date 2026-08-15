import React from 'react'
import { useNavigate } from 'react-router-dom'
import DeploymentStatus from './DeploymentStatus.jsx'

export default function DeploymentCard({ deployment }) {
  const navigate = useNavigate()

  return (
    <div className="deployment-card" onClick={() => navigate(`/deployments/${deployment.id}`)}>
      <div className="deployment-card-left">
        <div>
          <div className="deployment-card-title">
            {deployment.applicationName} <span className="text-tertiary">→</span> {deployment.environmentName}
          </div>
          <div className="deployment-card-meta">
            {deployment.version} · {deployment.branch}
            {deployment.commitSha ? ` · ${deployment.commitSha.slice(0, 7)}` : ''}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-12">
        <span className="text-tertiary" style={{ fontSize: 12 }}>
          {new Date(deployment.createdAt).toLocaleString()}
        </span>
        <DeploymentStatus status={deployment.status} />
      </div>
    </div>
  )
}
