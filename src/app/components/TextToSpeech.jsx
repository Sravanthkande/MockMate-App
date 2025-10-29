"use client";

import { useEffect, useRef, useState } from 'react';

export default function TextToSpeech({ text, shouldSpeak, onSpeakingChange }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (!text || !shouldSpeak || typeof window === 'undefined') return;

    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure voice settings
    utterance.rate = 1.0; // Speed (0.1 to 10)
    utterance.pitch = 1.0; // Pitch (0 to 2)
    utterance.volume = 1.0; // Volume (0 to 1)

    // Try to use a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en-') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Natural'))
    ) || voices.find(voice => voice.lang.startsWith('en-'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      if (onSpeakingChange) onSpeakingChange(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (onSpeakingChange) onSpeakingChange(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      if (onSpeakingChange) onSpeakingChange(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);

    // Cleanup on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text, shouldSpeak, onSpeakingChange]);

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    if (onSpeakingChange) onSpeakingChange(false);
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  if (!isSpeaking && !isPaused) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2">
        {/* Speaking indicator */}
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
          <span className="text-sm text-gray-700">
            {isPaused ? 'Paused' : 'Speaking...'}
          </span>
        </div>

        {/* Control buttons */}
        <div className="flex gap-1 ml-2">
          {!isPaused ? (
            <button
              onClick={handlePause}
              className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
              title="Pause"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleResume}
              className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
              title="Resume"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          
          <button
            onClick={handleStop}
            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            title="Stop"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

