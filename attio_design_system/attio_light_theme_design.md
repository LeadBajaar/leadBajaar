# LeadBajaar — Light Theme

## CSS Variables (add to `globals.css`)

```css
[data-theme="light"] {
  --attio-bg:           #f5f4f2;
  --attio-surface-1:    #ffffff;
  --attio-surface-2:    #f0efed;
  --attio-surface-3:    #e8e7e4;
  --attio-surface-4:    #dddcda;

  --attio-border:       rgba(0, 0, 0, 0.07);
  --attio-border-hover: rgba(0, 0, 0, 0.12);
  --attio-border-press: rgba(0, 0, 0, 0.18);

  --attio-text-primary:   #1a1a18;
  --attio-text-secondary: #5a5a56;
  --attio-text-tertiary:  #9a9a96;

  /* accent unchanged */
  --attio-accent:      #6b5ce7;
  --attio-accent-soft: rgba(107, 92, 231, 0.10);
  --attio-accent-border: rgba(107, 92, 231, 0.20);

  /* semantics — darker/more saturated for light bg */
  --attio-green:       #16a34a;
  --attio-green-soft:  rgba(22, 163, 74, 0.10);
  --attio-green-border: rgba(22, 163, 74, 0.20);

  --attio-amber:       #d97706;
  --attio-amber-soft:  rgba(217, 119, 6, 0.10);
  --attio-amber-border: rgba(217, 119, 6, 0.20);

  --attio-red:         #dc2626;
  --attio-red-soft:    rgba(220, 38, 38, 0.10);
  --attio-red-border:  rgba(220, 38, 38, 0.20);

  --attio-blue:        #2563eb;
  --attio-blue-soft:   rgba(37, 99, 235, 0.10);
  --attio-blue-border: rgba(37, 99, 235, 0.20);
}
```

---

## Tailwind Config — light mode extension

```js
// tailwind.config.js
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        attio: {
          // shared
          accent: '#6b5ce7',
          // light overrides
          'l-bg':   '#f5f4f2',
          'l-s1':   '#ffffff',
          'l-s2':   '#f0efed',
          'l-s3':   '#e8e7e4',
          'l-s4':   '#dddcda',
          'l-t1':   '#1a1a18',
          'l-t2':   '#5a5a56',
          'l-t3':   '#9a9a96',
          'l-green': '#16a34a',
          'l-amber': '#d97706',
          'l-red':   '#dc2626',
          'l-blue':  '#2563eb',
        }
      }
    }
  }
}
```

---

## Component Overrides (light-specific)

### Button — `btn-primary`
In dark mode: white bg + black text
In light mode: accent bg + white text

```css
/* Override for light */
[data-theme="light"] .btn-primary {
  background: var(--attio-accent);
  color: #ffffff;
}

[data-theme="light"] .btn-secondary {
  background: var(--attio-surface-1);
  color: var(--attio-text-primary);
  border: 0.5px solid var(--attio-border-hover);
}

[data-theme="light"] .btn-icon {
  background: var(--attio-surface-1);
  border: 0.5px solid var(--attio-border);
  color: var(--attio-text-secondary);
}

[data-theme="light"] .btn-icon[data-danger] {
  color: var(--attio-red);
  border-color: var(--attio-red-border);
}
```

### Badge — add border in light mode

```css
/* Dark badges have no border — light mode adds one */
[data-theme="light"] .badge-green {
  background: var(--attio-green-soft);
  color: var(--attio-green);
  border: 0.5px solid var(--attio-green-border);
}
[data-theme="light"] .badge-amber {
  background: var(--attio-amber-soft);
  color: var(--attio-amber);
  border: 0.5px solid var(--attio-amber-border);
}
[data-theme="light"] .badge-red {
  background: var(--attio-red-soft);
  color: var(--attio-red);
  border: 0.5px solid var(--attio-red-border);
}
[data-theme="light"] .badge-blue {
  background: var(--attio-blue-soft);
  color: var(--attio-blue);
  border: 0.5px solid var(--attio-blue-border);
}
[data-theme="light"] .badge-purple {
  background: var(--attio-accent-soft);
  color: var(--attio-accent);
  border: 0.5px solid var(--attio-accent-border);
}
[data-theme="light"] .badge-neutral {
  background: var(--attio-surface-2);
  color: var(--attio-text-secondary);
  border: 0.5px solid var(--attio-border);
}
```

