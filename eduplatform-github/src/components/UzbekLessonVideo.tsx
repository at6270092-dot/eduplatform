import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Link2,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Subtitles,
  Video,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { CourseItem, LessonItem } from '../types/edu';
import { buildVideoChapters, parseCustomVideoUrl } from '../utils/lessonContentBuilder';
import {
  fetchGeminiSpeechWav,
  GEMINI_VOICES,
  GeminiVoiceName,
} from '../utils/geminiAudioClient';

interface UzbekLessonVideoProps {
  lesson: LessonItem;
  course: CourseItem;
  isVideoWatched: boolean;
  customVideoUrl: string;
  onMarkVideoWatched: () => void;
  onSaveCustomVideoUrl: (url: string) => void;
}

const TOTAL_VIDEO_SECONDS = 120;

function formatTimer(sec: number): string {
  const clamped = Math.max(0, Math.min(TOTAL_VIDEO_SECONDS, Math.floor(sec)));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const UzbekLessonVideo: React.FC<UzbekLessonVideoProps> = ({
  lesson,
  course,
  isVideoWatched,
  customVideoUrl,
  onMarkVideoWatched,
  onSaveCustomVideoUrl,
}) => {
  const chapters = useMemo(() => buildVideoChapters(lesson, course), [lesson, course]);
  const [playerMode, setPlayerMode] = useState<'interactive' | 'custom'>('interactive');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<GeminiVoiceName>('Kore');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [cinemaMode, setCinemaMode] = useState(false);

  // Checkpoint inside Chapter 4 (at sec 80)
  const [checkpointSolved, setCheckpointSolved] = useState(false);
  const [checkpointSelected, setCheckpointSelected] = useState<number | null>(null);
  const [checkpointChecked, setCheckpointChecked] = useState(false);

  // Custom URL editor
  const [urlInput, setUrlInput] = useState(customVideoUrl);
  const [urlError, setUrlError] = useState<string | null>(null);

  const lastSpokenChapterRef = useRef<string | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const watchedTriggeredRef = useRef(false);

  const stopAudioPlayback = () => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
      audioElRef.current = null;
    }
  };

  // Reset player cleanly when lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentSec(0);
    setCheckpointSolved(false);
    setCheckpointSelected(null);
    setCheckpointChecked(false);
    setUrlInput(customVideoUrl);
    setUrlError(null);
    setVoiceError(null);
    setVoiceLoading(false);
    lastSpokenChapterRef.current = null;
    watchedTriggeredRef.current = isVideoWatched;
    stopAudioPlayback();
  }, [lesson.id, customVideoUrl, isVideoWatched]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudioPlayback();
    };
  }, []);

  const currentChapter = useMemo(() => {
    return (
      chapters.find((c) => currentSec >= c.startSec && currentSec < c.endSec) ??
      chapters[chapters.length - 1]
    );
  }, [chapters, currentSec]);

  // Main timeline ticker
  useEffect(() => {
    if (!isPlaying || playerMode !== 'interactive') return;

    const intervalMs = Math.round(250 / speed);
    const id = window.setInterval(() => {
      setCurrentSec((prev) => {
        const next = prev + 0.25;
        // Pause cleanly at interactive checkpoint (79s) if not yet solved
        if (!checkpointSolved && prev < 79 && next >= 79) {
          setIsPlaying(false);
          return 79;
        }
        if (next >= TOTAL_VIDEO_SECONDS) {
          setIsPlaying(false);
          return TOTAL_VIDEO_SECONDS;
        }
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [isPlaying, speed, checkpointSolved, playerMode]);

  // Mark video watched once user reaches 92% or finishes
  useEffect(() => {
    if (!watchedTriggeredRef.current && currentSec >= 108) {
      watchedTriggeredRef.current = true;
      onMarkVideoWatched();
    }
  }, [currentSec, onMarkVideoWatched]);

  // Gemini TTS server-side studio audio per chapter
  useEffect(() => {
    let cancelled = false;

    if (!isPlaying || !voiceEnabled || playerMode !== 'interactive') {
      stopAudioPlayback();
      lastSpokenChapterRef.current = null;
      setVoiceLoading(false);
      return;
    }

    const chapterKey = `${currentChapter.id}::${selectedVoice}`;
    if (lastSpokenChapterRef.current === chapterKey) {
      if (audioElRef.current) {
        audioElRef.current.playbackRate = speed;
      }
      return;
    }

    lastSpokenChapterRef.current = chapterKey;
    stopAudioPlayback();
    setVoiceLoading(true);
    setVoiceError(null);

    fetchGeminiSpeechWav(currentChapter.subtitle, selectedVoice)
      .then((dataUrl) => {
        if (cancelled) return;
        setVoiceLoading(false);
        const audio = new Audio(dataUrl);
        audio.playbackRate = speed;
        audioElRef.current = audio;
        audio.play().catch(() => {
          // Autoplay block fallback handled gracefully via user play interaction
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setVoiceLoading(false);
        setVoiceError(
          err instanceof Error
            ? err.message
            : 'Ovozli o‘qishda xatolik yuz berdi.'
        );
      });

    return () => {
      cancelled = true;
    };
  }, [isPlaying, voiceEnabled, currentChapter, speed, playerMode, selectedVoice]);

  const handleTogglePlay = () => {
    if (currentSec >= TOTAL_VIDEO_SECONDS) {
      setCurrentSec(0);
      setCheckpointSolved(false);
      setCheckpointSelected(null);
      setCheckpointChecked(false);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    setCurrentSec(0);
    setCheckpointSolved(false);
    setCheckpointSelected(null);
    setCheckpointChecked(false);
    lastSpokenChapterRef.current = null;
    setIsPlaying(true);
  };

  const handleSeek = (sec: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_VIDEO_SECONDS, sec));
    lastSpokenChapterRef.current = null;
    setCurrentSec(clamped);
  };

  const handleSubmitCheckpoint = () => {
    if (checkpointSelected === null) return;
    setCheckpointChecked(true);
    if (checkpointSelected === lesson.practice.correctIndex) {
      setCheckpointSolved(true);
    }
  };

  const handleContinueAfterCheckpoint = () => {
    setCheckpointSolved(true);
    setCurrentSec(96);
    setIsPlaying(true);
  };

  const handleSaveCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = urlInput.trim();
    if (!clean) {
      onSaveCustomVideoUrl('');
      setUrlError(null);
      return;
    }
    const parsed = parseCustomVideoUrl(clean);
    if (parsed.kind === 'invalid') {
      setUrlError("Iltimos, to'g'ri YouTube havolasi yoki .mp4/.webm video manzilini kiriting.");
      return;
    }
    setUrlError(null);
    onSaveCustomVideoUrl(clean);
  };

  const parsedCustom = customVideoUrl ? parseCustomVideoUrl(customVideoUrl) : null;
  const progressPct = Math.min(100, (currentSec / TOTAL_VIDEO_SECONDS) * 100);
  const codeLines = lesson.codeExample.split('\n');
  const activeCodeLineIndex =
    currentChapter.visualType === 'code'
      ? Math.floor(((currentSec - 48) / 30) * Math.max(1, codeLines.length)) %
        Math.max(1, codeLines.length)
      : -1;

  const isAtCheckpointGate =
    currentChapter.visualType === 'checkpoint' && !checkpointSolved && !isPlaying;

  const youtubeSearchHref = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${lesson.title} dars o'zbekcha`
  )}`;

  return (
    <section
      aria-labelledby="uzbek-video-heading"
      className={`rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] overflow-hidden ${
        cinemaMode ? 'ring-1 ring-[var(--edu-accent)]/40' : ''
      }`}
    >
      <div className="px-5 py-3.5 border-b border-[var(--edu-border)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Video className="w-4 h-4 text-[var(--edu-accent)] shrink-0" />
          <h2
            id="uzbek-video-heading"
            className="text-sm font-semibold text-[var(--edu-ink)]"
          >
            O&apos;zbekcha video dars
          </h2>
          <span className="text-xs text-[var(--edu-muted)] tabular-nums">
            · {isVideoWatched ? "Ko'rilgan (+15 XP)" : '+15 XP mukofot'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPlayerMode('interactive')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              playerMode === 'interactive'
                ? 'bg-[#2563EB]/15 border-[var(--edu-accent)] text-[var(--edu-accent)]'
                : 'bg-[var(--edu-inset)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
            }`}
          >
            Interaktiv video dars
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setPlayerMode('custom');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              playerMode === 'custom'
                ? 'bg-[#2563EB]/15 border-[var(--edu-accent)] text-[var(--edu-accent)]'
                : 'bg-[var(--edu-inset)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>YouTube / Video ulash</span>
          </button>
        </div>
      </div>

      {playerMode === 'interactive' ? (
        <div>
          <div
            className={`relative bg-[#060A13] text-[#F8FAFC] overflow-hidden ${
              cinemaMode ? 'min-h-[380px] sm:min-h-[440px]' : 'min-h-[300px] sm:min-h-[360px]'
            } flex flex-col justify-between`}
          >
            <img
              src={lesson.imageUrl}
              alt={lesson.title}
              className={`absolute inset-0 w-full h-full object-cover opacity-20 transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#060A13] via-[#060A13]/85 to-[#060A13]/75"
              aria-hidden="true"
            />

            {/* Top stage info */}
            <div className="relative z-10 px-5 pt-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#38BDF8] font-medium">
                <span>{currentChapter.title}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#94A3B8]">{course.title}</span>
              </div>
              <span className="text-[#94A3B8] tabular-nums">
                {formatTimer(currentSec)} / {formatTimer(TOTAL_VIDEO_SECONDS)}
              </span>
            </div>

            {/* Center animated visual slide */}
            <div className="relative z-10 px-5 sm:px-8 py-5 flex-1 flex flex-col justify-center">
              {isAtCheckpointGate ? (
                <div className="max-w-xl mx-auto w-full rounded-xl bg-[#0F172A]/95 border border-[#38BDF8]/50 p-4 sm:p-5 space-y-3">
                  <div className="text-xs font-semibold text-[#38BDF8]">
                    Video ichidagi nazorat savoli · Davom etish uchun javob bering
                  </div>
                  <p className="text-sm font-medium text-[#F8FAFC]">{lesson.practice.prompt}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {lesson.practice.options.map((opt, idx) => {
                      const selected = checkpointSelected === idx;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setCheckpointSelected(idx);
                            setCheckpointChecked(false);
                          }}
                          className={`text-left px-3 py-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                            selected
                              ? 'bg-[#2563EB]/25 border-[#38BDF8] text-white'
                              : 'bg-[#060A13] border-[#1E293B] text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {checkpointChecked && (
                    <div
                      className={`text-xs flex items-center gap-2 ${
                        checkpointSolved ? 'text-[#10B981]' : 'text-[#F87171]'
                      }`}
                    >
                      {checkpointSolved ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>
                        {checkpointSolved
                          ? "To'g'ri! Endi xulosa qismini ko'rishingiz mumkin."
                          : "Noto'g'ri variant — yana bir bor urinib ko'ring."}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    {!checkpointSolved ? (
                      <button
                        type="button"
                        disabled={checkpointSelected === null}
                        onClick={handleSubmitCheckpoint}
                        className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-45 text-white text-xs font-semibold cursor-pointer"
                      >
                        Tekshirish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleContinueAfterCheckpoint}
                        className="px-4 py-1.5 rounded-lg bg-[#10B981] text-[#060A13] text-xs font-semibold cursor-pointer"
                      >
                        Videoni davom ettirish
                      </button>
                    )}
                  </div>
                </div>
              ) : currentChapter.visualType === 'code' ? (
                <div className="max-w-2xl mx-auto w-full space-y-3">
                  <div className="text-base sm:text-lg font-bold text-[#F8FAFC]">
                    {currentChapter.headline}
                  </div>
                  <div className="rounded-xl bg-[#0B1120] border border-[#1E293B] p-4 font-mono text-xs sm:text-sm space-y-1 overflow-x-auto">
                    {codeLines.map((line, i) => (
                      <div
                        key={`${lesson.id}-vl-${i}`}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          i === activeCodeLineIndex
                            ? 'bg-[#2563EB]/25 text-[#38BDF8]'
                            : 'text-[#94A3B8]'
                        }`}
                      >
                        <span className="inline-block w-6 text-[#475569] select-none tabular-nums">
                          {i + 1}
                        </span>
                        <span>{line || ' '}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto w-full space-y-3">
                  <h3 className="text-lg sm:text-2xl font-bold text-[#F8FAFC] [text-wrap:balance]">
                    {currentChapter.headline}
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#CBD5E1]">
                    {currentChapter.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-[#38BDF8] font-bold tabular-nums">
                          {idx + 1}.
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Synchronized Uzbek Subtitles */}
            {showSubtitles && (
              <div className="relative z-10 px-5 pb-3 flex justify-center">
                <div className="max-w-2xl rounded-lg bg-[#060A13]/90 border border-[#1E293B] px-4 py-2 text-center text-xs sm:text-sm text-[#F8FAFC] leading-relaxed">
                  {currentChapter.subtitle}
                </div>
              </div>
            )}

            {/* Player Transport Controls */}
            <div className="relative z-10 bg-[#0B1120]/95 border-t border-[#1E293B] px-4 py-3 space-y-2.5">
              {/* Scrubber */}
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={TOTAL_VIDEO_SECONDS}
                  step={1}
                  value={Math.floor(currentSec)}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  aria-label="Video vaqt chizig'i"
                  className="w-full accent-[#38BDF8] h-1.5 cursor-pointer"
                />
                <div
                  className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-l bg-[#38BDF8]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pauza</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{currentSec > 0 && currentSec < TOTAL_VIDEO_SECONDS ? 'Davom ettirish' : "Videoni qo'yish"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRestart}
                    aria-label="Videoni boshidan qo'yish"
                    className="p-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setVoiceEnabled((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      voiceEnabled
                        ? 'bg-[#2563EB]/20 border-[#38BDF8] text-[#38BDF8]'
                        : 'bg-[#0F172A] border-[#1E293B] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {voiceLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : voiceEnabled ? (
                      <Volume2 className="w-3.5 h-3.5" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">
                      {voiceLoading ? 'Ovoz yuklanmoqda...' : 'AI Ovoz'}
                    </span>
                  </button>

                  {voiceEnabled && (
                    <select
                      aria-label="Ovoz turini tanlash"
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value as GeminiVoiceName)}
                      className="h-7 px-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[11px] text-[#94A3B8] focus:outline-none focus:border-[#38BDF8] cursor-pointer"
                    >
                      {GEMINI_VOICES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.id}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSpeed((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1))
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs font-medium text-[#94A3B8] hover:text-white tabular-nums cursor-pointer"
                  >
                    {speed}x
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSubtitles((prev) => !prev)}
                    aria-label="O'zbekcha subtitrlar"
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      showSubtitles
                        ? 'bg-[#2563EB]/20 border-[#38BDF8] text-[#38BDF8]'
                        : 'bg-[#0F172A] border-[#1E293B] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <Subtitles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Subtitr</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCinemaMode((prev) => !prev)}
                    aria-label="Katta ekran"
                    className="p-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                  >
                    {cinemaMode ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {voiceError && (
                <div className="rounded-lg bg-[#F87171]/15 border border-[#F87171]/40 px-3 py-2 text-xs text-[#F87171]">
                  {voiceError}
                </div>
              )}
            </div>
          </div>

          {/* Chapter jump bar */}
          <div className="p-3 bg-[var(--edu-inset)] border-t border-[var(--edu-border)] flex flex-wrap items-center gap-1.5">
            {chapters.map((ch) => {
              const active = ch.id === currentChapter.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    handleSeek(ch.startSec);
                    setIsPlaying(ch.visualType !== 'checkpoint');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#2563EB]/15 border-[var(--edu-accent)] text-[var(--edu-accent)]'
                      : 'bg-[var(--edu-card)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
                  }`}
                >
                  {ch.title}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          <form onSubmit={handleSaveCustomUrl} className="space-y-3">
            <label
              htmlFor="custom-video-url"
              className="block text-xs font-medium text-[var(--edu-muted)]"
            >
              Ushbu dars uchun YouTube (masalan, o&apos;zbekcha video dars) yoki .mp4 havolasini kiriting:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="custom-video-url"
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 h-10 px-3.5 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] text-sm text-[var(--edu-ink)] placeholder:text-[var(--edu-muted)]/60 focus:outline-none focus:border-[var(--edu-accent)]"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
              >
                Videoni ulash
              </button>
            </div>
            {urlError && <p className="text-xs text-[#F87171]">{urlError}</p>}
          </form>

          {parsedCustom && parsedCustom.kind === 'youtube' && (
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-[var(--edu-border)] bg-black">
              <iframe
                src={parsedCustom.embedUrl}
                title={`${lesson.title} YouTube video`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {parsedCustom && parsedCustom.kind === 'direct' && (
            <video
              src={parsedCustom.srcUrl}
              controls
              onEnded={onMarkVideoWatched}
              className="aspect-video w-full rounded-xl border border-[var(--edu-border)] bg-black"
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-[var(--edu-muted)]">
            <span>YouTube&apos;da shu mavzu bo&apos;yicha o&apos;zbekcha darslarni topish:</span>
            <a
              href={youtubeSearchHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-[var(--edu-accent)] hover:underline"
            >
              <span>YouTube&apos;da qidirish</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
};
