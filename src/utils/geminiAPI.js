// Direct Gemini API call - WORKING VERSION
export const callGeminiAPI = async (message, systemPrompt = "") => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("No API key");
    }
    
    const fullMessage = systemPrompt ? `${systemPrompt}\n\nUser: ${message}` : message;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullMessage }] }]
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};



