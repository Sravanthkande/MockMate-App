'use client';

import { useState, useEffect } from 'react';
import InterviewSetup from './components/InterviewSetup';
import ChatWindow from './components/ChatWindow';
import AudioRecorder from './components/AudioRecorder';
import TextToSpeech from './components/TextToSpeech';
import VoiceCall from './components/VoiceCall';
import { callInterviewAPI } from './lib/gemini';

export default function HomePage() {
  const [role, setRole] = useState('Software Engineer');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [history, setHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [pendingAIResponse, setPendingAIResponse] = useState(null);

  // Start the interview when setup is complete
  useEffect(() => {
    if (isSetupComplete && history.length === 0) {
      startInterview();
    }
  }, [isSetupComplete]);

  const startInterview = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await callInterviewAPI([], role);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      const aiMessage = {
        role: 'model',
        parts: [{ text: result.text }]
      };
      
      setHistory([aiMessage]);
    } catch (err) {
      setError('Failed to start interview. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (audioData = null, mimeType = null) => {
    if ((!userInput.trim() && !audioData) || isLoading) return;

    const userMessage = {
      role: 'user',
      parts: audioData ? [{
        inline_data: {
          mime_type: mimeType,
          data: audioData
        }
      }] : [{ text: userInput.trim() }]
    };

    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        history: newHistory,
        role: role,
        audioMode: isAudioMode || isInCall // Enable audio mode for voice calls
      };

      if (audioData) {
        payload.audioData = audioData;
        payload.mimeType = mimeType;
      }

      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError(result.error || 'Failed to get response');
        return;
      }

      const aiMessage = {
        role: 'model',
        parts: [{ text: result.text }]
      };

      setHistory([...newHistory, aiMessage]);

      // If in voice call mode, set response for voice call to speak
      if (isInCall) {
        console.log('📞 Voice Call: Got AI response, setting for speech:', result.text.substring(0, 50) + '...');
        // Clear previous response first, then set new one to trigger useEffect
        setPendingAIResponse(null);
        setTimeout(() => {
          setPendingAIResponse(result.text);
        }, 100);
      }
      // Otherwise, if audio mode is enabled, trigger text-to-speech
      else if (result.shouldSpeak || isAudioMode) {
        setCurrentSpeech({
          text: result.text,
          shouldSpeak: true
        });
      }
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setIsSetupComplete(false);
    setHistory([]);
    setUserInput('');
    setError(null);
  };

  const handleAudioRecorded = (audioData, mimeType) => {
    handleSendMessage(audioData, mimeType);
  };

  const handleStartVoiceCall = () => {
    setIsInCall(true);
    setIsAudioMode(true);
  };

  const handleEndVoiceCall = () => {
    setIsInCall(false);
    setPendingAIResponse(null);
  };

  const handleVoiceCallAudioMessage = (audioData, mimeType) => {
    console.log('📞 Voice Call: Received audio from user, sending to API...');
    // Clear previous AI response
    setPendingAIResponse(null);
    // Send audio message
    handleSendMessage(audioData, mimeType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Voice Call Overlay */}
      <VoiceCall
        isActive={isInCall}
        onAudioMessage={handleVoiceCallAudioMessage}
        onCallEnd={handleEndVoiceCall}
        aiResponse={pendingAIResponse}
        role={role}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            MockMate AI
          </h1>
          <p className="text-gray-600 text-lg">
            Your AI-Powered Interview Practice Partner
          </p>
        </header>

        {/* Setup or Interview Interface */}
        {!isSetupComplete ? (
          <InterviewSetup
            role={role}
            setRole={setRole}
            setIsSetupComplete={setIsSetupComplete}
            isSetupComplete={isSetupComplete}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Interview Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Mock Interview</h2>
                  <p className="text-blue-100">Role: {role}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Reset Interview
                </button>
              </div>

              {/* Audio Mode Toggle */}
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                <span className="text-sm font-medium">Input Mode:</span>
                <button
                  onClick={() => setIsAudioMode(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !isAudioMode
                      ? 'bg-white text-blue-600'
                      : 'bg-transparent text-white hover:bg-white/20'
                  }`}
                >
                  💬 Text
                </button>
                <button
                  onClick={() => setIsAudioMode(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isAudioMode
                      ? 'bg-white text-blue-600'
                      : 'bg-transparent text-white hover:bg-white/20'
                  }`}
                >
                  🎤 Audio
                </button>
                <button
                  onClick={handleStartVoiceCall}
                  className="ml-4 px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 animate-pulse"
                >
                  📞 Voice Call
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Window */}
            <div className="h-[500px] flex flex-col">
              <ChatWindow history={history} role={role} />

              {/* Text-to-Speech Player for AI Response */}
              {currentSpeech && (
                <div className="border-t border-gray-200 p-4">
                  <TextToSpeech
                    text={currentSpeech.text}
                    shouldSpeak={currentSpeech.shouldSpeak}
                    onSpeakingChange={setIsSpeaking}
                  />
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {isAudioMode ? (
                  // Audio Mode
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-3 p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <AudioRecorder
                        onAudioRecorded={handleAudioRecorded}
                        disabled={isLoading || isSpeaking}
                        isAudioMode={isAudioMode}
                      />
                      <span className="text-gray-600">
                        {isSpeaking ? 'AI is speaking...' : isLoading ? 'Processing...' : 'Click microphone to record your answer'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      🎤 Audio mode: Speak your answer and AI will respond with voice
                    </p>
                  </div>
                ) : (
                  // Text Mode
                  <div>
                    <div className="flex gap-2 items-end">
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isSpeaking ? "AI is speaking..." : "Type your answer here..."}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="2"
                        disabled={isLoading || isSpeaking}
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={!userInput.trim() || isLoading || isSpeaking}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Sending...</span>
                          </div>
                        ) : (
                          'Send'
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💬 Text mode: Type your answer and press Enter to send
                      {isAudioMode && ' • AI will respond with voice'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-600 text-sm">
          <p>Powered by Google Gemini AI • Built with Next.js</p>
        </footer>
      </div>
    </div>
  );
}

