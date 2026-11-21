import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  MessageCircle,
  MessageSquare,
  Reply,
  Send,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import {
  DiscussionPostType,
  LessonDiscussionPost,
  UserAccount,
} from '../types/edu';

interface LessonDiscussionProps {
  lessonId: string;
  currentUser: UserAccount;
  discussions: LessonDiscussionPost[];
  onAddPost: (postType: DiscussionPostType, text: string) => void;
  onAddReply: (postId: string, text: string) => void;
  onToggleHelpful: (postId: string) => void;
  onDeletePost: (postId: string) => void;
}

type FilterTab = 'all' | DiscussionPostType;

function formatUzDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const months = [
      'yan',
      'fev',
      'mar',
      'apr',
      'may',
      'iyn',
      'iyl',
      'avg',
      'sen',
      'okt',
      'noy',
      'dek',
    ];
    const day = d.getDate();
    const month = months[d.getMonth()] ?? '';
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}-${month}, ${hours}:${mins}`;
  } catch {
    return '';
  }
}

export const LessonDiscussion: React.FC<LessonDiscussionProps> = ({
  lessonId,
  currentUser,
  discussions,
  onAddPost,
  onAddReply,
  onToggleHelpful,
  onDeletePost,
}) => {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [postType, setPostType] = useState<DiscussionPostType>('savol');
  const [draftText, setDraftText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    setFilter('all');
    setDraftText('');
    setFormError(null);
    setReplyingToId(null);
    setReplyDraft('');
    setReplyError(null);
  }, [lessonId]);

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = draftText.trim();
    if (clean.length < 3) {
      setFormError('Savol yoki mulohaza kamida 3 ta belgidan iborat bo‘lishi kerak.');
      return;
    }
    onAddPost(postType, clean);
    setDraftText('');
    setFormError(null);
    if (filter !== 'all' && filter !== postType) {
      setFilter('all');
    }
  };

  const handleSubmitReply = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const clean = replyDraft.trim();
    if (clean.length < 2) {
      setReplyError('Javob matni kamida 2 ta belgidan iborat bo‘lishi kerak.');
      return;
    }
    onAddReply(postId, clean);
    setReplyDraft('');
    setReplyError(null);
    setReplyingToId(null);
  };

  const savolCount = discussions.filter((p) => p.postType === 'savol').length;
  const mulohazaCount = discussions.filter((p) => p.postType === 'mulohaza').length;

  const filteredPosts =
    filter === 'all'
      ? discussions
      : discussions.filter((p) => p.postType === filter);

  const filterTabs: Array<{ id: FilterTab; label: string; count: number }> = [
    { id: 'all', label: 'Barchasi', count: discussions.length },
    { id: 'savol', label: 'Savollar', count: savolCount },
    { id: 'mulohaza', label: 'Mulohazalar', count: mulohazaCount },
  ];

  return (
    <section
      aria-labelledby="lesson-discussion-heading"
      className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-[var(--edu-accent)] shrink-0" />
          <h2
            id="lesson-discussion-heading"
            className="text-sm font-semibold text-[var(--edu-ink)]"
          >
            Muhokama
          </h2>
          <span className="text-xs text-[var(--edu-muted)] tabular-nums">
            · {discussions.length} ta fikr
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {filterTabs.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap tabular-nums cursor-pointer ${
                  active
                    ? 'bg-[#2563EB]/15 border-[var(--edu-accent)] text-[var(--edu-accent)]'
                    : 'bg-[var(--edu-inset)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmitPost} className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPostType('savol')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                postType === 'savol'
                  ? 'bg-[#F59E0B]/15 border-[#F59E0B]/60 text-[#F59E0B]'
                  : 'bg-[var(--edu-inset)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Savol berish</span>
            </button>

            <button
              type="button"
              onClick={() => setPostType('mulohaza')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                postType === 'mulohaza'
                  ? 'bg-[#2563EB]/15 border-[var(--edu-accent)] text-[var(--edu-accent)]'
                  : 'bg-[var(--edu-inset)] border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Mulohaza yozish</span>
            </button>
          </div>

          <span className="text-xs text-[var(--edu-muted)]">
            Muallif: <span className="font-medium text-[var(--edu-ink)]">{currentUser.fullName}</span>
          </span>
        </div>

        <textarea
          rows={3}
          value={draftText}
          onChange={(e) => {
            setDraftText(e.target.value);
            if (formError) setFormError(null);
          }}
          placeholder={
            postType === 'savol'
              ? "Dars bo'yicha tushunmagan joyingiz yoki savolingizni yozing..."
              : "Dars haqidagi fikringiz, tajribangiz yoki foydali mulohazangizni yozing..."
          }
          className="w-full p-3.5 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] text-sm text-[var(--edu-ink)] placeholder:text-[var(--edu-muted)]/60 focus:outline-none focus:border-[var(--edu-accent)]"
        />

        {formError && (
          <p className="text-xs text-[#F87171]">{formError}</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{postType === 'savol' ? 'Savolni yuborish' : 'Mulohazani joylash'}</span>
          </button>
        </div>
      </form>

      {filteredPosts.length === 0 ? (
        <div className="rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] p-5 text-center space-y-1">
          <p className="text-sm font-medium text-[var(--edu-ink)]">
            {discussions.length === 0
              ? 'Hozircha bu dars bo‘yicha muhokama yo‘q'
              : 'Tanlangan toifada hozircha yozuvlar yo‘q'}
          </p>
          <p className="text-xs text-[var(--edu-muted)]">
            {discussions.length === 0
              ? 'Birinchi bo‘lib savol bering yoki dars haqidagi mulohazangizni qoldiring.'
              : 'Boshqa toifani tanlang yoki yuqoridagi maydon orqali yangi fikr qo‘shing.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isOwner = post.authorContact === currentUser.contact;
            const hasVoted = post.helpfulByContacts.includes(currentUser.contact);
            const isReplying = replyingToId === post.id;

            return (
              <article
                key={post.id}
                className="rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--edu-muted)]">
                    <span className="font-semibold text-[var(--edu-ink)]">
                      {post.authorName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        post.postType === 'savol'
                          ? 'font-medium text-[#F59E0B]'
                          : 'font-medium text-[var(--edu-accent)]'
                      }
                    >
                      {post.postType === 'savol' ? 'Savol' : 'Mulohaza'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatUzDateTime(post.createdAt)}</span>
                  </div>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => onDeletePost(post.id)}
                      aria-label="Yozuvni o'chirish"
                      className="inline-flex items-center gap-1 text-xs text-[var(--edu-muted)] hover:text-[#F87171] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>O&apos;chirish</span>
                    </button>
                  )}
                </div>

                <p className="text-sm text-[var(--edu-ink)] leading-relaxed whitespace-pre-wrap">
                  {post.text}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onToggleHelpful(post.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors tabular-nums cursor-pointer ${
                      hasVoted
                        ? 'text-[var(--edu-accent)]'
                        : 'text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-current' : ''}`} />
                    <span>
                      Foydali
                      {post.helpfulByContacts.length > 0
                        ? ` (${post.helpfulByContacts.length})`
                        : ''}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isReplying) {
                        setReplyingToId(null);
                        setReplyDraft('');
                        setReplyError(null);
                      } else {
                        setReplyingToId(post.id);
                        setReplyDraft('');
                        setReplyError(null);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--edu-muted)] hover:text-[var(--edu-ink)] transition-colors cursor-pointer"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>{isReplying ? 'Yopish' : 'Javob yozish'}</span>
                  </button>
                </div>

                {post.replies.length > 0 && (
                  <div className="border-t border-[var(--edu-border)] pt-3 space-y-2.5">
                    {post.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="pl-3 border-l border-[var(--edu-border)] space-y-1"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--edu-muted)]">
                          <span className="font-semibold text-[var(--edu-ink)]">
                            {reply.authorName}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {formatUzDateTime(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--edu-ink)]/90 leading-relaxed whitespace-pre-wrap">
                          {reply.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {isReplying && (
                  <form
                    onSubmit={(e) => handleSubmitReply(e, post.id)}
                    className="border-t border-[var(--edu-border)] pt-3 space-y-2"
                  >
                    <textarea
                      rows={2}
                      value={replyDraft}
                      onChange={(e) => {
                        setReplyDraft(e.target.value);
                        if (replyError) setReplyError(null);
                      }}
                      placeholder={`${post.authorName}ga javob yozing...`}
                      className="w-full p-2.5 rounded-lg bg-[var(--edu-card)] border border-[var(--edu-border)] text-xs sm:text-sm text-[var(--edu-ink)] placeholder:text-[var(--edu-muted)]/60 focus:outline-none focus:border-[var(--edu-accent)]"
                    />
                    {replyError && (
                      <p className="text-xs text-[#F87171]">{replyError}</p>
                    )}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingToId(null);
                          setReplyDraft('');
                          setReplyError(null);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[var(--edu-border)] bg-[var(--edu-card)] text-xs font-medium text-[var(--edu-muted)] hover:text-[var(--edu-ink)] cursor-pointer"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold cursor-pointer"
                      >
                        Javob yuborish
                      </button>
                    </div>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
