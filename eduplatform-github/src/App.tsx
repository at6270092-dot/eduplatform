/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Code2, Home, Layers, User } from 'lucide-react';
import {
  AppScreen,
  CertificateRecord,
  DiscussionPostType,
  LessonQuizScoreRecord,
  MockExamRecord,
  PracticeTab,
  QuizResultRecord,
  ThemeMode,
  UserAccount,
} from './types/edu';
import {
  COURSE_BY_ID,
  EDU_COURSES,
  EDU_FLASHCARDS,
  EDU_INTERVIEW_QA,
  EDU_ROADMAPS,
  TOTAL_LESSONS_COUNT,
} from './data/eduCourses';
import { eduStorage } from './utils/eduStorage';
import { AuthView } from './components/AuthView';
import { HomeView } from './components/HomeView';
import { CourseDetailView, CoursesView } from './components/CoursesView';
import { LessonView } from './components/LessonView';
import { PracticeHubView } from './components/PracticeHubView';
import { MockExamRunnerView, QuizRunnerView, QuizzesListView } from './components/QuizView';
import { ProfileView } from './components/ProfileView';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { LiveTranslateModal } from './components/LiveTranslateModal';
import { PomodoroWidget } from './components/PomodoroWidget';

interface UserProgressState {
  completedIds: string[];
  watchedVideoIds: string[];
  customVideoUrls: Record<string, string>;
  lessonQuizScores: Record<string, LessonQuizScoreRecord>;
  dailyChallengeDates: string[];
  pomodoroCount: number;
  practiceIds: string[];
  bookmarkedIds: string[];
  notesMap: Record<string, string>;
  masteredFlashcards: string[];
  projectStepIds: string[];
  interviewIds: string[];
  quizResults: QuizResultRecord[];
  mockExamResults: MockExamRecord[];
  certificates: CertificateRecord[];
  dailyGoal: number;
  activityByDate: Record<string, number>;
}

function loadUserProgress(contact: string): UserProgressState {
  return {
    completedIds: eduStorage.getCompletedLessonIds(contact),
    watchedVideoIds: eduStorage.getWatchedVideoIds(contact),
    customVideoUrls: eduStorage.getCustomVideoUrls(contact),
    lessonQuizScores: eduStorage.getLessonQuizScores(contact),
    dailyChallengeDates: eduStorage.getDailyChallengeDates(contact),
    pomodoroCount: eduStorage.getPomodoroCount(contact),
    practiceIds: eduStorage.getCompletedPracticeIds(contact),
    bookmarkedIds: eduStorage.getBookmarkedLessonIds(contact),
    notesMap: eduStorage.getLessonNotes(contact),
    masteredFlashcards: eduStorage.getMasteredFlashcards(contact),
    projectStepIds: eduStorage.getCompletedProjectSteps(contact),
    interviewIds: eduStorage.getMasteredInterviewIds(contact),
    quizResults: eduStorage.getQuizResults(contact),
    mockExamResults: eduStorage.getMockExamResults(contact),
    certificates: eduStorage.getCertificates(contact),
    dailyGoal: eduStorage.getDailyGoal(contact),
    activityByDate: eduStorage.getActivityByDate(contact),
  };
}

