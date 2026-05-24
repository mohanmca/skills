import React, { useEffect, useState } from 'react';

const MESSAGES = {
  correct: ['🌟 Great job!', '💪 You\'re getting stronger!', '🎯 Nailed it!', '🚀 Keep going!', '🎉 That\'s the spirit!', '✨ You\'re a star!'],
  wrong: ['💡 Nice try — here\'s why…', '🌱 Every mistake helps you grow!', '🔍 Let\'s figure this out together.', '✅ Almost there! Check this out…'],
};

export default function EncouragementToast({ type, visible }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (visible && type) {
      const pool = MESSAGES[type] || MESSAGES.correct;
      setMessage(pool[Math.floor(Math.random() * pool.length)]);
    }
  }, [visible, type]);

  if (!visible || !message) return null;

  const isCorrect = type === 'correct';
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderRadius: '1rem',
        margin: '1rem 0',
        fontWeight: 700,
        fontSize: '1.05rem',
        animation: 'slideUp 0.4s ease',
        background: isCorrect ? '#d1fae5' : '#fef3c7',
        border: `2px solid ${isCorrect ? '#10b981' : '#f59e0b'}`,
        color: isCorrect ? '#065f46' : '#92400e',
      }}
    >
      {message}
    </div>
  );
}
