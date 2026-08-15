// Lightweight inline SVG icons - avoids an extra dependency for a small,
// fixed set of icons used throughout the app.
import React from 'react'

const base = (props) => ({
  width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
  ...props,
})

export const IconDashboard = (props) => (
  <svg {...base(props)}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
)
export const IconApps = (props) => (
  <svg {...base(props)}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>
)
export const IconRocket = (props) => (
  <svg {...base(props)}><path d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-8 5-10Z" /><circle cx="12" cy="10" r="2" /><path d="M9 17l-3 4M15 17l3 4" /></svg>
)
export const IconLayers = (props) => (
  <svg {...base(props)}><path d="M12 2 2 8l10 6 10-6-10-6Z" /><path d="M2 14l10 6 10-6" /></svg>
)
export const IconSettings = (props) => (
  <svg {...base(props)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" /></svg>
)
export const IconPlus = (props) => (
  <svg {...base(props)}><path d="M12 5v14M5 12h14" /></svg>
)
export const IconAlert = (props) => (
  <svg {...base(props)}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4M12 17h.01" /></svg>
)
export const IconInbox = (props) => (
  <svg {...base(props)}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" /></svg>
)
export const IconBack = (props) => (
  <svg {...base(props)}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
)
export const IconGitBranch = (props) => (
  <svg {...base(props)}><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>
)
export const IconClock = (props) => (
  <svg {...base(props)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
export const IconTrash = (props) => (
  <svg {...base(props)}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" /></svg>
)
export const IconEdit = (props) => (
  <svg {...base(props)}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>
)
export const IconUndo = (props) => (
  <svg {...base(props)}><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-15-6.7L3 13" /></svg>
)
export const IconMenu = (props) => (
  <svg {...base(props)}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
)
export const IconClose = (props) => (
  <svg {...base(props)}><path d="M18 6 6 18M6 6l12 12" /></svg>
)
