import React from 'react';

export default function ProgressBar({ current, total, label, height = 10, colorful = false }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      {label && (
        <div style={{ fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 600, color: '#475569' }}>
          {label}
        </div>
      )}
      <div
        style={{
          height: `${height}px`,
          background: '#e2e8f0',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: colorful
              ? 'linear-gradient(90deg, #06b6d4, #10b981)'
              : '#06b6d4',
            transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            borderRadius: '999px',
          }}
        />
      </div>
      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem', fontWeight: 600 }}>
        {pct}%
      </div>
    </div>
  );
}
