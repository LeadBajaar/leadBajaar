import React from 'react';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '0.5px solid var(--crm-border)'
    }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 500, color: 'var(--crm-text-primary)' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 11, color: 'var(--crm-text-tertiary)' }}>{subtitle}</p>}
      </div>
      {actions && (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
