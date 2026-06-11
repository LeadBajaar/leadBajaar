# LeadBajaar — Missing Components (Part 2)

---

## 01 — Modal / Dialog

```css
/* globals.css */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal {
  background: var(--attio-surface-2);
  border: 0.5px solid var(--attio-border-hover);
  border-radius: var(--r-xl);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
}

.modal-sm { max-width: 360px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 0.5px solid var(--attio-border);
}
.modal-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--attio-text-primary);
}
.modal-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal-footer {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 0.5px solid var(--attio-border);
}
.modal-footer .btn { flex: 1; justify-content: center; }

/* Confirm / Danger dialog icon */
.modal-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.modal-icon-danger { background: var(--attio-red-soft); }
```

```tsx
/* AddLeadModal.tsx */
{isOpen && (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <span className="modal-title">Add New Lead</span>
        <button className="btn-icon" style={{ width: 24, height: 24, fontSize: 13 }} onClick={onClose}>
          <i className="ti ti-x" aria-label="close" />
        </button>
      </div>
      <div className="modal-body">
        <div className="field-wrap">
          <label className="field-label">Full Name</label>
          <input className="attio-input" placeholder="Rajesh Kumar" />
        </div>
        <div className="field-wrap">
          <label className="field-label">Phone</label>
          <input className="attio-input" placeholder="+91 98765 43210" style={{ fontFamily: 'monospace' }} />
        </div>
        <div className="field-wrap">
          <label className="field-label">Stage</label>
          <select className="attio-select">
            <option>New Lead</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Appointment Booked</option>
          </select>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost btn-xs" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-xs" onClick={onSave}>Save Lead</button>
      </div>
    </div>
  </div>
)}

/* DeleteConfirmModal.tsx */
{isOpen && (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
      <div className="modal-body">
        <div className="modal-icon modal-icon-danger">
          <i className="ti ti-trash" style={{ fontSize: 15, color: 'var(--attio-red)' }} aria-hidden="true" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--attio-text-primary)' }}>
          Delete Lead?
        </div>
        <div style={{ fontSize: 12, color: 'var(--attio-text-secondary)', lineHeight: 1.5 }}>
          {lead.name} will be permanently removed. This cannot be undone.
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost btn-xs" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-xs" onClick={onDelete}>Delete</button>
      </div>
    </div>
  </div>
)}
```

---

## 02 — Dropdown Menu / Popover

```css
/* globals.css */

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--attio-surface-2);
  border: 0.5px solid var(--attio-border-hover);
  border-radius: var(--r-lg);
  min-width: 180px;
  z-index: 50;
  overflow: hidden;
  padding: 4px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 10px;
  border-radius: var(--r-sm);
  font-size: 12px;
  color: var(--attio-text-primary);
  cursor: pointer;
  transition: background 0.1s;
}
.dropdown-item:hover           { background: var(--attio-surface-3); }
.dropdown-item.danger          { color: var(--attio-red); }
.dropdown-item.danger:hover    { background: var(--attio-red-soft); }
.dropdown-item i               { font-size: 14px; color: var(--attio-text-secondary); }
.dropdown-item.danger i        { color: var(--attio-red); }

.dropdown-divider {
  height: 0.5px;
  background: var(--attio-border);
  margin: 4px 0;
}

/* Stage picker variant */
.dropdown-search {
  padding: 8px 8px 4px;
}
.dropdown-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--r-sm);
  font-size: 12px;
  color: var(--attio-text-secondary);
  cursor: pointer;
  transition: background 0.1s;
}
.dropdown-option:hover    { background: var(--attio-surface-3); }
.dropdown-option.selected { color: var(--attio-text-primary); }
.dropdown-option-dot      { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
```

