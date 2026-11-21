import React, { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Languages,
  Layers,
  Moon,
  Search,
  Sparkles,
  Sun,
  Timer,
  XCircle,
} from 'lucide-react';
import {
  CourseItem,
  LessonQuizScoreRecord,
  PracticeTab,
  QuizResultRecord,
  ThemeMode,
  UserAccount,
} from '../types/edu';
import {
  ALL_LESSONS_MAP,
  EDU_FLASHCARDS,
  EDU_INTERVIEW_QA,
  EDU_ROADMAPS,
  TOTAL_LESSONS_COUNT,
} from '../data/eduCourses';
import { EDU_IMAGES } from '../data/eduMedia';
import { calculateStreak, calculateUserXp, getTodayDateKey } from '../utils/eduStorage';
import { getDailyChallengeQuestion } from '../utils/lessonContentBuilder';
import { EduMediaBanner } from './EduMediaBanner';

interface HomeViewProps {
  user: UserAccount;
  courses: CourseItem[];
  completedIds: string[];
  watchedVideoIds: string[];
  lessonQuizScores: Record<string, LessonQuizScoreRecord>;
  dailyChallengeDates: string[];
  pomodoroCount: number;
  practiceIds: string[];
  bookmarkedIds: string[];
  masteredFlashcards: string[];
  projectStepIds: string[];
  certificatesCount: number;
  quizResults: QuizResultRecord[];
  mockExamCount: number;
  dailyGoal: number;
  activityByDate: Record<string, number>;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onChangeDailyGoal: (goal: number) => void;
  onCompleteDailyChallenge: (dateKey: string) => void;
  onOpenCourse: (courseId: string) => void;
  onOpenLesson: (courseId: string, lessonId: string) => void;
  onOpenAllCourses: () => void;
  onOpenPractice: (tab?: PracticeTab) => void;
  onOpenMockExam: () => void;
  onOpenLiveTranslate: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  courses,
  completedIds,
  watchedVideoIds,
  lessonQuizScores,
  dailyChallengeDates,
  pomodoroCount,
  practiceIds,
  bookmarkedIds,
  masteredFlashcards,
  projectStepIds,
  certificatesCount,
  quizResults,
  mockExamCount,
  dailyGoal,
  activityByDate,
  themeMode,
  onToggleTheme,
  onChangeDailyGoal,
  onCompleteDailyChallenge,
  onOpenCourse,
  onOpenLesson,
  onOpenAllCourses,
  onOpenPractice,
  onOpenMockExam,
  onOpenLiveTranslate,
}) => {
  const [globalQuery, setGlobalQuery] = useState('');
  const [dailySelectedOpt, setDailySelectedOpt] = useState<number | null>(null);
  const [dailyChecked, setDailyChecked] = useState(false);

  const doneCount = completedIds.length;
  const lessonQuizCount = Object.keys(lessonQuizScores).length;
  const progressPct =
    TOTAL_LESSONS_COUNT > 0 ? Math.round((doneCount / TOTAL_LESSONS_COUNT) * 100) : 0;
  const avgScore =
    quizResults.length > 0
      ? Math.round(quizResults.reduce((acc, r) => acc + r.percentage, 0) / quizResults.length)
      : null;

  const { xp, rank, nextRankXp } = calculateUserXp(
    doneCount,
    practiceIds.length,
    quizResults.length,
    mockExamCount,
    masteredFlashcards.length,
    projectStepIds.length,
    certificatesCount,
    watchedVideoIds.length,
    lessonQuizCount,
    dailyChallengeDates.length,
    pomodoroCount
  );

  const streakDays = useMemo(() => calculateStreak(activityByDate), [activityByDate]);
  const todayKey = getTodayDateKey(0);
  const dailyChallengeDoneToday = dailyChallengeDates.includes(todayKey);
  const dailyChallenge = useMemo(
    () => getDailyChallengeQuestion(courses, todayKey),
    [courses, todayKey]
  );
  const todayPoints = activityByDate[todayKey] ?? 0;
  const dailyPct = Math.min(100, Math.round((todayPoints / dailyGoal) * 100));

  const last7Days = useMemo(() => {
    const dayLabels = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
    return Array.from({ length: 7 }, (_, idx) => {
      const offset = idx - 6;
      const key = getTodayDateKey(offset);
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return {
        key,
        label: dayLabels[d.getDay()],
        count: activityByDate[key] ?? 0,
        isToday: offset === 0,
      };
    });
  }, [activityByDate]);

  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return [];
    const results: Array<{
      id: string;
      courseId: string;
      courseTitle: string;
      title: string;
      order: number;
      duration: number;
    }> = [];
    for (const course of courses) {
      for (const lesson of course.lessons) {
        if (
          lesson.title.toLowerCase().includes(q) ||
          lesson.summary.toLowerCase().includes(q) ||
          course.title.toLowerCase().includes(q)
        ) {
          results.push({
            id: lesson.id,
            courseId: course.id,
            courseTitle: course.title,
            title: lesson.title,
            order: lesson.order,
            duration: lesson.durationMinutes,
          });
        }
        if (results.length >= 8) return results;
      }
    }
    return results;
  }, [courses, globalQuery]);

  const nextRecommendedLesson = useMemo(() => {
    for (const course of courses) {
      const next = course.lessons.find((l) => !completedIds.includes(l.id));
      if (next) return { course, lesson: next };
    }
    return { course: courses[0], lesson: courses[0]?.lessons[0] };
  }, [courses, completedIds]);

  const recentCompleted = useMemo(() => {
    return completedIds
      .slice(-3)
      .reverse()
      .map((id) => ALL_LESSONS_MAP.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [completedIds]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-[var(--edu-accent)]">
            {rank} · <span className="tabular-nums">{xp} XP</span> · Barcha {TOTAL_LESSONS_COUNT} ta dars ochiq
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--edu-ink)] [text-wrap:balance]">
            Xush kelibsiz, {user.fullName}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--edu-muted)]">
            {courses.length} ta yo&apos;nalish, amaliy kod mashqlari, kunlik o&apos;quv zanjiri va vaqtli imtihonlar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-[var(--edu-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder={`${TOTAL_LESSONS_COUNT} ta dars ichidan qidirish...`}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] text-sm text-[var(--edu-ink)] placeholder:text-[var(--edu-muted)]/60 focus:outline-none focus:border-[var(--edu-accent)] transition-colors"
            />
            {globalQuery.trim() && (
              <div className="absolute left-0 right-0 top-13 z-20 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] divide-y divide-[var(--edu-border)] shadow-xl max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-[var(--edu-muted)]">
                    &quot;{globalQuery}&quot; bo&apos;yicha dars topilmadi.
                  </div>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setGlobalQuery('');
                        onOpenLesson(item.courseId, item.id);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[var(--edu-border)]/40 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-xs text-[var(--edu-accent)] truncate">
                          {item.courseTitle}
                        </div>
                        <div className="text-sm font-medium text-[var(--edu-ink)] truncate">
                          {item.order}-dars · {item.title}
                        </div>
                      </div>
                      <span className="text-xs text-[var(--edu-muted)] tabular-nums shrink-0">
                        {item.duration} daq
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="h-11 px-4 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-sm font-medium text-[var(--edu-ink)] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {themeMode === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[#FBBF24]" />
                <span>Kunduzgi rejim</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#2563EB]" />
                <span>Tungi rejim</span>
              </>
            )}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-5">
          <div className="text-xs font-medium text-[var(--edu-muted)]">O&apos;tilgan darslar</div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--edu-ink)] tabular-nums">
            {doneCount} / {TOTAL_LESSONS_COUNT}
          </div>
        </div>
        <div className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-5">
          <div className="text-xs font-medium text-[var(--edu-muted)]">Amaliy mashqlar</div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--edu-accent)] tabular-nums">
            {practiceIds.length} / {TOTAL_LESSONS_COUNT}
          </div>
        </div>
        <div className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-5">
          <div className="text-xs font-medium text-[var(--edu-muted)]">O&apos;rtacha test balli</div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--edu-ink)] tabular-nums">
            {avgScore === null ? '—' : `${avgScore}%`}
          </div>
        </div>
        <div className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-5">
          <div className="text-xs font-medium text-[var(--edu-muted)]">Sertifikat va Saqlangan</div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#10B981] tabular-nums">
            {certificatesCount} · {bookmarkedIds.length}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-[var(--edu-ink)]">
                Umumiy o&apos;quv jarayoni
              </h2>
              <span className="text-sm font-semibold text-[var(--edu-accent)] tabular-nums">
                {progressPct}%
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full rounded-full bg-[var(--edu-border)] overflow-hidden">
              <div
                className="h-full bg-[#38BDF8] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-[var(--edu-muted)] tabular-nums">
              {courses.length} ta kurs · Keyingi daraja ({nextRankXp} XP) uchun yana{' '}
              {Math.max(0, nextRankXp - xp)} XP kerak
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-5 border-t border-[var(--edu-border)]">
            <div className="sm:col-span-4 rounded-xl overflow-hidden border border-[var(--edu-border)]">
              <EduMediaBanner
                src={nextRecommendedLesson.course?.imageUrl ?? EDU_IMAGES.heroWorkspace}
                alt={nextRecommendedLesson.lesson?.title ?? "Keyingi dars"}
                heightClass="aspect-video"
              />
            </div>
            <div className="sm:col-span-8 flex flex-col justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-medium text-[var(--edu-accent)]">
                  Davom ettirish uchun keyingi dars
                </div>
                <div className="text-base font-semibold text-[var(--edu-ink)] truncate mt-0.5">
                  {nextRecommendedLesson.course?.title} · {nextRecommendedLesson.lesson?.order}-dars:{' '}
                  {nextRecommendedLesson.lesson?.title}
                </div>
                <p className="text-xs text-[var(--edu-muted)] line-clamp-1 mt-1">
                  {nextRecommendedLesson.lesson?.summary}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {nextRecommendedLesson.course && nextRecommendedLesson.lesson && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenLesson(nextRecommendedLesson.course.id, nextRecommendedLesson.lesson.id)
                    }
                    className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap inline-flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Darsni ochish</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenMockExam}
                  className="px-4 py-2.5 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-xs sm:text-sm font-medium text-[var(--edu-ink)] transition-colors whitespace-nowrap inline-flex items-center gap-2 cursor-pointer"
                >
                  <Timer className="w-4 h-4 text-[var(--edu-accent)]" />
                  <span>Vaqtli imtihon</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenLiveTranslate}
                  className="px-4 py-2.5 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-xs sm:text-sm font-medium text-[var(--edu-ink)] transition-colors whitespace-nowrap inline-flex items-center gap-2 cursor-pointer"
                >
                  <Languages className="w-4 h-4 text-[var(--edu-accent)]" />
                  <span>Jonli tarjimon</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-[var(--edu-ink)] inline-flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#F59E0B]" />
                <span>Kunlik maqsad va Streak</span>
              </h2>
              <span className="text-sm font-bold text-[#F59E0B] tabular-nums">
                {streakDays} kun ketma-ket
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[var(--edu-muted)] tabular-nums">
              <span>
                Bugungi faollik: <strong className="text-[var(--edu-ink)]">{todayPoints}</strong> / {dailyGoal} amal
              </span>
              <span>{dailyPct}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-[var(--edu-border)] overflow-hidden">
              <div className="h-full bg-[#10B981]" style={{ width: `${dailyPct}%` }} />
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {last7Days.map((day) => (
                <div key={day.key} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-full h-8 rounded-lg border flex items-center justify-center text-xs font-semibold tabular-nums ${
                      day.count > 0
                        ? 'bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981]'
                        : day.isToday
                        ? 'bg-[var(--edu-inset)] border-[var(--edu-accent)] text-[var(--edu-accent)]'
                        : 'bg-[var(--edu-inset)] border-[var(--edu-border)] text-[var(--edu-muted)]'
                    }`}
                  >
                    {day.count > 0 ? day.count : '·'}
                  </div>
                  <span className="text-[11px] text-[var(--edu-muted)]">{day.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 text-xs text-[var(--edu-muted)]">
              <span>Kunlik maqsad:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 5].map((goalOpt) => (
                  <button
                    key={goalOpt}
                    type="button"
                    onClick={() => onChangeDailyGoal(goalOpt)}
                    className={`px-2.5 py-1 rounded-md font-semibold tabular-nums transition-colors cursor-pointer ${
                      dailyGoal === goalOpt
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[var(--edu-inset)] border border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
                    }`}
                  >
                    {goalOpt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--edu-border)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--edu-muted)]">Oxirgi yakunlangan darslar</span>
              <button
                type="button"
                onClick={() => onOpenPractice('roadmap')}
                className="font-semibold text-[var(--edu-accent)] hover:opacity-80 whitespace-nowrap cursor-pointer"
              >
                Yo&apos;l xaritasi →
              </button>
            </div>
            {recentCompleted.length === 0 ? (
              <p className="text-xs text-[var(--edu-muted)]">
                Hali yakunlangan darslar yo&apos;q. Pastdagi {courses.length} ta kursdan birini tanlab boshlang.
              </p>
            ) : (
              recentCompleted.map((lesson) => (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => onOpenLesson(lesson.courseId, lesson.id)}
                  className="w-full text-left flex items-center justify-between gap-3 text-xs sm:text-sm text-[var(--edu-ink)] hover:text-[var(--edu-accent)] transition-colors cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span className="truncate">{lesson.title}</span>
                  </span>
                  <span className="text-xs text-[var(--edu-muted)] tabular-nums shrink-0">
                    {lesson.durationMinutes} daq
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {dailyChallenge && (
        <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <h2 className="text-base font-semibold text-[var(--edu-ink)]">
                Bugungi kun savoli
              </h2>
              <span className="text-xs text-[var(--edu-accent)]">
                · {dailyChallenge.courseTitle}
              </span>
            </div>
            <span
              className={`text-xs font-semibold tabular-nums ${
                dailyChallengeDoneToday ? 'text-[#10B981]' : 'text-[#F59E0B]'
              }`}
            >
              {dailyChallengeDoneToday ? 'Bugun bajarilgan (+15 XP)' : '+15 XP kunlik bonus'}
            </span>
          </div>

          <p className="text-sm sm:text-base font-medium text-[var(--edu-ink)]">
            {dailyChallenge.question.question}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {dailyChallenge.question.options.map((opt, idx) => {
              const selected = dailySelectedOpt === idx;
              const isRight = idx === dailyChallenge.question.correctIndex;
              const showResult = dailyChecked || dailyChallengeDoneToday;

              let btnClass =
                'bg-[var(--edu-inset)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:border-[var(--edu-accent)]/60 hover:text-[var(--edu-ink)]';

              if (showResult) {
                if (isRight) {
                  btnClass = 'bg-[#10B981]/15 border-[#10B981]/60 text-[#10B981]';
                } else if (selected) {
                  btnClass = 'bg-[#F87171]/15 border-[#F87171]/60 text-[#F87171]';
                }
              } else if (selected) {
                btnClass = 'bg-[#2563EB]/15 border-[var(--edu-accent)] text-[var(--edu-ink)]';
              }

              return (
                <button
                  key={`${dailyChallenge.question.id}-${idx}`}
                  type="button"
                  disabled={showResult}
                  onClick={() => setDailySelectedOpt(idx)}
                  className={`text-left px-4 py-3 rounded-xl border text-xs sm:text-sm transition-colors cursor-pointer disabled:cursor-default ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {(dailyChecked || dailyChallengeDoneToday) ? (
            <div className="rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] px-4 py-3 flex items-start gap-2.5 text-xs">
              {dailySelectedOpt === dailyChallenge.question.correctIndex || dailyChallengeDoneToday ? (
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold text-[var(--edu-ink)]">Izoh: </span>
                <span className="text-[var(--edu-muted)]">
                  {dailyChallenge.question.explanation}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                disabled={dailySelectedOpt === null}
                onClick={() => {
                  setDailyChecked(true);
                  onCompleteDailyChallenge(todayKey);
                }}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-45 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Javobni yuborish
              </button>
            </div>
          )}
        </section>
      )}

      <section>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--edu-ink)]">
              Barcha fan kurslari ({courses.length} ta · {TOTAL_LESSONS_COUNT} dars)
            </h2>
            <p className="text-xs text-[var(--edu-muted)] mt-0.5">
              Har bir kurs 10 ta rasmli dars, bosqichma-bosqich tahlil, amaliy mashqlar, mini-loyiha va 10 ta testdan iborat.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAllCourses}
            className="px-4 py-2 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-sm font-medium text-[var(--edu-ink)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Katalog
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const doneInCourse = course.lessons.filter((l) => completedIds.includes(l.id)).length;
            const pct = Math.round((doneInCourse / course.lessons.length) * 100);
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onOpenCourse(course.id)}
                className="text-left rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] overflow-hidden transition-colors flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <EduMediaBanner
                    src={course.imageUrl}
                    alt={course.title}
                    heightClass="aspect-video"
                    className="border-b border-[var(--edu-border)]"
                  />
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-[var(--edu-accent)]">
                      <span>{course.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.level}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-[var(--edu-ink)] group-hover:text-[var(--edu-accent)] transition-colors">
                      {course.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-[var(--edu-muted)] line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-[var(--edu-border)]">
                  <div className="flex items-center justify-between text-xs text-[var(--edu-muted)] tabular-nums mb-2">
                    <span>
                      {doneInCourse} / {course.lessons.length} dars
                    </span>
                    <span className="text-[var(--edu-ink)] font-medium">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--edu-border)] overflow-hidden">
                    <div className="h-full bg-[#38BDF8]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-[var(--edu-accent)]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--edu-ink)]">
                Amaliyot markazi: Kartochkalar, Yo&apos;l xaritasi, Mini-loyihalar va Intervyu
              </h3>
              <p className="text-sm text-[var(--edu-muted)] mt-1">
                {EDU_FLASHCARDS.length} ta tezkor kartochka, {EDU_ROADMAPS.length} ta kasb yo&apos;l xaritasi, {courses.length} ta portfel mini-loyihasi va{' '}
                {EDU_INTERVIEW_QA.length} ta suhbat savol-javobini amaliyot bo&apos;limida sinab ko&apos;ring.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onOpenPractice('flashcards')}
              className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              Amaliyotni ochish
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#10B981] whitespace-nowrap">
              <Award className="w-4 h-4" />
              <span>70%+ natija uchun sertifikat</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
