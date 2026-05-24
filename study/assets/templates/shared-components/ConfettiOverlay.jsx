import React from 'react';
import { motion } from 'framer-motion';

const ConfettiOverlay = () => {
  return (
    <div className="confetti-overlay" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
      {/* Simplified confetti placeholder using framer-motion */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1 }}
          animate={{ y: window.innerHeight, opacity: 0 }}
          transition={{ duration: 2, delay: Math.random() * 0.5 }}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            backgroundColor: ['#f43f5e', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6'][i % 5],
            borderRadius: '50%'
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiOverlay;
