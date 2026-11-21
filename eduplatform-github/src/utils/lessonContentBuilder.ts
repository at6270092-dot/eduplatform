import {
  AchievementBadge,
  CourseItem,
  LessonItem,
  LessonMicroQuestion,
  LessonVideoChapter,
  QuizQuestion,
} from '../types/edu';

function rotateWithSeed<T>(items: T[], correctIndex: number, seed: number): {
  options: T[];
  correctIndex: number;
} {
  if (items.length === 0) return { options: items, correctIndex: 0 };
  const shift = seed % items.length;
  const rotated = items.map((_, i) => items[(i + shift) % items.length]);
  const newCorrect = (correctIndex - shift + items.length) % items.length;
  return { options: rotated, correctIndex: newCorrect };
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function buildVideoChapters(
  lesson: LessonItem,
  course: CourseItem
): LessonVideoChapter[] {
  const sentences = splitSentences(lesson.content);
  const firstTheory = sentences[0] ?? lesson.summary;
  const secondTheory = sentences[1] ?? lesson.takeaway;
  const thirdTheory = sentences[2] ?? `Amaliyotda ${lesson.title.toLowerCase()} mavzusini kodda sinab ko'ring.`;
  const codeLines = lesson.codeExample
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 4);

  return [
    {
      id: `${lesson.id}-ch1`,
      title: '1. Kirish va maqsad',
      startSec: 0,
      endSec: 20,
      visualType: 'intro',
      headline: `${lesson.order}-dars: ${lesson.title}`,
      bullets: [
        `Kurs yo‘nalishi: ${course.title}`,
        `Modul: ${lesson.moduleTitle}`,
        `Maqsad: ${lesson.summary}`,
      ],
      subtitle: `Assalomu alaykum! Bugungi ${lesson.order}-darsimiz mavzusi — "${lesson.title}". ${lesson.summary}`,
    },
    {
      id: `${lesson.id}-ch2`,
      title: '2. Nazariy tahlil',
      startSec: 20,
      endSec: 48,
      visualType: 'theory',
      headline: 'Asosiy tushuncha va ishlash printsipi',
      bullets: [firstTheory, secondTheory, thirdTheory],
      subtitle: `${firstTheory} ${secondTheory}`,
    },
    {
      id: `${lesson.id}-ch3`,
      title: '3. Kod namunasi tahlili',
      startSec: 48,
      endSec: 78,
      visualType: 'code',
      headline: 'Amaliy kod qanday yoziladi?',
      bullets:
        codeLines.length > 0
          ? codeLines
          : [lesson.codeExample],
      subtitle: `Endi amaliy kodga e'tibor bering. Ushbu misolda "${lesson.title}" tushunchasining toza va xavfsiz yozilish usuli ko'rsatilgan.`,
    },
    {
      id: `${lesson.id}-ch4`,
      title: '4. Video savoli (Nazorat)',
      startSec: 78,
      endSec: 96,
      visualType: 'checkpoint',
      headline: 'Video ichidagi tezkor savol',
      bullets: [
        lesson.practice.prompt,
        "To'g'ri javobni tanlang va videoni davom ettiring.",
      ],
      subtitle: `Kichik tekshiruv vaqti! Hozir ko'rgan ma'lumotlarimiz asosida ekrandagi savolga javob bering.`,
    },
    {
      id: `${lesson.id}-ch5`,
      title: '5. Xato tahlili va xulosa',
      startSec: 96,
      endSec: 120,
      visualType: 'summary',
      headline: 'Eslab qolish kerak bo‘lgan qoidalar',
      bullets: [
        `Oldini olish kerak: ${lesson.commonMistake}`,
        `Oltin qoida: ${lesson.takeaway}`,
      ],
      subtitle: `Diqqat qiling: ${lesson.commonMistake} Eng muhim xulosa esa: ${lesson.takeaway} Darsni yakunlashdan oldin pastdagi savollarni ham ishlab chiqing!`,
    },
  ];
}

