import React from 'react';

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className || ''}`} style={style} />;
}

export function SkeletonRow({ delay = 0 }: { delay?: number }) {
  const s = (w: string | number, h = 10, extra = '') => (
    <div className="skeleton" style={{ width: w, height: h, animationDelay: `${delay}s` }} />
  );

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

export function MetricCardSkeleton() {
  return (
    <div className="metric-card">
      <div className="skeleton" style={{ width: '50%', height: 9, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '70%', height: 20 }} />
    </div>
  );
}
