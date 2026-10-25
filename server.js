import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, contextData } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const protocolSummary = contextData ? JSON.stringify(contextData, null, 2) : 'No user data provided.';

    const systemInstruction = `You are the AndroLog TRT & Biomarker Clinical Protocol Assistant.
You help the user analyze their Testosterone Replacement Therapy (TRT) protocol, trough blood panels (AccessLabs / Labcorp), dosage titrations (mg/week), Testosterone-to-Estradiol (T:E2) ratios, Hematocrit, PSA, SHBG, and injection site rotation.

USER'S LIVE ANDROLOG DATA:
${protocolSummary}

CLINICAL & UX GUIDELINES:
- Be concise, direct, analytical, and grounded in the user's exact numbers above.
- Reference specific dates, trough Total T (ng/dL), Estradiol E2 (pg/mL, noting the user runs a No-AI protocol), T:E2 ratio, PSA, and weekly dosage (mg/wk) when answering questions.
- Format responses cleanly using short paragraphs or bullet points (**bold** for key biomarkers/numbers).
- Note that your insights are for informational protocol tracking and discussion with their provider (GameDay Men's Health).`;

    const contents = messages.map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.text || '') }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW
        }
      }
    });

    return res.json({
      reply: response.text || 'No response generated.'
    });
  } catch (err) {
    console.error('Gemini /api/chat error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate response from Gemini.'
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

