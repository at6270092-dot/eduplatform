import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ExternalLink,
  Languages,
  Lightbulb,
  ListChecks,
  Loader2,
  Maximize2,
  Minimize2,
  Square,
  Volume2,
} from 'lucide-react';
import {
  CourseItem,
  DiscussionPostType,
  LessonDiscussionPost,
  LessonItem,
  LessonQuizScoreRecord,
  UserAccount,
} from '../types/edu';
import { fetchGeminiSpeechWav } from '../utils/geminiAudioClient';
import { buildDeepLessonBreakdown } from '../utils/lessonContentBuilder';
import { EduMediaBanner } from './EduMediaBanner';
import { LessonCodePlayground } from './LessonCodePlayground';
import { LessonDiscussion } from './LessonDiscussion';
import { LessonQuestionsSection } from './LessonQuestionsSection';
import { UzbekLessonVideo } from './UzbekLessonVideo';

interface LessonViewProps {
  course: CourseItem;
  lesson: LessonItem;
  currentUser: UserAccount;
  discussions: LessonDiscussionPost[];
  isCompleted: boolean;
  isVideoWatched: boolean;
  customVideoUrl: string;
  lessonQuizScore?: LessonQuizScoreRecord;
  isBookmarked: boolean;
  initialNote: string;
  hasNextLesson: boolean;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  onBack: () => void;
  onToggleBookmark: () => void;
  onSaveNote: (note: string) => void;
  onMarkVideoWatched: () => void;
  onSaveCustomVideoUrl: (url: string) => void;
  onCompleteLessonQuiz: (score: number, total: number) => void;
  onAddDiscussionPost: (postType: DiscussionPostType, text: string) => void;
  onAddDiscussionReply: (postId: string, text: string) => void;
  onToggleDiscussionHelpful: (postId: string) => void;
  onDeleteDiscussionPost: (postId: string) => void;
  onMarkCompleted: () => void;
  onMarkPracticeCompleted: () => void;
  onOpenLiveTranslate: () => void;
  onNextLesson: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  course,
  lesson,
  currentUser,
  discussions,
  isCompleted,
  isVideoWatched,
  customVideoUrl,
  lessonQuizScore,
  isBookmarked,
  initialNote,
  hasNextLesson,
  focusMode,
  onToggleFocusMode,
  onBack,
  onToggleBookmark,
  onSaveNote,
  onMarkVideoWatched,
  onSaveCustomVideoUrl,
  onCompleteLessonQuiz,
  onAddDiscussionPost,
  onAddDiscussionReply,
  onToggleDiscussionHelpful,
  onDeleteDiscussionPost,
  onMarkCompleted,
  onMarkPracticeCompleted,
  onOpenLiveTranslate,
  onNextLesson,
}) => {
  const [noteText, setNoteText] = useState(initialNote);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
  const [theoryAudioState, setTheoryAudioState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [theoryAudioError, setTheoryAudioError] = useState<string | null>(null);
  const theoryAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopTheoryAudio = () => {
    if (theoryAudioRef.current) {
      theoryAudioRef.current.pause();
      theoryAudioRef.current.currentTime = 0;
      theoryAudioRef.current = null;
    }
    setTheoryAudioState('idle');
  };

  useEffect(() => {
    setNoteText(initialNote);
    setNoteSavedFeedback(false);
    setTheoryAudioError(null);
    stopTheoryAudio();
  }, [lesson.id, initialNote]);

  useEffect(() => {
    return () => {
      stopTheoryAudio();
    };
  }, []);

  const handleToggleTheoryAudio = async () => {
    if (theoryAudioState === 'playing' || theoryAudioState === 'loading') {
      stopTheoryAudio();
      return;
    }

    setTheoryAudioError(null);
    setTheoryAudioState('loading');
    try {
      const rawText = `${lesson.order}-dars: ${lesson.title}. ${lesson.summary} ${lesson.content}`;
      const boundedText =
        rawText.length > 1750
          ? `${rawText.slice(0, rawText.lastIndexOf(' ', 1750) || 1750)}.`
          : rawText;
      const wavUrl = await fetchGeminiSpeechWav(boundedText, 'Kore');
      const audio = new Audio(wavUrl);
      theoryAudioRef.current = audio;
      audio.onended = () => {
        setTheoryAudioState('idle');
        theoryAudioRef.current = null;
      };
      await audio.play();
      setTheoryAudioState('playing');
    } catch (err) {
      setTheoryAudioState('idle');
      setTheoryAudioError(
        err instanceof Error
          ? err.message
          : 'Ovozli o‘qishda xatolik yuz berdi.'
      );
    }
  };

  const handleSaveNote = () => {
    onSaveNote(noteText);
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 1800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-sm font-medium text-[var(--edu-ink)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{course.title}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenLiveTranslate}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-sm font-medium text-[var(--edu-ink)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Languages className="w-4 h-4 text-[var(--edu-accent)]" />
            <span>Jonli tarjimon</span>
          </button>

          <button
            type="button"
            onClick={onToggleFocusMode}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              focusMode
                ? 'bg-[#2563EB]/15 border-[var(--edu-accent)] text-[var(--edu-accent)]'
                : 'bg-[var(--edu-card)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
            }`}
          >
            {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{focusMode ? 'Oddiy ko‘rinish' : 'Fokus rejimi'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleBookmark}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isBookmarked
                ? 'bg-[#2563EB]/15 border-[var(--edu-accent)] text-[var(--edu-accent)]'
                : 'bg-[var(--edu-card)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>{isBookmarked ? 'Saqlangan' : 'Saqlash'}</span>
          </button>
        </div>
      </div>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--edu-accent)] tabular-nums">
          <span>{lesson.moduleTitle}</span>
          <span aria-hidden="true">·</span>
          <span>{lesson.order}-dars</span>
          <span aria-hidden="true">·</span>
          <span>{lesson.durationMinutes} daqiqa</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--edu-ink)] [text-wrap:balance]">
          {lesson.title}
        </h1>
        <p className="text-sm sm:text-base text-[var(--edu-muted)]">{lesson.summary}</p>
      </header>

      <EduMediaBanner
        src={lesson.imageUrl}
        alt={lesson.title}
        caption={lesson.imageCaption}
        heightClass="h-44 sm:h-56"
        className="rounded-2xl border border-[var(--edu-border)]"
      />

      <UzbekLessonVideo
        lesson={lesson}
        course={course}
        isVideoWatched={isVideoWatched}
        customVideoUrl={customVideoUrl}
        onMarkVideoWatched={onMarkVideoWatched}
        onSaveCustomVideoUrl={onSaveCustomVideoUrl}
      />

      <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--edu-accent)]">Nazariya</h2>
          <button
            type="button"
            onClick={handleToggleTheoryAudio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-xs font-semibold text-[var(--edu-ink)] transition-colors cursor-pointer"
          >
            {theoryAudioState === 'loading' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--edu-accent)]" />
                <span>Ovoz tayyorlanmoqda...</span>
              </>
            ) : theoryAudioState === 'playing' ? (
              <>
                <Square className="w-3.5 h-3.5 text-[#F87171] fill-current" />
                <span>Ovozni to&apos;xtatish</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[var(--edu-accent)]" />
                <span>Darsni ovozli tinglash</span>
              </>
            )}
          </button>
        </div>
        <p className="text-base text-[var(--edu-ink)] leading-relaxed">{lesson.content}</p>
        {theoryAudioError && (
          <p className="text-xs text-[#F87171]">{theoryAudioError}</p>
        )}
      </section>

      {(() => {
        const breakdown = buildDeepLessonBreakdown(lesson, course);
        return (
          <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--edu-accent)]">
              <ListChecks className="w-4 h-4 shrink-0" />
              <span>Qadam-baqadam dars tahlili va amaliy topshiriq</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--edu-muted)]">
                Asosiy qoidalar
              </h3>
              <ul className="space-y-2">
                {breakdown.conceptPoints.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-[var(--edu-ink)]/95 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-md bg-[var(--edu-inset)] border border-[var(--edu-border)] text-[11px] font-bold text-[var(--edu-accent)] flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                      {idx + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {breakdown.lineExplanations.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--edu-border)]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--edu-muted)]">
                  Kod satrlari tahlili
                </h3>
                <div className="divide-y divide-[var(--edu-border)] rounded-xl border border-[var(--edu-border)] bg-[var(--edu-inset)] overflow-hidden">
                  {breakdown.lineExplanations.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2.5 grid grid-cols-1 md:grid-cols-12 gap-2 items-baseline"
                    >
                      <code className="md:col-span-5 text-xs font-mono text-[var(--edu-accent)] break-all">
                        {item.code.trim()}
                      </code>
                      <span className="md:col-span-7 text-xs text-[var(--edu-muted)] leading-relaxed">
                        {item.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-[#2563EB]/10 border border-[var(--edu-accent)]/30 px-4 py-3 text-xs sm:text-sm text-[var(--edu-ink)]">
              <span className="font-semibold text-[var(--edu-accent)]">Mustaqil sinov: </span>
              {breakdown.practiceTask}
            </div>
          </section>
        );
      })()}

      <LessonCodePlayground
        lessonId={lesson.id}
        courseId={course.id}
        initialCode={lesson.codeExample}
      />

      <LessonQuestionsSection
        lesson={lesson}
        course={course}
        savedScore={lessonQuizScore}
        onCompleteLessonQuiz={onCompleteLessonQuiz}
        onMarkPracticeCompleted={onMarkPracticeCompleted}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[var(--edu-card)] border border-[#F87171]/35 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F87171] mb-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Ko&apos;p uchraydigan xato</span>
          </div>
          <p className="text-sm text-[var(--edu-ink)]/90 leading-relaxed">{lesson.commonMistake}</p>
        </div>

        <div className="rounded-2xl bg-[var(--edu-card)] border border-[#10B981]/35 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981] mb-2">
            <Lightbulb className="w-4 h-4 shrink-0" />
            <span>Asosiy xulosa</span>
          </div>
          <p className="text-sm text-[var(--edu-ink)]/90 leading-relaxed">{lesson.takeaway}</p>
        </div>
      </div>

      <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-[var(--edu-ink)]">Mening shaxsiy konspektim</h2>
          {noteSavedFeedback && (
            <span className="text-xs font-medium text-[#10B981]">Konspekt saqlandi</span>
          )}
        </div>
        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Shu dars bo'yicha o'z eslatmangizni yozib qo'ying..."
          className="w-full p-3.5 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] text-sm text-[var(--edu-ink)] placeholder:text-[var(--edu-muted)]/60 focus:outline-none focus:border-[var(--edu-accent)]"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveNote}
            className="px-4 py-2 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-xs font-semibold text-[var(--edu-accent)] transition-colors cursor-pointer"
          >
            Konspektni saqlash
          </button>
        </div>
      </section>

      <LessonDiscussion
        lessonId={lesson.id}
        currentUser={currentUser}
        discussions={discussions}
        onAddPost={onAddDiscussionPost}
        onAddReply={onAddDiscussionReply}
        onToggleHelpful={onToggleDiscussionHelpful}
        onDeletePost={onDeleteDiscussionPost}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <a
          href={lesson.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--edu-border)] bg-[var(--edu-card)] hover:border-[var(--edu-accent)] text-sm font-medium text-[var(--edu-ink)] transition-colors whitespace-nowrap"
        >
          <span>Qo&apos;llanma / rasmiy hujjat</span>
          <ExternalLink className="w-4 h-4 text-[var(--edu-accent)]" />
        </a>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMarkCompleted}
            disabled={isCompleted}
            className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap inline-flex items-center justify-center gap-2 ${
              isCompleted
                ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] cursor-default'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isCompleted ? 'Yakunlangan (+20 XP)' : 'Darsni yakunlash'}</span>
          </button>

          {hasNextLesson && (
            <button
              type="button"
              onClick={onNextLesson}
              className="px-5 py-3 rounded-xl border border-[var(--edu-border)] bg-[var(--edu-card)] hover:border-[var(--edu-accent)] text-sm font-medium text-[var(--edu-ink)] transition-colors whitespace-nowrap inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Keyingi dars</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
