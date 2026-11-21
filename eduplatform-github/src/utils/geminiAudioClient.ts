const ttsCache = new Map<string, string>();

export type GeminiVoiceName = 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir';

export const GEMINI_VOICES: Array<{ id: GeminiVoiceName; label: string }> = [
  { id: 'Kore', label: 'Kore (Aniq ayol ovozi)' },
  { id: 'Zephyr', label: 'Zephyr (Yumshoq ovoz)' },
  { id: 'Puck', label: 'Puck (Energetik ovoz)' },
  { id: 'Charon', label: 'Charon (Chuqur erkak ovozi)' },
  { id: 'Fenrir', label: 'Fenrir (Jiddiy erkak ovozi)' },
];

export async function fetchGeminiSpeechWav(
  text: string,
  voiceName: GeminiVoiceName = 'Kore',
  style?: string
): Promise<string> {
  const cleanText = text.trim();
  const cacheKey = `${voiceName}::${cleanText}`;
  const cached = ttsCache.get(cacheKey);
  if (cached) return cached;

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: cleanText,
      voiceName,
      style,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    audioBase64?: string;
    mimeType?: string;
    error?: string;
  };

  if (!response.ok || !data.audioBase64) {
    throw new Error(
      data.error || `Ovoz yaratishda xatolik yuz berdi (kod: ${response.status}).`
    );
  }

  const dataUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
  ttsCache.set(cacheKey, dataUrl);
  return dataUrl;
}

export function float32ToPcm16Base64(float32: Float32Array): string {
  const buffer = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function decodeBase64Pcm24kToAudioBuffer(
  ctx: AudioContext,
  base64Pcm: string
): AudioBuffer {
  const binary = atob(base64Pcm);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const audioBuffer = ctx.createBuffer(1, int16.length, 24000);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < int16.length; i++) {
    channelData[i] = int16[i] / 32768;
  }
  return audioBuffer;
}
