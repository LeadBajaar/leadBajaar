import React from 'react';

export function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    'Appointment Booked': 'badge-green',
    'Qualified': 'badge-purple',
    'In Progress': 'badge-amber',
    'Contacted': 'badge-blue',
    'Lost': 'badge-red',
    'New Lead': 'badge-neutral',
  };
  const badgeClass = map[stage] || 'badge-neutral';
  return (
    <span className={`badge ${badgeClass}`}>
      <div className="badge-dot" />
      {stage}
    </span>
  );
}

const AVATAR_COLORS = [
  { bg: 'rgba(107,92,231,0.15)',  color: '#a89cf7' }, // purple
  { bg: 'rgba(62,207,142,0.12)',  color: '#3ecf8e' }, // green
  { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' }, // amber
  { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' }, // blue
  { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' }, // red
];

export function getAvatarColor(name: string) {
  if (!name) return AVATAR_COLORS[0];
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getInitials(name: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
  const { bg, color } = getAvatarColor(name);
  const initials = getInitials(name);
  return (
    <div className={`avatar ${size === 'lg' ? 'avatar-lg' : ''}`} style={{ background: bg, color }}>
      {initials}
    </div>
  );
}
