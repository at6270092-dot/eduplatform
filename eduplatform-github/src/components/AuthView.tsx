import React, { useState } from 'react';
import { Code2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import {
  EDU_COURSES,
  EDU_FLASHCARDS,
  TOTAL_LESSONS_COUNT,
  TOTAL_QUIZ_COUNT,
} from '../data/eduCourses';
import { EDU_IMAGES } from '../data/eduMedia';
import { EduMediaBanner } from './EduMediaBanner';

interface AuthViewProps {
  errorMessage: string | null;
  onClearError: () => void;
  onLogin: (contact: string, password: string) => void;
  onRegister: (fullName: string, contact: string, password: string) => void;
  onDemoLogin: () => void;
  onOpenAndroidCode: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  errorMessage,
  onClearError,
  onLogin,
  onRegister,
  onDemoLogin,
  onOpenAndroidCode,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegisterMode) {
      onRegister(fullName, contact, password);
    } else {
      onLogin(contact, password);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--edu-bg)] text-[var(--edu-ink)] flex flex-col">
      <header className="w-full border-b border-[var(--edu-border)] bg-[var(--edu-nav)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <span className="text-xl font-bold tracking-tight text-[var(--edu-accent)] whitespace-nowrap shrink-0">
            EduPlatform
          </span>
          <div className="hidden md:flex items-center gap-6 text-sm text-[var(--edu-muted)]">
            <span className="whitespace-nowrap tabular-nums">{EDU_COURSES.length} ta fan kursi</span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap tabular-nums">{TOTAL_LESSONS_COUNT} ta dars</span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap tabular-nums">{TOTAL_QUIZ_COUNT} ta test</span>
          </div>
          <button
            type="button"
            onClick={onOpenAndroidCode}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-[var(--edu-border)] bg-[var(--edu-card)] text-[var(--edu-ink)] hover:border-[var(--edu-accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-[var(--edu-accent)]" />
            <span className="hidden sm:inline">Android Kodi</span>
            <span className="sm:hidden">APK Kod</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <section className="lg:col-span-6 flex flex-col justify-between gap-6 py-2">
            <div className="space-y-5">
              <p className="text-sm font-medium text-[var(--edu-accent)]">
                Mobil va Veb Ta&apos;lim Tizimi · Barcha darslar ochiq
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--edu-ink)] leading-tight [text-wrap:balance]">
                {TOTAL_LESSONS_COUNT} ta amaliy dars, interaktiv mashqlar va sertifikatlar uchun yagona platforma
              </h1>
              <p className="text-base text-[var(--edu-muted)] leading-relaxed max-w-xl">
                0 dan boshlang&apos;ich dasturlash (println, var/val), amaliy masalalar, Android Compose,
                Kotlin, SQL, Git, Algoritmlar, UI/UX, React, Backend API va Python darsliklari
                to&apos;liq ochiq holatda tayyor.
              </p>

              <EduMediaBanner
                src={EDU_IMAGES.heroWorkspace}
                alt="EduPlatform o'quv muhiti"
                caption={`${EDU_COURSES.length} ta kurs · ${TOTAL_LESSONS_COUNT} ta rasmli dars · ${TOTAL_QUIZ_COUNT} ta test · ${EDU_FLASHCARDS.length} ta kartochka`}
                className="rounded-2xl border border-[var(--edu-border)]"
              />

              <div className="grid grid-cols-3 gap-4 border-t border-[var(--edu-border)] pt-5">
                <div>
                  <div className="text-2xl font-bold text-[var(--edu-ink)] tabular-nums">
                    {EDU_COURSES.length}
                  </div>
                  <div className="text-xs text-[var(--edu-muted)] mt-1">Asosiy kurs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--edu-accent)] tabular-nums">
                    {TOTAL_LESSONS_COUNT}
                  </div>
                  <div className="text-xs text-[var(--edu-muted)] mt-1">Rasmli dars</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#10B981] tabular-nums">
                    {TOTAL_QUIZ_COUNT}
                  </div>
                  <div className="text-xs text-[var(--edu-muted)] mt-1">Test savoli</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--edu-accent)]">
              Loyiha rahbari: Ahmadali Toshturgunov tomonidan ishlab chiqilgan · 2026-yil 16-noyabr, soat 09:45
            </p>
          </section>

          <section className="lg:col-span-6">
            <div className="rounded-2xl bg-[var(--edu-card)] border border-[var(--edu-border)] p-6 sm:p-8 h-full flex flex-col justify-center">
              <div className="mb-6 pb-6 border-b border-[var(--edu-border)]">
                <button
                  type="button"
                  onClick={onDemoLogin}
                  className="w-full h-12 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#060A13] font-bold text-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Barcha {TOTAL_LESSONS_COUNT} ta darsni hoziroq ochish (Tezkor kirish)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="mt-2 text-xs text-center text-[var(--edu-muted)]">
                  Ro&apos;yxatdan o&apos;tmasdan ham demo talaba sifatida barcha bo&apos;limlarni ko&apos;ring
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    onClearError();
                  }}
                  className={`h-11 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    !isRegisterMode
                      ? 'bg-[#2563EB] text-white'
                      : 'border border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
                  }`}
                >
                  Kirish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    onClearError();
                  }}
                  className={`h-11 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    isRegisterMode
                      ? 'bg-[#2563EB] text-white'
                      : 'border border-[var(--edu-border)] text-[var(--edu-muted)] hover:text-[var(--edu-ink)]'
                  }`}
                >
                  Ro&apos;yxatdan o&apos;tish
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegisterMode && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--edu-muted)] mb-1.5">
                      Ism va familiya
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        onClearError();
                      }}
                      placeholder="Masalan: Sardor Karimov"
                      className="w-full h-12 px-4 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] text-[var(--edu-ink)] placeholder:text-[var(--edu-muted)]/60 focus:outline-none focus:border-[var(--edu-accent)] transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--edu-muted)] mb-1.5">
                    Elektron pochta yoki telefon
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);
                      onClearError();
                    }}
                    placeholder="ali@mail.uz yoki +998901234567"
                    className="w-full h-12 px-4 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] text-[var(--edu-ink)] placeholder:text-[var(--edu-muted)]/60 focus:outline-none focus:border-[var(--edu-accent)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--edu-muted)] mb-1.5">
                    Parol
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        onClearError();
                      }}
                      placeholder="Kamida 6 ta belgi"
                      className="w-full h-12 pl-4 pr-20 rounded-xl bg-[var(--edu-inset)] border border-[var(--edu-border)] text-[var(--edu-ink)] placeholder:text-[var(--edu-muted)]/60 focus:outline-none focus:border-[var(--edu-accent)] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-xs font-medium text-[var(--edu-accent)] hover:opacity-80 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {passwordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{passwordVisible ? 'Yopish' : "Ko'rish"}</span>
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="rounded-xl bg-[#F87171]/10 border border-[#F87171]/40 px-4 py-3 text-sm text-[#F87171]">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold transition-colors cursor-pointer"
                >
                  {isRegisterMode ? 'Hisob yaratish' : 'Shaxsiy hisobga kirish'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
