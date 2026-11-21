import { FlashcardItem, InterviewQA, RoadmapItem } from '../types/edu';

export const EDU_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-1',
    topic: 'Jetpack Compose',
    front: '@Composable annotatsiyasi nima vazifani bajaradi?',
    back: "Funksiyani deklarativ UI komponentiga aylantiradi va State o'zgarganda faqat kerakli joyni qayta chizadi.",
    hint: 'XML o‘rnini bosuvchi UI funksiya belgisi',
  },
  {
    id: 'fc-2',
    topic: 'Jetpack Compose',
    front: 'remember { mutableStateOf(...) } nima uchun kerak?',
    back: "Recomposition jarayonida ekran holatini xotirada yo'qotmasdan saqlab turish va o'zgarganda UI ni yangilash uchun.",
    hint: 'Holatni eslab qolish',
  },
  {
    id: 'fc-3',
    topic: 'Jetpack Compose',
    front: 'Column va LazyColumn farqi nimada?',
    back: 'Column barcha elementlarni birdan chizadi; LazyColumn esa faqat ekranda ko‘rinib turgan elementlarni chizib xotirani tejaydi.',
    hint: 'Katta ro‘yxatlar unumdorligi',
  },
  {
    id: 'fc-4',
    topic: 'Jetpack Compose',
    front: 'State Hoisting nima?',
    back: "Holatni ichki komponentdan ota-komponentga ko'tarish usuli — UI ni qayta ishlatish va test qilishni osonlashtiradi.",
    hint: 'Holat yuqoriga, hodisa pastdan yuqoriga',
  },
  {
    id: 'fc-5',
    topic: 'Kotlin',
    front: 'val va var kalit so‘zlari nimasi bilan farq qiladi?',
    back: "val — o'zgarmas (read-only) havola; var — dastur davomida qayta qiymat tayinlash mumkin bo'lgan o'zgaruvchi.",
    hint: 'Value vs Variable',
  },
  {
    id: 'fc-6',
    topic: 'Kotlin',
    front: '?: (Elvis operatori) qanday ishlaydi?',
    back: "Chap tomonidagi ifoda null bo'lmasa o'zini, null bo'lsa o'ng tomonidagi zaxira qiymatni qaytaradi.",
    hint: 'Null xavfsizligi zaxira qiymati',
  },
  {
    id: 'fc-7',
    topic: 'Kotlin',
    front: 'data class bizga qaysi metodlarni avtomatik yaratadi?',
    back: 'equals(), hashCode(), toString(), copy() va componentN() destructuring metodlarini avtomatik beradi.',
    hint: 'Model klasslari',
  },
  {
    id: 'fc-8',
    topic: 'Kotlin',
    front: 'sealed interface afzalligi nimada?',
    back: "Barcha voris turlarni bitta fayl/modul ichida cheklaydi, shu sababli when operatori else talab qilmaydi.",
    hint: 'Ekran marshrutlari va UI holatlari',
  },
  {
    id: 'fc-9',
    topic: 'SQL',
    front: 'PRIMARY KEY nima?',
    back: 'Jadvaldagi har bir satrni takrorlanmas tarzda noyob aniqlab beruvchi ustun (NULL bo‘lishi mumkin emas).',
    hint: 'Satr identifikatori',
  },
  {
    id: 'fc-10',
    topic: 'SQL',
    front: 'INNER JOIN va LEFT JOIN farqi?',
    back: "INNER JOIN faqat ikki jadvalda mos kelgan satrlarni qaytaradi; LEFT JOIN esa chap jadvalni to'liq chiqaradi.",
    hint: 'Jadvallarni birlashtirish',
  },
  {
    id: 'fc-11',
    topic: 'SQL',
    front: 'WHERE va HAVING bandlari farqi?',
    back: 'WHERE guruhlashdan oldin alohida satrlarni filtrlaydi; HAVING esa GROUP BY dan keyin guruhlarni filtrlaydi.',
    hint: 'Agregat funksiyalar sharti',
  },
  {
    id: 'fc-12',
    topic: 'SQL',
    front: 'Android Room kutubxonasidagi 3 asosiy komponent?',
    back: '@Entity (jadval), @Dao (SQL so‘rov metodlari) va @Database (ma’lumotlar bazasi nuqtasi).',
    hint: 'SQLite ustidagi rasmiy ORM',
  },
  {
    id: 'fc-13',
    topic: 'Git',
    front: 'git add va git commit farqi?',
    back: "git add o'zgarishlarni tayyorlash maydoniga (staging) oladi, git commit esa ularni tarixga muhrlaydi.",
    hint: 'Ikki bosqichli saqlash',
  },
  {
    id: 'fc-14',
    topic: 'Git',
    front: '.gitignore fayli nima uchun kerak?',
    back: 'Maxfiy .env fayllari, node_modules va build/ papkalarini GitHub ga yuklanishidan to‘sish uchun.',
    hint: 'Kuzatuvdan chiqarish',
  },
  {
    id: 'fc-15',
    topic: 'Git',
    front: 'git revert va git reset farqi?',
    back: "git revert eski commitni bekor qiluvchi yangi commit qo'shadi (xavfsiz); git reset esa tarixni o'chirib orqaga suradi.",
    hint: 'Jamoaviy shoxda xavfsizlik',
  },
  {
    id: 'fc-16',
    topic: 'Algoritmlar',
    front: 'Binary Search vaqt murakkabligi qancha?',
    back: 'O(log n) — har bir qadamda qidiruv sohasi teng yarmiga qisqaradi.',
    hint: 'Tartiblangan massivda qidiruv',
  },
  {
    id: 'fc-17',
    topic: 'Algoritmlar',
    front: 'Stack va Queue ishlash prinsipi?',
    back: 'Stack — LIFO (oxirgi kirgan birinchi chiqadi); Queue — FIFO (birinchi kirgan birinchi chiqadi).',
    hint: 'Navigatsiya tarixi vs Navbat',
  },
  {
    id: 'fc-18',
    topic: 'UI/UX',
    front: '60-30-10 rang qoidasi nimani anglatadi?',
    back: '60% asosiy fon, 30% kartalar/panellar, 10% faqat muhim tugma va faol aksentlar.',
    hint: 'Vizual muvozanat',
  },
  {
    id: 'fc-19',
    topic: 'Web va Tailwind',
    front: 'Flexbox va CSS Grid farqi nimada?',
    back: "Flexbox bir o'lchamli (qator yoki ustun) joylashuv uchun; CSS Grid esa ikki o'lchamli (qator + ustun) to'rlar uchun qulay.",
    hint: '1D vs 2D layout',
  },
  {
    id: 'fc-20',
    topic: 'Web va Tailwind',
    front: 'Semantic HTML (<header>, <main>, <article>) nima uchun muhim?',
    back: "Ekran o'quvchi dasturlar (accessibility) va qidiruv tizimlari (SEO) sahifa tuzilishini to'g'ri tushunishi uchun.",
    hint: 'Ma’noli teglar',
  },
  {
    id: 'fc-21',
    topic: 'React va TypeScript',
    front: 'React da useEffect dependency massivi [] bo‘sh bo‘lsa nima bo‘ladi?',
    back: 'Effekt faqat komponent ekranga birinchi marta chiqqanda (mount) bir marta ishga tushadi.',
    hint: 'Komponent hayot sikli',
  },
  {
    id: 'fc-22',
    topic: 'React va TypeScript',
    front: 'React ro‘yxatlarida key prop nima uchun kerak?',
    back: 'React qaysi element qo‘shilgani, o‘zgargani yoki o‘chganini tez aniqlab, ortiqcha DOM chizilishini oldini olishi uchun.',
    hint: 'Virtual DOM solishtirish',
  },
  {
    id: 'fc-23',
    topic: 'React va TypeScript',
    front: 'TypeScript da interface va type asosiy afzalligi?',
    back: "Xatolarni kod brauzerga chiqmasdan, yozish jarayonida (kompilyatsiya bosqichida) ushlab qoladi.",
    hint: 'Statik tip tekshiruvi',
  },
  {
    id: 'fc-24',
    topic: 'Backend va API',
    front: 'HTTP 200, 201, 401 va 404 kodlari nimani bildiradi?',
    back: '200 OK, 201 Created (yaratildi), 401 Unauthorized (ruxsat yo‘q), 404 Not Found (topilmadi).',
    hint: 'REST API statuslari',
  },
  {
    id: 'fc-25',
    topic: 'Backend va API',
    front: 'JWT (JSON Web Token) qayerda va nima uchun ishlatiladi?',
    back: 'Foydalanuvchi tizimga kirgandan keyin keyingi har bir API so‘rovida uning shaxsini tasdiqlash uchun (Bearer token).',
    hint: 'Stateless autentifikatsiya',
  },
  {
    id: 'fc-26',
    topic: 'Backend va API',
    front: 'PUT va PATCH metodlari farqi?',
    back: 'PUT butun resursni to‘liq almashtiradi; PATCH esa faqat ko‘rsatilgan bir nechta maydonni qisman yangilaydi.',
    hint: 'Resursni yangilash',
  },
  {
    id: 'fc-27',
    topic: 'Python',
    front: 'Python da List Comprehension nima?',
    back: "Yangi ro'yxat yaratishning ixcham va tez usuli: [x * 2 for x in sonlar if x > 0].",
    hint: 'Bir qatorli ro‘yxat generatori',
  },
  {
    id: 'fc-28',
    topic: 'Python',
    front: 'list va tuple farqi nimada?',
    back: "list o'zgaruvchan (mutable), kvadrat qavs [] bilan yoziladi; tuple o'zgarmas (immutable), dumaloq qavs () bilan yoziladi.",
    hint: 'O‘zgaruvchanlik farqi',
  },
  {
    id: 'fc-29',
    topic: 'Python',
    front: 'Virtual Environment (venv) nima uchun kerak?',
    back: 'Har bir loyiha kutubxona versiyalarini bir-biriga aralashmasdan alohida izolyatsiyada saqlash uchun.',
    hint: 'Loyiha muhiti izolyatsiyasi',
  },
  {
    id: 'fc-30',
    topic: 'Python',
    front: 'with open(...) as f: konstruksiyasi nimani kafolatlaydi?',
    back: 'Kontekst menejeri blok tugagach (hatto xato yuz bersa ham) faylni avtomatik xavfsiz yopadi.',
    hint: 'Fayl resurslarini boshqarish',
  },
];