```tsx
/* RowActionMenu.tsx */
function RowActionMenu({ lead, onClose }) {
  return (
    <div className="dropdown-menu">
      <div className="dropdown-item" onClick={() => { onEdit(lead); onClose(); }}>
        <i className="ti ti-edit" aria-hidden="true" /> Edit lead
      </div>
      <div className="dropdown-item" onClick={() => { onStageChange(lead); onClose(); }}>
        <i className="ti ti-flag" aria-hidden="true" /> Change stage
      </div>
      <div className="dropdown-item" onClick={() => { onDuplicate(lead); onClose(); }}>
        <i className="ti ti-copy" aria-hidden="true" /> Duplicate
      </div>
      <div className="dropdown-divider" />
      <div className="dropdown-item danger" onClick={() => { onDelete(lead); onClose(); }}>
        <i className="ti ti-trash" aria-hidden="true" /> Delete lead
      </div>
    </div>
  );
}

/* StagePicker.tsx */
function StagePicker({ current, stages, onChange }) {
  const [query, setQuery] = useState('');
  const filtered = stages.filter(s => s.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="dropdown-menu" style={{ minWidth: 190 }}>
      <div className="dropdown-search">
        <input
          className="attio-input"
          placeholder="Search stages..."
          style={{ fontSize: 11, padding: '5px 8px' }}
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      <div style={{ padding: '0 4px 4px' }}>
        {filtered.map(stage => (
          <div
            key={stage.value}
            className={`dropdown-option ${current === stage.value ? 'selected' : ''}`}
            onClick={() => onChange(stage.value)}
          >
            <div className="dropdown-option-dot" style={{ background: stage.color }} />
            {stage.label}
            {current === stage.value && (
              <i className="ti ti-check" style={{ fontSize: 12, marginLeft: 'auto', color: stage.color }} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 03 — Tooltips

```css
/* globals.css */

.tooltip-wrap {
  position: relative;
  display: inline-flex;
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--attio-surface-3);
  border: 0.5px solid var(--attio-border-hover);
  border-radius: var(--r-sm);
  padding: 3px 8px;
  font-size: 11px;
  color: var(--attio-text-secondary);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 100;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid var(--attio-border-hover);
}

.tooltip-wrap:hover .tooltip { opacity: 1; }

.tooltip-danger {
  background: var(--attio-red-soft);
  border-color: rgba(239, 68, 68, 0.25);
  color: var(--attio-red);
}
.tooltip-danger::after {
  border-top-color: rgba(239, 68, 68, 0.25);
}
```

```tsx
/* Tooltip.tsx */
function Tooltip({ label, danger = false, children }) {
  return (
    <div className="tooltip-wrap">
      {children}
      <div className={`tooltip ${danger ? 'tooltip-danger' : ''}`}>
        {label}
      </div>
    </div>
  );
}

/* Usage in table row actions */
<div style={{ display: 'flex', gap: 5 }}>
  <Tooltip label="Edit lead">
    <button className="btn-icon btn-icon-sm" aria-label="Edit lead">
      <i className="ti ti-edit" aria-hidden="true" />
    </button>
  </Tooltip>
  <Tooltip label="Add note">
    <button className="btn-icon btn-icon-sm" aria-label="Add note">
      <i className="ti ti-message" aria-hidden="true" />
    </button>
  </Tooltip>
  <Tooltip label="Call lead">
    <button className="btn-icon btn-icon-sm" aria-label="Call lead">
      <i className="ti ti-phone" aria-hidden="true" />
    </button>
  </Tooltip>
  <Tooltip label="Delete" danger>
    <button className="btn-icon btn-icon-sm" style={{ color: 'var(--attio-red)' }} aria-label="Delete lead">
      <i className="ti ti-trash" aria-hidden="true" />
    </button>
  </Tooltip>
</div>
```

---

## 04 — Activity Timeline

```css
/* globals.css */

.timeline { display: flex; flex-direction: column; gap: 0; }

.timeline-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding-bottom: 16px;
  position: relative;
}

