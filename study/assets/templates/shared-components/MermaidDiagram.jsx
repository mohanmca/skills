import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const MermaidDiagram = ({ definition }) => {
  const ref = useRef(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: 'forest' });
    if (ref.current) {
      mermaid.contentLoaded();
    }
  }, [definition]);

  return (
    <div className="mermaid-diagram">
      <div className="mermaid" ref={ref}>
        {definition}
      </div>
    </div>
  );
};

export default MermaidDiagram;
