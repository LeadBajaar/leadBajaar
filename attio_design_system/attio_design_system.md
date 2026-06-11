# LeadBajaar → Attio Design System Migration

## Context
This is a Next.js 14 + Tailwind CSS CRM called LeadBajaar. Redesign the entire UI to match Attio's aesthetic (dark, minimal, dense data tables, monospace details, pill badges).

---

## Step 1: Add CSS Variables to `globals.css`

```css
:root {
  --attio-bg: #0f0f0f;
  --attio-surface-1: #161616;
  --attio-surface-2: #1c1c1c;
  --attio-surface-3: #242424;
  --attio-surface-4: #2e2e2e;
  --attio-border: rgba(255, 255, 255, 0.08);
  --attio-border-hover: rgba(255, 255, 255, 0.14);
  --attio-text-primary: #e8e8e6;
  --attio-text-secondary: #8a8a85;
  --attio-text-tertiary: #5a5a56;
  --attio-accent: #6b5ce7;
  --attio-accent-soft: rgba(107, 92, 231, 0.15);
  --attio-green: #3ecf8e;
  --attio-green-soft: rgba(62, 207, 142, 0.12);
  --attio-amber: #f59e0b;
  --attio-amber-soft: rgba(245, 158, 11, 0.12);
  --attio-red: #ef4444;
  --attio-red-soft: rgba(239, 68, 68, 0.12);
  --attio-blue: #3b82f6;
  --attio-blue-soft: rgba(59, 130, 246, 0.12);

  --r-xs: 3px;
  --r-sm: 5px;
  --r-md: 7px;
  --r-lg: 10px;
  --r-xl: 14px;
  --r-pill: 99px;
}

body {
  background: var(--attio-bg);
  color: var(--attio-text-primary);
  font-family: -apple-system, 'SF Pro Text', sans-serif;
  font-size: 13px;
  line-height: 1.5;
}
```

---

## Step 2: Add to `tailwind.config.js`

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        attio: {
          bg: '#0f0f0f',
          's1': '#161616',
          's2': '#1c1c1c',
          's3': '#242424',
          's4': '#2e2e2e',
          accent: '#6b5ce7',
          green: '#3ecf8e',
          amber: '#f59e0b',
          red: '#ef4444',
          blue: '#3b82f6',
          't1': '#e8e8e6',
          't2': '#8a8a85',
          't3': '#5a5a56',
        }
      },
      borderRadius: {
        'attio-xs': '3px',
        'attio-sm': '5px',
        'attio-md': '7px',
        'attio-lg': '10px',
        'attio-xl': '14px',
      },
      fontSize: {
        'label': ['10px', { fontWeight: '600', letterSpacing: '0.10em', textTransform: 'uppercase' }],
        'body-sm': ['11px', '1.5'],
        'body-md': ['12px', '1.5'],
        'body-lg': ['13px', '1.5'],
        'heading-sm': ['14px', { fontWeight: '500' }],
        'heading-lg': ['16px', { fontWeight: '500' }],
        'display': ['22px', { fontWeight: '500', letterSpacing: '-0.02em' }],
      },
      borderWidth: {
        'thin': '0.5px',
      }
    }
  }
}
```

---

## Step 3: Reusable Component Classes (add to `globals.css`)

```css
/* --- Buttons --- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--r-md);
  font-size: 13px;
  font-weight: 500;
  padding: 7px 13px;
  border: none;
  cursor: pointer;
  transition: background 0.12s, opacity 0.12s;
  white-space: nowrap;
}
.btn-primary  { background: #e8e8e6; color: #0f0f0f; }
.btn-secondary { background: var(--attio-surface-3); color: var(--attio-text-primary); border: 0.5px solid var(--attio-border-hover); }
.btn-ghost    { background: transparent; color: var(--attio-text-secondary); border: 0.5px solid var(--attio-border); }
.btn-danger   { background: var(--attio-red-soft); color: var(--attio-red); border: 0.5px solid rgba(239,68,68,0.25); }
.btn-xs       { padding: 4px 9px; font-size: 11px; border-radius: var(--r-sm); }
.btn-icon {
  width: 28px; height: 28px; padding: 0;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: var(--r-sm);
  background: var(--attio-surface-3);
  border: 0.5px solid var(--attio-border);
  color: var(--attio-text-secondary);
  cursor: pointer;
  font-size: 14px;
}
.btn-icon-sm { width: 24px; height: 24px; font-size: 12px; }

/* --- Badges / Stage Pills --- */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--r-pill);
  font-size: 11px;
  font-weight: 500;
}
.badge-dot { width: 6px; height: 6px; border-radius: 50%; }

