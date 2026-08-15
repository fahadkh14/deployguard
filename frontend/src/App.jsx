import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Applications from './pages/Applications.jsx'
import ApplicationDetail from './pages/ApplicationDetail.jsx'
import Deployments from './pages/Deployments.jsx'
import DeploymentDetail from './pages/DeploymentDetail.jsx'
import Environments from './pages/Environments.jsx'
import Settings from './pages/Settings.jsx'

const TITLES = {
  '/dashboard': ['Dashboard', 'Overview of applications and deployment health'],
  '/applications': ['Applications', 'Manage registered applications'],
  '/deployments': ['Deployments', 'All deployment activity across environments'],
  '/environments': ['Environments', 'Manage deployment target environments'],
  '/settings': ['Settings', 'Platform configuration'],
}

function resolveTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname]
  if (pathname.startsWith('/applications/')) return ['Application details', 'Deployments and configuration for this application']
  if (pathname.startsWith('/deployments/')) return ['Deployment details', 'Pipeline status and stage timeline']
  return ['DeployGuard', '']
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const [title, subtitle] = resolveTitle(location.pathname)

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-column">
        <Navbar title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/deployments" element={<Deployments />} />
            <Route path="/deployments/:id" element={<DeploymentDetail />} />
            <Route path="/environments" element={<Environments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
