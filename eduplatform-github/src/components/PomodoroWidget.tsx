import React, { useEffect, useState } from 'react';
import { Coffee, Pause, Play, RotateCcw, Timer, X } from 'lucide-react';

interface PomodoroWidgetProps {
  completedSessions: number;
  onCompleteSession: () => void;
}

const FOCUS_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

function playGentleChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // AudioContext blocked or unsupported
  }
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  completedSessions,
  onCompleteSession,
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SEC);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          playGentleChime();
          if (mode === 'focus') {
            onCompleteSession();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, mode, onCompleteSession]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const switchMode = (nextMode: 'focus' | 'break') => {
    setRunning(false);
    setMode(nextMode);
    setSecondsLeft(nextMode === 'focus' ? FOCUS_SEC : BREAK_SEC);
  };

  return (
    <div className="fixed bottom-20 md:bottom-5 right-4 z-40 no-print">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-11 px-4 rounded-full bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] shadow-lg inline-flex items-center gap-2 text-xs font-semibold text-[var(--edu-ink)] transition-colors cursor-pointer"
        >
          <Timer className={`w-4 h-4 ${running ? 'text-[#10B981]' : 'text-[var(--edu-accent)]'}`} />
          <span className="tabular-nums">
            {running ? `${mins}:${secs}` : 'Fokus taymeri'}
          </span>
        </button>
      ) : (
        <div className="w-72 rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] shadow-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--edu-ink)]">
              <Timer className="w-4 h-4 text-[var(--edu-accent)]" />
              <span>Pomodoro taymer</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Taymerni yig'ish"
              className="p-1 rounded-lg text-[var(--edu-muted)] hover:text-[var(--edu-ink)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => switchMode('focus')}
              className={`py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                mode === 'focus'
                  ? 'bg-[#2563EB]/15 border border-[var(--edu-accent)] text-[var(--edu-accent)]'
                  : 'bg-[var(--edu-inset)] border border-[var(--edu-border)] text-[var(--edu-muted)]'
              }`}
            >
              Fokus (25 daq)
            </button>
            <button
              type="button"
              onClick={() => switchMode('break')}
              className={`py-1.5 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                mode === 'break'
                  ? 'bg-[#10B981]/15 border border-[#10B981]/60 text-[#10B981]'
                  : 'bg-[var(--edu-inset)] border border-[var(--edu-border)] text-[var(--edu-muted)]'
              }`}
            >
              <Coffee className="w-3 h-3" />
              <span>Tanaffus (5 daq)</span>
            </button>
          </div>

          <div className="text-center py-2 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)]">
            <div className="text-3xl font-bold text-[var(--edu-ink)] tabular-nums tracking-tight">
              {mins}:{secs}
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--edu-muted)] tabular-nums">
              Yakunlangan sessiyalar: {completedSessions} ta (+10 XP)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (secondsLeft === 0) {
                  setSecondsLeft(mode === 'focus' ? FOCUS_SEC : BREAK_SEC);
                }
                setRunning((prev) => !prev);
              }}
              className="flex-1 h-9 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {running ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pauza</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Boshlash</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setRunning(false);
                setSecondsLeft(mode === 'focus' ? FOCUS_SEC : BREAK_SEC);
              }}
              aria-label="Taymerni qayta o'rnatish"
              className="h-9 px-3 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