export const EDU_ROADMAPS: RoadmapItem[] = [
  {
    id: 'android-dev',
    title: "Android Dasturchi Yo'li",
    subtitle: "0 dan (println, var/val) tayyor Android Jetpack Compose ilova yaratishgacha.",
    targetRole: 'Junior / Middle Android Developer',
    courseIds: [
      'dasturlash-noldan',
      'amaliy-masalalar',
      'kotlin-basics',
      'git-github',
      'ui-ux-material3',
      'android-compose',
      'database-sql',
    ],
  },
  {
    id: 'fullstack-web',
    title: "Full-Stack Web Dasturchi Yo'li",
    subtitle: "Zamonaviy React/TypeScript interfeysdan tortib xavfsiz Backend REST API va SQL bazagacha.",
    targetRole: 'Full-Stack Web Engineer',
    courseIds: ['web-html-tailwind', 'typescript-react', 'git-github', 'backend-api', 'database-sql'],
  },
  {
    id: 'python-algo',
    title: "Python, Backend va Algoritmlar Yo'li",
    subtitle: "Algoritmik fikrlash, amaliy masalalar yechish, Python avtomatlashtirish va server tizimlari.",
    targetRole: 'Python / Backend Developer',
    courseIds: [
      'dasturlash-noldan',
      'amaliy-masalalar',
      'python-automation',
      'algorithms-logic',
      'database-sql',
      'backend-api',
      'git-github',
    ],
  },
];

