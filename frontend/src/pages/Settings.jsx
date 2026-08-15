import React from 'react'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function Settings() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">Settings</div>
          <div className="page-header-desc">Platform configuration for this environment</div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-title mb-16">API connection</div>
        <div className="form-group">
          <label className="form-label">Backend API URL</label>
          <input className="form-control mono" value={API_URL} readOnly />
          <div className="form-hint">
            Configured via the <code>VITE_API_URL</code> environment variable at build time. Update your
            <code> .env</code> file and restart the dev server to change it.
          </div>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-title mb-16">About DeployGuard</div>
        <div className="text-secondary" style={{ fontSize: 13, lineHeight: 1.7 }}>
          DeployGuard is a self-service deployment platform: register an application, choose a target
          environment and version, and trigger a deployment. This build simulates the deployment pipeline
          in the backend so the full application flow can be exercised end-to-end before real infrastructure
          (Kubernetes, container registries, CI/CD) is wired in.
        </div>
      </div>

      <div className="card">
        <div className="card-title mb-16">Roadmap</div>
        <div className="text-secondary" style={{ fontSize: 13, lineHeight: 1.9 }}>
          • Containerize with Docker and orchestrate locally with docker-compose<br />
          • Real deployments to Kubernetes<br />
          • CI pipeline integration (build, test, security scan, image build)<br />
          • Infrastructure as Code with Terraform<br />
          • Continuous delivery with Argo CD<br />
          • Observability: metrics, logs, and alerting
        </div>
      </div>
    </div>
  )
}
