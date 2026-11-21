import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Award, CheckCircle2, Play, RefreshCw, Timer, XCircle } from 'lucide-react';
import { CourseItem, MockExamRecord, QuizQuestion, QuizResultRecord } from '../types/edu';

interface QuizzesListViewProps {
  courses: CourseItem[];
  quizResults: QuizResultRecord[];
  mockExamResults: MockExamRecord[];
  onStartQuiz: (courseId: string) => void;
  onStartMockExam: () => void;
}

export const QuizzesListView: React.FC<QuizzesListViewProps> = ({
  courses,
  quizResults,
  mockExamResults,
  onStartQuiz,
  onStartMockExam,
}) => {
  const bestScoreByCourse = useMemo(() => {
    const map = new Map<string, number>();
    for (const record of quizResults) {
      const prev = map.get(record.courseId);
      if (prev === undefined || record.percentage > prev) {
        map.set(record.courseId, record.percentage);
      }
    }
    return map;
  }, [quizResults]);

  const bestMockExam = useMemo(() => {
    if (mockExamResults.length === 0) return null;
    return Math.max(...mockExamResults.map((r) => r.percentage));
  }, [mockExamResults]);

  const totalQuizCount = useMemo(
    () => courses.reduce((acc, c) => acc + c.quiz.length, 0),
    [courses]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--edu-ink)]">
          Testlar va Vaqtli Imtihon
        </h1>
        <p className="mt-1 text-sm text-[var(--edu-muted)]">
          Har bir fandan 10 tadan jami {totalQuizCount} ta test savoli. 70% va undan yuqori natija uchun shaxsiy
          sertifikat avtomatik ochiladi.
        </p>
      </div>

      <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-accent)]/50 p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--edu-accent)]">
            <Timer className="w-4 h-4" />
            <span>Vaqtli Umumiy Imtihon · 15 daqiqa · 20 ta aralash savol</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--edu-ink)]">
            Barcha {courses.length} ta fan bo&apos;yicha Mock Imtihon
          </h2>
          <p className="text-sm text-[var(--edu-muted)]">
            {totalQuizCount} ta savol bazasidan tasodifiy tanlangan 20 ta savolga 15 daqiqa ichida javob bering.
            Muvaffaqiyatli topshirish uchun +60 XP beriladi.
            {bestMockExam !== null ? ` Eng yaxshi natijangiz: ${bestMockExam}%` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={onStartMockExam}
          className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#060A13] text-sm font-bold transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Timer className="w-4 h-4" />
          <span>Imtihonni boshlash</span>
        </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => {
          const best = bestScoreByCourse.get(course.id);
          const passed = best !== undefined && best >= 70;

          return (
            <div
              key={course.id}
              className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-[var(--edu-accent)] font-medium">
                    {course.category} · {course.quiz.length} ta savol
                  </span>
                  {best !== undefined && (
                    <span
                      className={`font-semibold tabular-nums ${
                        passed ? 'text-[#10B981]' : 'text-[var(--edu-ink)]'
                      }`}
                    >
                      Eng yaxshi: {best}%{passed ? ' · Sertifikat ochilgan' : ''}
                    </span>
                  )}
                </div>

                <h2 className="mt-2 text-xl font-bold text-[var(--edu-ink)]">{course.title}</h2>
                <p className="mt-2 text-sm text-[var(--edu-muted)]">{course.description}</p>
              </div>

              <div className="pt-4 border-t border-[var(--edu-border)] flex items-center justify-between gap-4">
                <span className="text-xs text-[var(--edu-muted)] tabular-nums">
                  Minimal o&apos;tish bali: 70%
                </span>
                <button
                  type="button"
                  onClick={() => onStartQuiz(course.id)}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>{best !== undefined ? 'Qayta topshirish' : 'Testni boshlash'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface QuizRunnerViewProps {
  course: CourseItem;
  onBack: () => void;
  onSubmitResult: (score: number, totalQuestions: number, percentage: number) => void;
  onOpenProfileCertificates: () => void;
}

export const QuizRunnerView: React.FC<QuizRunnerViewProps> = ({
  course,
  onBack,
  onSubmitResult,
  onOpenProfileCertificates,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [warningText, setWarningText] = useState<string | null>(null);

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = course.quiz.length;
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const correctCount = useMemo(() => {
    return course.quiz.reduce((acc, q) => {
      return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
    }, 0);
  }, [course.quiz, selectedAnswers]);

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = percentage >= 70;

  const handleFinish = () => {
    if (answeredCount < totalQuestions) {
      setWarningText("Barcha savollarga javob belgilang, shundan so'ng natijani tekshiring.");
      return;
    }
    setWarningText(null);
    setSubmitted(true);
    onSubmitResult(correctCount, totalQuestions, percentage);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setWarningText(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-sm font-medium text-[var(--edu-ink)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Testlarga qaytish</span>
        </button>

        <span className="text-xs text-[var(--edu-muted)] tabular-nums">
          Javob berilgan: {answeredCount} / {totalQuestions}
        </span>
      </div>

      <header className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6">
        <div className="text-xs font-medium text-[var(--edu-accent)]">
          {course.category} · Bilimni tekshirish
        </div>
        <h1 className="mt-1 text-2xl font-bold text-[var(--edu-ink)]">{course.title}</h1>
        <div className="mt-4 h-2 w-full rounded-full bg-[var(--edu-border)] overflow-hidden">
          <div className="h-full bg-[#38BDF8] transition-all duration-200" style={{ width: `${progressPct}%` }} />
        </div>
      </header>

      {submitted ? (
        <div className="space-y-6">
          <section
            className={`rounded-2xl border p-6 sm:p-8 ${
              passed
                ? 'bg-[#10B981]/10 border-[#10B981]/40'
                : 'bg-[var(--edu-card)] border-[#F87171]/40'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div
                  className={`text-sm font-semibold ${
                    passed ? 'text-[#10B981]' : 'text-[#F87171]'
                  }`}
                >
                  {passed
                    ? 'Tabriklaymiz! Test muvaffaqiyatli topshirildi (+40 XP)'
                    : "Yana urinib ko'ring — sertifikat uchun kamida 70% kerak"}
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-bold text-[var(--edu-ink)] tabular-nums">
                  {correctCount} / {totalQuestions} ({percentage}%)
                </div>
                {passed && (
                  <p className="mt-2 text-sm text-[var(--edu-muted)]">
                    Siz ushbu kurs uchun shaxsiy raqamli sertifikatga ega bo&apos;ldingiz.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {passed && (
                  <button
                    type="button"
                    onClick={onOpenProfileCertificates}
                    className="h-11 px-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#060A13] text-sm font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Sertifikatni ko&apos;rish</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRetry}
                  className="h-11 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Qayta topshirish</span>
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--edu-ink)]">Savollar tahlili</h2>
            {course.quiz.map((q, index) => {
              const userChoice = selectedAnswers[q.id];
              const isRight = userChoice === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-semibold text-[var(--edu-ink)]">
                      {index + 1}. {q.question}
                    </h3>
                    {isRight ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[#F87171] shrink-0" />
                    )}
                  </div>

                  <div className="text-sm space-y-1">
                    <div className={isRight ? 'text-[#10B981]' : 'text-[#F87171]'}>
                      Sizning javobingiz: {q.options[userChoice] ?? 'Tanlanmagan'}
                    </div>
                    {!isRight && (
                      <div className="text-[#10B981]">
                        To&apos;g&apos;ri javob: {q.options[q.correctIndex]}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-[var(--edu-muted)] pt-2 border-t border-[var(--edu-border)]">
                    Izoh: {q.explanation}
                  </p>
                </div>
              );
            })}
          </section>
        </div>
      ) : (
        <div className="space-y-4">
          {course.quiz.map((q, index) => {
            const chosen = selectedAnswers[q.id];
            return (
              <div
                key={q.id}
                className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-5 sm:p-6 space-y-4"
              >
                <h2 className="text-base sm:text-lg font-semibold text-[var(--edu-ink)]">
                  {index + 1}. {q.question}
                </h2>
                <div className="space-y-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                          setWarningText(null);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-[#2563EB]/15 border-[var(--edu-accent)] text-[var(--edu-ink)]'
                            : 'bg-[var(--edu-inset)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:border-[var(--edu-accent)]/50 hover:text-[var(--edu-ink)]'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[var(--edu-accent)]' : 'border-[var(--edu-muted)]'
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[var(--edu-accent)]" />}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {warningText && (
            <div className="rounded-xl bg-[#F87171]/10 border border-[#F87171]/40 px-4 py-3 text-sm text-[#F87171]">
              {warningText}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleFinish}
              className="h-12 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Natijani tekshirish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface MockExamRunnerViewProps {
  courses: CourseItem[];
  onBack: () => void;
  onSubmitMockExam: (score: number, totalQuestions: number, percentage: number, durationSeconds: number) => void;
}

function pickRandomExamQuestions(courses: CourseItem[], count = 20): Array<{ courseTitle: string; q: QuizQuestion }> {
  const pool = courses.flatMap((c) => c.quiz.map((q) => ({ courseTitle: c.title, q })));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

const EXAM_DURATION_SEC = 15 * 60;

export const MockExamRunnerView: React.FC<MockExamRunnerViewProps> = ({
  courses,
  onBack,
  onSubmitMockExam,
}) => {
  const [questions, setQuestions] = useState(() => pickRandomExamQuestions(courses, 20));
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answersRef = React.useRef<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(EXAM_DURATION_SEC);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const finalizeExam = (currentAnswers: Record<string, number>, elapsedSec: number) => {
    const score = questions.reduce(
      (acc, item) => (currentAnswers[item.q.id] === item.q.correctIndex ? acc + 1 : acc),
      0
    );
    const pct = Math.round((score / questions.length) * 100);
    setSubmitted(true);
    onSubmitMockExam(score, questions.length, pct, elapsedSec);
  };

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finalizeExam(answersRef.current, EXAM_DURATION_SEC);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, questions]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.reduce(
    (acc, item) => (answers[item.q.id] === item.q.correctIndex ? acc + 1 : acc),
    0
  );
  const percentage = Math.round((correctCount / questions.length) * 100);

  const handleRestart = () => {
    setQuestions(pickRandomExamQuestions(courses, 20));
    setAnswers({});
    setSecondsLeft(EXAM_DURATION_SEC);
    setSubmitted(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-sm font-medium text-[var(--edu-ink)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Testlarga qaytish</span>
        </button>

        <div className="flex items-center gap-4 text-sm tabular-nums">
          <span className="text-[var(--edu-muted)]">
            Javob: {answeredCount} / {questions.length}
          </span>
          <span
            className={`px-3 py-1.5 rounded-lg border font-bold inline-flex items-center gap-1.5 ${
              secondsLeft < 120
                ? 'bg-[#F87171]/15 border-[#F87171]/50 text-[#F87171]'
                : 'bg-[var(--edu-card)] border-[var(--edu-border)] text-[var(--edu-accent)]'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>
              {mins}:{secs}
            </span>
          </span>
        </div>
      </div>

      <header className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6">
        <div className="text-xs font-medium text-[var(--edu-accent)]">
          Vaqtli Umumiy Imtihon · {courses.length} ta fan aralashmasi
        </div>
        <h1 className="mt-1 text-2xl font-bold text-[var(--edu-ink)]">
          20 ta savollik Mock Imtihon
        </h1>
      </header>

      {submitted ? (
        <div className="space-y-6">
          <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-accent)]/40 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="text-sm font-semibold text-[#10B981]">
                Imtihon yakunlandi (+60 XP)
              </div>
              <div className="mt-2 text-3xl sm:text-4xl font-bold text-[var(--edu-ink)] tabular-nums">
                {correctCount} / {questions.length} ({percentage}%)
              </div>
              <p className="mt-1 text-xs text-[var(--edu-muted)] tabular-nums">
                Sarflangan vaqt: {Math.floor((EXAM_DURATION_SEC - secondsLeft) / 60)} daqiqa{' '}
                {(EXAM_DURATION_SEC - secondsLeft) % 60} soniya
              </p>
            </div>
            <button
              type="button"
              onClick={handleRestart}
              className="h-11 px-5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yangi savollar bilan boshlash</span>
            </button>
          </section>

          <section className="space-y-3">
            {questions.map(({ courseTitle, q }, index) => {
              const userChoice = answers[q.id];
              const isRight = userChoice === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-[var(--edu-accent)]">{courseTitle}</div>
                      <h3 className="text-base font-semibold text-[var(--edu-ink)] mt-0.5">
                        {index + 1}. {q.question}
                      </h3>
                    </div>
                    {isRight ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[#F87171] shrink-0" />
                    )}
                  </div>
                  <div className="text-sm">
                    <span className={isRight ? 'text-[#10B981]' : 'text-[#F87171]'}>
                      Javobingiz: {userChoice !== undefined ? q.options[userChoice] : 'Belgilanmagan'}
                    </span>
                    {!isRight && (
                      <span className="ml-3 text-[#10B981]">
                        To&apos;g&apos;ri: {q.options[q.correctIndex]}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--edu-muted)] pt-2 border-t border-[var(--edu-border)]">
                    {q.explanation}
                  </p>
                </div>
              );
            })}
          </section>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map(({ courseTitle, q }, index) => {
            const chosen = answers[q.id];
            return (
              <div
                key={q.id}
                className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-5 space-y-3"
              >
                <div className="text-xs text-[var(--edu-accent)]">{courseTitle}</div>
                <h2 className="text-base font-semibold text-[var(--edu-ink)]">
                  {index + 1}. {q.question}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-[#2563EB]/15 border-[var(--edu-accent)] text-[var(--edu-ink)]'
                            : 'bg-[var(--edu-inset)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:border-[var(--edu-accent)]/60 hover:text-[var(--edu-ink)]'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[var(--edu-accent)]' : 'border-[var(--edu-muted)]'
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[var(--edu-accent)]" />}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => finalizeExam(answers, EXAM_DURATION_SEC - secondsLeft)}
              className="h-12 px-6 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#060A13] text-sm font-bold transition-colors cursor-pointer"
            >
              Imtihonni yakunlash va tekshirish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
