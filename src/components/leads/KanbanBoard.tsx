import React from 'react';
import { Avatar } from './Helpers';

export function KanbanBoard({ columns }: { columns: { id: string; name: string; color: string; leads: any[] }[] }) {
  return (
    <div className="kanban-board">
      {columns.map(col => (
        <div key={col.id} className="kanban-col">
          <div className="kanban-col-header">
            <div className="kanban-col-dot" style={{ background: col.color }} />
            <div className="kanban-col-name">{col.name}</div>
            <div className="kanban-col-count">{col.leads.length}</div>
          </div>
          <div className="kanban-cards">
            {col.leads.map(lead => (
              <div key={lead.id} className="kanban-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="kanban-card-name">{lead.name}</div>
                    <div className="kanban-card-phone">{lead.phone}</div>
                  </div>
                  <Avatar name={lead.name} size="sm" />
                </div>
                <div className="kanban-card-date">{lead.createdAt}</div>
              </div>
            ))}
          </div>
          <div className="kanban-col-footer">
            <button className="kanban-add-btn">
              <i className="ti ti-plus" aria-hidden="true" /> Add lead
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
