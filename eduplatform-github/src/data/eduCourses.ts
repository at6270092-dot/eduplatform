import { CourseItem, LessonItem } from '../types/edu';
import { EDU_COURSES_FOUNDATION } from './eduCoursesFoundation';
import { EDU_COURSES_CORE } from './eduCoursesCore';
import { EDU_COURSES_EXTRA } from './eduCoursesExtra';
import { EDU_FLASHCARDS, EDU_INTERVIEW_QA, EDU_ROADMAPS } from './eduPracticeData';

export const EDU_COURSES: CourseItem[] = [
  ...EDU_COURSES_FOUNDATION,
  ...EDU_COURSES_CORE,
  ...EDU_COURSES_EXTRA,
];

export { EDU_FLASHCARDS, EDU_ROADMAPS, EDU_INTERVIEW_QA };

export const ALL_LESSONS_MAP: Map<string, LessonItem> = new Map(
  EDU_COURSES.flatMap((course) => course.lessons.map((lesson) => [lesson.id, lesson] as const))
);

export const COURSE_BY_ID: Map<string, CourseItem> = new Map(
  EDU_COURSES.map((course) => [course.id, course] as const)
);

export const TOTAL_LESSONS_COUNT = EDU_COURSES.reduce((acc, c) => acc + c.lessons.length, 0);
export const TOTAL_QUIZ_COUNT = EDU_COURSES.reduce((acc, c) => acc + c.quiz.length, 0);
