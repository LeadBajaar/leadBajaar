import React from 'react';
import { Avatar } from './Helpers';

export function ActivityTimeline({ activities }: { activities: any[] }) {
  return (
    <div className="timeline">
      {activities.map((act, i) => (
        <div key={act.id} className="timeline-item">
          <div className="timeline-line" />
          {act.type === 'note' && (
            <div className="timeline-icon timeline-icon-note">
              <i className="ti ti-notes" aria-hidden="true" />
            </div>
          )}
          {act.type === 'call' && (
            <div className="timeline-icon timeline-icon-call">
              <i className="ti ti-phone" aria-hidden="true" />
            </div>
          )}
          {act.type === 'stage_change' && (
            <div className="timeline-icon timeline-icon-stage">
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </div>
          )}
          {act.type === 'created' && (
            <div className="timeline-icon timeline-icon-created">
              <i className="ti ti-plus" aria-hidden="true" />
            </div>
          )}

          <div className="timeline-body">
            <div className="timeline-title">{act.title}</div>
            <div className="timeline-meta">{act.timestamp} &bull; by {act.author}</div>
            {act.body && <div className="timeline-note-body">{act.body}</div>}
          </div>
        </div>
      ))}
      <div className="timeline-add">
        <textarea
          className="crm-textarea"
          rows={2}
          placeholder="Add a note or log an activity..."
        />
      </div>
    </div>
  );
}
