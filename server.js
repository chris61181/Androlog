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

// Status check to let client know if AI Studio Env key exists
app.get('/api/status', (req, res) => {
  res.json({
    hasEnvKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
    defaultModel: 'gemini-4-argon'
  });
});

// Diagnostic endpoint to verify Gemini 4 Argon connection and token usage
app.post('/api/test-connection', async (req, res) => {
  try {
    const { apiKey, thinkingLevel } = req.body || {};
    const effectiveKey = (apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY;

    if (!effectiveKey) {
      return res.status(401).json({
        ok: false,
        error: 'Missing Gemini API key. Please save your API key in API & Model Settings.'
      });
    }

    // Dynamic instantiation per request
    const ai = new GoogleGenAI({
      apiKey: effectiveKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const level = (thinkingLevel === 'MEDIUM') ? ThinkingLevel.MEDIUM : ThinkingLevel.LOW;

    // STRICT ARGON RULE: Pass only thinkingConfig: { thinkingLevel }
    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: [{ role: 'user', parts: [{ text: 'Reply with: Argon Ready' }] }],
      config: {
        thinkingConfig: {
          thinkingLevel: level
        }
      }
    });

    return res.json({
      ok: true,
      model: 'gemini-4-argon',
      reply: response.text || 'Argon Ready',
      usageMetadata: response.usageMetadata || {
        promptTokenCount: 0,
        thoughtsTokenCount: 0,
        candidatesTokenCount: 0,
        totalTokenCount: 0
      }
    });
  } catch (err) {
    console.error('Test Argon connection error:', err);
    return res.status(500).json({
      ok: false,
      error: err.message || 'Failed to connect to Gemini 4 Argon.'
    });
  }
});

// Multi-turn protocol chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, contextData, apiKey, model, thinkingLevel } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const effectiveKey = (apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY;
    if (!effectiveKey) {
      return res.status(401).json({
        error: 'Missing Gemini API key. Please provide your API key in API & Model Settings.'
      });
    }

    // Dynamic instantiation per request
    const ai = new GoogleGenAI({
      apiKey: effectiveKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const protocolSummary = contextData ? JSON.stringify(contextData, null, 2) : 'No user data provided.';

    const systemInstruction = `You are the AndroLog TRT & Biomarker Clinical Protocol Assistant powered by Gemini 4 Argon.
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

    const selectedModel = model || 'gemini-4-argon';
    const level = (thinkingLevel === 'MEDIUM') ? ThinkingLevel.MEDIUM : ThinkingLevel.LOW;

    // STRICT ARGON RULE: Pass only thinkingConfig: { thinkingLevel }
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: level
        }
      }
    });

    return res.json({
      reply: response.text || 'No response generated.',
      usageMetadata: response.usageMetadata || null
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


