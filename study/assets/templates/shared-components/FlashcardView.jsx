import React, { useState } from 'react';

const FlashcardView = ({ flashcard, onRating }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        <div className="front">
          <h3>{flashcard.front}</h3>
          <p className="hint">Tap to flip</p>
        </div>
        <div className="back">
          <p>{flashcard.back}</p>
          <div className="rating-buttons" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onRating(flashcard.id, 'hard')}>Hard</button>
            <button onClick={() => onRating(flashcard.id, 'good')}>Good</button>
            <button onClick={() => onRating(flashcard.id, 'easy')}>Easy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardView;
