import React, { useState } from 'react';

const FlashcardView = ({ flashcard, onRating }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rated, setRated] = useState(null);

  const handleRating = (rating) => {
    setRated(rating);
    onRating(flashcard.id, rating);
    // Reset after a delay if needed, or keep to show progress
  };

  return (
    <div className="slide-premium animate-fade-in" style={{ cursor: 'pointer', textAlign: 'center', marginBottom: '20px', minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }} onClick={() => setIsFlipped(!isFlipped)}>
      {!isFlipped ? (
        <div>
          <span className="badge" style={{ backgroundColor: 'var(--color-violet-light)', color: 'var(--color-violet)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', textTransform: 'uppercase' }}>FLASHCARD</span>
          <h3 style={{ marginTop: '20px' }}>{flashcard.front}</h3>
          <p style={{ color: '#666', fontSize: '0.8rem' }}>Tap to reveal answer</p>
        </div>
      ) : (
        <div>
          {rated ? (
            <div className="animate-bounce">
              <p style={{ fontSize: '1.5rem' }}>🚀</p>
              <p style={{ color: 'var(--color-emerald)', fontWeight: 'bold' }}>Scheduled as {rated}!</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>{flashcard.back}</p>
              <div className="rating-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                <button className="btn-primary" style={{ backgroundColor: 'var(--color-coral)' }} onClick={() => handleRating('hard')}>Hard</button>
                <button className="btn-primary" style={{ backgroundColor: 'var(--color-amber)' }} onClick={() => handleRating('good')}>Good</button>
                <button className="btn-primary" style={{ backgroundColor: 'var(--color-emerald)' }} onClick={() => handleRating('easy')}>Easy</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardView;
