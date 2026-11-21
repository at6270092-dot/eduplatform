import {
  CertificateRecord,
  DiscussionPostType,
  LessonDiscussionPost,
  LessonQuizScoreRecord,
  MockExamRecord,
  QuizResultRecord,
  ThemeMode,
  UserAccount,
} from '../types/edu';

const KEYS = {
  users: 'eduplatform_users_v1',
  activeContact: 'eduplatform_active_contact_v1',
  themeMode: 'eduplatform_theme_v1',
  discussions: 'eduplatform_discussions_v1',
  lessonsPrefix: 'eduplatform_lessons_',
  videosPrefix: 'eduplatform_videos_',
  customVideoUrlsPrefix: 'eduplatform_custom_video_urls_',
  lessonQuizPrefix: 'eduplatform_lesson_quiz_',
  dailyChallengePrefix: 'eduplatform_daily_challenge_',
  pomodoroPrefix: 'eduplatform_pomodoro_',
  practicePrefix: 'eduplatform_practice_',
  bookmarksPrefix: 'eduplatform_bookmarks_',
  notesPrefix: 'eduplatform_notes_',
  quizzesPrefix: 'eduplatform_quizzes_',
  mockExamPrefix: 'eduplatform_mockexams_',
  flashcardsPrefix: 'eduplatform_flashcards_',
  certificatesPrefix: 'eduplatform_certs_',
  projectStepsPrefix: 'eduplatform_project_steps_',
  interviewPrefix: 'eduplatform_interview_',
  dailyGoalPrefix: 'eduplatform_daily_goal_',
  activityPrefix: 'eduplatform_activity_',
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors in constrained environments
  }
}

