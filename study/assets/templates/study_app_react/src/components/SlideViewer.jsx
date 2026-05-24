import React, { useRef, useEffect, useState } from 'react';
import CanvasMath from './CanvasMath.jsx';

let katexModule = null;
try {
  katexModule = await import('katex');
} catch {
  katexModule = null;
}

function FormulaBlock({ formula }) {
  const containerRef = useRef(null);
  const [katexFailed, setKatexFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !katexModule || katexFailed) return;
    try {
      katexModule.default.render(formula, containerRef.current, {
        throwOnError: false,
        displayMode: true,
      });
    } catch (e) {
      console.warn('KaTeX render failed, falling back to canvas', e);
      setKatexFailed(true);
    }
  }, [formula, katexFailed]);

  if (katexFailed || !katexModule) {
    return <CanvasMath formula={formula} />;
  }

  return (
    <div
      ref={containerRef}
      style={{
        margin: '1rem 0',
        padding: '1rem',
        background: '#f8fafc',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        overflowX: 'auto',
        textAlign: 'center',
      }}
    />
  );
}

export default function SlideViewer({ slide }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '900px',
      width: '100%',
      minHeight: '50vh',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    }}>
      <h2 style={{ marginTop: 0 }}>{slide.title}</h2>
      {(slide.content || []).map((c, i) => (
        <p key={i} style={{ lineHeight: 1.6 }}>{c}</p>
      ))}
      {slide.visualAssets?.map((a, i) => (
        <img key={i} src={a} alt="" style={{ maxWidth: '100%', borderRadius: '0.5rem', marginTop: '1rem' }} />
      ))}
      {slide.formula && <FormulaBlock formula={slide.formula} />}
      {slide.table && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr>
              {slide.table.columns.map((c, i) => (
                <th key={i} style={{ border: '1px solid #d1d5db', padding: '0.5rem', textAlign: 'left', background: '#e0e7ff' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slide.table.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} style={{ border: '1px solid #d1d5db', padding: '0.5rem' }}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {slide.speakerNotes && (
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#6b7280' }}>Speaker notes</summary>
          <p style={{ fontSize: '0.9rem', color: '#374151' }}>{slide.speakerNotes}</p>
        </details>
      )}
    </div>
  );
}