.timeline-item:not(:last-child) .timeline-line {
  position: absolute;
  left: 15px;
  top: 30px;
  bottom: 0;
  width: 0.5px;
  background: var(--attio-border);
}

.timeline-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}
.timeline-icon i { font-size: 13px; }

.timeline-icon-note  { background: var(--attio-blue-soft);  border: 0.5px solid rgba(59,130,246,0.2); }
.timeline-icon-note i  { color: var(--attio-blue); }
.timeline-icon-call  { background: var(--attio-amber-soft); border: 0.5px solid rgba(245,158,11,0.2); }
.timeline-icon-call i  { color: var(--attio-amber); }
.timeline-icon-stage { background: var(--attio-green-soft); border: 0.5px solid rgba(62,207,142,0.2); }
.timeline-icon-stage i { color: var(--attio-green); }
.timeline-icon-created { background: var(--attio-surface-3); border: 0.5px solid var(--attio-border); }
.timeline-icon-created i { color: var(--attio-text-tertiary); }

.timeline-body { flex: 1; padding-top: 4px; }
.timeline-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--attio-text-primary);
}
.timeline-meta {
  font-size: 11px;
  color: var(--attio-text-tertiary);
  margin-top: 2px;
}
.timeline-note-body {
  font-size: 12px;
  color: var(--attio-text-secondary);
  background: var(--attio-surface-2);
  border: 0.5px solid var(--attio-border);
  border-radius: var(--r-md);
  padding: 8px 10px;
  margin-top: 6px;
  line-height: 1.5;
}

.timeline-add {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 0.5px solid var(--attio-border);
}
```

```tsx
/* ActivityTimeline.tsx */
const ACTIVITY_ICONS = {
  note:    { class: 'timeline-icon-note',    icon: 'ti-message' },
  call:    { class: 'timeline-icon-call',    icon: 'ti-phone' },
  stage:   { class: 'timeline-icon-stage',   icon: 'ti-flag' },
  created: { class: 'timeline-icon-created', icon: 'ti-user-plus' },
};