### Input

```css
[data-theme="light"] .attio-input,
[data-theme="light"] .attio-textarea {
  background: var(--attio-surface-1);
  border: 0.5px solid var(--attio-border-hover);
  color: var(--attio-text-primary);
}
[data-theme="light"] .attio-input:focus,
[data-theme="light"] .attio-textarea:focus {
  border-color: rgba(107, 92, 231, 0.5);
}
```

### Skeleton

```css
/* Dark: surface-3 = #242424, Light: surface-3 = #e8e7e4 */
/* No extra CSS needed — .skeleton uses var(--attio-surface-3) */
/* which is automatically correct in both themes             */
.skeleton {
  background: var(--attio-surface-3);
}
```

### Dropdown + Modal

```css
[data-theme="light"] .dropdown-menu,
[data-theme="light"] .modal {
  background: var(--attio-surface-1);
  border: 0.5px solid var(--attio-border-hover);
}

[data-theme="light"] .dropdown-item:hover {
  background: var(--attio-surface-2);
}
```

### Toast

```css
[data-theme="light"] .toast {
  background: var(--attio-surface-1);
  border: 0.5px solid var(--attio-border-hover);
}
[data-theme="light"] .toast-success { border-left: 2.5px solid var(--attio-green); }
[data-theme="light"] .toast-error   { border-left: 2.5px solid var(--attio-red);   }
[data-theme="light"] .toast-warning { border-left: 2.5px solid var(--attio-amber); }
```

### Sidebar + Nav

```css
[data-theme="light"] .sidebar {
  background: var(--attio-surface-1);
  border-right: 0.5px solid var(--attio-border);
}
[data-theme="light"] .nav-item:hover,
[data-theme="light"] .nav-item.active {
  background: var(--attio-surface-2);
  color: var(--attio-text-primary);
}
/* Active icon gets accent color in light mode */
[data-theme="light"] .nav-item.active i {
  color: var(--attio-accent);
}
```

### Table

```css
[data-theme="light"] .attio-table th {
  background: var(--attio-surface-2);
  border-bottom: 0.5px solid var(--attio-border);
  color: var(--attio-text-tertiary);
}
[data-theme="light"] .attio-table tr:hover td {
  background: var(--attio-surface-2);
}
[data-theme="light"] .attio-table td {
  border-bottom: 0.5px solid var(--attio-border);
}
```

### Toggle

```css
/* on state same in both modes: accent bg + white thumb */
[data-theme="light"] .toggle.off {
  background: var(--attio-surface-3);
  border: 0.5px solid var(--attio-border-hover);
}
[data-theme="light"] .toggle.off .toggle-thumb {
  background: var(--attio-text-tertiary);
}
```

### Kanban

```css
[data-theme="light"] .kanban-col {
  background: var(--attio-surface-2);
  border: 0.5px solid var(--attio-border);
}
[data-theme="light"] .kanban-card {
  background: var(--attio-surface-1);
  border: 0.5px solid var(--attio-border);
}
[data-theme="light"] .kanban-add-btn {
  border: 0.5px dashed var(--attio-border);
}
[data-theme="light"] .kanban-add-btn:hover {
  border-color: var(--attio-border-hover);
}
```

---

## Theme Switcher Implementation

```tsx
/* useTheme.ts */
import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('lb-theme') as Theme) ?? 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lb-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return { theme, toggle };
}

/* ThemeToggle.tsx */
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="btn-icon" onClick={toggle} aria-label="Toggle theme">
      <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} aria-hidden="true" />
    </button>
  );
}
```

---

## Avatar Colors — same palette, adjusted for light bg

