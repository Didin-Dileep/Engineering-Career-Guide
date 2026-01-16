import { onRequest } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const mentorChat = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const mentorPrompt = `You are a friendly AI student mentor.

Your role:
- Help students with studies, subjects, coding, engineering, science, exams.
- Give motivation, encouragement, and emotional support.
- Talk politely, calmly, and positively.

Rules:
- You are NOT a doctor or therapist.
- Do NOT give medical or mental health diagnoses.
- If user expresses sadness, stress, or self-doubt:
  → Listen
  → Encourage
  → Suggest healthy actions like rest, talking to someone trusted.
- If user asks harmful or unsafe things, gently refuse.

Tone:
- Friendly
- Supportive
- Clear
- Like a senior mentor

User message: "${message}"`;
    
    const result = await model.generateContent(mentorPrompt);
    const response = result.response.text();

    res.json({ reply: response });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Mentor failed to respond" });
  }
});