const EMPTY_PROGRESS: UserProgressState = {
  completedIds: [],
  watchedVideoIds: [],
  customVideoUrls: {},
  lessonQuizScores: {},
  dailyChallengeDates: [],
  pomodoroCount: 0,
  practiceIds: [],
  bookmarkedIds: [],
  notesMap: {},
  masteredFlashcards: [],
  projectStepIds: [],
  interviewIds: [],
  quizResults: [],
  mockExamResults: [],
  certificates: [],
  dailyGoal: 2,
  activityByDate: {},
};

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => eduStorage.getThemeMode());
  const [activeUser, setActiveUser] = useState<UserAccount | null>(() => eduStorage.getActiveUser());
  const [progress, setProgress] = useState<UserProgressState>(() => {
    const u = eduStorage.getActiveUser();
    return u ? loadUserProgress(u.contact) : EMPTY_PROGRESS;
  });
  const [screen, setScreen] = useState<AppScreen>({ type: 'home' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [androidModalOpen, setAndroidModalOpen] = useState(false);
  const [liveTranslateOpen, setLiveTranslateOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [, setDiscussionsVersion] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    eduStorage.setThemeMode(themeMode);
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const syncAfterAuth = (user: UserAccount) => {
    setActiveUser(user);
    setProgress(loadUserProgress(user.contact));
    setScreen({ type: 'home' });
    setAuthError(null);
  };

  const handleLogin = (contact: string, password: string) => {
    const res = eduStorage.loginUser(contact, password);
    if (res.error || !res.user) {
      setAuthError(res.error);
      return;
    }
    syncAfterAuth(res.user);
  };

  const handleRegister = (fullName: string, contact: string, password: string) => {
    const res = eduStorage.registerUser(fullName, contact, password);
    if (res.error || !res.user) {
      setAuthError(res.error);
      return;
    }
    syncAfterAuth(res.user);
  };

  const handleDemoLogin = () => {
    const demoUser = eduStorage.loginOrCreateDemoStudent();
    syncAfterAuth(demoUser);
  };

  const handleLogout = () => {
    eduStorage.logout();
    setActiveUser(null);
    setProgress(EMPTY_PROGRESS);
    setScreen({ type: 'home' });
    setFocusMode(false);
    setAuthError(null);
  };

  const handleMarkLessonCompleted = (lessonId: string) => {
    if (!activeUser) return;
    const completedIds = eduStorage.markLessonCompleted(activeUser.contact, lessonId);
    const activityByDate = eduStorage.getActivityByDate(activeUser.contact);
    setProgress((prev) => ({ ...prev, completedIds, activityByDate }));
  };

  const handleMarkPracticeCompleted = (lessonId: string) => {
    if (!activeUser) return;
    const practiceIds = eduStorage.markPracticeCompleted(activeUser.contact, lessonId);
    const activityByDate = eduStorage.getActivityByDate(activeUser.contact);
    setProgress((prev) => ({ ...prev, practiceIds, activityByDate }));
  };

  const handleToggleBookmark = (lessonId: string) => {
    if (!activeUser) return;
    const bookmarkedIds = eduStorage.toggleBookmark(activeUser.contact, lessonId);
    setProgress((prev) => ({ ...prev, bookmarkedIds }));
  };

  const handleSaveNote = (lessonId: string, note: string) => {
    if (!activeUser) return;
    const notesMap = eduStorage.saveLessonNote(activeUser.contact, lessonId, note);
    setProgress((prev) => ({ ...prev, notesMap }));
  };

  const handleAddDiscussionPost = (
    lessonId: string,
    postType: DiscussionPostType,
    text: string
  ) => {
    if (!activeUser) return;
    eduStorage.addDiscussionPost(
      lessonId,
      activeUser.fullName,
      activeUser.contact,
      postType,
      text
    );
    const activityByDate = eduStorage.getActivityByDate(activeUser.contact);
    setProgress((prev) => ({ ...prev, activityByDate }));
    setDiscussionsVersion((v) => v + 1);
  };

  const handleAddDiscussionReply = (lessonId: string, postId: string, text: string) => {
    if (!activeUser) return;
    eduStorage.addDiscussionReply(
      lessonId,
      postId,
      activeUser.fullName,
      activeUser.contact,
      text
    );
    setDiscussionsVersion((v) => v + 1);
  };

  const handleToggleDiscussionHelpful = (lessonId: string, postId: string) => {
    if (!activeUser) return;
    eduStorage.toggleDiscussionHelpful(lessonId, postId, activeUser.contact);
    setDiscussionsVersion((v) => v + 1);
  };

  const handleDeleteDiscussionPost = (lessonId: string, postId: string) => {
    if (!activeUser) return;
    eduStorage.deleteDiscussionPost(lessonId, postId, activeUser.contact);
    setDiscussionsVersion((v) => v + 1);
  };

  const handleMarkVideoWatched = (lessonId: string) => {
    if (!activeUser) return;
    const watchedVideoIds = eduStorage.markVideoWatched(activeUser.contact, lessonId);
    const activityByDate = eduStorage.getActivityByDate(activeUser.contact);
    setProgress((prev) => ({ ...prev, watchedVideoIds, activityByDate }));
  };

  const handleSaveCustomVideoUrl = (lessonId: string, url: string) => {
    if (!activeUser) return;
    const customVideoUrls = eduStorage.saveCustomVideoUrl(activeUser.contact, lessonId, url);
    setProgress((prev) => ({ ...prev, customVideoUrls }));
  };

  const handleCompleteLessonQuiz = (lessonId: string, score: number, total: number) => {
    if (!activeUser) return;
    const lessonQuizScores = eduStorage.saveLessonQuizScore(
      activeUser.contact,
      lessonId,
      score,
      total
    );
    const activityByDate = eduStorage.getActivityByDate(activeUser.contact);
    setProgress((prev) => ({ ...prev, lessonQuizScores, activityByDate }));
  };

  const handleCompleteDailyChallenge = (dateKey: string) => {
    if (!activeUser) return;
    const dailyChallengeDates = eduStorage.markDailyChallengeCompleted(
      activeUser.contact,
      dateKey
    );
    const activityByDate = eduStorage.getActivityByDate(activeUser.contact);
    setProgress((prev) => ({ ...prev, dailyChallengeDates, activityByDate }));
  };

  const handleCompletePomodoro = () => {
    if (!activeUser) return;
    const pomodoroCount = eduStorage.incrementPomodoroCount(activeUser.contact);
    const activityByDate = eduStorage.getActivityByDate(activeUser.contact);
    setProgress((prev) => ({ ...prev, pomodoroCount, activityByDate }));
  };

  const handleToggleMasteredFlashcard = (cardId: string, mastered: boolean) => {
    if (!activeUser) return;
    const masteredFlashcards = eduStorage.toggleMasteredFlashcard(
      activeUser.contact,
      cardId,
      mastered
    );
    const activityByDate = eduStorage.getActivityByDate(activeUser.contact);
    setProgress((prev) => ({ ...prev, masteredFlashcards, activityByDate }));
  };

  const handleToggleProjectStep = (stepId: string) => {
    if (!activeUser) return;
    const projectStepIds = eduStorage.toggleProjectStep(activeUser.contact, stepId);
    const activityByDate = eduStorage.getActivityByDate(activeUser.contact);
    setProgress((prev) => ({ ...prev, projectStepIds, activityByDate }));
  };

  const handleToggleMasteredInterview = (qaId: string) => {
    if (!activeUser) return;
    const interviewIds = eduStorage.toggleMasteredInterview(activeUser.contact, qaId);
    setProgress((prev) => ({ ...prev, interviewIds }));
  };

  const handleChangeDailyGoal = (goal: number) => {
    if (!activeUser) return;
    const dailyGoal = eduStorage.setDailyGoal(activeUser.contact, goal);
    setProgress((prev) => ({ ...prev, dailyGoal }));
  };

  const handleSubmitQuizResult = (
    courseId: string,
    courseTitle: string,
    score: number,
    totalQuestions: number,
    percentage: number
  ) => {
    if (!activeUser) return;
    const quizResults = eduStorage.saveQuizResult(activeUser.contact, {
      courseId,
      courseTitle,
      score,
      totalQuestions,
      percentage,
    });
    const certificates = eduStorage.unlockCertificateIfEligible(
      activeUser.contact,
      activeUser.fullName,
      courseId,
      courseTitle,
      percentage
    );
    const activityByDate = eduStorage.getActivityByDate(activeUser.contact);
    setProgress((prev) => ({ ...prev, quizResults, certificates, activityByDate }));
  };

  const handleSubmitMockExam = (
    score: number,
    totalQuestions: number,
    percentage: number,
    durationSeconds: number
  ) => {
    if (!activeUser) return;
    const mockExamResults = eduStorage.saveMockExamResult(activeUser.contact, {
      score,
      totalQuestions,
      percentage,
      durationSeconds,
    });
    const activityByDate = eduStorage.getActivityByDate(activeUser.contact);
    setProgress((prev) => ({ ...prev, mockExamResults, activityByDate }));
  };

  const handleUpdateName = (newName: string) => {
    if (!activeUser) return;
    const updated = eduStorage.updateUserName(activeUser.contact, newName);
    if (updated) {
      setActiveUser(updated);
    }
  };

  const openPracticeTab = (initialTab: PracticeTab = 'flashcards') => {
    setScreen({ type: 'practice', initialTab });
  };

  const isNavActive = (
    tab: 'home' | 'courses' | 'practice' | 'quizzes' | 'profile'
  ): boolean => {
    if (tab === 'home') return screen.type === 'home';
    if (tab === 'courses') {
      return (
        screen.type === 'courses' ||
        screen.type === 'courseDetail' ||
        screen.type === 'lessonDetail'
      );
    }
    if (tab === 'practice') return screen.type === 'practice';
    if (tab === 'quizzes') {
      return screen.type === 'quizzes' || screen.type === 'quizRunner' || screen.type === 'mockExam';
    }
    return screen.type === 'profile';
  };

  const renderMainContent = () => {
    if (!activeUser) return null;

    switch (screen.type) {
      case 'home':
        return (
          <HomeView
            user={activeUser}
            courses={EDU_COURSES}
            completedIds={progress.completedIds}
            watchedVideoIds={progress.watchedVideoIds}
            lessonQuizScores={progress.lessonQuizScores}
            dailyChallengeDates={progress.dailyChallengeDates}
            pomodoroCount={progress.pomodoroCount}
            practiceIds={progress.practiceIds}
            bookmarkedIds={progress.bookmarkedIds}
            masteredFlashcards={progress.masteredFlashcards}
            projectStepIds={progress.projectStepIds}
            certificatesCount={progress.certificates.length}
            quizResults={progress.quizResults}
            mockExamCount={progress.mockExamResults.length}
            dailyGoal={progress.dailyGoal}
            activityByDate={progress.activityByDate}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
            onChangeDailyGoal={handleChangeDailyGoal}
            onCompleteDailyChallenge={handleCompleteDailyChallenge}
            onOpenCourse={(courseId) => setScreen({ type: 'courseDetail', courseId })}
            onOpenLesson={(courseId, lessonId) =>
              setScreen({ type: 'lessonDetail', courseId, lessonId })
            }
            onOpenAllCourses={() => setScreen({ type: 'courses' })}
            onOpenPractice={(tab) => openPracticeTab(tab)}
            onOpenMockExam={() => setScreen({ type: 'mockExam' })}
            onOpenLiveTranslate={() => setLiveTranslateOpen(true)}
          />
        );

      case 'courses':
        return (
          <CoursesView
            courses={EDU_COURSES}
            completedIds={progress.completedIds}
            practiceIds={progress.practiceIds}
            onSelectCourse={(courseId) => setScreen({ type: 'courseDetail', courseId })}
            onOpenLesson={(courseId, lessonId) =>
              setScreen({ type: 'lessonDetail', courseId, lessonId })
            }
          />
        );

      case 'courseDetail': {
        const course = COURSE_BY_ID.get(screen.courseId) ?? EDU_COURSES[0];
        return (
          <CourseDetailView
            course={course}
            completedIds={progress.completedIds}
            watchedVideoIds={progress.watchedVideoIds}
            practiceIds={progress.practiceIds}
            bookmarkedIds={progress.bookmarkedIds}
            onBack={() => setScreen({ type: 'courses' })}
            onOpenLesson={(lessonId) =>
              setScreen({ type: 'lessonDetail', courseId: course.id, lessonId })
            }
            onStartQuiz={() => setScreen({ type: 'quizRunner', courseId: course.id })}
            onOpenMiniProjects={() => openPracticeTab('projects')}
          />
        );
      }

      case 'lessonDetail': {
        const course = COURSE_BY_ID.get(screen.courseId) ?? EDU_COURSES[0];
        const courseIdx = EDU_COURSES.findIndex((c) => c.id === course.id);
        const lessonIndex = course.lessons.findIndex((l) => l.id === screen.lessonId);
        const safeLessonIndex = lessonIndex >= 0 ? lessonIndex : 0;
        const lesson = course.lessons[safeLessonIndex];

        let nextTarget: { courseId: string; lessonId: string } | null = null;
        if (safeLessonIndex + 1 < course.lessons.length) {
          nextTarget = {
            courseId: course.id,
            lessonId: course.lessons[safeLessonIndex + 1].id,
          };
        } else if (courseIdx >= 0 && courseIdx + 1 < EDU_COURSES.length) {
          const nextCourse = EDU_COURSES[courseIdx + 1];
          if (nextCourse.lessons.length > 0) {
            nextTarget = {
              courseId: nextCourse.id,
              lessonId: nextCourse.lessons[0].id,
            };
          }
        }

        return (
          <LessonView
            course={course}
            lesson={lesson}
            currentUser={activeUser}
            discussions={eduStorage.getLessonDiscussions(lesson.id)}
            isCompleted={progress.completedIds.includes(lesson.id)}
            isVideoWatched={progress.watchedVideoIds.includes(lesson.id)}
            customVideoUrl={progress.customVideoUrls[lesson.id] ?? ''}
            lessonQuizScore={progress.lessonQuizScores[lesson.id]}
            isBookmarked={progress.bookmarkedIds.includes(lesson.id)}
            initialNote={progress.notesMap[lesson.id] ?? ''}
            hasNextLesson={Boolean(nextTarget)}
            focusMode={focusMode}
            onToggleFocusMode={() => setFocusMode((prev) => !prev)}
            onBack={() => {
              setFocusMode(false);
              setScreen({ type: 'courseDetail', courseId: course.id });
            }}
            onToggleBookmark={() => handleToggleBookmark(lesson.id)}
            onSaveNote={(note) => handleSaveNote(lesson.id, note)}
            onMarkVideoWatched={() => handleMarkVideoWatched(lesson.id)}
            onSaveCustomVideoUrl={(url) => handleSaveCustomVideoUrl(lesson.id, url)}
            onCompleteLessonQuiz={(score, total) =>
              handleCompleteLessonQuiz(lesson.id, score, total)
            }
            onAddDiscussionPost={(postType, text) =>
              handleAddDiscussionPost(lesson.id, postType, text)
            }
            onAddDiscussionReply={(postId, text) =>
              handleAddDiscussionReply(lesson.id, postId, text)
            }
            onToggleDiscussionHelpful={(postId) =>
              handleToggleDiscussionHelpful(lesson.id, postId)
            }
            onDeleteDiscussionPost={(postId) =>
              handleDeleteDiscussionPost(lesson.id, postId)
            }
            onMarkCompleted={() => handleMarkLessonCompleted(lesson.id)}
            onMarkPracticeCompleted={() => handleMarkPracticeCompleted(lesson.id)}
            onOpenLiveTranslate={() => setLiveTranslateOpen(true)}
            onNextLesson={() => {
              if (nextTarget) {
                setScreen({
                  type: 'lessonDetail',
                  courseId: nextTarget.courseId,
                  lessonId: nextTarget.lessonId,
                });
              }
            }}
          />
        );
      }

      case 'practice':
        return (
          <PracticeHubView
            initialTab={screen.initialTab}
            cards={EDU_FLASHCARDS}
            roadmaps={EDU_ROADMAPS}
            courses={EDU_COURSES}
            interviewQAs={EDU_INTERVIEW_QA}
            completedLessonIds={progress.completedIds}
            masteredFlashcards={progress.masteredFlashcards}
            completedProjectSteps={progress.projectStepIds}
            masteredInterviewIds={progress.interviewIds}
            onToggleMasteredFlashcard={handleToggleMasteredFlashcard}
            onToggleProjectStep={handleToggleProjectStep}
            onToggleMasteredInterview={handleToggleMasteredInterview}
            onOpenCourse={(courseId) => setScreen({ type: 'courseDetail', courseId })}
          />
        );

      case 'quizzes':
        return (
          <QuizzesListView
            courses={EDU_COURSES}
            quizResults={progress.quizResults}
            mockExamResults={progress.mockExamResults}
            onStartQuiz={(courseId) => setScreen({ type: 'quizRunner', courseId })}
            onStartMockExam={() => setScreen({ type: 'mockExam' })}
          />
        );

      case 'quizRunner': {
        const course = COURSE_BY_ID.get(screen.courseId) ?? EDU_COURSES[0];
        return (
          <QuizRunnerView
            course={course}
            onBack={() => setScreen({ type: 'quizzes' })}
            onSubmitResult={(score, total, pct) =>
              handleSubmitQuizResult(course.id, course.title, score, total, pct)
            }
            onOpenProfileCertificates={() => setScreen({ type: 'profile' })}
          />
        );
      }

      case 'mockExam':
        return (
          <MockExamRunnerView
            courses={EDU_COURSES}
            onBack={() => setScreen({ type: 'quizzes' })}
            onSubmitMockExam={handleSubmitMockExam}
          />
        );

      case 'profile':
        return (
          <ProfileView
            user={activeUser}
            completedIds={progress.completedIds}
            watchedVideoIds={progress.watchedVideoIds}
            lessonQuizScores={progress.lessonQuizScores}
            dailyChallengeDates={progress.dailyChallengeDates}
            pomodoroCount={progress.pomodoroCount}
            practiceIds={progress.practiceIds}
            bookmarkedIds={progress.bookmarkedIds}
            notesMap={progress.notesMap}
            masteredFlashcards={progress.masteredFlashcards}
            projectStepIds={progress.projectStepIds}
            quizResults={progress.quizResults}
            mockExamResults={progress.mockExamResults}
            certificates={progress.certificates}
            dailyGoal={progress.dailyGoal}
            activityByDate={progress.activityByDate}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
            onChangeDailyGoal={handleChangeDailyGoal}
            onUpdateName={handleUpdateName}
            onOpenLesson={(courseId, lessonId) =>
              setScreen({ type: 'lessonDetail', courseId, lessonId })
            }
            onLogout={handleLogout}
          />
        );
    }
  };

  const navItems: Array<{
    id: 'home' | 'courses' | 'practice' | 'quizzes' | 'profile';
    label: string;
    icon: typeof Home;
  }> = [
    { id: 'home', label: 'Bosh sahifa', icon: Home },
    { id: 'courses', label: 'Kurslar', icon: BookOpen },
    { id: 'practice', label: 'Amaliyot', icon: Layers },
    { id: 'quizzes', label: 'Testlar', icon: CheckCircle2 },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const hideChromeInFocus = focusMode && screen.type === 'lessonDetail';

  return (
    <>
      {!activeUser ? (
        <AuthView
          errorMessage={authError}
          onClearError={() => setAuthError(null)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onDemoLogin={handleDemoLogin}
          onOpenAndroidCode={() => setAndroidModalOpen(true)}
        />
      ) : (
        <div className="min-h-screen bg-[var(--edu-bg)] text-[var(--edu-ink)] flex flex-col pb-20 md:pb-0">
          {!hideChromeInFocus && (
            <header className="sticky top-0 z-30 border-b border-[var(--edu-border)] bg-[var(--edu-nav)]/95 backdrop-blur-md no-print">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setScreen({ type: 'home' })}
                  className="text-xl font-bold tracking-tight text-[var(--edu-accent)] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  EduPlatform
                </button>

                <nav className="hidden lg:flex items-center gap-5" aria-label="Asosiy navigatsiya">
                  {navItems.map((item) => {
                    const active = isNavActive(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setFocusMode(false);
                          setScreen(
                            item.id === 'practice'
                              ? { type: 'practice', initialTab: 'flashcards' }
                              : { type: item.id }
                          );
                        }}
                        className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                          active
                            ? 'text-[var(--edu-accent)] border-[var(--edu-accent)]'
                            : 'text-[var(--edu-muted)] border-transparent hover:text-[var(--edu-ink)]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </nav>

                <button
                  type="button"
                  onClick={() => setAndroidModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-xs sm:text-sm font-medium text-[var(--edu-ink)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Code2 className="w-4 h-4 text-[var(--edu-accent)]" />
                  <span className="hidden sm:inline">Android Kodi</span>
                  <span className="sm:hidden">APK</span>
                </button>
              </div>
            </header>
          )}

          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
            {renderMainContent()}
          </main>

          {!hideChromeInFocus && (
            <footer className="border-t border-[var(--edu-border)] bg-[var(--edu-nav)]/60 no-print">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--edu-muted)]">
                <span>EduPlatform · {EDU_COURSES.length} ta kurs, {TOTAL_LESSONS_COUNT} ta dars va amaliy ta&apos;lim tizimi</span>
                <span className="text-[var(--edu-accent)] text-center sm:text-right">
                  Loyiha rahbari: Ahmadali Toshturgunov tomonidan ishlab chiqilgan · 2026-yil 16-noyabr, soat 09:45
                </span>
              </div>
            </footer>
          )}

          {!hideChromeInFocus && (
            <nav
              className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 border-t border-[var(--edu-border)] bg-[var(--edu-nav)] px-1 grid grid-cols-5 no-print"
              aria-label="Mobil navigatsiya"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFocusMode(false);
                      setScreen(
                        item.id === 'practice'
                          ? { type: 'practice', initialTab: 'flashcards' }
                          : { type: item.id }
                      );
                    }}
                    className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium whitespace-nowrap cursor-pointer ${
                      active ? 'text-[var(--edu-accent)]' : 'text-[var(--edu-muted)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      )}

      <AndroidCodeModal
        isOpen={androidModalOpen}
        onClose={() => setAndroidModalOpen(false)}
      />

      <LiveTranslateModal
        isOpen={liveTranslateOpen}
        onClose={() => setLiveTranslateOpen(false)}
      />

      {activeUser && (
        <PomodoroWidget
          completedSessions={progress.pomodoroCount}
          onCompleteSession={handleCompletePomodoro}
        />
      )}
    </>
  );
}
