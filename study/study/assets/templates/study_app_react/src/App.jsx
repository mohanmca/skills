import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SlideViewer from './components/SlideViewer.jsx';
import QuizEngine from './components/QuizEngine.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import Achievements from './components/Achievements.jsx';
import { STORE_KEY, MODULE_NAMES, SLIDES } from './data/sample-data.js';

function storageSet(key, value) {
  const json = JSON.stringify(value);
  try {
    localStorage.setItem(key, json);
  } catch {
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = key + '=' + encodeURIComponent(json) + '; expires=' + expires + '; path=/; SameSite=Strict';
  }
}

function storageGet(key) {
  try {
    const v = localStorage.getItem(key);
    if (v) return JSON.parse(v);
  } catch {}
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + key + '=([^;]*)'));
  if (match) {
    try { return JSON.parse(decodeURIComponent(match[1])); } catch {}
  }
  return null;
}

function loadProgress() {
  return storageGet(STORE_KEY) || {};
}

function saveProgress(p) {
  storageSet(STORE_KEY, p);
}

function updateStreak(p) {
  const today = new Date().toISOString().slice(0, 10);
  if (p.lastStudyDate === today) return p;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = p.lastStudyDate === yesterday ? (p.streakDays || 0) + 1 : 1;
  return { ...p, streakDays: streak, lastStudyDate: today };
}

function overallPercent(progress) {
  let completed = 0, total = 0;
  for (let i = 0; i < MODULE_NAMES.length; i++) {
    const modSlides = SLIDES.filter((s) => s.module === i);
    const seen = new Set(progress.modules?.['mod-' + i]?.seenSlides || []);
    completed += seen.size;
    total += modSlides.length;
  }
  return total ? Math.round((completed / total) * 100) : 0;
}

