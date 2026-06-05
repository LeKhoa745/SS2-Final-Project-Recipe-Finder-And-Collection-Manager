import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are a professional chef and kitchen assistant. You help users with recipe ideas, ingredient substitutions, and cooking tips. Keep your answers concise, friendly, and helpful. If asked about something unrelated to cooking or food, politely steer the conversation back to the kitchen."
});

router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      return res.status(500).json({ 
        message: "Gemini API key is not configured. Please add it to the .env file." 
      });
    }

    const chat = model.startChat({
      history: (history || []).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    logger.error('Gemini AI Error:', error);
    res.status(500).json({ message: "Chef is busy right now. Please try again later." });
  }
});

export default router;