function ActivityTimeline({ activities, onAddNote }) {
  const [note, setNote] = useState('');
  return (
    <div>
      <div className="timeline">
        {activities.map((item, i) => {
          const meta = ACTIVITY_ICONS[item.type];
          return (
            <div className="timeline-item" key={i}>
              <div className="timeline-line" />
              <div className={`timeline-icon ${meta.class}`}>
                <i className={`ti ${meta.icon}`} aria-hidden="true" />
              </div>
              <div className="timeline-body">
                <div className="timeline-title"
                  dangerouslySetInnerHTML={{ __html: item.title }} />
                {item.body && (
                  <div className="timeline-note-body">"{item.body}"</div>
                )}
                <div className="timeline-meta">
                  {item.date} {item.by ? `· by ${item.by}` : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="timeline-add">
        <input
          className="attio-input"
          placeholder="Add a note..."
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && note.trim()) {
              onAddNote(note);
              setNote('');
            }
          }}
        />
      </div>
    </div>
  );
}
```

---

## 05 — Tabs

```css
/* globals.css */

.tabs {
  display: flex;
  border-bottom: 0.5px solid var(--attio-border);
}

.tab {
  padding: 10px 14px;
  font-size: 13px;
  color: var(--attio-text-secondary);
  cursor: pointer;
  border-bottom: 1.5px solid transparent;
  margin-bottom: -0.5px;
  transition: color 0.12s, border-color 0.12s;
  white-space: nowrap;
}
.tab:hover  { color: var(--attio-text-primary); }
.tab.active {
  font-weight: 500;
  color: var(--attio-text-primary);
  border-bottom-color: var(--attio-accent);
}
```

```tsx
/* Tabs.tsx */
function Tabs({ tabs, active, onChange }) {
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

/* Usage in LeadProfile.tsx */
const LEAD_TABS = [
  { label: 'Details',  value: 'details'  },
  { label: 'Activity', value: 'activity' },
  { label: 'Files',    value: 'files'    },
  { label: 'Payments', value: 'payments' },
];

const [activeTab, setActiveTab] = useState('details');

<Tabs tabs={LEAD_TABS} active={activeTab} onChange={setActiveTab} />
{activeTab === 'details'  && <LeadDetails lead={lead} />}
{activeTab === 'activity' && <ActivityTimeline activities={lead.activities} />}
{activeTab === 'files'    && <LeadFiles lead={lead} />}
{activeTab === 'payments' && <LeadPayments lead={lead} />}
```

---

## 06 — Kanban / Board View

```css
/* globals.css */

.kanban-board {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
  align-items: flex-start;
}

.kanban-col {
  background: var(--attio-surface-2);
  border: 0.5px solid var(--attio-border);
  border-radius: var(--r-lg);
  overflow: hidden;
  min-height: 200px;
}

.kanban-col.drag-over {
  border-color: var(--attio-accent);
  background: var(--attio-accent-soft);
}

.kanban-col-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 0.5px solid var(--attio-border);
}
.kanban-col-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.kanban-col-name { font-size: 12px; font-weight: 500; color: var(--attio-text-secondary); }
.kanban-col-count {
  margin-left: auto;
  font-size: 10px;
  background: var(--attio-surface-3);
  border: 0.5px solid var(--attio-border);
  border-radius: var(--r-pill);
  padding: 1px 7px;
  color: var(--attio-text-tertiary);
}

.kanban-cards { padding: 8px; display: flex; flex-direction: column; gap: 6px; }

.kanban-card {
  background: var(--attio-surface-1);
  border: 0.5px solid var(--attio-border);
  border-radius: var(--r-md);
  padding: 10px;
  cursor: grab;
  transition: opacity 0.15s, border-color 0.15s;
}
.kanban-card:active { cursor: grabbing; }
.kanban-card.dragging { opacity: 0.4; }
.kanban-card-name { font-size: 12px; font-weight: 500; color: var(--attio-text-primary); margin-bottom: 3px; }
.kanban-card-phone { font-size: 10px; color: var(--attio-text-tertiary); font-family: monospace; }
.kanban-card-date  { font-size: 10px; color: var(--attio-text-tertiary); margin-top: 4px; }

.kanban-add-btn {
  width: 100%;
  background: transparent;
  border: 0.5px dashed var(--attio-border);
  border-radius: var(--r-md);
  padding: 7px;
  font-size: 11px;
  color: var(--attio-text-tertiary);
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s;
}
.kanban-add-btn:hover {
  border-color: var(--attio-border-hover);
  color: var(--attio-text-secondary);
}

.kanban-col-footer { padding: 6px 8px 8px; }
```

```tsx
/* KanbanBoard.tsx */
const STAGE_COLORS = {
  'New Lead':           '#5a5a56',
  'Contacted':          '#3b82f6',
  'In Progress':        '#f59e0b',
  'Qualified':          '#a89cf7',
  'Appointment Booked': '#3ecf8e',
  'Lost':               '#ef4444',
};

function KanbanBoard({ stages, leads, onStageChange, onAddLead }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const leadsByStage = stages.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.stage === s);
    return acc;
  }, {});

  return (
    <div className="kanban-board">
      {stages.map(stage => (
        <div
          key={stage}
          className={`kanban-col ${dragOver === stage ? 'drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(stage); }}
          onDragLeave={() => setDragOver(null)}
          onDrop={() => {
            if (dragging) onStageChange(dragging.id, stage);
            setDragging(null);
            setDragOver(null);
          }}
          style={{
            borderColor: dragOver === stage
              ? STAGE_COLORS[stage]
              : leadsByStage[stage].length > 0
                ? `${STAGE_COLORS[stage]}26`
                : undefined
          }}
        >
          <div className="kanban-col-header">
            <div className="kanban-col-dot" style={{ background: STAGE_COLORS[stage] }} />
            <div className="kanban-col-name" style={leadsByStage[stage].length > 0 ? { color: STAGE_COLORS[stage] } : {}}>
              {stage}
            </div>
            <div className="kanban-col-count">{leadsByStage[stage].length}</div>
          </div>
          <div className="kanban-cards">
            {leadsByStage[stage].map(lead => (
              <div
                key={lead.id}
                className={`kanban-card ${dragging?.id === lead.id ? 'dragging' : ''}`}
                draggable
                onDragStart={() => setDragging(lead)}
                onDragEnd={() => setDragging(null)}
              >
                <div className="kanban-card-name">{lead.name}</div>
                <div className="kanban-card-phone">{lead.phone}</div>
                <div className="kanban-card-date">{lead.createdAt}</div>
              </div>
            ))}
          </div>
          <div className="kanban-col-footer">
            <button className="kanban-add-btn" onClick={() => onAddLead(stage)}>
              <i className="ti ti-plus" style={{ fontSize: 12 }} aria-hidden="true" /> Add lead
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 07 — Toast Notifications

```css
/* globals.css */

.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 300;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--attio-surface-2);
  border: 0.5px solid var(--attio-border-hover);
  border-radius: var(--r-lg);
  padding: 11px 14px;
  width: 340px;
  pointer-events: all;
  animation: toast-in 0.2s ease;
}
.toast.toast-exit { animation: toast-out 0.2s ease forwards; }

.toast-success { border-color: rgba(62,207,142,0.25);  border-left: 2.5px solid var(--attio-green); }
.toast-error   { border-color: rgba(239,68,68,0.25);   border-left: 2.5px solid var(--attio-red); }
.toast-warning { border-color: rgba(245,158,11,0.25);  border-left: 2.5px solid var(--attio-amber); }
.toast-info    { border-color: var(--attio-border-hover); border-left: 2.5px solid var(--attio-text-tertiary); }

.toast-icon    { font-size: 16px; flex-shrink: 0; }
.toast-success .toast-icon { color: var(--attio-green); }
.toast-error   .toast-icon { color: var(--attio-red); }
.toast-warning .toast-icon { color: var(--attio-amber); }
.toast-info    .toast-icon { color: var(--attio-text-secondary); }

.toast-title   { font-size: 13px; font-weight: 500; color: var(--attio-text-primary); }
.toast-body    { font-size: 11px; color: var(--attio-text-secondary); }
.toast-dismiss { width: 22px; height: 22px; margin-left: auto; flex-shrink: 0; }

@keyframes toast-in  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes toast-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(8px); } }
```

```tsx
/* useToast.ts */
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast { id: string; type: ToastType; title: string; body?: string; }

const TOAST_ICONS = {
  success: 'ti-circle-check',
  error:   'ti-alert-circle',
  warning: 'ti-alert-triangle',
  info:    'ti-info-circle',
};
const TOAST_DURATION = { success: 4000, info: 4000, warning: 6000, error: 0 };

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

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

/* Usage */
const { toast, ToastContainer } = useToast();

const handleSave = async () => {
  try {
    await saveLead(data);
    toast.success('Lead created', 'Rajesh Kumar was added successfully.');
  } catch {
    toast.error('Save failed', 'Something went wrong. Please try again.');
  }
};

<ToastContainer />
```

---

## 08 — Skeleton / Loading States

```css
/* globals.css */

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}

