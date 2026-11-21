import React, { useState } from 'react';
import {
  Award,
  Bookmark,
  Check,
  CheckCircle2,
  Download,
  Edit3,
  FileText,
  Flame,
  Lock,
  LogOut,
  Moon,
  Sun,
  Trophy,
} from 'lucide-react';
import {
  CertificateRecord,
  LessonQuizScoreRecord,
  MockExamRecord,
  QuizResultRecord,
  ThemeMode,
  UserAccount,
} from '../types/edu';
import { ALL_LESSONS_MAP, TOTAL_LESSONS_COUNT } from '../data/eduCourses';
import { calculateStreak, calculateUserXp } from '../utils/eduStorage';
import { evaluateAchievements } from '../utils/lessonContentBuilder';

interface ProfileViewProps {
  user: UserAccount;
  completedIds: string[];
  watchedVideoIds: string[];
  lessonQuizScores: Record<string, LessonQuizScoreRecord>;
  dailyChallengeDates: string[];
  pomodoroCount: number;
  practiceIds: string[];
  bookmarkedIds: string[];
  notesMap: Record<string, string>;
  masteredFlashcards: string[];
  projectStepIds: string[];
  quizResults: QuizResultRecord[];
  mockExamResults: MockExamRecord[];
  certificates: CertificateRecord[];
  dailyGoal: number;
  activityByDate: Record<string, number>;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onChangeDailyGoal: (goal: number) => void;
  onUpdateName: (newName: string) => void;
  onOpenLesson: (courseId: string, lessonId: string) => void;
  onLogout: () => void;
}

function buildCertificateSvg(cert: CertificateRecord): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="720" viewBox="0 0 1120 720">
  <rect width="1120" height="720" fill="#060A13"/>
  <rect x="28" y="28" width="1064" height="664" rx="24" fill="#0F172A" stroke="#1E293B" stroke-width="2"/>
  <rect x="48" y="48" width="1024" height="624" rx="16" fill="none" stroke="#38BDF8" stroke-opacity="0.45" stroke-width="1.5"/>
  <text x="560" y="128" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="20" font-weight="700" letter-spacing="4">EDUPLATFORM · RASMIY SERTIFIKAT</text>
  <text x="560" y="190" text-anchor="middle" fill="#F8FAFC" font-family="sans-serif" font-size="44" font-weight="700">Muvaffaqiyat Sertifikati</text>
  <text x="560" y="255" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="20">Ushbu hujjat quyidagi tinglovchiga taqdim etiladi:</text>
  <text x="560" y="330" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="42" font-weight="700">${esc(cert.studentName)}</text>
  <line x1="260" y1="358" x2="860" y2="358" stroke="#1E293B" stroke-width="2"/>
  <text x="560" y="415" text-anchor="middle" fill="#F8FAFC" font-family="sans-serif" font-size="24" font-weight="600">"${esc(cert.courseTitle)}" kursini muvaffaqiyatli yakunladi</text>
  <text x="560" y="462" text-anchor="middle" fill="#10B981" font-family="sans-serif" font-size="22" font-weight="700">Yakuniy test natijasi: ${cert.percentage}%</text>
  <text x="110" y="595" fill="#94A3B8" font-family="sans-serif" font-size="16">Sertifikat ID: ${esc(cert.id)}</text>
  <text x="110" y="625" fill="#94A3B8" font-family="sans-serif" font-size="16">Berilgan sana: ${esc(issuedDate)}</text>
  <text x="1010" y="595" text-anchor="end" fill="#F8FAFC" font-family="sans-serif" font-size="17" font-weight="600">Loyiha rahbari: Ahmadali Toshturgunov</text>
  <text x="1010" y="625" text-anchor="end" fill="#38BDF8" font-family="sans-serif" font-size="15">EduPlatform Ta&apos;lim Tizimi · 2026</text>
