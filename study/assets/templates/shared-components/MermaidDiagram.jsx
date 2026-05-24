import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const MermaidDiagram = ({ definition }) => {
  const ref = useRef(null);
  const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    if (ref.current && definition) {
      try {
        mermaid.render(id, definition).then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        });
      } catch (e) {
        console.error('Mermaid render failed:', e);
        if (ref.current) {
          ref.current.innerHTML = '<p style="color:red">Diagram error: ' + e.message + '</p>';
        }
      }
    }
  }, [definition, id]);

  return (
    <div 
      ref={ref} 
      className="mermaid-container"
      style={{ 
        marginTop: '20px', 
        textAlign: 'center', 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
        overflowX: 'auto'
      }}
    >
      Loading diagram...
    </div>
  );
};

export default MermaidDiagram;
