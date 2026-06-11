import React from 'react';

export function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function Modal({ children, size = 'default' }: { children: React.ReactNode; size?: 'default' | 'sm' }) {
  return (
    <div className={`modal ${size === 'sm' ? 'modal-sm' : ''}`}>
      {children}
    </div>
  );
}

export function ModalHeader({ title, onClose }: { title: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-header">
      <span className="modal-title">{title}</span>
      <button className="btn-icon" style={{ width: 24, height: 24, fontSize: 13 }} onClick={onClose}>
        <i className="ti ti-x" aria-label="close" />
      </button>
    </div>
  );
}

export function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="modal-body">{children}</div>;
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="modal-footer">{children}</div>;
}

export function ModalIcon({ type = 'danger', icon = 'ti-trash' }: { type?: 'danger', icon?: string }) {
  return (
    <div className={`modal-icon modal-icon-${type}`}>
      <i className={`ti ${icon}`} style={{ fontSize: 15, color: 'var(--attio-red)' }} aria-hidden="true" />
    </div>
  );
}
