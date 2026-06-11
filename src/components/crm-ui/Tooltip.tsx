import React from 'react';

export function Tooltip({ label, danger = false, children }: { label: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <div className="tooltip-wrap">
      {children}
      <div className={`tooltip ${danger ? 'tooltip-danger' : ''}`}>
        {label}
      </div>
    </div>
  );
}
