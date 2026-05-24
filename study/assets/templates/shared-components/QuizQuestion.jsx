import React, { useState } from 'react';
import HintAccordion from './HintAccordion';

const QuizQuestion = ({ q }) => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="slide-premium" style={{ marginBottom: '20px', minHeight: 'auto' }}>
      <p style={{ fontWeight: 'bold' }}>{q.question}</p>
      <div className="options-grid" style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
        {q.options.map((opt, oi) => {
          let bgColor = 'white';
          let textColor = '#333';
          if (selected !== null) {
            if (oi === q.answer) {
              bgColor = 'var(--color-emerald)';
              textColor = 'white';
            } else if (oi === selected) {
              bgColor = 'var(--color-coral)';
              textColor = 'white';
            }
          }
          return (
            <button 
              key={oi} 
              className="btn-primary" 
              style={{ 
                textAlign: 'left', 
                backgroundColor: bgColor, 
                color: textColor, 
                border: '1px solid #ddd',
                transition: '0.3s',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }} 
              onClick={() => setSelected(oi)}
              disabled={selected !== null}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <p style={{ marginTop: '15px', color: selected === q.answer ? 'var(--color-emerald)' : 'var(--color-coral)', fontWeight: 'bold' }}>
          {selected === q.answer ? '🌟 Correct!' : '❌ Incorrect. Keep learning!'}
          <span style={{ display: 'block', fontWeight: 'normal', marginTop: '5px', fontSize: '0.9rem', color: '#666' }}>
            {q.explanation}
          </span>
        </p>
      )}
      <HintAccordion hints={q.hints} />
    </div>
  );
};

export default QuizQuestion;
