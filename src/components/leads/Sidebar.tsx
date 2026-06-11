import React from 'react';

export function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-top" style={{ padding: '12px 12px 8px', borderBottom: '0.5px solid var(--crm-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: 'var(--r-sm)', background: 'var(--crm-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
          LB
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--crm-text-primary)' }}>LeadBajaar</div>
      </div>

      <div style={{ padding: '8px 8px 4px' }}>
        <div className="nav-item active"><i className="ti ti-layout-dashboard" aria-hidden="true" /> Dashboard</div>
        <div className="nav-item"><i className="ti ti-users" aria-hidden="true" /> Leads</div>
        <div className="nav-item"><i className="ti ti-message-circle" aria-hidden="true" /> Live Chat</div>
        <div className="nav-item"><i className="ti ti-robot" aria-hidden="true" /> Chatbot</div>
        <div className="nav-item"><i className="ti ti-calendar" aria-hidden="true" /> Meetings</div>
      </div>

      <div style={{ padding: '8px 8px 4px', borderTop: '0.5px solid var(--crm-border)', marginTop: 4 }}>
        <div className="section-label" style={{ padding: '0 6px 4px' }}>Integrations</div>
        <div className="nav-item"><i className="ti ti-puzzle" aria-hidden="true" /> Integrations</div>
        <div className="nav-item"><i className="ti ti-brand-whatsapp" aria-hidden="true" /> WhatsApp Bot</div>
      </div>
    </div>
  );
}
