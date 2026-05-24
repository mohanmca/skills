import React, { useState } from 'react';

const SpeechTrigger = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  return (
    <button className={`speech-btn ${isSpeaking ? 'active' : ''}`} onClick={speak}>
      {isSpeaking ? '🔊 Speaking...' : '🔈 Read Aloud'}
    </button>
  );
};

export default SpeechTrigger;