export function buildLessonQuestions(
  lesson: LessonItem,
  course: CourseItem
): LessonMicroQuestion[] {
  const siblings = course.lessons.filter((l) => l.id !== lesson.id);
  const pickThree = (offset: number): LessonItem[] => {
    const out: LessonItem[] = [];
    for (let i = 0; i < 3 && siblings.length > 0; i++) {
      out.push(siblings[(lesson.order + offset + i) % siblings.length]);
    }
    return out;
  };

  const q1: LessonMicroQuestion = {
    id: `${lesson.id}-lq1`,
    category: 'Kod mashqi',
    question: lesson.practice.prompt,
    codeSnippet: lesson.practice.codeSnippet,
    options: lesson.practice.options,
    correctIndex: lesson.practice.correctIndex,
    explanation: lesson.practice.explanation,
  };

  const takeawaySiblings = pickThree(1);
  const q2Raw = [lesson.takeaway, ...takeawaySiblings.map((s) => s.takeaway)];
  const q2Rotated = rotateWithSeed(q2Raw, 0, lesson.order * 3 + 1);
  const q2: LessonMicroQuestion = {
    id: `${lesson.id}-lq2`,
    category: 'Nazariya',
    question: `"${lesson.title}" darsi bo‘yicha asosiy to‘g‘ri xulosa qaysi?`,
    options: q2Rotated.options,
    correctIndex: q2Rotated.correctIndex,
    explanation: `Bu mavzuda eng muhim qoida: ${lesson.takeaway}`,
  };

  const mistakeSiblings = pickThree(4);
  const q3Raw = [lesson.commonMistake, ...mistakeSiblings.map((s) => s.commonMistake)];
  const q3Rotated = rotateWithSeed(q3Raw, 0, lesson.order * 5 + 2);
  const q3: LessonMicroQuestion = {
    id: `${lesson.id}-lq3`,
    category: 'Xato tahlili',
    question: `"${lesson.title}" mavzusini qo‘llashda eng ko‘p uchraydigan xato qaysi?`,
    options: q3Rotated.options,
    correctIndex: q3Rotated.correctIndex,
    explanation: `Aynan shu xatodan ehtiyot bo'lish kerak: ${lesson.commonMistake}`,
  };

  const summarySiblings = pickThree(7);
  const q4Raw = [lesson.summary, ...summarySiblings.map((s) => s.summary)];
  const q4Rotated = rotateWithSeed(q4Raw, 0, lesson.order * 7 + 3);
  const q4: LessonMicroQuestion = {
    id: `${lesson.id}-lq4`,
    category: 'Maqsad',
    question: `"${lesson.title}" darsining asosiy maqsadi va mazmuni nimadan iborat?`,
    options: q4Rotated.options,
    correctIndex: q4Rotated.correctIndex,
    explanation: `Ushbu darsda biz aynan "${lesson.summary}" yo'nalishini o'rgandik.`,
  };

  return [q1, q2, q3, q4];
}

export type ParsedVideoSource =
  | { kind: 'youtube'; embedUrl: string }
  | { kind: 'direct'; srcUrl: string }
  | { kind: 'invalid' };

export function parseCustomVideoUrl(rawUrl: string): ParsedVideoSource {
  const trimmed = rawUrl.trim();
  if (!trimmed) return { kind: 'invalid' };

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      let videoId = '';
      if (host.includes('youtu.be')) {
        videoId = parsed.pathname.replace(/^\//, '').split('/')[0] ?? '';
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.replace('/shorts/', '').split('/')[0] ?? '';
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.replace('/embed/', '').split('/')[0] ?? '';
      } else {
        videoId = parsed.searchParams.get('v') ?? '';
      }
      if (/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) {
        return {
          kind: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
        };
      }
    }

    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(parsed.pathname)) {
      return { kind: 'direct', srcUrl: trimmed };
    }
  } catch {
    return { kind: 'invalid' };
  }

  return { kind: 'invalid' };
}

export function getDailyChallengeQuestion(
  courses: CourseItem[],
  dateKey: string
): { courseTitle: string; courseId: string; question: QuizQuestion } | null {
  const pool: Array<{ courseTitle: string; courseId: string; question: QuizQuestion }> = [];
  for (const c of courses) {
    for (const q of c.quiz) {
      pool.push({ courseTitle: c.title, courseId: c.id, question: q });
    }
  }
  if (pool.length === 0) return null;
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}