export function getTodayDateKey(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateStreak(activityByDate: Record<string, number>): number {
  let streak = 0;
  const todayKey = getTodayDateKey(0);
  const startOffset = (activityByDate[todayKey] ?? 0) > 0 ? 0 : -1;

  for (let i = startOffset; i >= -365; i--) {
    const key = getTodayDateKey(i);
    if ((activityByDate[key] ?? 0) > 0) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export const eduStorage = {
  getThemeMode(): ThemeMode {
    const saved = localStorage.getItem(KEYS.themeMode);
    return saved === 'light' ? 'light' : 'dark';
  },

  setThemeMode(mode: ThemeMode): void {
    localStorage.setItem(KEYS.themeMode, mode);
  },

  getAllUsers(): UserAccount[] {
    return readJson<UserAccount[]>(KEYS.users, []);
  },

  getActiveUser(): UserAccount | null {
    const activeContact = localStorage.getItem(KEYS.activeContact);
    if (!activeContact) return null;
    return this.getAllUsers().find((u) => u.contact === activeContact) ?? null;
  },

  registerUser(
    fullName: string,
    contact: string,
    password: string
  ): { user: UserAccount | null; error: string | null } {
    const name = fullName.trim();
    const cleanContact = contact.trim();
    const cleanPass = password.trim();

    if (name.length < 2) {
      return { user: null, error: "Ism kamida 2 ta belgidan iborat bo'lishi kerak." };
    }

    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const phoneRegex = /^\+?[0-9\s-]{9,15}$/;
    if (!emailRegex.test(cleanContact) && !phoneRegex.test(cleanContact)) {
      return { user: null, error: "To'g'ri elektron pochta yoki telefon raqami kiriting." };
    }

    if (cleanPass.length < 6) {
      return { user: null, error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." };
    }

    const users = this.getAllUsers();
    if (users.some((u) => u.contact.toLowerCase() === cleanContact.toLowerCase())) {
      return { user: null, error: "Bu pochta yoki telefon allaqachon ro'yxatdan o'tgan." };
    }

    const newUser: UserAccount = {
      fullName: name,
      contact: cleanContact,
      password: cleanPass,
      registeredAt: new Date().toISOString(),
    };
    writeJson(KEYS.users, [...users, newUser]);
    localStorage.setItem(KEYS.activeContact, newUser.contact);
    return { user: newUser, error: null };
  },

  loginUser(
    contact: string,
    password: string
  ): { user: UserAccount | null; error: string | null } {
    const cleanContact = contact.trim();
    const cleanPass = password.trim();

    if (!cleanContact || !cleanPass) {
      return { user: null, error: "Elektron pochta (yoki telefon) va parolni kiriting." };
    }

    const found = this.getAllUsers().find(
      (u) => u.contact.toLowerCase() === cleanContact.toLowerCase()
    );
    if (!found) {
      return { user: null, error: "Foydalanuvchi topilmadi. Avval ro'yxatdan o'ting." };
    }
    if (found.password !== cleanPass) {
      return { user: null, error: "Parol noto'g'ri kiritildi." };
    }

    localStorage.setItem(KEYS.activeContact, found.contact);
    return { user: found, error: null };
  },

  loginOrCreateDemoStudent(): UserAccount {
    const demoContact = 'talaba@eduplatform.uz';
    const existing = this.getAllUsers().find((u) => u.contact === demoContact);
    if (existing) {
      localStorage.setItem(KEYS.activeContact, existing.contact);
      return existing;
    }
    const demoUser: UserAccount = {
      fullName: 'Sardor Karimov',
      contact: demoContact,
      password: 'demo1234',
      registeredAt: new Date().toISOString(),
    };
    writeJson(KEYS.users, [...this.getAllUsers(), demoUser]);
    localStorage.setItem(KEYS.activeContact, demoUser.contact);
    return demoUser;
  },

  updateUserName(contact: string, newName: string): UserAccount | null {
    const trimmed = newName.trim();
    if (trimmed.length < 2) return null;
    const users = this.getAllUsers();
    let updatedUser: UserAccount | null = null;
    const nextUsers = users.map((u) => {
      if (u.contact === contact) {
        updatedUser = { ...u, fullName: trimmed };
        return updatedUser;
      }
      return u;
    });
    writeJson(KEYS.users, nextUsers);
    return updatedUser;
  },

  logout(): void {
    localStorage.removeItem(KEYS.activeContact);
  },

  getActivityByDate(contact: string): Record<string, number> {
    return readJson<Record<string, number>>(`${KEYS.activityPrefix}${contact}`, {});
  },

  recordTodayActivity(contact: string, points = 1): Record<string, number> {
    const current = this.getActivityByDate(contact);
    const todayKey = getTodayDateKey(0);
    const updated = {
      ...current,
      [todayKey]: (current[todayKey] ?? 0) + points,
    };
    writeJson(`${KEYS.activityPrefix}${contact}`, updated);
    return updated;
  },

  getDailyGoal(contact: string): number {
    const saved = readJson<number>(`${KEYS.dailyGoalPrefix}${contact}`, 2);
    return saved >= 1 && saved <= 10 ? saved : 2;
  },

  setDailyGoal(contact: string, goal: number): number {
    const clamped = Math.max(1, Math.min(10, goal));
    writeJson(`${KEYS.dailyGoalPrefix}${contact}`, clamped);
    return clamped;
  },

  getCompletedLessonIds(contact: string): string[] {
    return readJson<string[]>(`${KEYS.lessonsPrefix}${contact}`, []);
  },

  markLessonCompleted(contact: string, lessonId: string): string[] {
    const current = this.getCompletedLessonIds(contact);
    if (current.includes(lessonId)) return current;
    const updated = [...current, lessonId];
    writeJson(`${KEYS.lessonsPrefix}${contact}`, updated);
    this.recordTodayActivity(contact, 1);
    return updated;
  },

  getCompletedPracticeIds(contact: string): string[] {
    return readJson<string[]>(`${KEYS.practicePrefix}${contact}`, []);
  },

  markPracticeCompleted(contact: string, lessonId: string): string[] {
    const current = this.getCompletedPracticeIds(contact);
    if (current.includes(lessonId)) return current;
    const updated = [...current, lessonId];
    writeJson(`${KEYS.practicePrefix}${contact}`, updated);
    this.recordTodayActivity(contact, 1);
    return updated;
  },

  getBookmarkedLessonIds(contact: string): string[] {
    return readJson<string[]>(`${KEYS.bookmarksPrefix}${contact}`, []);
  },

  toggleBookmark(contact: string, lessonId: string): string[] {
    const current = this.getBookmarkedLessonIds(contact);
    const updated = current.includes(lessonId)
      ? current.filter((id) => id !== lessonId)
      : [lessonId, ...current];
    writeJson(`${KEYS.bookmarksPrefix}${contact}`, updated);
    return updated;
  },

  getLessonNotes(contact: string): Record<string, string> {
    return readJson<Record<string, string>>(`${KEYS.notesPrefix}${contact}`, {});
  },

  saveLessonNote(contact: string, lessonId: string, note: string): Record<string, string> {
    const current = this.getLessonNotes(contact);
    const updated = { ...current };
    if (note.trim()) {
      updated[lessonId] = note;
    } else {
      delete updated[lessonId];
    }
    writeJson(`${KEYS.notesPrefix}${contact}`, updated);
    return updated;
  },

  getMasteredFlashcards(contact: string): string[] {
    return readJson<string[]>(`${KEYS.flashcardsPrefix}${contact}`, []);
  },

  toggleMasteredFlashcard(contact: string, cardId: string, mastered: boolean): string[] {
    const current = this.getMasteredFlashcards(contact);
    const updated = mastered
      ? Array.from(new Set([...current, cardId]))
      : current.filter((id) => id !== cardId);
    writeJson(`${KEYS.flashcardsPrefix}${contact}`, updated);
    if (mastered) {
      this.recordTodayActivity(contact, 1);
    }
    return updated;
  },

  getCompletedProjectSteps(contact: string): string[] {
    return readJson<string[]>(`${KEYS.projectStepsPrefix}${contact}`, []);
  },

  toggleProjectStep(contact: string, stepId: string): string[] {
    const current = this.getCompletedProjectSteps(contact);
    const updated = current.includes(stepId)
      ? current.filter((id) => id !== stepId)
      : [...current, stepId];
    writeJson(`${KEYS.projectStepsPrefix}${contact}`, updated);
    if (!current.includes(stepId)) {
      this.recordTodayActivity(contact, 1);
    }
    return updated;
  },

  getMasteredInterviewIds(contact: string): string[] {
    return readJson<string[]>(`${KEYS.interviewPrefix}${contact}`, []);
  },

  toggleMasteredInterview(contact: string, qaId: string): string[] {
    const current = this.getMasteredInterviewIds(contact);
    const updated = current.includes(qaId)
      ? current.filter((id) => id !== qaId)
      : [...current, qaId];
    writeJson(`${KEYS.interviewPrefix}${contact}`, updated);
    return updated;
  },

  getQuizResults(contact: string): QuizResultRecord[] {
    return readJson<QuizResultRecord[]>(`${KEYS.quizzesPrefix}${contact}`, []);
  },

  saveQuizResult(
    contact: string,
    record: Omit<QuizResultRecord, 'id' | 'takenAt'>
  ): QuizResultRecord[] {
    const current = this.getQuizResults(contact);
    const entry: QuizResultRecord = {
      ...record,
      id: `qr-${Date.now()}`,
      takenAt: new Date().toISOString(),
    };
    const updated = [entry, ...current];
    writeJson(`${KEYS.quizzesPrefix}${contact}`, updated);
    this.recordTodayActivity(contact, 1);
    return updated;
  },

  getMockExamResults(contact: string): MockExamRecord[] {
    return readJson<MockExamRecord[]>(`${KEYS.mockExamPrefix}${contact}`, []);
  },

  saveMockExamResult(
    contact: string,
    record: Omit<MockExamRecord, 'id' | 'takenAt'>
  ): MockExamRecord[] {
    const current = this.getMockExamResults(contact);
    const entry: MockExamRecord = {
      ...record,
      id: `me-${Date.now()}`,
      takenAt: new Date().toISOString(),
    };
    const updated = [entry, ...current];
    writeJson(`${KEYS.mockExamPrefix}${contact}`, updated);
    this.recordTodayActivity(contact, 2);
    return updated;
  },

  getCertificates(contact: string): CertificateRecord[] {
    return readJson<CertificateRecord[]>(`${KEYS.certificatesPrefix}${contact}`, []);
  },

  unlockCertificateIfEligible(
    contact: string,
    studentName: string,
    courseId: string,
    courseTitle: string,
    percentage: number
  ): CertificateRecord[] {
    const current = this.getCertificates(contact);
    if (percentage < 70) return current;
    const existing = current.find((c) => c.courseId === courseId);
    if (existing && existing.percentage >= percentage) {
      return current;
    }
    const nextCert: CertificateRecord = {
      id:
        existing?.id ??
        `EDU-${courseId.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`,
      courseId,
      courseTitle,
      studentName,
      percentage,
      issuedAt: new Date().toISOString(),
    };
    const updated = [nextCert, ...current.filter((c) => c.courseId !== courseId)];
    writeJson(`${KEYS.certificatesPrefix}${contact}`, updated);
    return updated;
  },

  getLessonDiscussions(lessonId: string): LessonDiscussionPost[] {
    const all = readJson<Record<string, LessonDiscussionPost[]>>(KEYS.discussions, {});
    return all[lessonId] ?? [];
  },

  addDiscussionPost(
    lessonId: string,
    authorName: string,
    authorContact: string,
    postType: DiscussionPostType,
    text: string
  ): LessonDiscussionPost[] {
    const cleanText = text.trim();
    const all = readJson<Record<string, LessonDiscussionPost[]>>(KEYS.discussions, {});
    const current = all[lessonId] ?? [];
    if (!cleanText) return current;

    const newPost: LessonDiscussionPost = {
      id: `disc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      lessonId,
      authorName,
      authorContact,
      postType,
      text: cleanText,
      createdAt: new Date().toISOString(),
      helpfulByContacts: [],
      replies: [],
    };
    const updated = [newPost, ...current];
    writeJson(KEYS.discussions, { ...all, [lessonId]: updated });
    this.recordTodayActivity(authorContact, 1);
    return updated;
  },

  addDiscussionReply(
    lessonId: string,
    postId: string,
    authorName: string,
    authorContact: string,
    text: string
  ): LessonDiscussionPost[] {
    const cleanText = text.trim();
    const all = readJson<Record<string, LessonDiscussionPost[]>>(KEYS.discussions, {});
    const current = all[lessonId] ?? [];
    if (!cleanText) return current;

    const updated = current.map((post) => {
      if (post.id !== postId) return post;
      return {
        ...post,
        replies: [
          ...post.replies,
          {
            id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            authorName,
            authorContact,
            text: cleanText,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
    writeJson(KEYS.discussions, { ...all, [lessonId]: updated });
    return updated;
  },

  toggleDiscussionHelpful(
    lessonId: string,
    postId: string,
    contact: string
  ): LessonDiscussionPost[] {
    const all = readJson<Record<string, LessonDiscussionPost[]>>(KEYS.discussions, {});
    const current = all[lessonId] ?? [];
    const updated = current.map((post) => {
      if (post.id !== postId) return post;
      const already = post.helpfulByContacts.includes(contact);
      return {
        ...post,
        helpfulByContacts: already
          ? post.helpfulByContacts.filter((c) => c !== contact)
          : [...post.helpfulByContacts, contact],
      };
    });
    writeJson(KEYS.discussions, { ...all, [lessonId]: updated });
    return updated;
  },

  deleteDiscussionPost(
    lessonId: string,
    postId: string,
    contact: string
  ): LessonDiscussionPost[] {
    const all = readJson<Record<string, LessonDiscussionPost[]>>(KEYS.discussions, {});
    const current = all[lessonId] ?? [];
    const updated = current.filter(
      (post) => !(post.id === postId && post.authorContact === contact)
    );
    writeJson(KEYS.discussions, { ...all, [lessonId]: updated });
    return updated;
  },

  getWatchedVideoIds(contact: string): string[] {
    return readJson<string[]>(`${KEYS.videosPrefix}${contact}`, []);
  },

  markVideoWatched(contact: string, lessonId: string): string[] {
    const current = this.getWatchedVideoIds(contact);
    if (current.includes(lessonId)) return current;
    const updated = [...current, lessonId];
    writeJson(`${KEYS.videosPrefix}${contact}`, updated);
    this.recordTodayActivity(contact, 1);
    return updated;
  },

  getCustomVideoUrls(contact: string): Record<string, string> {
    return readJson<Record<string, string>>(`${KEYS.customVideoUrlsPrefix}${contact}`, {});
  },

  saveCustomVideoUrl(contact: string, lessonId: string, url: string): Record<string, string> {
    const current = this.getCustomVideoUrls(contact);
    const updated = { ...current };
    const clean = url.trim();
    if (clean) {
      updated[lessonId] = clean;
    } else {
      delete updated[lessonId];
    }
    writeJson(`${KEYS.customVideoUrlsPrefix}${contact}`, updated);
    return updated;
  },

  getLessonQuizScores(contact: string): Record<string, LessonQuizScoreRecord> {
    return readJson<Record<string, LessonQuizScoreRecord>>(`${KEYS.lessonQuizPrefix}${contact}`, {});
  },

  saveLessonQuizScore(
    contact: string,
    lessonId: string,
    score: number,
    total: number
  ): Record<string, LessonQuizScoreRecord> {
    const current = this.getLessonQuizScores(contact);
    const existing = current[lessonId];
    const nextRecord: LessonQuizScoreRecord = {
      score: existing ? Math.max(existing.score, score) : score,
      total,
      completedAt: new Date().toISOString(),
    };
    const updated = { ...current, [lessonId]: nextRecord };
    writeJson(`${KEYS.lessonQuizPrefix}${contact}`, updated);
    if (!existing) {
      this.recordTodayActivity(contact, 1);
    }
    return updated;
  },

  getDailyChallengeDates(contact: string): string[] {
    return readJson<string[]>(`${KEYS.dailyChallengePrefix}${contact}`, []);
  },

  markDailyChallengeCompleted(contact: string, dateKey: string): string[] {
    const current = this.getDailyChallengeDates(contact);
    if (current.includes(dateKey)) return current;
    const updated = [...current, dateKey];
    writeJson(`${KEYS.dailyChallengePrefix}${contact}`, updated);
    this.recordTodayActivity(contact, 1);
    return updated;
  },

  getPomodoroCount(contact: string): number {
    return readJson<number>(`${KEYS.pomodoroPrefix}${contact}`, 0);
  },

  incrementPomodoroCount(contact: string): number {
    const next = this.getPomodoroCount(contact) + 1;
    writeJson(`${KEYS.pomodoroPrefix}${contact}`, next);
    this.recordTodayActivity(contact, 1);
    return next;
  },
};

export function calculateUserXp(
  completedCount: number,
  practiceCount: number,
  quizResultsCount: number,
  mockExamCount: number,
  masteredFlashcardsCount: number,
  projectStepsCount: number,
  certificatesCount: number,
  watchedVideoCount = 0,
  lessonQuizzesCount = 0,
  dailyChallengeCount = 0,
  pomodoroCount = 0
): { xp: number; rank: string; nextRankXp: number } {
  const xp =
    completedCount * 20 +
    practiceCount * 15 +
    quizResultsCount * 40 +
    mockExamCount * 60 +
    masteredFlashcardsCount * 10 +
    projectStepsCount * 10 +
    certificatesCount * 100 +
    watchedVideoCount * 15 +
    lessonQuizzesCount * 25 +
    dailyChallengeCount * 15 +
    pomodoroCount * 10;

  if (xp < 250) return { xp, rank: 'Boshlovchi', nextRankXp: 250 };
  if (xp < 750) return { xp, rank: 'Izlanuvchi', nextRankXp: 750 };
  if (xp < 1600) return { xp, rank: 'Amaliyotchi', nextRankXp: 1600 };
  if (xp < 3000) return { xp, rank: 'Mutaxassis', nextRankXp: 3000 };
  return { xp, rank: 'Ustoz Muhandis', nextRankXp: 5000 };
}
