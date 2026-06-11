import React from 'react';

export function MetricCard({ label, value, trend, trendUp }: { label: string; value: string; trend?: string; trendUp?: boolean }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {trend && (
        <div className={trendUp ? 'metric-up' : 'metric-down'}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      )}
    </div>
  );
}
