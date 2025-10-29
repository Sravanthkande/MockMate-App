import React, { useState } from 'react';

const InterviewSetup = React.memo(({ role, setRole, setIsSetupComplete, isSetupComplete }) => {
  const [inputRole, setInputRole] = useState(role);
  const primaryColor = 'blue'; 

  const handleStart = () => {
    if (inputRole.trim()) {
      setRole(inputRole.trim());
      setIsSetupComplete(true);
    }
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-xl max-w-lg mx-auto my-10 font-sans">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Interview Setup</h2>
      <p className="text-gray-600 mb-6">Define the role you are preparing for. The AI will tailor questions and feedback accordingly.</p>
      
      <label htmlFor="role-input" className="block text-sm font-medium text-gray-700 mb-2">
        Job Role / Technology
      </label>
      <input
        id="role-input"
        type="text"
        value={inputRole}
        onChange={(e) => setInputRole(e.target.value)}
        placeholder="e.g., Senior React Developer, Python Automation Engineer"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-6 transition-colors"
        disabled={isSetupComplete}
      />
      
      <button
        onClick={handleStart}
        disabled={!inputRole.trim() || isSetupComplete}
        className={`w-full bg-${primaryColor}-500 hover:bg-${primaryColor}-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isSetupComplete ? `Interview Started: ${role}` : 'Start Mock Interview'}
      </button>
    </div>
  );
});

export default InterviewSetup;