```ts
/* avatarColors.ts */
export const AVATAR_COLORS_LIGHT = [
  { bg: 'rgba(107,92,231,0.12)',  border: 'rgba(107,92,231,0.20)', color: '#6b5ce7' },
  { bg: 'rgba(22,163,74,0.12)',   border: 'rgba(22,163,74,0.20)',  color: '#16a34a' },
  { bg: 'rgba(217,119,6,0.12)',   border: 'rgba(217,119,6,0.20)',  color: '#d97706' },
  { bg: 'rgba(37,99,235,0.12)',   border: 'rgba(37,99,235,0.20)',  color: '#2563eb' },
  { bg: 'rgba(220,38,38,0.12)',   border: 'rgba(220,38,38,0.20)',  color: '#dc2626' },
];

export const AVATAR_COLORS_DARK = [
  { bg: 'rgba(107,92,231,0.15)', border: 'none', color: '#a89cf7' },
  { bg: 'rgba(62,207,142,0.12)', border: 'none', color: '#3ecf8e' },
  { bg: 'rgba(245,158,11,0.12)', border: 'none', color: '#f59e0b' },
  { bg: 'rgba(59,130,246,0.12)', border: 'none', color: '#3b82f6' },
  { bg: 'rgba(239,68,68,0.12)',  border: 'none', color: '#ef4444' },
];

export function getAvatarColor(name: string, theme: 'dark' | 'light') {
  const palette = theme === 'light' ? AVATAR_COLORS_LIGHT : AVATAR_COLORS_DARK;
  return palette[name.charCodeAt(0) % palette.length];
}
```

---

## Stage → Badge Color Map (light)

| Stage               | bg token              | border token          | text token        |
|---------------------|-----------------------|-----------------------|-------------------|
| Appointment Booked  | `--attio-green-soft`  | `--attio-green-border`| `--attio-green`   |
| Qualified           | `--attio-accent-soft` | `--attio-accent-border`| `--attio-accent` |
| In Progress         | `--attio-amber-soft`  | `--attio-amber-border`| `--attio-amber`   |
| Contacted           | `--attio-blue-soft`   | `--attio-blue-border` | `--attio-blue`    |
| Lost                | `--attio-red-soft`    | `--attio-red-border`  | `--attio-red`     |
| New Lead            | `--attio-surface-2`   | `--attio-border`      | `--attio-text-secondary` |

---

## Dark vs Light — full token diff

| Token              | Dark                       | Light                   |
|--------------------|----------------------------|-------------------------|
| `bg-base`          | `#0f0f0f`                  | `#f5f4f2`               |
| `surface-1`        | `#161616`                  | `#ffffff`               |
| `surface-2`        | `#1c1c1c`                  | `#f0efed`               |
| `surface-3`        | `#242424`                  | `#e8e7e4`               |
| `text-primary`     | `#e8e8e6`                  | `#1a1a18`               |
| `text-secondary`   | `#8a8a85`                  | `#5a5a56`               |
| `text-tertiary`    | `#5a5a56`                  | `#9a9a96`               |
| `border`           | `rgba(255,255,255,0.08)`   | `rgba(0,0,0,0.07)`      |
| `border-hover`     | `rgba(255,255,255,0.14)`   | `rgba(0,0,0,0.12)`      |
| `accent`           | `#6b5ce7` (same)           | `#6b5ce7` (same)        |
| `green`            | `#3ecf8e`                  | `#16a34a`               |
| `amber`            | `#f59e0b`                  | `#d97706`               |
| `red`              | `#ef4444`                  | `#dc2626`               |
| `blue`             | `#3b82f6`                  | `#2563eb`               |
| `btn-primary`      | white bg + black text      | accent bg + white text  |
| `badge border`     | none                       | 0.5px semantic at 20%α  |
| `skeleton bg`      | `#242424`                  | `#e8e7e4`               |
| `sidebar bg`       | `#161616`                  | `#ffffff`               |
| `active nav bg`    | `#242424`                  | `#f0efed`               |
| `active nav icon`  | text-primary color         | accent color            |
| `modal/dropdown bg`| `#1c1c1c`                  | `#ffffff`               |