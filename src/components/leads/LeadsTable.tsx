import React from 'react';
import { Avatar, StageBadge } from './Helpers';

export function LeadsTable({ leads }: { leads: any[] }) {
  return (
    <table className="crm-table">
      <thead>
        <tr>
          <th style={{ width: 40 }}><input type="checkbox" /></th>
          <th>Name</th>
          <th>Phone</th>
          <th>Stage</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {leads.map(lead => (
          <tr key={lead.id}>
            <td><input type="checkbox" /></td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={lead.name} size="sm" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--crm-text-primary)' }}>
                    {lead.name}
                  </div>
                </div>
              </div>
            </td>
            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{lead.phone}</td>
            <td><StageBadge stage={lead.stage} /></td>
            <td style={{ color: 'var(--crm-text-secondary)', fontSize: 11 }}>{lead.createdAt}</td>
            <td>
              <div style={{ display: 'flex', gap: 5 }}>
                <button className="btn-icon btn-icon-sm" aria-label="Edit"><i className="ti ti-edit" aria-hidden="true" /></button>
                <button className="btn-icon btn-icon-sm" aria-label="Chat"><i className="ti ti-message" aria-hidden="true" /></button>
                <button className="btn-icon btn-icon-sm" style={{ color: 'var(--crm-red)' }} aria-label="Delete"><i className="ti ti-trash" aria-hidden="true" /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