export function evaluateAchievements(stats: {
  completedLessonsCount: number;
  watchedVideosCount: number;
  lessonQuizzesCount: number;
  practiceCount: number;
  streakDays: number;
  certificatesCount: number;
  pomodoroCount: number;
  projectStepsCount: number;
}): AchievementBadge[] {
  return [
    {
      id: 'first-lesson',
      title: 'Birinchi qadam',
      description: 'Kamida 1 ta darsni yakunlang',
      unlocked: stats.completedLessonsCount >= 1,
      progressText: `${Math.min(1, stats.completedLessonsCount)} / 1`,
    },
    {
      id: 'video-learner',
      title: 'Video tinglovchi',
      description: '5 ta o‘zbekcha video darsni tomosha qiling',
      unlocked: stats.watchedVideosCount >= 5,
      progressText: `${Math.min(5, stats.watchedVideosCount)} / 5`,
    },
    {
      id: 'lesson-quiz-master',
      title: 'Savol-javob bilimdoni',
      description: '5 ta dars savollari to‘plamini ishlang',
      unlocked: stats.lessonQuizzesCount >= 5,
      progressText: `${Math.min(5, stats.lessonQuizzesCount)} / 5`,
    },
    {
      id: 'code-practitioner',
      title: 'Kod amaliyotchisi',
      description: '10 ta amaliy kod mashqini to‘g‘ri bajaring',
      unlocked: stats.practiceCount >= 10,
      progressText: `${Math.min(10, stats.practiceCount)} / 10`,
    },
    {
      id: 'streak-3',
      title: 'Barqaror talaba',
      description: '3 kun ketma-ket kunlik faollik yig‘ing',
      unlocked: stats.streakDays >= 3,
      progressText: `${Math.min(3, stats.streakDays)} / 3 kun`,
    },
    {
      id: 'pomodoro-focus',
      title: 'Fokus ustasi',
      description: 'Kamida 1 ta Pomodoro fokus taymerini tugating',
      unlocked: stats.pomodoroCount >= 1,
      progressText: `${Math.min(1, stats.pomodoroCount)} / 1`,
    },
    {
      id: 'builder-10',
      title: 'Amaliy loyihachi',
      description: 'Mini-loyihalardan 10 ta bosqichni bajaring',
      unlocked: stats.projectStepsCount >= 10,
      progressText: `${Math.min(10, stats.projectStepsCount)} / 10`,
    },
    {
      id: 'certified-pro',
      title: 'Sertifikat sohibi',
      description: 'Kurs testidan 70%+ olib sertifikat oching',
      unlocked: stats.certificatesCount >= 1,
      progressText: `${Math.min(1, stats.certificatesCount)} / 1`,
    },
  ];
}

export interface DeepLessonBreakdown {
  lineExplanations: Array<{ code: string; meaning: string }>;
  conceptPoints: string[];
  practiceTask: string;
}