.skeleton {
  background: var(--attio-surface-3);
  border-radius: 3px;
  animation: pulse 1.5s ease-in-out infinite;
}
.skeleton-circle { border-radius: 50%; }
.skeleton-pill   { border-radius: var(--r-pill); }
```

```tsx
/* SkeletonRow.tsx */
function SkeletonRow({ delay = 0 }: { delay?: number }) {
  const s = (w: string, h = 10, extra = '') =>
    <div className="skeleton" style={{ width: w, height: h, animationDelay: `${delay}s` }} />;

  return (
    <tr>
      <td><div className="skeleton" style={{ width: 14, height: 14, borderRadius: 3, animationDelay: `${delay}s` }} /></td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="skeleton skeleton-circle" style={{ width: 26, height: 26, flexShrink: 0, animationDelay: `${delay}s` }} />
          <div style={{ flex: 1 }}>
            {s('55%', 11)}
            <div style={{ marginTop: 5 }}>{s('40%', 9)}</div>
          </div>
        </div>
      </td>
      <td>{s('80px')}</td>
      <td><div className="skeleton skeleton-pill" style={{ width: 80, height: 20, animationDelay: `${delay}s` }} /></td>
      <td>{s('60px')}</td>
      <td>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0,1,2].map(i => <div key={i} className="skeleton" style={{ width: 24, height: 24, borderRadius: 5, animationDelay: `${delay}s` }} />)}
        </div>
      </td>
    </tr>
  );
}

