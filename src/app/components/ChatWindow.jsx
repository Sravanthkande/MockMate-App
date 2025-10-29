import React, { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';

const ChatWindow = React.memo(({ history, role }) => {
  const chatEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 rounded-lg shadow-inner">
      {history.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664L12 3l7.11 5.406a2 2 0 01.89 1.664V19M21 19H3m18 0a2 2 0 002 2H1a2 2 0 002 2h18a2 2 0 002-2zM10 12h4m-4 4h4"></path></svg>
          <p>The interview hasn't started yet. Set the role and begin!</p>
        </div>
      ) : (
        history.map((msg, index) => {
          // Handle both text and audio messages
          const part = msg.parts[0];
          const messageText = part.text || (part.inline_data ? '🎤 Audio message' : 'No content');

          return (
            <ChatBubble
              key={index}
              message={messageText}
              isUser={msg.role === 'user'}
              role={role}
            />
          );
        })
      )}
      <div ref={chatEndRef} />
    </div>
  );
});

export default ChatWindow;
