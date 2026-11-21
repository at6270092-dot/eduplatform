export interface UserAccount {
  fullName: string;
  contact: string;
  password: string;
  registeredAt: string;
}

export interface LessonPractice {
  prompt: string;
  codeSnippet: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonItem {
  id: string;
  courseId: string;
  order: number;
  moduleTitle: string;
  title: string;
  durationMinutes: number;
  summary: string;
  content: string;
  codeExample: string;
  commonMistake: string;
  takeaway: string;
  videoUrl: string;
  imageUrl: string;
  imageCaption: string;
  practice: LessonPractice;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ProjectStep {
  id: string;
  title: string;
  detail: string;
}

export interface CourseItem {
  id: string;
  title: string;
  category: string;
  level: string;
  durationText: string;
  description: string;
  imageUrl: string;
  projectTitle: string;
  projectDescription: string;
  projectSteps: ProjectStep[];
  lessons: LessonItem[];
  quiz: QuizQuestion[];
}

export interface FlashcardItem {
  id: string;
  topic: string;
  front: string;
  back: string;
  hint: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  subtitle: string;
  targetRole: string;
  courseIds: string[];
}

export interface InterviewQA {
  id: string;
  category: string;
  question: string;
  answer: string;
  tip: string;
}

export interface QuizResultRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  takenAt: string;
}

export interface MockExamRecord {
  id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  durationSeconds: number;
  takenAt: string;
}

export interface CertificateRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  percentage: number;
  issuedAt: string;
}

export type PracticeTab = 'flashcards' | 'roadmap' | 'projects' | 'interview';
export type ThemeMode = 'dark' | 'light';

export type DiscussionPostType = 'savol' | 'mulohaza';

export interface LessonDiscussionReply {
  id: string;
  authorName: string;
  authorContact: string;
  text: string;
  createdAt: string;
}

export interface LessonDiscussionPost {
  id: string;
  lessonId: string;
  authorName: string;
  authorContact: string;
  postType: DiscussionPostType;
  text: string;
  createdAt: string;
  helpfulByContacts: string[];
  replies: LessonDiscussionReply[];
}

export interface LessonVideoChapter {
  id: string;
  title: string;
  startSec: number;
  endSec: number;
  subtitle: string;
  headline: string;
  bullets: string[];
  visualType: 'intro' | 'theory' | 'code' | 'checkpoint' | 'summary';
}

export interface LessonMicroQuestion {
  id: string;
  category: 'Kod mashqi' | 'Nazariya' | 'Xato tahlili' | 'Maqsad';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonQuizScoreRecord {
  score: number;
  total: number;
  completedAt: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progressText: string;
}

export type AppScreen =
  | { type: 'home' }
  | { type: 'courses' }
  | { type: 'practice'; initialTab?: PracticeTab }
  | { type: 'quizzes' }
  | { type: 'profile' }
  | { type: 'courseDetail'; courseId: string }
  | { type: 'lessonDetail'; courseId: string; lessonId: string }
  | { type: 'quizRunner'; courseId: string }
  | { type: 'mockExam' };