/* LeadsTable.tsx — loading state */
{isLoading
  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} delay={i * 0.15} />)
  : leads.map(lead => <LeadRow key={lead.id} lead={lead} />)
}

/* MetricCardSkeleton.tsx */
function MetricCardSkeleton() {
  return (
    <div className="metric-card">
      <div className="skeleton" style={{ width: '50%', height: 9, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '70%', height: 20 }} />
    </div>
  );
}
```

---

## 09 — Toggle · Checkbox · Radio

```css
/* globals.css */

/* --- Toggle --- */
.toggle-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.toggle-label-wrap .toggle-label { font-size: 13px; color: var(--attio-text-primary); }
.toggle-label-wrap .toggle-desc  { font-size: 11px; color: var(--attio-text-tertiary); margin-top: 1px; }

.toggle {
  width: 40px;
  height: 22px;
  border-radius: var(--r-pill);
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.toggle.on  { background: var(--attio-accent); }
.toggle.off { background: var(--attio-surface-3); border: 0.5px solid var(--attio-border-hover); }

.toggle-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  transition: left 0.15s ease;
}
.toggle.on  .toggle-thumb { left: 20px; background: var(--attio-text-primary); }
.toggle.off .toggle-thumb { left: 2px;  background: var(--attio-text-tertiary); }

/* --- Checkbox --- */
.checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s;
}
.checkbox.unchecked     { background: transparent; border: 0.5px solid var(--attio-border-hover); }
.checkbox.checked       { background: var(--attio-accent); border: 0.5px solid var(--attio-accent); }
.checkbox.indeterminate { background: var(--attio-accent-soft); border: 0.5px solid rgba(107,92,231,0.4); }

.checkbox-bar { width: 8px; height: 2px; background: var(--attio-accent); border-radius: 1px; }

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}
.checkbox-row-label { font-size: 13px; color: var(--attio-text-primary); }
.checkbox-row.disabled { opacity: 0.45; pointer-events: none; }

