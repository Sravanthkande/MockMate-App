'use client';

import React, { useState, useEffect } from 'react';
import InterviewSetup from './components/InterviewSetup';
import ChatWindow from './components/ChatWindow';
import { callInterviewAPI } from './lib/gemini';

export default function HomePage() {
  const [role, setRole] = useState('Software Engineer');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [history, setHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      parts: [{ text: userInput.trim() }]
    };

    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await callInterviewAPI(newHistory, role);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      const aiMessage = {
        role: 'model',
        parts: [{ text: result.text }]
      };

      setHistory([...newHistory, aiMessage]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
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
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex justify-between items-center">
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

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex gap-2">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your answer here... (Press Enter to send)"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="2"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isLoading}
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
                  Tip: Press Enter to send, Shift+Enter for new line
                </p>
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

