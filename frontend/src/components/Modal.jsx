import React from 'react'
import { IconClose } from './Icons.jsx'

export default function Modal({ open, title, onClose, children, width = 480 }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="modal-title" style={{ marginBottom: 0 }}>{title}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <IconClose width={16} height={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