/* --- Radio --- */
.radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s;
}
.radio.unchecked { background: transparent; border: 0.5px solid var(--attio-border-hover); }
.radio.checked   { background: var(--attio-accent); border: 0.5px solid var(--attio-accent); }
.radio-dot       { width: 6px; height: 6px; border-radius: 50%; background: #fff; }
```

```tsx
/* Toggle.tsx */
function Toggle({ on, onChange, label, description }: {
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

/* Checkbox.tsx */
function Checkbox({ state, onChange }: {
  state: 'checked' | 'unchecked' | 'indeterminate'; onChange: () => void;
}) {
  return (
    <div className={`checkbox ${state}`} onClick={onChange}>
      {state === 'checked'       && <i className="ti ti-check" style={{ fontSize: 11, color: '#fff' }} aria-hidden="true" />}
      {state === 'indeterminate' && <div className="checkbox-bar" />}
    </div>
  );
}

/* Radio.tsx */
function Radio({ checked, onChange, label }: {
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
```

---

## 10 — Textarea + Note Input

```css
/* globals.css */

.attio-textarea {
  background: var(--attio-surface-2);
  border: 0.5px solid var(--attio-border);
  border-radius: var(--r-md);
  padding: 7px 10px;
  font-size: 13px;
  font-family: inherit;
  color: var(--attio-text-primary);
  outline: none;
  width: 100%;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.12s;
  min-height: 72px;
}
.attio-textarea:focus       { border-color: rgba(107, 92, 231, 0.5); }
.attio-textarea::placeholder { color: var(--attio-text-tertiary); }
.attio-textarea.no-resize   { resize: none; }

/* Toolbar below textarea */
.note-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.note-toolbar-actions { display: flex; gap: 4px; }

/* Chat message composer (textarea inside card) */
.message-composer {
  background: var(--attio-surface-2);
  border: 0.5px solid var(--attio-border);
  border-radius: var(--r-md);
  overflow: hidden;
}
.message-composer textarea {
  background: transparent;
  border: none;
  border-radius: 0;
  resize: none;
}
.message-composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-top: 0.5px solid var(--attio-border);
}
```

```tsx
/* NoteInput.tsx */
function NoteInput({ onSave }: { onSave: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div>
      <textarea
        className="attio-textarea"
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

/* WhatsAppComposer.tsx */
function WhatsAppComposer({ onSend }: { onSend: (msg: string) => void }) {
  const [msg, setMsg] = useState('');
  return (
    <div className="message-composer">
      <textarea
        className="attio-textarea no-resize"
        rows={2}
        placeholder="Type a WhatsApp message..."
        value={msg}
        onChange={e => setMsg(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey && msg.trim()) {
            e.preventDefault();
            onSend(msg);
            setMsg('');
          }
        }}
      />
      <div className="message-composer-footer">
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn-icon btn-icon-sm" aria-label="Attach file">
            <i className="ti ti-paperclip" aria-hidden="true" />
          </button>
          <button className="btn-icon btn-icon-sm" aria-label="Emoji">
            <i className="ti ti-mood-smile" aria-hidden="true" />
          </button>
        </div>
        <button
          className="btn btn-primary btn-xs"
          disabled={!msg.trim()}
          onClick={() => { onSend(msg); setMsg(''); }}
        >
          <i className="ti ti-send" style={{ fontSize: 11 }} aria-hidden="true" /> Send
        </button>
      </div>
    </div>
  );
}
```

---

## Component File Structure (updated)

```
app/
└── components/
    ├── ui/
    │   ├── Modal.tsx            ← modal-backdrop + modal + modal-sm
    │   ├── Dropdown.tsx         ← dropdown-menu + RowActionMenu + StagePicker
    │   ├── Tooltip.tsx          ← tooltip-wrap + tooltip variants
    │   ├── Tabs.tsx             ← tabs + tab + active indicator
    │   ├── Toggle.tsx           ← toggle on/off
    │   ├── Checkbox.tsx         ← checked/unchecked/indeterminate
    │   ├── Radio.tsx            ← radio button
    │   ├── NoteInput.tsx        ← textarea + toolbar
    │   ├── WhatsAppComposer.tsx ← message-composer
    │   └── Toast/
    │       ├── useToast.ts      ← push/dismiss logic + ToastContainer
    │       └── ToastContainer.tsx
    ├── leads/
    │   ├── ActivityTimeline.tsx ← timeline + timeline-item types
    │   ├── KanbanBoard.tsx      ← kanban-board + drag-drop
    │   └── LeadProfile.tsx      ← tabs → Details / Activity / Files / Payments
    └── skeleton/
        ├── SkeletonRow.tsx      ← table row skeleton
        └── MetricCardSkeleton.tsx
```