.badge-green   { background: var(--attio-green-soft);  color: var(--attio-green); }
.badge-amber   { background: var(--attio-amber-soft);  color: var(--attio-amber); }
.badge-red     { background: var(--attio-red-soft);    color: var(--attio-red); }
.badge-blue    { background: var(--attio-blue-soft);   color: var(--attio-blue); }
.badge-purple  { background: var(--attio-accent-soft); color: #a89cf7; }
.badge-neutral { background: var(--attio-surface-3);   color: var(--attio-text-secondary); border: 0.5px solid var(--attio-border); }

/* --- Inputs --- */
.attio-input {
  background: var(--attio-surface-2);
  border: 0.5px solid var(--attio-border);
  border-radius: var(--r-md);
  padding: 7px 10px;
  font-size: 13px;
  color: var(--attio-text-primary);
  outline: none;
  width: 100%;
  transition: border-color 0.12s;
}
.attio-input:focus  { border-color: rgba(107, 92, 231, 0.5); }
.attio-input::placeholder { color: var(--attio-text-tertiary); }

/* --- Cards --- */
.card {
  background: var(--attio-surface-1);
  border: 0.5px solid var(--attio-border);
  border-radius: var(--r-xl);
  padding: 16px;
}
.card-sm { border-radius: var(--r-lg); padding: 12px 14px; }

/* --- Section Label --- */
.section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--attio-text-tertiary);
  margin-bottom: 12px;
}

/* --- Filter Pills --- */
.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--attio-surface-2);
  border: 0.5px solid var(--attio-border-hover);
  border-radius: var(--r-pill);
  padding: 4px 10px;
  font-size: 12px;
  color: var(--attio-text-secondary);
  cursor: pointer;
}
.filter-pill.active {
  background: var(--attio-accent-soft);
  border-color: rgba(107, 92, 231, 0.3);
  color: #a89cf7;
}

/* --- Table --- */
.attio-table { width: 100%; border-collapse: collapse; }
.attio-table th {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--attio-text-tertiary);
  padding: 8px 12px;
  text-align: left;
  background: var(--attio-surface-2);
  border-bottom: 0.5px solid var(--attio-border);
}
.attio-table td {
  padding: 9px 12px;
  font-size: 12px;
  color: var(--attio-text-primary);
  border-bottom: 0.5px solid var(--attio-border);
  vertical-align: middle;
}
.attio-table tr:hover td { background: var(--attio-surface-2); }
.attio-table tr:last-child td { border-bottom: none; }

/* --- Avatar --- */
.avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 600;
  flex-shrink: 0;
}
.avatar-lg { width: 36px; height: 36px; font-size: 12px; }

/* --- Sidebar --- */
.sidebar {
  width: 220px;
  background: var(--attio-surface-1);
  border-right: 0.5px solid var(--attio-border);
  height: 100vh;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--r-sm);
  font-size: 12px;
  color: var(--attio-text-secondary);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}
.nav-item:hover, .nav-item.active {
  background: var(--attio-surface-3);
  color: var(--attio-text-primary);
}