function explainSingleCodeLine(rawLine: string, courseId: string): string {
  const line = rawLine.trim();

  if (line.startsWith('//') || line.startsWith('#') || line.startsWith('--') || line.startsWith('/*')) {
    return "Izoh satri: kodni tushuntirish uchun yoziladi, dastur bajarilishiga ta'sir qilmaydi.";
  }
  if (line === '}' || line === '})' || line === '];' || line === ')') {
    return "Joriy kod bloki yoki qavslar shu satrda yopiladi.";
  }
  if (line.includes('@Composable')) {
    return "Jetpack Compose UI komponenti ekanini bildiruvchi annotatsiya.";
  }
  if (line.includes('remember') || line.includes('mutableStateOf')) {
    return "Recomposition paytida UI holatini xotirada saqlab turish mexanizmi.";
  }
  if (/\bprintln\s*\(/.test(line)) {
    return "Konsolga qiymat yoki matnni chiqarib, kursorni yangi qatorga tushiradi.";
  }
  if (/\bprint\s*\(/.test(line)) {
    if (courseId === 'python-automation') {
      return "Python konsoliga natijani chop etish buyrug'i.";
    }
    return "Konsolga matnni chiqaradi, lekin yangi qatorga tushmaydi.";
  }
  if (/\bconsole\.log\s*\(/.test(line)) {
    return "Brauzer yoki Node.js konsoliga natijani chiqarish buyrug'i.";
  }
  if (/^val\s+/.test(line)) {
    return "O'zgarmas (val) o'zgaruvchi e'lon qilindi — keyinchalik qayta tayinlab bo'lmaydi.";
  }
  if (/^var\s+/.test(line)) {
    return "O'zgaruvchan (var) o'zgaruvchi e'lon qilindi — dastur davomida qiymatini yangilash mumkin.";
  }
  if (/^(const|let)\s+/.test(line)) {
    return line.startsWith('const')
      ? "O'zgarmas (const) bog'lama yaratildi — qayta tayinlashga ruxsat berilmaydi."
      : "O'zgaruvchan (let) bog'lama yaratildi — qiymatini keyinroq yangilash mumkin.";
  }
  if (/^fun\s+/.test(line) || /^suspend\s+fun\s+/.test(line)) {
    return "Qayta ishlatiladigan Kotlin funksiyasi (vazifa bloki) ta'riflandi.";
  }
  if (/^def\s+/.test(line) || /^async\s+def\s+/.test(line)) {
    return "Python funksiyasi ta'riflandi — berilgan argumentlar asosida amal bajaradi.";
  }
  if (/^(data\s+class|sealed\s+|class\s+|interface\s+|type\s+)/.test(line)) {
    return "Ma'lumot tuzilmasi (model, interfeys yoki klass) e'lon qilindi.";
  }
  if (/^if\s*\(/.test(line) || /^if\s+/.test(line) || line.startsWith('} else')) {
    return "Shart tekshiruvi: mantiqiy ifoda rost bo'lganda tegishli blok bajariladi.";
  }
  if (/^when\s*\(/.test(line)) {
    return "Ko'p tarmoqli tanlov (when): qiymatga mos keluvchi tarmoqni ishga tushiradi.";
  }
  if (/^for\s*[\s(]/.test(line) || /^while\s*[\s(]/.test(line)) {
    return "Takrorlash sikli: ko'rsatilgan diapazon yoki shart tugaguncha kodni aylantiradi.";
  }
  if (/^try\b/.test(line) || /^}\s*catch\b/.test(line) || /^except\b/.test(line)) {
    return "Xatolarni xavfsiz ushlash bloki: kutilmagan xato chiqsa ham dastur to'xtab qolmaydi.";
  }
  if (/^return\b/.test(line)) {
    return "Hisoblangan yakuniy natijani funksiyadan tashqariga qaytaradi.";
  }
  if (/^git\s+/i.test(line)) {
    return "Git versiya boshqaruv tizimiga yuboriladigan terminal buyrug'i.";
  }
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|WITH)\b/i.test(line)) {
    return "Ma'lumotlar bazasiga yuboriladigan asosiy SQL buyruq bandi.";
  }
  if (/^\s*(FROM|WHERE|JOIN|LEFT JOIN|INNER JOIN|GROUP BY|HAVING|ORDER BY|LIMIT|VALUES|SET)\b/i.test(line)) {
    return "SQL so'rovini aniqlashtiruvchi, bog'lovchi yoki tartiblovchi qism.";
  }
  if (/^import\s+/.test(line) || /^from\s+.+\s+import\s+/.test(line)) {
    return "Tashqi kutubxona yoki moduldan kerakli vositalarni ulash satri.";
  }
  if (line.startsWith('<')) {
    return "Interfeys tuzilmasini (HTML/JSX/XML teg) tavsiflovchi belgilash satri.";
  }
  if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*(\+=|-=|\*=|\/=|=|\+\+|--)/.test(line)) {
    return "Mavjud o'zgaruvchining qiymati hisoblanib qayta yangilanmoqda.";
  }
  return "Ushbu qator asosiy dastur mantiqining navbatdagi bajariladigan bosqichini tashkil qiladi.";
}

export function buildDeepLessonBreakdown(
  lesson: LessonItem,
  course: CourseItem
): DeepLessonBreakdown {
  const sentences = splitSentences(lesson.content);
  const conceptPoints = [
    sentences[0] || lesson.summary,
    sentences[1] || lesson.takeaway,
    `Diqqat qiling: ${lesson.commonMistake}`,
  ];

  const codeLines = lesson.codeExample
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .slice(0, 8);

  const lineExplanations = codeLines.map((code) => ({
    code,
    meaning: explainSingleCodeLine(code, course.id),
  }));

  const isKotlinBeginner = ['dasturlash-noldan', 'amaliy-masalalar', 'kotlin-basics'].includes(
    course.id
  );

  let practiceTask =
    "Pastdagi kod oynasida \"Kodni sinab ko'rish\" tugmasini bosing, qiymatlardan birini o'zgartiring va \"Ishga tushirish\" orqali natijani kuzating.";

  if (isKotlinBeginner && lesson.codeExample.includes('val ')) {
    practiceTask =
      "\"Kodni sinab ko'rish\" ni bosib o'zgaruvchi qiymatlarini o'zgartiring yoki yangi println(\"...\") qatori qo'shing. Shuningdek, val bilan berilgan o'zgaruvchini qayta tayinlab ko'rsangiz qanday xato chiqishini tekshiring.";
  } else if (isKotlinBeginner) {
    practiceTask =
      "\"Kodni sinab ko'rish\" tugmasini bosing, sonlar yoki matnlarni o'zingiz xohlagan qiymatga almashtirib \"Ishga tushirish\" orqali konsol javobini tekshiring.";
  } else if (course.id === 'python-automation') {
    practiceTask =
      "\"Kodni sinab ko'rish\" rejimiga o'ting, print(...) ichidagi qiymat yoki o'zgaruvchilarni yangilab Python chiqishini tekshiring.";
  }

  return {
    lineExplanations,
    conceptPoints,
    practiceTask,
  };
}
