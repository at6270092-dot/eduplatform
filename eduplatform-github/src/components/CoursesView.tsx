import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FolderKanban, Play, Search } from 'lucide-react';
import { CourseItem, LessonItem } from '../types/edu';
import { EduMediaBanner } from './EduMediaBanner';

interface CoursesViewProps {
  courses: CourseItem[];
  completedIds: string[];
  practiceIds: string[];
  onSelectCourse: (courseId: string) => void;
  onOpenLesson: (courseId: string, lessonId: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  completedIds,
  practiceIds,
  onSelectCourse,
  onOpenLesson,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [viewMode, setViewMode] = useState<'courses' | 'sequence'>('courses');

  const categories = useMemo(
    () => ['Barchasi', ...Array.from(new Set(courses.map((c) => c.category)))],
    [courses]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesCat = selectedCategory === 'Barchasi' || course.category === selectedCategory;
      const matchesQuery =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [courses, query, selectedCategory]);

  const sequentialLessons = useMemo(() => {
    const q = query.trim().toLowerCase();
    const flat = courses.flatMap((course) =>
      course.lessons.map((lesson) => ({ course, lesson }))
    );
    return flat
      .map((item, idx) => ({ ...item, globalNumber: idx + 1 }))
      .filter(({ course, lesson }) => {
        const matchesCat = selectedCategory === 'Barchasi' || course.category === selectedCategory;
        const matchesQuery =
          !q ||
          lesson.title.toLowerCase().includes(q) ||
          lesson.summary.toLowerCase().includes(q) ||
          course.title.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
      });
  }, [courses, query, selectedCategory]);

  const totalLessons = useMemo(
    () => courses.reduce((acc, c) => acc + c.lessons.length, 0),
    [courses]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--edu-ink)]">
            Fanlar va kurslar ({courses.length} ta · {totalLessons} dars)
          </h1>
          <p className="mt-1 text-sm text-[var(--edu-muted)]">
            Barcha {courses.length} ta yo&apos;nalish va {totalLessons} ta dars ochiq — xohlang kursma-kurs, xohlang 1→{totalLessons} ketma-ket o&apos;qing.
          </p>
        </div>

        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-[var(--edu-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              viewMode === 'courses'
                ? "Kurs nomi bo'yicha qidirish..."
                : "Dars mavzusi bo'yicha qidirish..."
            }
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] text-sm text-[var(--edu-ink)] placeholder:text-[var(--edu-muted)]/60 focus:outline-none focus:border-[var(--edu-accent)] transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-1">
          <button
            type="button"
            onClick={() => setViewMode('courses')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'courses'
                ? 'bg-[#2563EB] text-white'
                : 'text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
            }`}
          >
            Kurslar ({courses.length} ta)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('sequence')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'sequence'
                ? 'bg-[#2563EB] text-white'
                : 'text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
            }`}
          >
            Ketma-ket darslar (1→{totalLessons})
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2563EB]/20 border border-[var(--edu-accent)] text-[var(--edu-accent)]'
                  : 'bg-[var(--edu-card)] border border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'sequence' ? (
        sequentialLessons.length === 0 ? (
          <div className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-8 text-center">
            <p className="text-base font-medium text-[var(--edu-ink)]">Mos dars topilmadi</p>
            <p className="mt-1 text-sm text-[var(--edu-muted)]">
              Qidiruv matnini o&apos;zgartirib ko&apos;ring.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sequentialLessons.map(({ course, lesson, globalNumber }) => {
              const isDone = completedIds.includes(lesson.id);
              const isPracticeDone = practiceIds.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => onOpenLesson(course.id, lesson.id)}
                  className="w-full text-left rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] p-4 sm:p-5 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 tabular-nums ${
                        isDone
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40'
                          : 'bg-[var(--edu-inset)] text-[var(--edu-accent)] border border-[var(--edu-border)]'
                      }`}
                    >
                      {globalNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[var(--edu-accent)] truncate">
                        {course.title} · {lesson.moduleTitle}
                      </p>
                      <h3 className="text-sm sm:text-base font-semibold text-[var(--edu-ink)] group-hover:text-[var(--edu-accent)] transition-colors truncate">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-[var(--edu-muted)] truncate mt-0.5">
                        {lesson.summary}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline text-xs text-[var(--edu-muted)] tabular-nums">
                      {lesson.durationMinutes} daq{isPracticeDone ? ' · Mashq ✓' : ''}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    ) : (
                      <Play className="w-5 h-5 text-[var(--edu-accent)]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-8 text-center">
          <p className="text-base font-medium text-[var(--edu-ink)]">Mos kurs topilmadi</p>
          <p className="mt-1 text-sm text-[var(--edu-muted)]">
            Qidiruv so&apos;zini o&apos;zgartirib ko&apos;ring yoki barcha kategoriyalarni tanlang.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((course) => {
            const doneCount = course.lessons.filter((l) => completedIds.includes(l.id)).length;
            const practiceDone = course.lessons.filter((l) => practiceIds.includes(l.id)).length;
            const pct = Math.round((doneCount / course.lessons.length) * 100);
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onSelectCourse(course.id)}
                className="text-left rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] overflow-hidden transition-colors flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <EduMediaBanner
                    src={course.imageUrl}
                    alt={course.title}
                    heightClass="aspect-video"
                    className="border-b border-[var(--edu-border)]"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-[var(--edu-accent)]">
                      <span>{course.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.level}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{course.durationText}</span>
                    </div>
                    <h2 className="mt-2 text-xl font-bold text-[var(--edu-ink)] group-hover:text-[var(--edu-accent)] transition-colors">
                      {course.title}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--edu-muted)] leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-[var(--edu-border)]">
                  <div className="h-2 w-full rounded-full bg-[var(--edu-border)] overflow-hidden mb-2.5">
                    <div className="h-full bg-[#38BDF8]" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--edu-muted)] tabular-nums">
                    <span>
                      {doneCount}/{course.lessons.length} dars · {practiceDone}/{course.lessons.length} mashq · {course.quiz.length} test
                    </span>
                    <span className="text-[var(--edu-ink)] font-medium">{pct}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface CourseDetailViewProps {
  course: CourseItem;
  completedIds: string[];
  watchedVideoIds?: string[];
  practiceIds: string[];
  bookmarkedIds: string[];
  onBack: () => void;
  onOpenLesson: (lessonId: string) => void;
  onStartQuiz: () => void;
  onOpenMiniProjects: () => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  course,
  completedIds,
  watchedVideoIds = [],
  practiceIds,
  bookmarkedIds,
  onBack,
  onOpenLesson,
  onStartQuiz,
  onOpenMiniProjects,
}) => {
  const [lessonFilter, setLessonFilter] = useState('');

  const groupedModules = useMemo(() => {
    const q = lessonFilter.trim().toLowerCase();
    const groups = new Map<string, LessonItem[]>();
    for (const lesson of course.lessons) {
      if (
        q &&
        !lesson.title.toLowerCase().includes(q) &&
        !lesson.summary.toLowerCase().includes(q)
      ) {
        continue;
      }
      const existing = groups.get(lesson.moduleTitle) ?? [];
      existing.push(lesson);
      groups.set(lesson.moduleTitle, existing);
    }
    return Array.from(groups.entries());
  }, [course.lessons, lessonFilter]);

  const doneCount = course.lessons.filter((l) => completedIds.includes(l.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-sm font-medium text-[var(--edu-ink)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kurslarga qaytish</span>
        </button>

        <span className="text-xs text-[var(--edu-muted)] tabular-nums">
          {doneCount} / {course.lessons.length} dars yakunlandi
        </span>
      </div>

      <section className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-5">
          <EduMediaBanner
            src={course.imageUrl}
            alt={course.title}
            heightClass="h-56 lg:h-full"
          />
        </div>
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--edu-accent)]">
              <span>{course.category}</span>
              <span aria-hidden="true">·</span>
              <span>{course.level}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{course.durationText}</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--edu-ink)]">
              {course.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[var(--edu-muted)] leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartQuiz}
              className="px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Bilimni tekshirish ({course.quiz.length} ta test)
            </button>
            <button
              type="button"
              onClick={onOpenMiniProjects}
              className="px-4 py-3 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-sm font-medium text-[var(--edu-ink)] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FolderKanban className="w-4 h-4 text-[var(--edu-accent)]" />
              <span>Mini-loyiha: {course.projectTitle}</span>
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[var(--edu-ink)]">
          Darslar ketma-ketligi ({course.lessons.length} ta)
        </h2>
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-[var(--edu-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={lessonFilter}
            onChange={(e) => setLessonFilter(e.target.value)}
            placeholder="Mavzuni qidirish..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] text-sm text-[var(--edu-ink)] placeholder:text-[var(--edu-muted)]/60 focus:outline-none focus:border-[var(--edu-accent)]"
          />
        </div>
      </div>

      <div className="space-y-6">
        {groupedModules.map(([moduleTitle, lessons]) => (
          <div key={moduleTitle} className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--edu-accent)]">{moduleTitle}</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {lessons.map((lesson) => {
                const isDone = completedIds.includes(lesson.id);
                const isVideoDone = watchedVideoIds.includes(lesson.id);
                const isPracticeDone = practiceIds.includes(lesson.id);
                const isSaved = bookmarkedIds.includes(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onOpenLesson(lesson.id)}
                    className="w-full text-left rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] px-5 py-4 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--edu-muted)] tabular-nums">
                        <span>{lesson.order}-dars</span>
                        <span aria-hidden="true">·</span>
                        <span>{lesson.durationMinutes} daqiqa</span>
                        <span aria-hidden="true">·</span>
                        <span className={isVideoDone ? 'text-[#10B981]' : 'text-[var(--edu-accent)]'}>
                          {isVideoDone ? 'Video ko‘rilgan' : 'O‘zbekcha video + 4 savol'}
                        </span>
                        {isPracticeDone && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#10B981]">Mashq bajarilgan</span>
                          </>
                        )}
                        {isSaved && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[var(--edu-accent)]">Saqlangan</span>
                          </>
                        )}
                      </div>
                      <div className="mt-1 text-base font-semibold text-[var(--edu-ink)] truncate">
                        {lesson.title}
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--edu-muted)] truncate">
                        {lesson.summary}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                      ) : (
                        <Play className="w-5 h-5 text-[var(--edu-accent)]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
