import React from 'react'
import { IconMenu } from './Icons.jsx'

export default function Navbar({ title, subtitle, actions, onMenuClick }) {
  return (
    <>
      <div className="mobile-topbar">
        <button className="btn btn-ghost btn-icon" onClick={onMenuClick} aria-label="Open menu">
          <IconMenu />
        </button>
        <div className="topbar-title" style={{ fontSize: 15 }}>{title}</div>
        <div style={{ width: 34 }} />
      </div>
      <div className="topbar">
        <div>
          <div className="topbar-title">{title}</div>
          {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
        </div>
        <div className="topbar-actions">{actions}</div>
      </div>
    </>
  )
}
