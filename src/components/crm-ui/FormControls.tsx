import React, { useState } from 'react';

export function Toggle({ on, onChange, label, description }: {
  on: boolean; onChange: (v: boolean) => void; label: string; description?: string;
}) {
  return (
    <div className="toggle-wrap">
      <div className="toggle-label-wrap">
        <div className="toggle-label">{label}</div>
        {description && <div className="toggle-desc">{description}</div>}
      </div>
      <div className={`toggle ${on ? 'on' : 'off'}`} onClick={() => onChange(!on)}>
        <div className="toggle-thumb" />
      </div>
    </div>
  );
}

export function Checkbox({ state, onChange }: {
  state: 'checked' | 'unchecked' | 'indeterminate'; onChange: () => void;
}) {
  return (
    <div className={`checkbox ${state}`} onClick={onChange}>
      {state === 'checked'       && <i className="ti ti-check" style={{ fontSize: 11, color: '#fff' }} aria-hidden="true" />}
      {state === 'indeterminate' && <div className="checkbox-bar" />}
    </div>
  );
}

export function Radio({ checked, onChange, label }: {
  checked: boolean; onChange: () => void; label: string;
}) {
  return (
    <div className="checkbox-row" onClick={onChange}>
      <div className={`radio ${checked ? 'checked' : 'unchecked'}`}>
        {checked && <div className="radio-dot" />}
      </div>
      <span className="checkbox-row-label">{label}</span>
    </div>
  );
}

export function NoteInput({ onSave }: { onSave: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div>
      <textarea
        className="crm-textarea"
        rows={3}
        placeholder="Write a note about this lead..."
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <div className="note-toolbar">
        <div className="note-toolbar-actions">
          {[
            ['ti-bold',   'bold'],
            ['ti-italic', 'italic'],
            ['ti-link',   'link'],
            ['ti-at',     'mention'],
          ].map(([icon, label]) => (
            <button key={label} className="btn-icon btn-icon-sm" aria-label={label}>
              <i className={`ti ${icon}`} aria-hidden="true" />
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary btn-xs"
          disabled={!text.trim()}
          onClick={() => { onSave(text); setText(''); }}
        >
          Save note
        </button>
      </div>
    </div>
  );
}
