import React, { useState } from 'react';

const FlashcardView = ({ flashcard, onRating }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="slide-premium animate-fade-in" style={{ cursor: 'pointer', textAlign: 'center', marginBottom: '20px', minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsFlipped(!isFlipped)}>
      {!isFlipped ? (
        <div>
          <span className="badge" style={{ backgroundColor: 'var(--color-violet-light)', color: 'var(--color-violet)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', textTransform: 'uppercase' }}>FLASHCARD</span>
          <h3 style={{ marginTop: '20px' }}>{flashcard.front}</h3>
          <p style={{ color: '#666', fontSize: '0.8rem' }}>Tap to reveal answer</p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>{flashcard.back}</p>
          <div className="rating-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
            <button className="btn-primary" style={{ backgroundColor: 'var(--color-coral)' }} onClick={() => onRating(flashcard.id, 'hard')}>Hard</button>
            <button className="btn-primary" style={{ backgroundColor: 'var(--color-amber)' }} onClick={() => onRating(flashcard.id, 'good')}>Good</button>
            <button className="btn-primary" style={{ backgroundColor: 'var(--color-emerald)' }} onClick={() => onRating(flashcard.id, 'easy')}>Easy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardView;
