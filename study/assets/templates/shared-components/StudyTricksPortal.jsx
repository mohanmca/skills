import React, { useState } from 'react';

const StudyTricksPortal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const tricks = [
    { title: "1. Active Recall + Blind Writing", text: "Close the book and write what you remember without looking. Why: retrieval makes memory stronger than rereading.", color: "var(--color-coral)" },
    { title: "2. Spaced Repetition", text: "Revise after gaps: 10 mins, 1 day, 3 days, 1 week. Why: spacing fights forgetting.", color: "var(--color-teal)" },
    { title: "3. Blurting Method", text: "Blurt out everything you know on a blank page, then check what you missed. Why: shows your strengths and weaknesses.", color: "var(--color-amber)" },
    { title: "4. Teach-Back Method", text: "Explain the topic simply to a friend or even a toy! Why: teaching forces the brain to organize ideas.", color: "var(--color-emerald)" },
    { title: "5. Draw From Memory", text: "Look at a diagram, close it, and redraw it. Why: pictures + words = stronger recall paths.", color: "var(--color-violet)" },
    { title: "6. Memory Palace", text: "Place facts inside imaginary rooms in your house. Why: the brain is great at remembering locations.", color: "var(--color-coral)" },
    { title: "7. Chunking", text: "Break large info into small meaningful groups (like phone numbers). Why: easier for working memory to hold.", color: "var(--color-teal)" },
    { title: "8. Mixed Practice", text: "Mix different types of problems instead of doing one type. Why: trains the brain to choose the right method.", color: "var(--color-amber)" }
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'var(--gradient-header)',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 100,
          transition: 'transform 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Study Tricks"
      >
        💡
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="slide-premium animate-fade-in" style={{ 
            maxWidth: '600px', 
            maxHeight: '90vh', 
            overflowY: 'auto', 
            position: 'relative',
            background: 'var(--color-bg)'
          }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h2 style={{ color: 'var(--color-violet)', textAlign: 'center', marginBottom: '20px' }}>🚀 8 Super Study Tricks</h2>
            <p style={{ fontSize: '0.9rem', textAlign: 'center', marginBottom: '20px', color: '#666' }}>
              Based on research by Pooja K. Agarwal, Ph.D.
            </p>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {tricks.map((trick, i) => (
                <div key={i} style={{ 
                  padding: '15px', 
                  borderRadius: '12px', 
                  background: 'white', 
                  borderLeft: `6px solid ${trick.color}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <h4 style={{ margin: '0 0 5px 0', color: trick.color }}>{trick.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>{trick.text}</p>
                </div>
              ))}
            </div>
            
            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '20px' }}
              onClick={() => setIsOpen(false)}
            >
              Got it, let's study!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StudyTricksPortal;
