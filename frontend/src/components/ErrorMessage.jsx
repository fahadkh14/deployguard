import React from 'react'
import { IconAlert, IconInbox } from './Icons.jsx'

export function ErrorMessage({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state-block">
      <IconAlert className="state-block-icon" />
      <div className="state-block-title">{title}</div>
      <div className="state-block-desc">{message || 'Please try again in a moment.'}</div>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>Try again</button>
      )}
    </div>
  )
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="state-block">
      <IconInbox className="state-block-icon" />
      <div className="state-block-title">{title}</div>
      {message && <div className="state-block-desc">{message}</div>}
      {action}
    </div>
  )
}

export default ErrorMessage
