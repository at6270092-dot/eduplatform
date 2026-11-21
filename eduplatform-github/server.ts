import 'dotenv/config';
process.env.DISABLE_HMR = 'true';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocket, WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY topilmadi. Iltimos, AI Studio Settings > Secrets bo'limida GEMINI_API_KEY qiymatini kiriting."
    );
  }
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractErrorDetails(err: unknown): { status: number; message: string } {
  const rawMessage = err instanceof Error ? err.message : String(err);
  if (
    rawMessage.includes('API_KEY_INVALID') ||
    rawMessage.includes('PERMISSION_DENIED') ||
    rawMessage.includes('GEMINI_API_KEY')
  ) {
    return {
      status: 400,
      message:
        "Gemini API kaliti noto'g'ri yoki sozlanmagan. Iltimos, Settings > Secrets bo'limidan GEMINI_API_KEY ni tekshiring.",
    };
  }
  if (rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429')) {
    return {
      status: 429,
      message:
        "So'rovlar limiti tugadi (429). Biroz kuting yoki Settings > Secrets bo'limida billing yoqilgan kalitni tanlang.",
    };
  }
  return {
    status: 500,
    message: rawMessage || 'Serverda kutilmagan xatolik yuz berdi.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
    });
  });

  // Server-side Text-to-Speech endpoint using gemini-3.8-flash-lite-tts
  app.post('/api/tts', async (req, res) => {
    try {
      const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
      const voiceName =
        typeof req.body?.voiceName === 'string' && req.body.voiceName.trim()
          ? req.body.voiceName.trim()
          : 'Kore';
      const style =
        typeof req.body?.style === 'string' && req.body.style.trim()
          ? req.body.style.trim()
          : "Aniq, ravon va tushunarli ustoz ovozi, o'zbekcha matnni tabiiy ohangda o'qish";

      if (!text) {
        res.status(400).json({ error: "Ovozlashtirish uchun matn kiritilmadi." });
        return;
      }

      const clippedText = text.slice(0, 1800);
      const ai = getGeminiClient();

      const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash-lite-tts',
        input: [
          {
            type: 'text',
            text: clippedText,
            annotations: [
              {
                type: 'speech_metadata',
                style,
              },
            ],
          },
        ],
        response_format: { type: 'audio' },
        generation_config: {
          speech_config: [
            {
              voice: voiceName,
            },
          ],
        },
      });

      const base64Audio = interaction.output_audio?.data;
      const mimeType = interaction.output_audio?.mime_type || 'audio/wav';

      if (!base64Audio) {
        res.status(502).json({
          error: 'Model audio qaytarmadi. Matnni qisqartirib qayta urinib ko‘ring.',
        });
        return;
      }

      res.json({
        audioBase64: base64Audio,
        mimeType,
      });
    } catch (err) {
      const { status, message } = extractErrorDetails(err);
      res.status(status).json({ error: message });
    }
  });

  // Fallback text translation + speech endpoint when microphone is unavailable/denied
  app.post('/api/translate-speak', async (req, res) => {
    try {
      const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
      const targetLanguageCode =
        typeof req.body?.targetLang === 'string' && req.body.targetLang.trim()
          ? req.body.targetLang.trim()
          : 'uz';

      if (!text) {
        res.status(400).json({ error: "Tarjima qilish uchun matn kiriting." });
        return;
      }

      const langNames: Record<string, string> = {
        uz: 'Uzbek',
        en: 'English',
        ru: 'Russian',
        tr: 'Turkish',
        es: 'Spanish',
      };
      const targetName = langNames[targetLanguageCode] || targetLanguageCode;
      const ai = getGeminiClient();

      const textResp = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Translate the following text accurately and naturally into ${targetName}. Return ONLY the translated text without quotes or explanations.\n\nText: ${text.slice(0, 1200)}`,
      });

      const translatedText = textResp.text?.trim();
      if (!translatedText) {
        res.status(502).json({ error: 'Tarjima matni olinmadi. Qayta urinib ko‘ring.' });
        return;
      }

      const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash-lite-tts',
        input: [
          {
            type: 'text',
            text: translatedText.slice(0, 1800),
            annotations: [
              {
                type: 'speech_metadata',
                style: 'Aniq, ravon va tabiiy ustoz talaffuzi',
              },
            ],
          },
        ],
        response_format: { type: 'audio' },
        generation_config: {
          speech_config: [{ voice: 'Kore' }],
        },
      });

      const audioBase64 = interaction.output_audio?.data;
      const mimeType = interaction.output_audio?.mime_type || 'audio/wav';

      res.json({
        translatedText,
        audioBase64,
        mimeType,
      });
    } catch (err) {
      const { status, message } = extractErrorDetails(err);
      res.status(status).json({ error: message });
    }
  });

  if (IS_PROD) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const reqUrl = request.url ?? '';
    if (!reqUrl.startsWith('/api/live-translate')) {
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', async (clientWs: WebSocket, request: http.IncomingMessage) => {
    let liveSession: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null = null;

    try {
      const parsedUrl = new URL(request.url ?? '/api/live-translate', `http://localhost:${PORT}`);
      const targetLanguageCode = parsedUrl.searchParams.get('targetLang') || 'uz';
      const ai = getGeminiClient();

      liveSession = await ai.live.connect({
        model: 'gemini-3.5-live-translate-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          translationConfig: {
            targetLanguageCode,
            echoTargetLanguage: false,
          },
        },
        callbacks: {
          onopen: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ ready: true, targetLanguageCode }));
            }
          },
          onmessage: (message: LiveServerMessage) => {
            if (clientWs.readyState !== WebSocket.OPEN) return;
            const content = message.serverContent;
            if (content?.inputTranscription?.text) {
              clientWs.send(
                JSON.stringify({ inputTranscript: content.inputTranscription.text })
              );
            }
            if (content?.outputTranscription?.text) {
              clientWs.send(
                JSON.stringify({ outputTranscript: content.outputTranscription.text })
              );
            }
            if (content?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }
          },
          onerror: (ev) => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  error:
                    (ev as { message?: string })?.message ||
                    'Gemini Live tarjimon ulanishida xatolik yuz berdi.',
                })
              );
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.close();
            }
          },
        },
      });
    } catch (err) {
      const { message } = extractErrorDetails(err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: message }));
        clientWs.close();
      }
      return;
    }

    clientWs.on('message', (raw) => {
      try {
        const parsed = JSON.parse(raw.toString()) as { audio?: string };
        if (parsed.audio && liveSession) {
          liveSession.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } catch {
        // Ignore malformed frame
      }
    });

    clientWs.on('close', () => {
      try {
        liveSession?.close();
      } catch {
        // Ignore close errors
      }
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`EduPlatform server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
