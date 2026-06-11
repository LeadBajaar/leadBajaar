import React, { useState } from 'react';

export function Tabs({ tabs, active, onChange }: { tabs: { label: string; value: string }[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="tabs">
      {tabs.map(tab => (
        <div
          key={tab.value}
          className={`tab ${active === tab.value ? 'active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}
