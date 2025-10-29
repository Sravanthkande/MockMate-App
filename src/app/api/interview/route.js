import { NextResponse } from 'next/server';

const API_KEY = process.env.GEMINI_API_KEY || "";
// Using Gemini 2.0 Flash - stable and fast model
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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

    if (!role || !Array.isArray(history)) {
      return NextResponse.json({
        error: "Invalid request: role and history are required"
      }, { status: 400 });
    }

    // Construct the payload for the Gemini API call
    const payload = {
      contents: history.length > 0 ? history : [{
        role: 'user',
        parts: [{ text: 'Start the interview' }]
      }],
      systemInstruction: getSystemInstruction(role),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log("Sending request to Gemini API...");
    const geminiResponse = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiResponse.ok) {
        const errorData = await geminiResponse.json().catch(() => ({}));
        console.error("Gemini API Error:", {
          status: geminiResponse.status,
          statusText: geminiResponse.statusText,
          error: errorData
        });

        return NextResponse.json({
          error: `Gemini API error: ${errorData.error?.message || geminiResponse.statusText}`
        }, { status: geminiResponse.status });
    }

    const result = await geminiResponse.json();
    console.log("Gemini API Response:", JSON.stringify(result, null, 2));

    const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
        console.error("No text generated. Full response:", result);
        return NextResponse.json({
          error: "AI did not generate a valid response. Please try again."
        }, { status: 500 });
    }

    return NextResponse.json({ text: generatedText });

  } catch (error) {
    console.error("Error processing interview request:", error);
    return NextResponse.json({
      error: `Internal Server Error: ${error.message}`
    }, { status: 500 });
  }
}
