import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  FolderKanban,
  Layers,
  MessageSquareText,
} from 'lucide-react';
import {
  CourseItem,
  FlashcardItem,
  InterviewQA,
  PracticeTab,
  RoadmapItem,
} from '../types/edu';
import { COURSE_BY_ID } from '../data/eduCourses';
import { FlashcardsView } from './FlashcardsView';

interface PracticeHubViewProps {
  initialTab?: PracticeTab;
  cards: FlashcardItem[];
  roadmaps: RoadmapItem[];
  courses: CourseItem[];
  interviewQAs: InterviewQA[];
  completedLessonIds: string[];
  masteredFlashcards: string[];
  completedProjectSteps: string[];
  masteredInterviewIds: string[];
  onToggleMasteredFlashcard: (cardId: string, mastered: boolean) => void;
  onToggleProjectStep: (stepId: string) => void;
  onToggleMasteredInterview: (qaId: string) => void;
  onOpenCourse: (courseId: string) => void;
}

export const PracticeHubView: React.FC<PracticeHubViewProps> = ({
  initialTab = 'flashcards',
  cards,
  roadmaps,
  courses,
  interviewQAs,
  completedLessonIds,
  masteredFlashcards,
  completedProjectSteps,
  masteredInterviewIds,
  onToggleMasteredFlashcard,
  onToggleProjectStep,
  onToggleMasteredInterview,
  onOpenCourse,
}) => {
  const [activeTab, setActiveTab] = useState<PracticeTab>(initialTab);
  const [interviewCat, setInterviewCat] = useState('Barchasi');
  const [expandedQaId, setExpandedQaId] = useState<string | null>(interviewQAs[0]?.id ?? null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const interviewCategories = useMemo(
    () => ['Barchasi', ...Array.from(new Set(interviewQAs.map((q) => q.category)))],
    [interviewQAs]
  );

  const filteredInterviewQAs = useMemo(() => {
    if (interviewCat === 'Barchasi') return interviewQAs;
    return interviewQAs.filter((q) => q.category === interviewCat);
  }, [interviewQAs, interviewCat]);

  const tabs: Array<{ id: PracticeTab; label: string; icon: typeof Layers }> = [
    { id: 'flashcards', label: `Kartochkalar (${cards.length})`, icon: Layers },
    { id: 'roadmap', label: `Yo'l xaritasi (${roadmaps.length})`, icon: Compass },
    { id: 'projects', label: `Mini-loyihalar (${courses.length})`, icon: FolderKanban },
    { id: 'interview', label: `Intervyu (${interviewQAs.length})`, icon: MessageSquareText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--edu-ink)]">Amaliyot markazi</h1>
          <p className="mt-1 text-sm text-[var(--edu-muted)]">
            Kartochkalar bilan tez takrorlang, kasb yo&apos;l xaritasini kuzating, portfel
            loyihalarini bajaring va suhbat savollariga tayyorlaning.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'flashcards' && (
        <FlashcardsView
          cards={cards}
          masteredIds={masteredFlashcards}
          onToggleMastered={onToggleMasteredFlashcard}
        />
      )}

      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          {roadmaps.map((roadmap) => {
            const steps = roadmap.courseIds
              .map((id) => COURSE_BY_ID.get(id))
              .filter((c): c is NonNullable<typeof c> => Boolean(c));
            const totalLessonsInPath = steps.reduce((acc, c) => acc + c.lessons.length, 0);
            const doneLessonsInPath = steps.reduce(
              (acc, c) =>
                acc + c.lessons.filter((l) => completedLessonIds.includes(l.id)).length,
              0
            );
            const pathPct =
              totalLessonsInPath > 0
                ? Math.round((doneLessonsInPath / totalLessonsInPath) * 100)
                : 0;

            return (
              <section
                key={roadmap.id}
                className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[var(--edu-accent)]">
                      Maqsad: {roadmap.targetRole}
                    </div>
                    <h2 className="mt-1 text-xl font-bold text-[var(--edu-ink)]">{roadmap.title}</h2>
                    <p className="mt-1 text-sm text-[var(--edu-muted)]">{roadmap.subtitle}</p>
                  </div>
                  <div className="text-left sm:text-right tabular-nums shrink-0">
                    <div className="text-2xl font-bold text-[#10B981]">{pathPct}%</div>
                    <div className="text-xs text-[var(--edu-muted)]">
                      {doneLessonsInPath} / {totalLessonsInPath} dars
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {steps.map((course, idx) => {
                    const done = course.lessons.filter((l) =>
                      completedLessonIds.includes(l.id)
                    ).length;
                    const pct = Math.round((done / course.lessons.length) * 100);
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => onOpenCourse(course.id)}
                        className="text-left rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] p-4 transition-colors flex flex-col justify-between gap-3 cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[var(--edu-accent)] tabular-nums">
                            0{idx + 1}. Bosqich
                          </div>
                          <div className="mt-1 text-sm font-bold text-[var(--edu-ink)]">
                            {course.title}
                          </div>
                        </div>
                        <div className="tabular-nums text-xs text-[var(--edu-muted)]">
                          {done}/{course.lessons.length} dars ·{' '}
                          <span className="text-[var(--edu-ink)] font-semibold">{pct}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => {
            const doneSteps = course.projectSteps.filter((s) =>
              completedProjectSteps.includes(s.id)
            ).length;
            const allDone = doneSteps === course.projectSteps.length;

            return (
              <section
                key={course.id}
                className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-[var(--edu-accent)]">{course.title}</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        allDone ? 'text-[#10B981]' : 'text-[var(--edu-muted)]'
                      }`}
                    >
                      {doneSteps} / {course.projectSteps.length} bosqich
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-[var(--edu-ink)]">
                    {course.projectTitle}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--edu-muted)]">{course.projectDescription}</p>

                  <div className="mt-4 space-y-2">
                    {course.projectSteps.map((step) => {
                      const checked = completedProjectSteps.includes(step.id);
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => onToggleProjectStep(step.id)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-colors flex items-start gap-3 cursor-pointer ${
                            checked
                              ? 'bg-[#10B981]/10 border-[#10B981]/40'
                              : 'bg-[var(--edu-inset)] border-[var(--edu-border)] hover:border-[var(--edu-accent)]/60'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                              checked
                                ? 'bg-[#10B981] border-[#10B981] text-[#060A13]'
                                : 'border-[var(--edu-muted)]'
                            }`}
                          >
                            {checked && <Check className="w-3.5 h-3.5" />}
                          </span>
                          <div className="min-w-0">
                            <div
                              className={`text-sm font-medium ${
                                checked ? 'text-[#10B981]' : 'text-[var(--edu-ink)]'
                              }`}
                            >
                              {step.title}
                            </div>
                            <div className="text-xs text-[var(--edu-muted)]">{step.detail}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--edu-border)] flex items-center justify-between gap-3 text-xs">
                  <span className="text-[var(--edu-muted)]">
                    Har bir bosqich uchun +10 XP beriladi
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenCourse(course.id)}
                    className="font-semibold text-[var(--edu-accent)] hover:opacity-80 whitespace-nowrap cursor-pointer"
                  >
                    Kurs darslarini ko&apos;rish →
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {activeTab === 'interview' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {interviewCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setInterviewCat(cat)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    interviewCat === cat
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-[var(--edu-card)] border border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-xs text-[var(--edu-muted)] tabular-nums shrink-0">
              Tayyorlangan: {masteredInterviewIds.length} / {interviewQAs.length}
            </span>
          </div>

          <div className="space-y-3">
            {filteredInterviewQAs.map((qa) => {
              const isOpen = expandedQaId === qa.id;
              const isMastered = masteredInterviewIds.includes(qa.id);
              return (
                <div
                  key={qa.id}
                  className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedQaId(isOpen ? null : qa.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-[var(--edu-accent)]">
                        {qa.category}
                        {isMastered ? ' · Tayyor' : ''}
                      </div>
                      <h3 className="mt-1 text-base font-semibold text-[var(--edu-ink)]">
                        {qa.question}
                      </h3>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[var(--edu-muted)] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--edu-muted)] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 border-t border-[var(--edu-border)] space-y-3">
                      <p className="text-sm text-[var(--edu-ink)] leading-relaxed">{qa.answer}</p>
                      <p className="text-xs text-[var(--edu-accent)]">
                        Suhbat maslahati: {qa.tip}
                      </p>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => onToggleMasteredInterview(qa.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                            isMastered
                              ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981]'
                              : 'bg-[var(--edu-inset)] border border-[var(--edu-border)] text-[var(--edu-ink)] hover:border-[var(--edu-accent)]'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isMastered ? 'Tayyorman (belgilangan)' : 'Javobni o‘zlashtirdim'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
