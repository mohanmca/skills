import React, { useState } from 'react';

const HintAccordion = ({ hints }) => {
  const [visibleHints, setVisibleHints] = useState(0);

  return (
    <div className="hint-accordion">
      {hints.slice(0, visibleHints).map((hint, index) => (
        <div key={index} className="hint-item">
          <strong>Hint {index + 1}:</strong> {hint}
        </div>
      ))}
      {visibleHints < hints.length && (
        <button className="hint-toggle" onClick={() => setVisibleHints(visibleHints + 1)}>
          {visibleHints === 0 ? 'Need a hint?' : 'Next hint'}
        </button>
      )}
    </div>
  );
};

export default HintAccordion;
