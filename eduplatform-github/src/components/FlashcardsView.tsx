import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, RefreshCw } from 'lucide-react';
import { FlashcardItem } from '../types/edu';

interface FlashcardsViewProps {
  cards: FlashcardItem[];
  masteredIds: string[];
  onToggleMastered: (cardId: string, mastered: boolean) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  cards,
  masteredIds,
  onToggleMastered,
}) => {
  const topics = useMemo(
    () => ['Barchasi', ...Array.from(new Set(cards.map((c) => c.topic)))],
    [cards]
  );

  const [selectedTopic, setSelectedTopic] = useState('Barchasi');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const filteredCards = useMemo(() => {
    if (selectedTopic === 'Barchasi') return cards;
    return cards.filter((c) => c.topic === selectedTopic);
  }, [cards, selectedTopic]);

  useEffect(() => {
    setCurrentIndex(0);
    setShowBack(false);
    setShowHint(false);
  }, [selectedTopic]);

  const currentCard = filteredCards[currentIndex];
  const masteredCountInFilter = filteredCards.filter((c) => masteredIds.includes(c.id)).length;
  const isCurrentMastered = currentCard ? masteredIds.includes(currentCard.id) : false;

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setShowBack(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setShowBack(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--edu-ink)]">
            Tezkor kartochkalar ({cards.length} ta)
          </h2>
          <p className="mt-1 text-sm text-[var(--edu-muted)]">
            Kartochkani bosib javobni oching, asosiy atamalarni tez yodlang va +10 XP to&apos;plang.
          </p>
        </div>

        <div className="text-sm text-[var(--edu-muted)] tabular-nums">
          O&apos;zlashtirilgan:{' '}
          <span className="font-semibold text-[#10B981]">
            {masteredCountInFilter} / {filteredCards.length}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {topics.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => setSelectedTopic(topic)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedTopic === topic
                ? 'bg-[#2563EB] text-white'
                : 'bg-[var(--edu-card)] border border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {!currentCard ? (
        <div className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-8 text-center">
          <p className="text-base font-medium text-[var(--edu-ink)]">Kartochkalar topilmadi</p>
        </div>
      ) : (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setShowBack((prev) => !prev)}
            className={`w-full text-left rounded-2xl border p-6 sm:p-10 min-h-[250px] flex flex-col justify-between transition-colors cursor-pointer ${
              showBack
                ? 'bg-[var(--edu-nav)] border-[var(--edu-accent)]'
                : 'bg-[var(--edu-card)] border-[var(--edu-border)] hover:border-[var(--edu-accent)]/70'
            }`}
          >
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="font-semibold text-[var(--edu-accent)]">
                {currentCard.topic} · {showBack ? 'Javob' : 'Savol'}
              </span>
              <span className="text-[var(--edu-muted)] tabular-nums">
                {currentIndex + 1} / {filteredCards.length}
                {isCurrentMastered ? ' · O‘zlashtirilgan' : ''}
              </span>
            </div>

            <div className="my-6">
              <p className="text-xl sm:text-2xl font-semibold text-[var(--edu-ink)] leading-relaxed [text-wrap:balance]">
                {showBack ? currentCard.back : currentCard.front}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 text-xs text-[var(--edu-muted)]">
              <span>
                {showBack
                  ? "Savolga qaytish uchun kartochkani bosing"
                  : "Javobni ko'rish uchun kartochkani bosing"}
              </span>
              <span className="text-[var(--edu-accent)] font-medium whitespace-nowrap">
                {showBack ? 'Savolni ko‘rsatish' : 'Javobni ochish'}
              </span>
            </div>
          </button>

          {currentCard.hint && (
            <div className="rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] px-4 py-3 flex items-center justify-between gap-4">
              {showHint ? (
                <p className="text-sm text-[var(--edu-accent)]">
                  Maslahat: <span className="text-[var(--edu-ink)]">{currentCard.hint}</span>
                </p>
              ) : (
                <span className="text-xs text-[var(--edu-muted)]">
                  Javob esga tushmasa, qisqa maslahatni ochishingiz mumkin.
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--edu-accent)] hover:opacity-80 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showHint ? 'Yashirish' : 'Maslahat'}</span>
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                className="flex-1 sm:flex-initial h-11 px-4 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-sm font-medium text-[var(--edu-ink)] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Oldingi</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 sm:flex-initial h-11 px-4 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-accent)] text-sm font-medium text-[var(--edu-ink)] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Keyingi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onToggleMastered(currentCard.id, false);
                  handleNext();
                }}
                className="flex-1 sm:flex-initial h-11 px-4 rounded-xl bg-[var(--edu-card)] border border-[var(--edu-border)] hover:border-[var(--edu-muted)] text-sm font-medium text-[var(--edu-muted)] hover:text-[var(--edu-ink)] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Qayta ko&apos;rish</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleMastered(currentCard.id, true);
                  handleNext();
                }}
                className={`flex-1 sm:flex-initial h-11 px-5 rounded-xl text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                  isCurrentMastered
                    ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981]'
                    : 'bg-[#10B981] hover:bg-[#059669] text-[#060A13]'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{isCurrentMastered ? 'Bildim (saqlangan)' : 'Bildim (+10 XP)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
