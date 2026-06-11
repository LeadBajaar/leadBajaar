import React, { useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface ToastData { id: string; type: ToastType; title: string; body?: string; }

const TOAST_ICONS = {
  success: 'ti-circle-check',
  error:   'ti-alert-circle',
  warning: 'ti-alert-triangle',
  info:    'ti-info-circle',
};

const TOAST_DURATION = { success: 4000, info: 4000, warning: 6000, error: 0 };

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const push = (type: ToastType, title: string, body?: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, title, body }]);
    const dur = TOAST_DURATION[type];
    if (dur > 0) setTimeout(() => dismiss(id), dur);
  };

  const dismiss = (id: string) =>
    setToasts(prev => prev.filter(t => t.id !== id));

  const toast = {
    success: (title: string, body?: string) => push('success', title, body),
    error:   (title: string, body?: string) => push('error',   title, body),
    warning: (title: string, body?: string) => push('warning', title, body),
    info:    (title: string, body?: string) => push('info',    title, body),
  };

  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <i className={`ti ${TOAST_ICONS[t.type]} toast-icon`} aria-hidden="true" />
          <div>
            <div className="toast-title">{t.title}</div>
            {t.body && <div className="toast-body">{t.body}</div>}
          </div>
          <button className="btn-icon toast-dismiss" onClick={() => dismiss(t.id)}>
            <i className="ti ti-x" aria-label="dismiss" />
          </button>
        </div>
      ))}
    </div>
  );

  return { toast, ToastContainer };
}
