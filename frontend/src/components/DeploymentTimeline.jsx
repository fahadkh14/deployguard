import React from 'react'

const STAGE_ICON = {
  success: '✓',
  failed: '✕',
  running: '●',
  pending: '',
}

export default function DeploymentTimeline({ stages }) {
  if (!stages || stages.length === 0) {
    return <div className="text-tertiary">No pipeline stages recorded for this deployment.</div>
  }

  return (
    <div className="pipeline-rail">
      {stages.map((stage, idx) => {
        const cls = stage.status.toLowerCase()
        const isLast = idx === stages.length - 1
        return (
          <React.Fragment key={stage.id}>
            <div className="pipeline-stage">
              <div className={`pipeline-node ${cls}`}>{STAGE_ICON[cls] || ''}</div>
              <div className="pipeline-stage-name">{stage.stageName}</div>
              {stage.durationText && (
                <div className="pipeline-stage-meta">{stage.durationText}</div>
              )}
              {stage.status === 'FAILED' && stage.message && (
                <div className="pipeline-stage-message">{stage.message}</div>
              )}
            </div>
            {!isLast && (
              <div className={`pipeline-connector ${stage.status === 'SUCCESS' ? 'done' : ''}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
