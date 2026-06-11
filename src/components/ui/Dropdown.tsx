import React, { useState } from 'react';

export function Dropdown({ children, isOpen, onClose, minWidth = 180 }: { children: React.ReactNode; isOpen: boolean; onClose: () => void; minWidth?: number }) {
  if (!isOpen) return null;
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={onClose} />
      <div className="dropdown-menu" style={{ minWidth }}>
        {children}
      </div>
    </>
  );
}

export function DropdownItem({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <div className={`dropdown-item ${danger ? 'danger' : ''}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function DropdownDivider() {
  return <div className="dropdown-divider" />;
}

export function DropdownSearch({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (val: string) => void; placeholder?: string }) {
  return (
    <div className="dropdown-search">
      <input
        className="attio-input"
        placeholder={placeholder}
        style={{ fontSize: 11, padding: '5px 8px' }}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus
      />
    </div>
  );
}

export function DropdownOption({ label, color, selected, onClick }: { label: string; color?: string; selected?: boolean; onClick: () => void }) {
  return (
    <div className={`dropdown-option ${selected ? 'selected' : ''}`} onClick={onClick}>
      {color && <div className="dropdown-option-dot" style={{ background: color }} />}
      {label}
      {selected && color && (
        <i className="ti ti-check" style={{ fontSize: 12, marginLeft: 'auto', color }} aria-hidden="true" />
      )}
    </div>
  );
}
