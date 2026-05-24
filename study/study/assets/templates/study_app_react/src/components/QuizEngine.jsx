import React, { useState } from 'react';
import EncouragementToast from './EncouragementToast.jsx';

export default function QuizEngine({ question, onAnswer, answered }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (opt) => {
    if (answered) return;
    setSelected(opt);
    onAnswer(question.id, opt);
  };

  const isCorrect = answered?.selected === question.correctAnswer;

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
        <span
          style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            background:
              question.difficulty === 'easy'
                ? '#d1fae5'
                : question.difficulty === 'medium'
                ? '#fef3c7'
                : '#fee2e2',
            color:
              question.difficulty === 'easy'
                ? '#065f46'
                : question.difficulty === 'medium'
                ? '#92400e'
                : '#991b1b',
          }}
        >
          {question.difficulty}
        </span>{' '}
        {question.concept}
      </p>
      <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.4 }}>{question.question}</p>
      <div style={{ marginTop: '1rem' }}>
        {question.options.map((opt) => {
          const status = answered
            ? opt === question.correctAnswer
              ? 'correct'
              : answered.selected === opt
              ? 'wrong'
              : ''
            : '';
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={!!answered}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                margin: '0.6rem 0',
                padding: '1rem',
                border: `2px solid ${
                  status === 'correct'
                    ? '#10b981'
                    : status === 'wrong'
                    ? '#f43f5e'
                    : selected === opt
                    ? '#06b6d4'
                    : '#e2e8f0'
                }`,
                borderRadius: '1rem',
                background:
                  status === 'correct'
                    ? '#d1fae5'
                    : status === 'wrong'
                    ? '#ffe4e6'
                    : '#ffffff',
                cursor: answered ? 'default' : 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                transform: status === 'correct' ? 'scale(1.01)' : 'none',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <>
          <EncouragementToast type={isCorrect ? 'correct' : 'wrong'} visible={true} />
          <div
            style={{
              marginTop: '0.5rem',
              padding: '1rem',
              borderRadius: '1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem',
              lineHeight: 1.5,
            }}
          >
            {question.explanation}
          </div>
        </>
      )}
    </div>
  );
}
