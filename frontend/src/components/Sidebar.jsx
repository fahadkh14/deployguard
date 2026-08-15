import React from 'react'
import { NavLink } from 'react-router-dom'
import { IconDashboard, IconApps, IconRocket, IconLayers, IconSettings, IconClose } from './Icons.jsx'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/applications', label: 'Applications', icon: IconApps },
  { to: '/deployments', label: 'Deployments', icon: IconRocket },
  { to: '/environments', label: 'Environments', icon: IconLayers },
  { to: '/settings', label: 'Settings', icon: IconSettings },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">DG</div>
          <div style={{ flex: 1 }}>
            <div className="sidebar-brand-text">DeployGuard</div>
            <div className="sidebar-brand-sub">deployment console</div>
          </div>
          <button className="btn btn-ghost btn-icon" style={{ display: open ? 'inline-flex' : 'none' }} onClick={onClose} aria-label="Close menu">
            <IconClose />
          </button>
        </div>
        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          DeployGuard v1.0.0
          <br />
          Self-service deployment platform
        </div>
      </aside>
    </>
  )
}
