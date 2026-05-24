import React from 'react';

const ACHIEVEMENTS = [
  { id: 'first-slide', title: 'Blast Off', emoji: '🚀', check: (p) => (p.slidesSeen || 0) > 0 },
  { id: 'first-quiz', title: 'First Steps', emoji: '👟', check: (p) => Object.keys(p.answered || {}).length > 0 },
  { id: 'streak-3', title: 'On Fire', emoji: '🔥', check: (p) => (p.streakDays || 0) >= 3 },
  { id: 'perfect', title: 'Star Student', emoji: '⭐', check: (p) => Object.values(p.moduleScores || {}).some((s) => s === 100) },
  { id: 'comeback', title: 'Comeback Kid', emoji: '🔄', check: (p) => Object.values(p.recovered || {}).some((v) => v) },
  { id: 'finished', title: 'Champion', emoji: '🏆', check: (p) => p.finishedExam },
];

export default function Achievements({ progress }) {
  const list = ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.check(progress) }));
  const unlocked = list.filter((a) => a.unlocked).length;

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 style={{ color: '#f43f5e', marginBottom: '0.75rem' }}>
        🏅 Achievements ({unlocked}/{list.length})
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '0.75rem',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {list.map((a) => (
          <div
            key={a.id}
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '1rem',
              textAlign: 'center',
              fontSize: '0.85rem',
              background: a.unlocked ? '#fef3c7' : '#f1f5f9',
              color: a.unlocked ? '#92400e' : '#94a3b8',
              border: `2px solid ${a.unlocked ? '#f59e0b' : 'transparent'}`,
              transform: a.unlocked ? 'scale(1.05)' : 'scale(1)',
              boxShadow: a.unlocked ? '0 4px 12px rgba(245,158,11,0.2)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.25rem' }}>{a.emoji}</span>
            {a.title}
          </div>
        ))}
      </div>
    </div>
  );
}
