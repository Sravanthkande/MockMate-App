"use client";

import { useEffect, useRef, useState } from 'react';

export default function VoiceCall({ 
  isActive, 
  onAudioMessage, 
  onCallEnd,
  aiResponse,
  role 
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const utteranceRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Start call timer
  useEffect(() => {
    if (isActive) {
      callStartTimeRef.current = Date.now();
      const interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  // Initialize audio context for volume visualization
  useEffect(() => {
    if (isActive && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
  }, [isActive]);

  // Auto-start listening when call becomes active
  useEffect(() => {
    if (isActive && !isListening && !isSpeaking) {
      startListening();
    }
  }, [isActive, isSpeaking]);

  // Handle AI response - speak it and then start listening again
  useEffect(() => {
    if (aiResponse && isActive) {
      console.log('🔊 VoiceCall: Received AI response, speaking:', aiResponse.substring(0, 50) + '...');
      speakResponse(aiResponse);
    }
  }, [aiResponse, isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup volume visualization
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        visualizeVolume();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Only send if there's actual audio data
        if (audioBlob.size > 100) {
          console.log('🎤 VoiceCall: Sending audio to API, size:', audioBlob.size);
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Audio = reader.result.split(',')[1];
            onAudioMessage(base64Audio, 'audio/webm');
          };
        } else {
          console.log('⚠️ VoiceCall: Audio too small, not sending');
        }

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsListening(true);

      // Auto-stop after 10 seconds (or when user stops speaking)
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopListening();
        }
      }, 10000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
    setVolume(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const visualizeVolume = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateVolume = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setVolume(Math.min(100, (average / 255) * 200));
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };

    updateVolume();
  };

  const speakResponse = (text) => {
    if (!text || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure voice
    utterance.rate = 1.1; // Slightly faster for natural conversation
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en-') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Natural'))
    ) || voices.find(voice => voice.lang.startsWith('en-'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsListening(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Automatically start listening again after AI finishes speaking
      if (isActive) {
        setTimeout(() => startListening(), 500);
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      if (isActive) {
        setTimeout(() => startListening(), 500);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleEndCall = () => {
    stopListening();
    window.speechSynthesis.cancel();
    onCallEnd();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 z-50 flex items-center justify-center">
      <div className="text-center text-white">
        {/* Call Status */}
        <div className="mb-8">
          <div className="text-6xl mb-4">
            {isSpeaking ? '🔊' : isListening ? '🎤' : '📞'}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {role ? `${role} Interview` : 'Voice Interview'}
          </h2>
          <p className="text-xl text-blue-200">
            {isSpeaking ? 'AI is speaking...' : isListening ? 'Listening...' : 'In call'}
          </p>
        </div>

        {/* Volume Visualizer */}
        {isListening && (
          <div className="mb-8 flex justify-center gap-2">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-green-400 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(10, Math.random() * volume)}px`,
                  opacity: volume > 10 ? 1 : 0.3
                }}
              />
            ))}
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="mb-8 flex justify-center gap-3">
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Call Duration */}
        <div className="text-2xl font-mono mb-8 text-blue-200">
          {formatDuration(callDuration)}
        </div>

        {/* Controls */}
        <div className="flex gap-6 justify-center">
          {/* Manual Stop/Start Listening */}
          {isListening ? (
            <button
              onClick={stopListening}
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-6 rounded-full shadow-lg transition-all transform hover:scale-110"
              title="Stop speaking"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            </button>
          ) : !isSpeaking && (
            <button
              onClick={startListening}
              className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-full shadow-lg transition-all transform hover:scale-110 animate-pulse"
              title="Start speaking"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="bg-red-500 hover:bg-red-600 text-white p-6 rounded-full shadow-lg transition-all transform hover:scale-110"
            title="End call"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-sm text-blue-200 max-w-md mx-auto">
          <p>💡 Speak naturally - the AI will respond automatically</p>
          <p className="mt-2">Press the microphone to speak, or it will auto-start after AI responds</p>
        </div>
      </div>
    </div>
  );
}

