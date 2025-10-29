// This file contains the client-side fetch function that calls our SECURE Next.js API route.

/**
 * Client-side function to communicate with the Next.js interview API route.
 * This function is used by the frontend page components.
 * * @param {Array<Object>} history The conversation history to send to the model.
 * @param {string} role The interview role.
 * @returns {Promise<{text: string}|{error: string}>}
 */
export const callInterviewAPI = async (history, role) => {
  const API_ROUTE = '/api/interview';
  
  try {
    const response = await fetch(API_ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, role })
    });

    const result = await response.json();

    if (!response.ok) {
        // Handle server-side errors (e.g., API key missing, Gemini error)
        console.error("API Route Error:", result.error);
        return { error: result.error || "An unknown error occurred during AI processing." };
    }

    return { text: result.text };

  } catch (error) {
    console.error("Client fetch failed:", error);
    return { error: `Network or Client Error: ${error.message}` };
  }
};
