import React, { useEffect, useRef, useState } from 'react';
import { Languages, Loader2, Mic, MicOff, Volume2, X } from 'lucide-react';
import {
  decodeBase64Pcm24kToAudioBuffer,
  float32ToPcm16Base64,
} from '../utils/geminiAudioClient';

interface LiveTranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TARGET_LANGUAGES = [
  { code: 'uz', label: "O'zbekcha (uz)" },
  { code: 'en', label: 'Inglizcha (en)' },
  { code: 'ru', label: 'Ruscha (ru)' },
  { code: 'tr', label: 'Turkcha (tr)' },
  { code: 'es', label: 'Ispancha (es)' },
];

export const LiveTranslateModal: React.FC<LiveTranslateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [targetLang, setTargetLang] = useState('uz');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPermissionBlocked, setIsPermissionBlocked] = useState(false);
  const [inputTranscript, setInputTranscript] = useState('');
  const [outputTranscript, setOutputTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);

  const cleanupLiveSession = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {
        // Ignore already stopped source
      }
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (inputCtxRef.current) {
      inputCtxRef.current.close().catch(() => {});
      inputCtxRef.current = null;
    }

    if (outputCtxRef.current) {
      outputCtxRef.current.close().catch(() => {});
      outputCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Ignore close error
      }
      wsRef.current = null;
    }

    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause();
      fallbackAudioRef.current = null;
    }

    setStatus('idle');
  };

  useEffect(() => {
    if (!isOpen) {
      cleanupLiveSession();
    }
    return () => {
      cleanupLiveSession();
    };
  }, [isOpen]);

  const handleStartLive = async () => {
    setErrorMsg(null);
    setIsPermissionBlocked(false);
    setInputTranscript('');
    setOutputTranscript('');
    setStatus('connecting');

    try {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error(
          "Ushbu brauzerda mikrofon API mavjud emas. Pastdagi matn orqali tarjima va ovozli o‘qishdan foydalanishingiz mumkin."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(
        `${protocol}//${window.location.host}/api/live-translate?targetLang=${encodeURIComponent(
          targetLang
        )}`
      );
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as {
            ready?: boolean;
            inputTranscript?: string;
            outputTranscript?: string;
            audio?: string;
            interrupted?: boolean;
            error?: string;
          };

          if (msg.error) {
            setErrorMsg(msg.error);
            cleanupLiveSession();
            return;
          }

          if (msg.ready) {
            setStatus('live');
          }

          if (msg.inputTranscript) {
            setInputTranscript((prev) => (prev ? `${prev} ${msg.inputTranscript}` : msg.inputTranscript!));
          }

          if (msg.outputTranscript) {
            setOutputTranscript((prev) =>
              prev ? `${prev} ${msg.outputTranscript}` : msg.outputTranscript!
            );
          }

          if (msg.interrupted && outputCtxRef.current) {
            activeSourcesRef.current.forEach((s) => {
              try {
                s.stop();
              } catch {
                // Ignore
              }
            });
            activeSourcesRef.current = [];
            nextStartTimeRef.current = outputCtxRef.current.currentTime;
          }

          if (msg.audio && outputCtxRef.current) {
            const ctx = outputCtxRef.current;
            const audioBuffer = decodeBase64Pcm24kToAudioBuffer(ctx, msg.audio);
            const src = ctx.createBufferSource();
            src.buffer = audioBuffer;
            src.connect(ctx.destination);

            const startAt = Math.max(ctx.currentTime, nextStartTimeRef.current);
            src.start(startAt);
            nextStartTimeRef.current = startAt + audioBuffer.duration;
            activeSourcesRef.current.push(src);
            src.onended = () => {
              activeSourcesRef.current = activeSourcesRef.current.filter((item) => item !== src);
            };
          }
        } catch {
          // Ignore malformed WS message
        }
      };

      ws.onerror = () => {
        setErrorMsg("WebSocket ulanishida xatolik yuz berdi.");
        cleanupLiveSession();
      };

      ws.onclose = () => {
        setStatus((prev) => (prev === 'idle' ? 'idle' : 'idle'));
      };

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const socket = wsRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        const channelData = e.inputBuffer.getChannelData(0);
        const base64Pcm = float32ToPcm16Base64(channelData);
        socket.send(JSON.stringify({ audio: base64Pcm }));
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const isPerm =
        (err instanceof DOMException &&
          (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) ||
        /permission denied|notallowederror/i.test(raw);
      const isNoMic =
        (err instanceof DOMException && err.name === 'NotFoundError') ||
        /requested device not found/i.test(raw);

      if (isPerm) {
        setIsPermissionBlocked(true);
        setErrorMsg(
          isInIframe
            ? "Ko‘rib chiqish oynasida (iframe) brauzer mikrofonni cheklab qo‘ygan. Mikrofon bilan jonli gapirish uchun ilovani yangi oynada oching — yoki pastdagi Matn tarjimonidan mikrofonsiz foydalaning."
            : "Mikrofonga ruxsat berilmadi (Permission denied). Brauzer manzil satridagi qulf/mikrofon belgisidan mikrofon ruxsatini yoqing — yoki pastdagi matn tarjimoni orqali ovozli natija oling."
        );
      } else if (isNoMic) {
        setErrorMsg(
          "Qurilmada mikrofon topilmadi. Pastdagi matn maydoniga so‘z yozib ovozli tarjima qilishingiz mumkin."
        );
      } else {
        setErrorMsg(raw || "Mikrofonga ruxsat berilmadi yoki ulanishda xato.");
      }
      cleanupLiveSession();
    }
  };

  const handleManualTranslateSpeak = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualText.trim();
    if (!clean || manualLoading) return;

    setErrorMsg(null);
    setManualLoading(true);
    setInputTranscript(clean);
    try {
      const resp = await fetch('/api/translate-speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, targetLang }),
      });
      const data = (await resp.json().catch(() => ({}))) as {
        translatedText?: string;
        audioBase64?: string;
        mimeType?: string;
        error?: string;
      };
      if (!resp.ok || !data.translatedText) {
        throw new Error(data.error || 'Matn tarjimasida xatolik yuz berdi.');
      }
      setOutputTranscript(data.translatedText);
      let playedServerAudio = false;
      if (data.audioBase64) {
        if (fallbackAudioRef.current) {
          fallbackAudioRef.current.pause();
        }
        const audio = new Audio(
          `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`
        );
        fallbackAudioRef.current = audio;
        try {
          await audio.play();
          playedServerAudio = true;
        } catch {
          playedServerAudio = false;
        }
      }
      if (!playedServerAudio && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(data.translatedText);
        utter.lang =
          targetLang === 'uz'
            ? 'uz-UZ'
            : targetLang === 'ru'
            ? 'ru-RU'
            : targetLang === 'tr'
            ? 'tr-TR'
            : targetLang === 'es'
            ? 'es-ES'
            : 'en-US';
        window.speechSynthesis.speak(utter);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Matn tarjimasida xatolik.');
    } finally {
      setManualLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-translate-title"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--edu-border)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Languages className="w-5 h-5 text-[var(--edu-accent)]" />
            <div>
              <h2
                id="live-translate-title"
                className="text-base font-bold text-[var(--edu-ink)]"
              >
                Jonli Ovozli Tarjimon
              </h2>
              <p className="text-xs text-[var(--edu-muted)]">
                gemini-3.5-live-translate-preview · Nutqdan nutqqa jonli tarjima
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="p-2 rounded-lg text-[var(--edu-muted)] hover:text-[var(--edu-ink)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label
              htmlFor="target-lang-select"
              className="text-xs font-medium text-[var(--edu-muted)]"
            >
              Qaysi tilga ovozli tarjima qilinsin?
            </label>
            <select
              id="target-lang-select"
              disabled={status !== 'idle'}
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] text-sm text-[var(--edu-ink)] focus:outline-none focus:border-[var(--edu-accent)] disabled:opacity-60"
            >
              {TARGET_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] p-5 flex flex-col items-center text-center gap-3">
            {status === 'idle' ? (
              <button
                type="button"
                onClick={handleStartLive}
                className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Mikrofonni yoqish va gapirish</span>
              </button>
            ) : status === 'connecting' ? (
              <button
                type="button"
                onClick={cleanupLiveSession}
                className="px-6 py-3 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] text-sm font-semibold text-[var(--edu-ink)] inline-flex items-center gap-2 cursor-pointer"
              >
                <Loader2 className="w-4 h-4 animate-spin text-[var(--edu-accent)]" />
                <span>Ulanmoqda... (Bekor qilish)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={cleanupLiveSession}
                className="px-6 py-3 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MicOff className="w-4 h-4" />
                <span>Jonli efirni to&apos;xtatish</span>
              </button>
            )}

            <p className="text-xs text-[var(--edu-muted)] max-w-md">
              {status === 'live'
                ? "Mikrofon faol! Istalgan tilda gapiring — ovozli tarjima avtomatik yangraydi."
                : "Inglizcha yoki boshqa tildagi dars/atamani ayting, model uni tanlangan tilga jonli ovozda tarjima qilib eshittiradi."}
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-[#F87171]/10 border border-[#F87171]/40 px-4 py-3 text-xs text-[#F87171] leading-relaxed space-y-2">
              <p>{errorMsg}</p>
              {isPermissionBlocked && isInIframe && typeof window !== 'undefined' && (
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold transition-colors"
                >
                  Yangi oynada ochish (Mikrofon ruxsati uchun)
                </a>
              )}
            </div>
          )}

          <form
            onSubmit={handleManualTranslateSpeak}
            className="rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] p-4 space-y-2.5"
          >
            <label
              htmlFor="manual-translate-input"
              className="block text-xs font-medium text-[var(--edu-muted)]"
            >
              Yoki matn yozib tarjima + ovoz eshiting (mikrofonsiz ham ishlaydi)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="manual-translate-input"
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Masalan: Variable immutability in Kotlin"
                className="flex-1 h-10 px-3.5 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] text-sm text-[var(--edu-ink)] placeholder:text-[var(--edu-muted)]/60 focus:outline-none focus:border-[var(--edu-accent)]"
              />
              <button
                type="submit"
                disabled={manualLoading || !manualText.trim()}
                className="h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-45 text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                {manualLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Tarjima...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Tarjima + Ovoz</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] p-4 space-y-1.5 min-h-[96px]">
              <div className="text-xs font-semibold text-[var(--edu-muted)]">
                Sizning nutqingiz
              </div>
              <p className="text-xs sm:text-sm text-[var(--edu-ink)] leading-relaxed">
                {inputTranscript || 'Matn shu yerda ko‘rinadi...'}
              </p>
            </div>

            <div className="rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] p-4 space-y-1.5 min-h-[96px]">
              <div className="text-xs font-semibold text-[var(--edu-accent)] inline-flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Ovozli tarjima</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--edu-ink)] leading-relaxed">
                {outputTranscript || 'Tarjima matni va ovozi shu yerda chiqadi...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
