import { NextResponse } from 'next/server';

const API_KEY = process.env.GEMINI_API_KEY || "";

/**
 * POST handler for transcribing audio to text using Gemini API
 * Accepts audio file (base64 or multipart) and returns transcribed text
 */
export async function POST(request) {
  if (!API_KEY) {
    return NextResponse.json({ error: "API Key not configured on the server." }, { status: 500 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let audioData;
    let mimeType;

    // Handle multipart/form-data (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const audioFile = formData.get('audio');
      
      if (!audioFile) {
        return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
      }

      // Convert file to base64
      const bytes = await audioFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      audioData = buffer.toString('base64');
      mimeType = audioFile.type || 'audio/webm';
    } 
    // Handle JSON with base64 audio
    else if (contentType.includes('application/json')) {
      const body = await request.json();
      audioData = body.audio;
      mimeType = body.mimeType || 'audio/webm';

      if (!audioData) {
        return NextResponse.json({ error: "No audio data provided" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ 
        error: "Invalid content type. Use multipart/form-data or application/json" 
      }, { status: 400 });
    }

    // Use Gemini API to transcribe audio
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    const payload = {
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: audioData
            }
          },
          {
            text: "Transcribe this audio to text. Only return the transcribed text, nothing else."
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      }
    };

    console.log("Sending audio transcription request to Gemini API...");
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
        error: `Transcription failed: ${errorData.error?.message || geminiResponse.statusText}`
      }, { status: geminiResponse.status });
    }

    const result = await geminiResponse.json();
    const transcribedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!transcribedText) {
      console.error("No transcription generated. Full response:", result);
      return NextResponse.json({
        error: "Failed to transcribe audio. Please try again."
      }, { status: 500 });
    }

    return NextResponse.json({ 
      text: transcribedText.trim(),
      success: true 
    });

  } catch (error) {
    console.error("Error processing transcription request:", error);
    return NextResponse.json({
      error: `Internal Server Error: ${error.message}`
    }, { status: 500 });
  }
}

