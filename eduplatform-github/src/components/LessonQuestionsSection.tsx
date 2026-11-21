import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { CourseItem, LessonItem, LessonQuizScoreRecord } from '../types/edu';
import { buildLessonQuestions } from '../utils/lessonContentBuilder';

interface LessonQuestionsSectionProps {
  lesson: LessonItem;
  course: CourseItem;
  savedScore?: LessonQuizScoreRecord;
  onCompleteLessonQuiz: (score: number, total: number) => void;
  onMarkPracticeCompleted: () => void;
}

export const LessonQuestionsSection: React.FC<LessonQuestionsSectionProps> = ({
  lesson,
  course,
  savedScore,
  onCompleteLessonQuiz,
  onMarkPracticeCompleted,
}) => {
  const questions = useMemo(
    () => buildLessonQuestions(lesson, course),
    [lesson, course]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [submittedSummary, setSubmittedSummary] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setSelectedAnswers({});
    setCheckedIds({});
    setSubmittedSummary(false);
  }, [lesson.id]);

  const activeQuestion = questions[activeIndex];
  const selectedOption = selectedAnswers[activeQuestion.id] ?? null;
  const isChecked = Boolean(checkedIds[activeQuestion.id]);
  const isCorrect = isChecked && selectedOption === activeQuestion.correctIndex;

  const checkedCount = questions.filter((q) => checkedIds[q.id]).length;
  const correctCount = questions.filter(
    (q) => checkedIds[q.id] && selectedAnswers[q.id] === q.correctIndex
  ).length;

  const handleSelectOption = (idx: number) => {
    if (isChecked) return;
    setSelectedAnswers((prev) => ({ ...prev, [activeQuestion.id]: idx }));
  };

  const handleCheckCurrent = () => {
    if (selectedOption === null) return;
    const nextChecked = { ...checkedIds, [activeQuestion.id]: true };
    setCheckedIds(nextChecked);

    if (activeIndex === 0 && selectedOption === activeQuestion.correctIndex) {
      onMarkPracticeCompleted();
    }

    const totalCheckedNow = questions.filter((q) => nextChecked[q.id]).length;
    if (totalCheckedNow === questions.length) {
      const totalScore = questions.filter(
        (q) =>
          nextChecked[q.id] &&
          (q.id === activeQuestion.id ? selectedOption : selectedAnswers[q.id]) ===
            q.correctIndex
      ).length;
      setSubmittedSummary(true);
      onCompleteLessonQuiz(totalScore, questions.length);
    }
  };

  const handleResetQuiz = () => {
    setActiveIndex(0);
    setSelectedAnswers({});
    setCheckedIds({});
    setSubmittedSummary(false);
  };

  return (
    <section
      aria-labelledby="lesson-questions-heading"
      className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[var(--edu-accent)] shrink-0" />
          <h2
            id="lesson-questions-heading"
            className="text-sm font-semibold text-[var(--edu-ink)]"
          >
            Shu darsdan savollar (Bilimni tekshirish)
          </h2>
          <span className="text-xs text-[var(--edu-muted)] tabular-nums">
            · {questions.length} ta savol
          </span>
        </div>

        <span
          className={`text-xs font-semibold tabular-nums ${
            savedScore ? 'text-[#10B981]' : 'text-[var(--edu-muted)]'
          }`}
        >
          {savedScore
            ? `Eng yaxshi natija: ${savedScore.score} / ${savedScore.total} (+25 XP)`
            : '+25 XP mukofot'}
        </span>
      </div>

      {/* Question selector tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {questions.map((q, idx) => {
            const qChecked = Boolean(checkedIds[q.id]);
            const qCorrect = qChecked && selectedAnswers[q.id] === q.correctIndex;
            const isCurrent = idx === activeIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors tabular-nums cursor-pointer ${
                  isCurrent
                    ? 'bg-[#2563EB] border-[#2563EB] text-white'
                    : qChecked
                    ? qCorrect
                      ? 'bg-[#10B981]/15 border-[#10B981]/50 text-[#10B981]'
                      : 'bg-[#F87171]/15 border-[#F87171]/50 text-[#F87171]'
                    : 'bg-[var(--edu-inset)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
                }`}
              >
                {idx + 1}-savol · {q.category}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-[var(--edu-muted)] tabular-nums">
          Tekshirilgan: {checkedCount} / {questions.length}
        </span>
      </div>

      {/* Active question card */}
      <div className="rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] p-5 space-y-4">
        <div className="text-xs font-medium text-[var(--edu-accent)]">
          {activeIndex + 1}-savol · {activeQuestion.category}
        </div>
        <p className="text-sm sm:text-base font-medium text-[var(--edu-ink)] leading-relaxed">
          {activeQuestion.question}
        </p>

        {activeQuestion.codeSnippet && (
          <pre className="p-4 rounded-xl bg-[#0B1120] border border-[#1E293B] overflow-x-auto text-xs sm:text-sm font-mono text-[#38BDF8] leading-relaxed">
            <code>{activeQuestion.codeSnippet}</code>
          </pre>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {activeQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isRightOpt = idx === activeQuestion.correctIndex;

            let optionClass =
              'bg-[var(--edu-card)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:border-[var(--edu-accent)]/60 hover:text-[var(--edu-ink)]';

            if (isChecked) {
              if (isRightOpt) {
                optionClass = 'bg-[#10B981]/15 border-[#10B981]/60 text-[#10B981]';
              } else if (isSelected) {
                optionClass = 'bg-[#F87171]/15 border-[#F87171]/60 text-[#F87171]';
              } else {
                optionClass = 'bg-[var(--edu-card)] border-[var(--edu-border)] text-[var(--edu-muted)] opacity-60';
              }
            } else if (isSelected) {
              optionClass = 'bg-[#2563EB]/15 border-[var(--edu-accent)] text-[var(--edu-ink)]';
            }

            return (
              <button
                key={`${activeQuestion.id}-${idx}`}
                type="button"
                disabled={isChecked}
                onClick={() => handleSelectOption(idx)}
                className={`text-left px-4 py-3 rounded-xl border text-xs sm:text-sm transition-colors cursor-pointer disabled:cursor-default ${optionClass}`}
              >
                <span className="font-semibold mr-2 tabular-nums">
                  {String.fromCharCode(65 + idx)})
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {isChecked && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-2.5 ${
              isCorrect
                ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]'
                : 'bg-[#F87171]/10 border-[#F87171]/40 text-[#F87171]'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold">
                {isCorrect ? "To'g'ri javob!" : "Noto'g'ri tanlov — izohga qarang:"}
              </div>
              <p className="mt-1 text-xs text-[var(--edu-ink)]/90">
                {activeQuestion.explanation}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            className="px-3.5 py-2 rounded-xl border border-[var(--edu-border)] bg-[var(--edu-card)] text-xs font-medium text-[var(--edu-ink)] disabled:opacity-40 cursor-pointer"
          >
            Oldingi savol
          </button>

          <div className="flex items-center gap-2">
            {!isChecked ? (
              <button
                type="button"
                disabled={selectedOption === null}
                onClick={handleCheckCurrent}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-45 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Javobni tekshirish
              </button>
            ) : activeIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveIndex((i) => i + 1)}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Keyingi savol
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {submittedSummary && (
        <div className="rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-[var(--edu-ink)]">
            <span className="font-bold text-[#10B981] tabular-nums">
              Dars savollari yakunlandi: {correctCount} / {questions.length} (
              {Math.round((correctCount / questions.length) * 100)}%)
            </span>
            <span className="ml-2 text-[var(--edu-muted)]">
              Natija profilingizga saqlandi.
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetQuiz}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--edu-border)] bg-[var(--edu-card)] text-xs font-medium text-[var(--edu-ink)] hover:border-[var(--edu-accent)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Qayta ishlash</span>
          </button>
        </div>
      )}
    </section>
  );
};