export const EDU_INTERVIEW_QA: InterviewQA[] = [
  {
    id: 'iq-1',
    category: 'Android & Kotlin',
    question: "Jetpack Compose'da Recomposition nima va u qachon yuz beradi?",
    answer:
      "Recomposition — bu State (holat) qiymati o'zgarganda Compose faqat o'sha ma'lumotni o'qiyotgan Composable funksiyalarni qayta ishga tushirib, UI ni yangilashi jarayonidir.",
    tip: "Suhbatda butun ekran emas, faqat o'zgargan Scope qayta chizilishini alohida ta'kidlang.",
  },
  {
    id: 'iq-2',
    category: 'Android & Kotlin',
    question: "remember va rememberSaveable o'rtasidagi asosiy farq?",
    answer:
      "remember oddiy recomposition orasida qiymatni saqlaydi, lekin ekran aylanganda (configuration change) yoki jarayon o'lganda yo'qotadi. rememberSaveable esa Bundle ga saqlab bu holatlardan ham omon qoladi.",
    tip: "Formadagi matnlarni ekran aylanganda saqlash uchun rememberSaveable misolini keltiring.",
  },
  {
    id: 'iq-3',
    category: 'Android & Kotlin',
    question: "Kotlin'da val qiymati har doim to'liq o'zgarmas (immutable) mi?",
    answer:
      "val faqat havolani (reference) qayta tayinlashga ruxsat bermaydi. Agar val list = mutableListOf(1) bo'lsa, list ning ichiga yangi element qo'shish mumkin. Haqiqiy o'zgarmaslik uchun listOf() ishlatiladi.",
    tip: "Bu intervyuchilarning eng sevimli tuzoq savollaridan biri!",
  },
  {
    id: 'iq-4',
    category: 'Android & Kotlin',
    question: "ViewModel nima uchun Activity/Fragment ga qaraganda afzal?",
    answer:
      "ViewModel UI holatini konfiguratsiya o'zgarishlarida (masalan, ekran aylanganda) saqlab qoladi va biznes mantiqni UI kodidan toza ajratadi.",
    tip: "ViewModel ichida hech qachon Activity Context saqlamaslik kerakligini ham qo'shib ayting.",
  },
  {
    id: 'iq-5',
    category: 'Web & React',
    question: "React'da Virtual DOM nima va u tezlikka qanday ta'sir qiladi?",
    answer:
      "Virtual DOM — haqiqiy brauzer DOM ining xotiradagi yengil JavaScript nusxasi. Holat o'zgarganda React ikki versiyani solishtirib (Diffing), haqiqiy DOM ning faqat o'zgargan qismini yangilaydi.",
    tip: "key atributi aynan Diffing algoritmi to'g'ri ishlashi uchun kerakligini bog'lang.",
  },
  {
    id: 'iq-6',
    category: 'Web & React',
    question: "useMemo va useCallback farqi nimada?",
    answer:
      "useMemo hisob-kitob NATIJASINI keshlaydi (masalan, filtrlangan massiv), useCallback esa FUNKSIYA havolasining o'zini qayta chizilishlar orasida saqlab qoladi.",
    tip: "Har joyda bekorga ishlatmaslik, faqat og'ir hisob va memo qilingan child komponentlarda ishlatish kerak.",
  },
  {
    id: 'iq-7',
    category: 'Web & React',
    question: "TypeScript'da interface va type farqi bormi?",
    answer:
      "Obyekt shakli uchun ikkalasi ham ishlaydi. Lekin interface bir xil nom bilan kengaytirilishi (declaration merging) mumkin, type esa union (A | B) va tuple turlarida kuchliroq.",
    tip: "Obyektlar uchun interface, union va murakkab turlar uchun type ishlataman deb javob bering.",
  },
  {
    id: 'iq-8',
    category: 'Web & React',
    question: "Tailwind CSS da responsive dizayn qanday ishlaydi?",
    answer:
      "Mobile-first tamoyili asosida: prefikssiz klasslar mobilga, sm:, md:, lg:, xl: prefikslari esa kattaroq ekranlarga qo'llanadi.",
    tip: "Masalan, grid-cols-1 md:grid-cols-3 misolini keltiring.",
  },
  {
    id: 'iq-9',
    category: 'SQL & Backend',
    question: "SQL Injection nima va undan qanday himoyalaniladi?",
    answer:
      "Foydalanuvchi inputi orqali zararli SQL buyrug'ini kiritish hujumi. Himoyalanish uchun so'rovlarni hech qachon string bilan ulamasdan, parametrlangan so'rovlar ($1, ?) yoki ORM ishlatiladi.",
    tip: "OWASP Top-10 xavflari ro'yxatidan ekanini ayting.",
  },
  {
    id: 'iq-10',
    category: 'SQL & Backend',
    question: "ACID xossalari nimani anglatadi?",
    answer:
      "Atomicity (hammasi yoki hech biri), Consistency (ma'lumot yaxlitligi), Isolation (parallel tranzaksiyalar bir-birini buzmaydi), Durability (saqlangan natija o'chmaydi).",
    tip: "Bank o'tkazmalari misolida tushuntirish eng oson yo'li.",
  },
  {
    id: 'iq-11',
    category: 'SQL & Backend',
    question: "REST API da Stateless (holatsiz) tamoyili nima?",
    answer:
      "Server mijozning oldingi so'rovlarini xotirada saqlab o'tirmaydi — har bir so'rov autentifikatsiya tokeni (JWT) va barcha kerakli ma'lumotni o'zi bilan olib kelishi kerak.",
    tip: "Bu serverlarni gorizontal kengaytirishni (scaling) osonlashtiradi.",
  },
  {
    id: 'iq-12',
    category: 'SQL & Backend',
    question: "CORS xatosi nima va u qachon chiqadi?",
    answer:
      "Brauzer xavfsizlik mexanizmi: bir domendagi frontend boshqa domendagi API ga so'rov yuborganda server Access-Control-Allow-Origin ruxsatini bermasa CORS xatosi chiqadi.",
    tip: "CORS bu server tomonda sozlanadigan header, Postman da chiqmasligining sababi ham shu.",
  },
  {
    id: 'iq-13',
    category: 'Algoritmlar & Git',
    question: "HashMap da to'qnashuv (Collision) bo'lganda nima yuz beradi?",
    answer:
      "Ikki xil kalit bir xil xesh indeksiga tushsa, o'sha katakda bog'langan ro'yxat (yoki muvozanatli daraxt) orqali ikkalasi ham saqlanadi.",
    tip: "Shuning uchun HashMap o'rtacha O(1), eng yomon holatda O(n) yoki O(log n) bo'lishini eslang.",
  },
  {
    id: 'iq-14',
    category: 'Algoritmlar & Git',
    question: "BFS va DFS algoritmlari qayerga mos?",
    answer:
      "BFS navbat (Queue) bilan qavatma-qavat yurib vaznsiz grafda eng qisqa yo'lni topadi. DFS esa stek/rekursiya bilan chuqurlikka kirib barcha yo'llarni yoki tsiklni tekshiradi.",
    tip: "Har doim visited to'plamini saqlash kerakligini qo'shing.",
  },
  {
    id: 'iq-15',
    category: 'Algoritmlar & Git',
    question: "git merge va git rebase o'rtasidagi farq?",
    answer:
      "merge ikki shox tarixini yangi merge-commit bilan bog'laydi. rebase esa commitlarni boshqa shox uchiga ko'chirib tekis chiziqli tarix hosil qiladi.",
    tip: "Push qilingan umumiy shoxlarda rebase qilmaslik oltin qoidadir.",
  },
  {
    id: 'iq-16',
    category: 'Algoritmlar & Git',
    question: "git pull va git fetch farqi?",
    answer:
      "git fetch yangi o'zgarishlarni faqat yuklab oladi, lekin kodingizga qo'shmaydi. git pull esa fetch + merge ni birdan bajaradi.",
    tip: "Avval fetch qilib ko'rib, keyin birlashtirish xavfsizroq.",
  },
  {
    id: 'iq-17',
    category: 'Python & Umumiy',
    question: "Python'da decorator (@) nima vazifani bajaradi?",
    answer:
      "Decorator mavjud funksiyaning asosiy kodini o'zgartirmasdan turib, undan oldin va keyin qo'shimcha amal (masalan, log yozish, vaqt o'lchash, auth tekshirish) bajaradi.",
    tip: "Funksiya ichida wrapper funksiya qaytarilishini eslang.",
  },
  {
    id: 'iq-18',
    category: 'Python & Umumiy',
    question: "List va Set qidirish tezligi Python'da nimasi bilan farq qiladi?",
    answer:
      "List da `x in list` O(n) chiziqli vaqt oladi; Set da esa xesh jadvali tufayli `x in set` O(1) doimiy vaqtda bajariladi.",
    tip: "Minglab elementlar orasida tekshirishda doimo set() ga o'tkazing.",
  },
  {
    id: 'iq-19',
    category: 'Android & Kotlin',
    question: "Coroutines da launch va async farqi?",
    answer:
      "launch natija qaytarmaydigan (Job) fon vazifasini boshlaydi; async esa natija qaytaradi (Deferred<T>) va uni .await() bilan kutib olish mumkin.",
    tip: "Ikki API so'rovini parallel yuborishda async + awaitAll() ishlatiladi.",
  },
  {
    id: 'iq-20',
    category: 'Web & React',
    question: "Controlled va Uncontrolled Input farqi?",
    answer:
      "Controlled input qiymati React state orqali (value + onChange) boshqariladi; Uncontrolled esa to'g'ridan-to'g'ri DOM ref orqali o'qiladi.",
    tip: "Real-vaqt validatsiya uchun Controlled input eng yaxshi tanlov.",
  },
  {
    id: 'iq-21',
    category: 'SQL & Backend',
    question: "Database Index qachon sekinlikka olib kelishi mumkin?",
    answer:
      "Indeks SELECT ni tezlashtiradi, lekin har bir INSERT, UPDATE va DELETE da indeks daraxtini ham qayta yangilashga to'g'ri keladi, shu bois yozish ko'p jadvallarda ortiqcha indeks zararli.",
    tip: "O'qish va yozish muvozanatini tushunishingizni ko'rsating.",
  },
  {
    id: 'iq-22',
    category: 'UI/UX',
    question: "WCAG AA kontrast talabi nimani bildiradi?",
    answer:
      "Matn va uning orqa foni orasidagi yorqinlik nisbati oddiy matn uchun kamida 4.5:1, yirik sarlavhalar uchun 3:1 bo'lishi kerak — bu har qanday ekranda matnni aniq o'qishni ta'minlaydi.",
    tip: "Faqat rang bilan emas, matn/ikonka bilan ham holatni bildirish accessibility belgisidir.",
  },
  {
    id: 'iq-23',
    category: 'Python & Umumiy',
    question: "Sinxron va Asinxron (async/await) kod farqi?",
    answer:
      "Sinxron kod navbatdagi qatorga o'tish uchun joriy vazifa (masalan, API javobi) tugashini kutib oqimni band qiladi; asinxron kod esa kutish vaqtida boshqa vazifalarni bajarib turadi.",
    tip: "Web server va tarmoq so'rovlarida asinxronlik o'tkazuvchanlikni oshiradi.",
  },
  {
    id: 'iq-24',
    category: 'Android & Kotlin',
    question: "Android APK va AAB (Android App Bundle) farqi?",
    answer:
      "APK to'g'ridan-to'g'ri telefonga o'rnatiladigan tayyor arxiv. AAB esa Play Marketga yuklanadigan format bo'lib, Play Market har bir foydalanuvchi telefoniga faqat uning protsessor va ekraniga mos kichik APK kesib beradi.",
    tip: "Test uchun APK, Play Store nashri uchun AAB ishlatilishini ayting.",
  },
];
