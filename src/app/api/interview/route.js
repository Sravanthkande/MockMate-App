import { NextResponse } from 'next/server';

// NOTE: In a real Next.js app, API_KEY would be loaded securely from process.env.GEMINI_API_KEY
// For this demo, we mock it.
const API_KEY = process.env.GEMINI_API_KEY || ""; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

/**
 * Mocks the system instruction logic (equivalent of gemini.js payload builder)
 */
const getSystemInstruction = (role) => {
  return {
    parts: [{
      text: `You are an expert AI interviewer. Your current task is to conduct a mock job interview for the role of a ${role}. 
      Follow these rules strictly:
      1. Start by asking a single, concise introductory question.
      2. Base the difficulty and content on common industry standards for this role.
      3. After the user provides an answer, you MUST provide concise, constructive feedback on their previous answer AND then immediately ask the next logical follow-up question to drive the conversation forward.
      4. Always format your response with a "Feedback:" section followed by a "Next Question:" section.
      `
    }]
  };
};

/**
 * POST handler for starting/continuing the interview.
 * @param {Request} request The incoming Next.js request object.
 */
export async function POST(request) {
  if (!API_KEY) {
    return NextResponse.json({ error: "API Key not configured on the server." }, { status: 500 });
  }

  try {
    const { history, role } = await request.json();
    
    // Construct the payload for the Gemini API call
    const payload = {
      contents: history,
      systemInstruction: getSystemInstruction(role),
    };

    // Retry logic (Exponential Backoff - simplified for this demo)
    const geminiResponse = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiResponse.ok) {
        // Log status for debugging on the server
        console.error("Gemini API returned an error status:", geminiResponse.status);
        throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const result = await geminiResponse.json();
    const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
         return NextResponse.json({ error: "AI did not generate a valid response." }, { status: 500 });
    }

    return NextResponse.json({ text: generatedText });

  } catch (error) {
    console.error("Error processing interview request:", error);
    return NextResponse.json({ error: "Internal Server Error during AI processing." }, { status: 500 });
  }
}