</svg>`;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  completedIds,
  watchedVideoIds,
  lessonQuizScores,
  dailyChallengeDates,
  pomodoroCount,
  practiceIds,
  bookmarkedIds,
  notesMap,
  masteredFlashcards,
  projectStepIds,
  quizResults,
  mockExamResults,
  certificates,
  dailyGoal,
  activityByDate,
  themeMode,
  onToggleTheme,
  onChangeDailyGoal,
  onUpdateName,
  onOpenLesson,
  onLogout,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(user.fullName);

  const lessonQuizzesCount = Object.keys(lessonQuizScores).length;

  const { xp, rank, nextRankXp } = calculateUserXp(
    completedIds.length,
    practiceIds.length,
    quizResults.length,
    mockExamResults.length,
    masteredFlashcards.length,
    projectStepIds.length,
    certificates.length,
    watchedVideoIds.length,
    lessonQuizzesCount,
    dailyChallengeDates.length,
    pomodoroCount
  );

  const streakDays = calculateStreak(activityByDate);
  const rankProgressPct = Math.min(100, Math.round((xp / nextRankXp) * 100));

  const badges = evaluateAchievements({
    completedLessonsCount: completedIds.length,
    watchedVideosCount: watchedVideoIds.length,
    lessonQuizzesCount,
    practiceCount: practiceIds.length,
    streakDays,
    certificatesCount: certificates.length,
    pomodoroCount,
    projectStepsCount: projectStepIds.length,
  });
  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  const bookmarkedLessons = bookmarkedIds
    .map((id) => ALL_LESSONS_MAP.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const completedLessons = completedIds
    .slice()
    .reverse()
    .map((id) => ALL_LESSONS_MAP.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const noteEntries = Object.entries(notesMap)
    .map(([lessonId, text]) => ({
      lesson: ALL_LESSONS_MAP.get(lessonId),
      text,
    }))
    .filter((item): item is { lesson: NonNullable<typeof item.lesson>; text: string } =>
      Boolean(item.lesson)
    );

  const handleDownloadCert = (cert: CertificateRecord) => {
    const svg = buildCertificateSvg(cert);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduPlatform-Sertifikat-${cert.courseId}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (draftName.trim().length >= 2) {
      onUpdateName(draftName.trim());
      setEditingName(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--edu-accent)]">
              <span>{rank}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{xp} XP</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-[#F59E0B] tabular-nums">
                <Flame className="w-3.5 h-3.5" />
                {streakDays} kun streak
              </span>
            </div>

            {editingName ? (
              <form onSubmit={handleSaveName} className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-accent)] text-[var(--edu-ink)] text-base font-semibold focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-[#10B981] text-[#060A13] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Saqlash</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(user.fullName);
                    setEditingName(false);
                  }}
                  className="h-10 px-3 rounded-xl border border-[var(--edu-border)] text-xs text-[var(--edu-muted)] hover:text-[var(--edu-ink)] cursor-pointer"
                >
                  Bekor qilish
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--edu-ink)]">
                  {user.fullName}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(user.fullName);
                    setEditingName(true);
                  }}
                  aria-label="Ismni tahrirlash"
                  className="p-2 rounded-lg border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-[var(--edu-muted)] hover:text-[var(--edu-accent)] transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-sm text-[var(--edu-muted)]">{user.contact}</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="tabular-nums">
              <div className="text-xs text-[var(--edu-muted)]">Darslar</div>
              <div className="text-xl font-bold text-[var(--edu-ink)]">
                {completedIds.length} / {TOTAL_LESSONS_COUNT}
              </div>
            </div>
            <div className="tabular-nums">
              <div className="text-xs text-[var(--edu-muted)]">Mashqlar</div>
              <div className="text-xl font-bold text-[var(--edu-accent)]">
                {practiceIds.length} / {TOTAL_LESSONS_COUNT}
              </div>
            </div>
            <div className="tabular-nums">
              <div className="text-xs text-[var(--edu-muted)]">Test va Imtihon</div>
              <div className="text-xl font-bold text-[#10B981]">
                {quizResults.length + mockExamResults.length} ta
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[var(--edu-border)] space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-[var(--edu-muted)] tabular-nums mb-2">
              <span>Daraja progressi ({rank})</span>
              <span>
                {xp} / {nextRankXp} XP
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--edu-border)] overflow-hidden">
              <div className="h-full bg-[#38BDF8]" style={{ width: `${rankProgressPct}%` }} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-[var(--edu-muted)]">
              <span>Kunlik maqsad (amal/kun):</span>
              {[1, 2, 3, 5].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onChangeDailyGoal(g)}
                  className={`px-2.5 py-1 rounded-md font-semibold tabular-nums cursor-pointer ${
                    dailyGoal === g
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-[var(--edu-inset)] border border-[var(--edu-border)] text-[var(--edu-muted)]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              className="px-3.5 py-2 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-xs font-semibold text-[var(--edu-ink)] inline-flex items-center gap-2 cursor-pointer"
            >
              {themeMode === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-[#FBBF24]" />
                  <span>Kunduzgi rejimga o&apos;tish</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#2563EB]" />
                  <span>Tungi rejimga o&apos;tish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[var(--edu-ink)] inline-flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F59E0B]" />
            <span>Yutuq nishonlari</span>
          </h2>
          <span className="text-xs text-[var(--edu-muted)] tabular-nums">
            {unlockedBadgesCount} / {badges.length} ochilgan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-2xl border p-4 space-y-2 transition-colors ${
                badge.unlocked
                  ? 'bg-[var(--edu-card)] border-[#10B981]/50'
                  : 'bg-[var(--edu-card)] border-[var(--edu-border)] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold ${
                    badge.unlocked ? 'text-[#10B981]' : 'text-[var(--edu-muted)]'
                  }`}
                >
                  {badge.unlocked ? 'Ochilgan' : 'Qulflangan'}
                </span>
                {badge.unlocked ? (
                  <Trophy className="w-4 h-4 text-[#F59E0B]" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[var(--edu-muted)]" />
                )}
              </div>
              <div className="text-sm font-bold text-[var(--edu-ink)]">{badge.title}</div>
              <p className="text-xs text-[var(--edu-muted)] leading-relaxed">
                {badge.description}
              </p>
              <div className="text-[11px] font-semibold text-[var(--edu-accent)] tabular-nums pt-1">
                Holat: {badge.progressText}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[var(--edu-ink)]">Raqamli sertifikatlar</h2>
          <span className="text-xs text-[var(--edu-muted)] tabular-nums">
            {certificates.length} ta ochilgan
          </span>
        </div>

        {certificates.length === 0 ? (
          <div className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 text-sm text-[var(--edu-muted)]">
            Hozircha sertifikat yo&apos;q. Istalgan kurs testidan kamida 70% natija oling —
            yuklab olinadigan sertifikat shu yerda paydo bo&apos;ladi.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="rounded-2xl bg-[var(--edu-nav)] border border-[var(--edu-accent)]/40 p-6 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#10B981]">
                      <Award className="w-4 h-4" />
                      <span>Tasdiqlangan sertifikat</span>
                    </span>
                    <span className="text-[var(--edu-muted)] tabular-nums">{cert.id}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-[var(--edu-ink)]">{cert.courseTitle}</h3>
                  <p className="mt-1 text-sm text-[var(--edu-muted)]">
                    Tinglovchi: <span className="text-[var(--edu-ink)]">{cert.studentName}</span> ·
                    Natija:{' '}
                    <span className="text-[#10B981] font-semibold tabular-nums">
                      {cert.percentage}%
                    </span>
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--edu-border)] flex items-center justify-between gap-4">
                  <span className="text-xs text-[var(--edu-muted)]">
                    Rahbar: Ahmadali Toshturgunov
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownloadCert(cert)}
                    className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Yuklab olish (SVG)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-[var(--edu-ink)] inline-flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[var(--edu-accent)]" />
              <span>Saqlangan darslar</span>
            </h2>
            <span className="text-xs text-[var(--edu-muted)] tabular-nums">
              {bookmarkedLessons.length} ta
            </span>
          </div>

          {bookmarkedLessons.length === 0 ? (
            <p className="text-sm text-[var(--edu-muted)]">Saqlangan darslar hali mavjud emas.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {bookmarkedLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => onOpenLesson(lesson.courseId, lesson.id)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="text-sm font-medium text-[var(--edu-ink)] truncate">
                    {lesson.title}
                  </span>
                  <span className="text-xs text-[var(--edu-accent)] whitespace-nowrap shrink-0">
                    Ochish
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-[var(--edu-ink)] inline-flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--edu-accent)]" />
              <span>Shaxsiy konspektlar</span>
            </h2>
            <span className="text-xs text-[var(--edu-muted)] tabular-nums">
              {noteEntries.length} ta
            </span>
          </div>

          {noteEntries.length === 0 ? (
            <p className="text-sm text-[var(--edu-muted)]">
              Dars ichida konspekt yozib saqlasangiz, barchasi shu ro&apos;yxatda jamlanadi.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {noteEntries.map(({ lesson, text }) => (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => onOpenLesson(lesson.courseId, lesson.id)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] transition-colors space-y-1 cursor-pointer"
                >
                  <div className="text-xs font-semibold text-[var(--edu-accent)]">
                    {lesson.title}
                  </div>
                  <p className="text-sm text-[var(--edu-muted)] line-clamp-2">{text}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 space-y-4">
          <h2 className="text-lg font-bold text-[var(--edu-ink)]">Test va Imtihon natijalari</h2>
          {quizResults.length === 0 && mockExamResults.length === 0 ? (
            <p className="text-sm text-[var(--edu-muted)]">Hali test yoki imtihon topshirilmagan.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {mockExamResults.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="px-4 py-3 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-accent)]/40 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[var(--edu-ink)] truncate">
                      Vaqtli Umumiy Imtihon (Mock Exam)
                    </div>
                    <div className="text-xs text-[var(--edu-muted)] tabular-nums">
                      {m.score} / {m.totalQuestions} to&apos;g&apos;ri javob
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[var(--edu-accent)] tabular-nums shrink-0">
                    {m.percentage}%
                  </span>
                </div>
              ))}
              {quizResults.slice(0, 8).map((r) => (
                <div
                  key={r.id}
                  className="px-4 py-3 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[var(--edu-ink)] truncate">
                      {r.courseTitle}
                    </div>
                    <div className="text-xs text-[var(--edu-muted)] tabular-nums">
                      {r.score} / {r.totalQuestions} to&apos;g&apos;ri javob
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold tabular-nums shrink-0 ${
                      r.percentage >= 70 ? 'text-[#10B981]' : 'text-[#F87171]'
                    }`}
                  >
                    {r.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 space-y-4">
          <h2 className="text-lg font-bold text-[var(--edu-ink)]">Yakunlangan darslar</h2>
          {completedLessons.length === 0 ? (
            <p className="text-sm text-[var(--edu-muted)]">Hali dars yakunlanmagan.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {completedLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => onOpenLesson(lesson.courseId, lesson.id)}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2 text-sm text-[var(--edu-ink)] truncate">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span className="truncate">{lesson.title}</span>
                  </span>
                  <span className="text-xs text-[var(--edu-muted)] tabular-nums shrink-0">
                    {lesson.durationMinutes} daq
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onLogout}
          className="h-11 px-5 rounded-xl border border-[#F87171]/50 text-[#F87171] hover:bg-[#F87171]/10 text-sm font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Tizimdan chiqish</span>
        </button>
      </div>
    </div>
  );
};
