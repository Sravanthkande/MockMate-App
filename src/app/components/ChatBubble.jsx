import React from 'react';

const ChatBubble = ({ message, isUser, role }) => {
  // Ensure message is a string
  const messageText = typeof message === 'string' ? message : String(message || '');

  // Split the AI response into feedback and next question sections for clean display
  const isAI = !isUser;
  const feedbackMatch = messageText.match(/Feedback:([\s\S]*?)Next Question:/i);
  const nextQuestionMatch = messageText.match(/Next Question:([\s\S]*)/i);

  const feedback = feedbackMatch ? feedbackMatch[1].trim() : (isAI ? "Processing feedback..." : null);
  const nextQuestion = nextQuestionMatch ? nextQuestionMatch[1].trim() : (isAI ? messageText.replace(/Feedback:[\s\S]*?/i, '').trim() : null);
  
  // Define primary color for Tailwind utility classes (mocked here, typically in tailwind.config.js)
  const primaryColor = 'blue'; 

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-4xl p-4 rounded-xl shadow-lg transition-all duration-300 ${
        isUser 
          ? `bg-${primaryColor}-500 text-white rounded-tr-none` 
          : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
      }`}>
        <div className="font-semibold text-sm mb-1">
          {isUser ? 'You' : `${role} Interviewer`}
        </div>
        
        {isUser ? (
          // User message
          <p className="whitespace-pre-wrap">{messageText}</p>
        ) : (
          // AI message (split into feedback and question)
          <div className="space-y-3">
            {feedback && (
              <div>
                <strong className={`text-${primaryColor}-600`}>Feedback:</strong>
                <p className="text-sm pt-1">{feedback}</p>
              </div>
            )}
            {nextQuestion && (
              <div className="pt-2 border-t border-gray-200">
                <strong className={`text-${primaryColor}-600`}>Next Question:</strong>
                <p className="text-md font-medium pt-1">{nextQuestion}</p>
              </div>
            )}
            {!feedback && !nextQuestion && <p>{messageText}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