function Confetti() {
  const colors = ['#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight + 20,
            rotate: 720,
            opacity: 0,
          }}
          transition={{ duration: 1.5 + Math.random() * 1.5, ease: 'easeOut', delay: Math.random() * 0.5 }}
          style={{
            position: 'absolute',
            width: 6 + Math.random() * 8,
            height: 6 + Math.random() * 8,
            borderRadius: '50%',
            background: colors[Math.floor(Math.random() * colors.length)],
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(() => updateStreak(loadProgress()));
  const [showToc, setShowToc] = useState(false);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'slide'
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const saved = loadProgress();
    if (saved.lastSlide != null) {
      setIdx(saved.lastSlide);
      setView('slide');
    }
  }, []);

  useEffect(() => {
    const p = { ...progress, lastSlide: idx };
    setProgress(p);
    saveProgress(p);
  }, [idx]);

  const slide = SLIDES[idx];

  const go = useCallback(
    (n) => {
      setIdx(Math.max(0, Math.min(SLIDES.length - 1, n)));
      setView('slide');
    },
    []
  );

  const trackSlideSeen = useCallback(
    (slideIndex) => {
      const s = SLIDES[slideIndex];
      const modKey = 'mod-' + s.module;
      setProgress((prev) => {
        const mods = { ...(prev.modules || {}) };
        if (!mods[modKey]) mods[modKey] = { seenSlides: [] };
        if (!mods[modKey].seenSlides.includes(slideIndex)) {
          mods[modKey] = { ...mods[modKey], seenSlides: [...mods[modKey].seenSlides, slideIndex] };
        }
        return { ...prev, modules: mods, slidesSeen: Math.max(prev.slidesSeen || 0, mods[modKey].seenSlides.length) };
      });
    },
    []
  );

  useEffect(() => {
    if (view === 'slide') trackSlideSeen(idx);
  }, [idx, view, trackSlideSeen]);

  const handleAnswer = (qid, selected) => {
    const answered = { ...(progress.answered || {}), [qid]: { selected } };
    const failed = [...(progress.failed || [])];
    const q = SLIDES.flatMap((s) => s.questions || []).find((qq) => qq.id === qid);
    if (q && selected !== q.correctAnswer && !failed.includes(qid)) {
      failed.push(qid);
    }
    const recovered = { ...(progress.recovered || {}) };
    if (q && selected === q.correctAnswer) {
      recovered[qid] = true;
    }

    // Module score
    const moduleScores = { ...(progress.moduleScores || {}) };
    if (q) {
      const modKey = 'mod-' + SLIDES.find((s) => s.questions?.some((qq) => qq.id === qid))?.module;
      if (modKey) {
        const modQs = SLIDES.filter((sl) => sl.module === SLIDES.find((s) => s.questions?.some((qq) => qq.id === qid))?.module && sl.type === 'quiz').flatMap((sl) => sl.questions);
        const correct = modQs.filter((mq) => (answered[mq.id]?.selected) === mq.correctAnswer).length;
        moduleScores[modKey] = modQs.length ? Math.round((correct / modQs.length) * 100) : 0;
      }
    }

    const p = { ...progress, answered, failed, recovered, moduleScores };

    // Celebration check
    const s = SLIDES.find((sl) => sl.questions?.some((qq) => qq.id === qid));
    if (s) {
      const modKey = 'mod-' + s.module;
      const modSlides = SLIDES.filter((sl) => sl.module === s.module);
      const seen = new Set(p.modules?.[modKey]?.seenSlides || []);
      if (seen.size >= modSlides.length) {
        const celebrated = [...(progress.celebratedModules || [])];
        if (!celebrated.includes(modKey)) {
          celebrated.push(modKey);
          p.celebratedModules = celebrated;
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 3000);
        }
      }
    }

    setProgress(p);
    saveProgress(p);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (view !== 'slide') return;
      if (e.key === 'ArrowRight') go(idx + 1);
      if (e.key === 'ArrowLeft') go(idx - 1);
      if (e.key === 'Home') go(0);
      if (e.key === 'End') go(SLIDES.length - 1);
      if (e.key === 't') setShowToc((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, view, go]);

  const overall = overallPercent(progress);

  const Dashboard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '1.25rem',
        padding: '2rem',
        maxWidth: '700px',
        width: '100%',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        textAlign: 'center',
      }}
    >
      <h2 style={{ color: '#8b5cf6', fontSize: '2rem', marginBottom: '0.5rem' }}>📚 Your Study Deck</h2>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'linear-gradient(135deg, #f97316, #ef4444)',
          color: 'white',
          padding: '0.4rem 1rem',
          borderRadius: '999px',
          fontWeight: 700,
          fontSize: '0.95rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(239,68,68,0.25)',
        }}
      >
        🔥 {progress.streakDays || 0} day streak
      </div>
      <p style={{ color: '#64748b', fontSize: '0.95rem' }}>You're doing amazing! Keep it up!</p>
      <ProgressBar current={overall} total={100} label="Overall Progress" height={18} colorful />
      <Achievements progress={progress} />
      <h3 style={{ marginTop: '1.5rem', color: '#10b981' }}>📖 Your Modules</h3>
      <div style={{ textAlign: 'left', marginTop: '1rem' }}>
        {MODULE_NAMES.map((name, i) => {
          const modSlides = SLIDES.filter((s) => s.module === i);
          const seen = new Set(progress.modules?.['mod-' + i]?.seenSlides || []);
          const modPct = modSlides.length ? Math.round((seen.size / modSlides.length) * 100) : 0;
          return (
            <div
              key={i}
              onClick={() => {
                const firstIdx = SLIDES.findIndex((s) => s.module === i);
                go(firstIdx);
              }}
              style={{
                margin: '0.75rem 0',
                padding: '0.75rem 1rem',
                background: '#f8fafc',
                borderRadius: '0.75rem',
                borderLeft: '4px solid #06b6d4',
                cursor: 'pointer',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
            >
              <div style={{ fontWeight: 700 }}>{name}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {seen.size} / {modSlides.length} slides seen
              </div>
              <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginTop: '0.5rem' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${modPct}%`,
                    background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                    borderRadius: '999px',
                    transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff8f0', color: '#1e293b' }}>
      {celebrate && <Confetti />}
      <header
        style={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
          color: 'white',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(6,182,212,0.25)',
        }}
      >
        <button
          onClick={() => setShowToc((v) => !v)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0.55rem 0.75rem',
            cursor: 'pointer',
            color: 'white',
            fontSize: '1rem',
          }}
        >
          ☰
        </button>
        <h1 style={{ fontSize: '1.15rem', margin: 0, flex: 1, fontWeight: 700 }}>
          {view === 'dashboard' ? '📚 Study Deck' : MODULE_NAMES[slide?.module] || 'Study Deck'}
        </h1>
        <div style={{ width: '140px' }}>
          <div style={{ height: '10px', background: 'rgba(255,255,255,0.3)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: '#fff',
                width: `${view === 'dashboard' ? overall : ((idx + 1) / SLIDES.length) * 100}%`,
                transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </div>
        </div>
        <button
          onClick={() => setView('dashboard')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0.55rem 0.75rem',
            cursor: 'pointer',
            color: 'white',
            fontSize: '1rem',
          }}
        >
          🏠
        </button>
      </header>

      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {showToc && (
          <nav
            style={{
              width: '280px',
              background: '#ffffff',
              borderRight: '1px solid #e2e8f0',
              padding: '1rem',
              overflowY: 'auto',
              boxShadow: '4px 0 16px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: '0.95rem', color: '#8b5cf6' }}>📖 Your Journey</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li
                onClick={() => { setView('dashboard'); setShowToc(false); }}
                style={{
                  padding: '0.5rem 0.65rem',
                  borderRadius: '0.6rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  marginBottom: '0.25rem',
                  fontWeight: view === 'dashboard' ? 700 : 400,
                  background: view === 'dashboard' ? '#cffafe' : 'transparent',
                  color: view === 'dashboard' ? '#0e7490' : '#1e293b',
                }}
              >
                🏠 Dashboard
              </li>
              {SLIDES.map((s, i) => (
                <li
                  key={i}
                  onClick={() => { go(i); setShowToc(false); }}
                  style={{
                    padding: '0.5rem 0.65rem',
                    borderRadius: '0.6rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    marginBottom: '0.25rem',
                    fontWeight: i === idx && view === 'slide' ? 700 : 400,
                    background: i === idx && view === 'slide' ? '#cffafe' : 'transparent',
                    color: i === idx && view === 'slide' ? '#0e7490' : '#1e293b',
                  }}
                >
                  {i + 1}. {s.title}
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div
          style={{
            flex: 1,
            padding: '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AnimatePresence mode="wait">
            {view === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <Dashboard />
              </motion.div>
            ) : (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -12 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                {slide.type === 'quiz' ? (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '1.25rem',
                      padding: '2rem',
                      maxWidth: '900px',
                      width: '100%',
                      minHeight: '50vh',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                    }}
                  >
                    <h2 style={{ marginTop: 0, color: '#8b5cf6' }}>
                      📝 {slide.title}
                    </h2>
                    {slide.questions?.map((q) => (
                      <QuizEngine
                        key={q.id}
                        question={q}
                        answered={progress.answered?.[q.id]}
                        onAnswer={handleAnswer}
                      />
                    ))}
                  </div>
                ) : (
                  <SlideViewer slide={slide} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {view === 'slide' && (
        <footer
          style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={() => go(idx - 1)}
            disabled={idx === 0}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '0.55rem 0.75rem',
              cursor: 'pointer',
              opacity: idx === 0 ? 0.5 : 1,
              fontWeight: 600,
            }}
          >
            ← Back
          </button>
          <div style={{ flex: 1 }} />
          <span style={{ fontWeight: 700, color: '#8b5cf6' }}>
            {idx + 1} / {SLIDES.length}
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => go(idx + 1)}
            disabled={idx === SLIDES.length - 1}
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.55rem 0.75rem',
              cursor: 'pointer',
              opacity: idx === SLIDES.length - 1 ? 0.5 : 1,
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(6,182,212,0.25)',
            }}
          >
            Next →
          </button>
        </footer>
      )}
    </div>
  );
}
