import React, { useMemo, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { generateAndroidMainActivityKotlin } from '../data/androidKotlinExport';
import { EDU_COURSES, EDU_FLASHCARDS, TOTAL_LESSONS_COUNT, TOTAL_QUIZ_COUNT } from '../data/eduCourses';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  const [packageName, setPackageName] = useState('com.example.myapplication');
  const [activeTab, setActiveTab] = useState<'kotlin' | 'strings'>('kotlin');
  const [copied, setCopied] = useState(false);

  const kotlinSource = useMemo(
    () => generateAndroidMainActivityKotlin(packageName),
    [packageName]
  );

  const stringsXmlSource = `<resources>\n    <string name="app_name">EduPlatform</string>\n</resources>\n`;

  if (!isOpen) return null;

  const currentCode = activeTab === 'kotlin' ? kotlinSource : stringsXmlSource;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#060A13]/85 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Android MainActivity.kt kodi"
    >
      <div className="w-full max-w-4xl max-h-[88vh] rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--edu-border)] flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--edu-ink)]">
              Yangilangan Android Compose kodi (EduPlatform)
            </h2>
            <p className="text-xs text-[var(--edu-muted)] mt-0.5 tabular-nums">
              {EDU_COURSES.length} ta kurs, {TOTAL_LESSONS_COUNT} ta dars (1→{TOTAL_LESSONS_COUNT}), {EDU_FLASHCARDS.length} kartochka, {TOTAL_QUIZ_COUNT} test, Amaliyot markazi, Mock Imtihon, Pomodoro, Tarjimon, Muhokama, Yutuq nishonlari va Sertifikatlar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="p-2 rounded-lg border border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)] hover:border-[var(--edu-accent)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-[var(--edu-border)] bg-[var(--edu-nav)] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="inline-flex rounded-lg bg-[var(--edu-inset)] border border-[var(--edu-border)] p-0.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('kotlin');
                  setCopied(false);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'kotlin'
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
                }`}
              >
                MainActivity.kt
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('strings');
                  setCopied(false);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'strings'
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
                }`}
              >
                strings.xml (Ilova nomi: EduPlatform)
              </button>
            </div>

            {activeTab === 'kotlin' && (
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <label className="text-xs font-medium text-[var(--edu-muted)] whitespace-nowrap">
                  Package:
                </label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="flex-1 max-w-xs h-8 px-3 rounded-lg bg-[var(--edu-inset)] border border-[var(--edu-border)] text-xs font-mono text-[var(--edu-ink)] focus:outline-none focus:border-[var(--edu-accent)]"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="h-9 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Nusxa olindi!' : 'Koddan nusxa olish'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-[#060A13] p-5">
          <pre className="text-xs font-mono text-[#38BDF8] leading-relaxed whitespace-pre">
            <code>{currentCode}</code>
          </pre>
        </div>

        <div className="px-6 py-3 border-t border-[var(--edu-border)] bg-[var(--edu-nav)] text-xs text-[var(--edu-muted)] space-y-1">
          {activeTab === 'kotlin' ? (
            <p>
              Android Studio&apos;da <span className="text-[var(--edu-ink)] font-mono">MainActivity.kt</span> faylini
              to&apos;liq almashtiring, keyin telefoningizdagi ilova nomini ham o&apos;zgartirish uchun{' '}
              <span className="text-[var(--edu-ink)] font-semibold">strings.xml</span> bo&apos;limiga o&apos;ting.
            </p>
          ) : (
            <p>
              Telefondagi &quot;My Application&quot; nomini <span className="text-[var(--edu-ink)] font-semibold">EduPlatform</span> ga almashtirish uchun Android Studio&apos;da{' '}
              <span className="text-[var(--edu-ink)] font-mono">app → res → values → strings.xml</span> faylini ochib, shu kod bilan almashtiring.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
