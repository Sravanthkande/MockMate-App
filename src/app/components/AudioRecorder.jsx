"use client";

import { useState, useRef } from 'react';

export default function AudioRecorder({ onAudioRecorded, disabled, isAudioMode }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);

        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1]; // Remove data:audio/webm;base64, prefix
          onAudioRecorded(base64Audio, 'audio/webm');
        };

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (!isAudioMode) return null;

  return (
    <div className="flex items-center gap-2">
      {!isRecording && (
        <button
          onClick={startRecording}
          disabled={disabled}
          className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Start recording"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {isRecording && (
        <button
          onClick={stopRecording}
          className="p-3 bg-red-600 text-white rounded-full animate-pulse"
          title="Stop recording"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <rect x="6" y="6" width="8" height="8" rx="1" />
          </svg>
        </button>
      )}

      {isRecording && (
        <span className="text-sm text-red-600 animate-pulse">
          Recording...
        </span>
      )}
    </div>
  );
}