/* --- Metric Card --- */
.metric-card {
  background: var(--attio-surface-1);
  border: 0.5px solid var(--attio-border);
  border-radius: var(--r-lg);
  padding: 12px 14px;
}
.metric-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--attio-text-tertiary);
  margin-bottom: 6px;
}
.metric-value { font-size: 20px; font-weight: 500; color: var(--attio-text-primary); }
.metric-up    { font-size: 10px; color: var(--attio-green); margin-top: 3px; }
.metric-down  { font-size: 10px; color: var(--attio-red);   margin-top: 3px; }
```

---

## Step 4: Stage → Badge Color Mapping

Apply this mapping everywhere a stage label appears:

| Stage Name          | Badge Class     |
|---------------------|-----------------|
| Appointment Booked  | `badge-green`   |
| Qualified           | `badge-purple`  |
| In Progress         | `badge-amber`   |
| Contacted           | `badge-blue`    |
| Lost                | `badge-red`     |
| New Lead            | `badge-neutral` |

---

## Step 5: Avatar Color Cycling

Generate avatar bg/text color from lead name initial:

```js
const AVATAR_COLORS = [
  { bg: 'rgba(107,92,231,0.15)',  color: '#a89cf7' }, // purple
  { bg: 'rgba(62,207,142,0.12)',  color: '#3ecf8e' }, // green
  { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' }, // amber
  { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' }, // blue
  { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' }, // red
];

export function getAvatarColor(name: string) {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
```

---

## Step 6: Layout Structure

```
app/
├── layout.tsx          ← dark bg, sidebar wrapper
├── leads/
│   └── page.tsx        ← page header + filter bar + table
└── components/
    ├── Sidebar.tsx      ← nav-item list, 220px fixed
    ├── PageHeader.tsx   ← title + subtitle + right-side actions
    ├── FilterBar.tsx    ← filter-pill row
    ├── LeadsTable.tsx   ← attio-table with avatar + badge
    ├── StageBadge.tsx   ← maps stage string → badge class
    ├── Avatar.tsx       ← initials + getAvatarColor()
    └── MetricCard.tsx   ← metric-card layout
```

---

## Step 7: Leads Table Row JSX Pattern

```tsx
<tr>
  <td><input type="checkbox" /></td>
  <td>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Avatar name={lead.name} size="sm" />
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--attio-text-primary)' }}>
          {lead.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--attio-text-tertiary)', fontFamily: 'monospace' }}>
          {lead.phone}
        </div>
      </div>
    </div>
  </td>
  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{lead.phone}</td>
  <td><StageBadge stage={lead.stage} /></td>
  <td style={{ color: 'var(--attio-text-secondary)', fontSize: 11 }}>{lead.createdAt}</td>
  <td>
    <div style={{ display: 'flex', gap: 5 }}>
      <button className="btn-icon btn-icon-sm">✏</button>
      <button className="btn-icon btn-icon-sm">💬</button>
      <button className="btn-icon btn-icon-sm" style={{ color: 'var(--attio-red)' }}>🗑</button>
    </div>
  </td>
</tr>
```

> Replace emoji with Tabler icons: `<i className="ti ti-edit" />`

---

## Step 8: Page Header JSX Pattern

```tsx
<div style={{
  display: 'flex', alignItems: 'center',
  padding: '16px 24px',
  borderBottom: '0.5px solid var(--attio-border)'
}}>
  <div>
    <h1 style={{ fontSize: 16, fontWeight: 500, color: 'var(--attio-text-primary)' }}>Leads</h1>
    <p style={{ fontSize: 11, color: 'var(--attio-text-tertiary)' }}>Manage and track your leads</p>
  </div>
  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
    <button className="btn btn-ghost btn-xs">Columns</button>
    <button className="btn btn-ghost btn-xs">Export</button>
    <button className="btn btn-ghost btn-xs">Import</button>
    <button className="btn btn-ghost btn-xs">Sync Leads</button>
    <button className="btn btn-primary btn-xs">+ Add Lead</button>
  </div>
</div>
```

---

## Design Rules (apply everywhere)

- All borders: `0.5px solid var(--attio-border)` — never 1px
- Border radius on cards: `var(--r-xl)` (14px)
- Border radius on buttons/inputs: `var(--r-md)` (7px)
- Border radius on badges: `var(--r-pill)` (99px)
- Font weight: only `400` or `500` — never 600/700 on body text
- Section labels: always `10px / 600 / uppercase / letter-spacing: 0.10em`
- Phone numbers: always `font-family: monospace`
- Action buttons in table rows: `btn-icon btn-icon-sm` (24×24px)
- Primary action always rightmost in toolbar
- Icons: Tabler outline only — import from `@tabler/icons-react`