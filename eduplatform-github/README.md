# EduPlatform

**Kurs ishi (Android Dasturlash va Ta'lim Tizimi)**  
**Loyiha rahbari:** Ahmadali Toshturgunov  
**O‘qituvchi:** Ziyodxon Lutfiddinov  

---

## Loyiha maqsadi
**EduPlatform** — o‘quvchilar uchun fanlar, interaktiv darslar, ovozli tushuntirish, kod maydonchasi, amaliy mashqlar, bilim testlari va raqamli sertifikatlarni bir joyda jamlagan mobil va veb ta’lim tizimi (shuningdek, Android Jetpack Compose kodi eksporti bilan).

---

## Texnologiyalar
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite 8, Lucide Icons
- **Backend:** Node.js, Express (`server.ts`)
- **Ovozli yordamchi:** `@google/genai` (server tomonda `GEMINI_API_KEY` orqali TTS va jonli tarjima)
- **Mobil eksport:** Android Jetpack Compose (`MainActivity.kt` + `strings.xml`)

---

## Asosiy imkoniyatlar
- Ro‘yxatdan o‘tish va tizimga kirish (email/telefon validatsiyasi + 1 bosishda Demo kirish)
- **12 ta kurs, 120 ta dars** (nazariya, illyustrativ banner, ovozli ustoz pleyeri, kod namunasi va jonli tahlilchi, dars savollari, konspekt, muhokama)
- **Amaliyot markazi:** 30 ta Flashcard, 3 ta Yo‘l xaritasi, 12 ta Mini-loyiha, 24 ta Intervyu savoli
- **120 ta test savoli**, 15 daqiqalik **Mock Imtihon** va ≥70% natija uchun **Raqamli Sertifikat**
- **Profil:** Yutuq nishonlari, kunlik maqsad, 7 kunlik faollik va tungi/kunduzgi tema

---

## Lokal ishga tushirish

```bash
npm install
cp .env.example .env
# .env fayliga GEMINI_API_KEY qiymatini kiriting
npm run dev
```

So‘ng brauzerda `http://localhost:3000` manzilini oching.
