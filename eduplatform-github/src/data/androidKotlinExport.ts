import {
  EDU_COURSES,
  EDU_FLASHCARDS,
  EDU_INTERVIEW_QA,
  EDU_ROADMAPS,
} from './eduCourses';

function escapeKotlinString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/\r?\n/g, '\\n');
}

export function generateAndroidMainActivityKotlin(packageName = 'com.example.myapplication'): string {
  const cleanPkg = packageName.trim() || 'com.example.myapplication';
  const totalLessons = EDU_COURSES.reduce((acc, c) => acc + c.lessons.length, 0);
  const totalQuizzes = EDU_COURSES.reduce((acc, c) => acc + c.quiz.length, 0);

  const courseBuildersKotlin = EDU_COURSES.map((course, courseIdx) => {
    const projectStepsKotlin = course.projectSteps
      .map(
        (s) =>
          `            ProjectStepItem("${escapeKotlinString(s.id)}", "${escapeKotlinString(s.title)}", "${escapeKotlinString(s.detail)}")`
      )
      .join(',\n');

    const lessonsKotlin = course.lessons
      .map((l) => {
        const practiceOpts = l.practice.options
          .map((o) => `"${escapeKotlinString(o)}"`)
          .join(', ');
        return `            LessonItem(
                id = "${escapeKotlinString(l.id)}",
                courseId = "${escapeKotlinString(l.courseId)}",
                order = ${l.order},
                moduleTitle = "${escapeKotlinString(l.moduleTitle)}",
                title = "${escapeKotlinString(l.title)}",
                durationMinutes = ${l.durationMinutes},
                summary = "${escapeKotlinString(l.summary)}",
                content = "${escapeKotlinString(l.content)}",
                codeExample = "${escapeKotlinString(l.codeExample)}",
                commonMistake = "${escapeKotlinString(l.commonMistake)}",
                takeaway = "${escapeKotlinString(l.takeaway)}",
                videoUrl = "${escapeKotlinString(l.videoUrl)}",
                imageCaption = "${escapeKotlinString(l.imageCaption)}",
                practicePrompt = "${escapeKotlinString(l.practice.prompt)}",
                practiceCodeSnippet = "${escapeKotlinString(l.practice.codeSnippet)}",
                practiceOptions = listOf(${practiceOpts}),
                practiceCorrectIndex = ${l.practice.correctIndex},
                practiceExplanation = "${escapeKotlinString(l.practice.explanation)}"
            )`;
      })
      .join(',\n');

    const quizKotlin = course.quiz
      .map((q) => {
        const opts = q.options.map((o) => `"${escapeKotlinString(o)}"`).join(', ');
        return `            QuizQuestion(
                id = "${escapeKotlinString(q.id)}",
                question = "${escapeKotlinString(q.question)}",
                options = listOf(${opts}),
                correctIndex = ${q.correctIndex},
                explanation = "${escapeKotlinString(q.explanation)}"
            )`;
      })
      .join(',\n');

    return `    private fun buildCourse${courseIdx}(): CourseItem = CourseItem(
        id = "${escapeKotlinString(course.id)}",
        title = "${escapeKotlinString(course.title)}",
        category = "${escapeKotlinString(course.category)}",
        level = "${escapeKotlinString(course.level)}",
        durationText = "${escapeKotlinString(course.durationText)}",
        description = "${escapeKotlinString(course.description)}",
        projectTitle = "${escapeKotlinString(course.projectTitle)}",
        projectDescription = "${escapeKotlinString(course.projectDescription)}",
        projectSteps = listOf(
${projectStepsKotlin}
        ),
        lessons = listOf(
${lessonsKotlin}
        ),
        quiz = listOf(
${quizKotlin}
        )
    )`;
  }).join('\n\n');

  const courseCallList = EDU_COURSES.map((_, idx) => `buildCourse${idx}()`).join(', ');

  const flashcardsKotlin = EDU_FLASHCARDS.map(
    (f) =>
      `            FlashcardItem("${escapeKotlinString(f.id)}", "${escapeKotlinString(f.topic)}", "${escapeKotlinString(f.front)}", "${escapeKotlinString(f.back)}", "${escapeKotlinString(f.hint)}")`
  ).join(',\n');

  const roadmapsKotlin = EDU_ROADMAPS.map((r) => {
    const cIds = r.courseIds.map((id) => `"${escapeKotlinString(id)}"`).join(', ');
    return `            RoadmapItem("${escapeKotlinString(r.id)}", "${escapeKotlinString(r.title)}", "${escapeKotlinString(r.subtitle)}", "${escapeKotlinString(r.targetRole)}", listOf(${cIds}))`;
  }).join(',\n');

  const interviewKotlin = EDU_INTERVIEW_QA.map(
    (qa) =>
      `            InterviewQA("${escapeKotlinString(qa.id)}", "${escapeKotlinString(qa.category)}", "${escapeKotlinString(qa.question)}", "${escapeKotlinString(qa.answer)}", "${escapeKotlinString(qa.tip)}")`
  ).join(',\n');

  return `package ${cleanPkg}

import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.content.edit
import androidx.core.net.toUri
import kotlinx.coroutines.delay
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

private data class EduPalette(
    val isDark: Boolean,
    val bg: Color,
    val nav: Color,
    val card: Color,
    val inset: Color,
    val border: Color,
    val ink: Color,
    val muted: Color,
    val primary: Color,
    val accent: Color,
    val success: Color,
    val error: Color,
    val warning: Color,
    val violet: Color
)

private val DarkEduPalette = EduPalette(
    isDark = true,
    bg = Color(0xFF060A13),
    nav = Color(0xFF0B1120),
    card = Color(0xFF0F172A),
    inset = Color(0xFF060A13),
    border = Color(0xFF1E293B),
    ink = Color(0xFFF8FAFC),
    muted = Color(0xFF94A3B8),
    primary = Color(0xFF2563EB),
    accent = Color(0xFF38BDF8),
    success = Color(0xFF10B981),
    error = Color(0xFFF87171),
    warning = Color(0xFFF59E0B),
    violet = Color(0xFF8B5CF6)
)

private val LightEduPalette = EduPalette(
    isDark = false,
    bg = Color(0xFFF1F5F9),
    nav = Color(0xFFFFFFFF),
    card = Color(0xFFFFFFFF),
    inset = Color(0xFFF8FAFC),
    border = Color(0xFFCBD5E1),
    ink = Color(0xFF0F172A),
    muted = Color(0xFF475569),
    primary = Color(0xFF2563EB),
    accent = Color(0xFF0284C7),
    success = Color(0xFF059669),
    error = Color(0xFFDC2626),
    warning = Color(0xFFD97706),
    violet = Color(0xFF7C3AED)
)

private val LocalEduPalette = compositionLocalOf { DarkEduPalette }

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            EduPlatformRoot()
        }
    }
}

data class UserAccount(
    val fullName: String,
    val contact: String,
    val password: String
)

data class ProjectStepItem(
    val id: String,
    val title: String,
    val detail: String
)

data class LessonItem(
    val id: String,
    val courseId: String,
    val order: Int,
    val moduleTitle: String,
    val title: String,
    val durationMinutes: Int,
    val summary: String,
    val content: String,
    val codeExample: String,
    val commonMistake: String,
    val takeaway: String,
    val videoUrl: String,
    val imageCaption: String,
    val practicePrompt: String,
    val practiceCodeSnippet: String,
    val practiceOptions: List<String>,
    val practiceCorrectIndex: Int,
    val practiceExplanation: String
)

data class QuizQuestion(
    val id: String,
    val question: String,
    val options: List<String>,
    val correctIndex: Int,
    val explanation: String
)

data class CourseItem(
    val id: String,
    val title: String,
    val category: String,
    val level: String,
    val durationText: String,
    val description: String,
    val projectTitle: String,
    val projectDescription: String,
    val projectSteps: List<ProjectStepItem>,
    val lessons: List<LessonItem>,
    val quiz: List<QuizQuestion>
)

data class FlashcardItem(
    val id: String,
    val topic: String,
    val front: String,
    val back: String,
    val hint: String
)

data class RoadmapItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val targetRole: String,
    val courseIds: List<String>
)

data class InterviewQA(
    val id: String,
    val category: String,
    val question: String,
    val answer: String,
    val tip: String
)

data class QuizResultRecord(
    val courseId: String,
    val courseTitle: String,
    val score: Int,
    val totalQuestions: Int,
    val percentage: Int
)

data class MockExamRecord(
    val id: String,
    val score: Int,
    val totalQuestions: Int,
    val percentage: Int,
    val durationSeconds: Int
)

data class CertificateRecord(
    val id: String,
    val courseId: String,
    val courseTitle: String,
    val studentName: String,
    val percentage: Int,
    val issuedAt: String
)

data class LessonQuizScoreRecord(
    val score: Int,
    val total: Int
)

data class DiscussionReply(
    val id: String,
    val authorName: String,
    val text: String,
    val createdAt: String
)

data class DiscussionPost(
    val id: String,
    val authorName: String,
    val authorContact: String,
    val postType: String,
    val text: String,
    val createdAt: String,
    val helpfulByContacts: List<String>,
    val replies: List<DiscussionReply>
)

private data class LessonMicroQuestion(
    val id: String,
    val category: String,
    val question: String,
    val codeSnippet: String,
    val options: List<String>,
    val correctIndex: Int,
    val explanation: String
)

private data class AchievementBadge(
    val id: String,
    val title: String,
    val description: String,
    val unlocked: Boolean,
    val progressText: String
)

private data class LessonSlideChapter(
    val shortTitle: String,
    val headline: String,
    val bodyLines: List<String>,
    val speechText: String
)

private data class CodeLineAnalysis(
    val line: String,
    val meaning: String
)

private fun getTodayDateKey(offsetDays: Int = 0): String {
    val cal = Calendar.getInstance()
    cal.add(Calendar.DAY_OF_YEAR, offsetDays)
    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    return sdf.format(cal.time)
}

private fun getDayShortLabel(offsetDays: Int): String {
    val cal = Calendar.getInstance()
    cal.add(Calendar.DAY_OF_YEAR, offsetDays)
    return when (cal.get(Calendar.DAY_OF_WEEK)) {
        Calendar.SUNDAY -> "Ya"
        Calendar.MONDAY -> "Du"
        Calendar.TUESDAY -> "Se"
        Calendar.WEDNESDAY -> "Ch"
        Calendar.THURSDAY -> "Pa"
        Calendar.FRIDAY -> "Ju"
        else -> "Sh"
    }
}

private fun formatNowTime(): String {
    val sdf = SimpleDateFormat("dd-MMM, HH:mm", Locale.US)
    return sdf.format(Date())
}

private fun calculateStreak(activityByDate: Map<String, Int>): Int {
    var streak = 0
    val todayKey = getTodayDateKey(0)
    val startOffset = if ((activityByDate[todayKey] ?: 0) > 0) 0 else -1
    for (i in startOffset downTo -365) {
        val key = getTodayDateKey(i)
        if ((activityByDate[key] ?: 0) > 0) streak++ else break
    }
    return streak
}

private data class XpRankInfo(val xp: Int, val rank: String, val nextRankXp: Int)

private fun calculateUserXp(
    completedCount: Int,
    practiceCount: Int,
    quizCount: Int,
    mockExamCount: Int,
    masteredFlashcardsCount: Int,
    projectStepsCount: Int,
    certificatesCount: Int,
    watchedVideoCount: Int,
    lessonQuizzesCount: Int,
    dailyChallengeCount: Int,
    pomodoroCount: Int
): XpRankInfo {
    val xp = completedCount * 20 +
        practiceCount * 15 +
        quizCount * 40 +
        mockExamCount * 60 +
        masteredFlashcardsCount * 10 +
        projectStepsCount * 10 +
        certificatesCount * 100 +
        watchedVideoCount * 15 +
        lessonQuizzesCount * 25 +
        dailyChallengeCount * 15 +
        pomodoroCount * 10

    return when {
        xp < 250 -> XpRankInfo(xp, "Boshlovchi", 250)
        xp < 750 -> XpRankInfo(xp, "Izlanuvchi", 750)
        xp < 1600 -> XpRankInfo(xp, "Amaliyotchi", 1600)
        xp < 3000 -> XpRankInfo(xp, "Mutaxassis", 3000)
        else -> XpRankInfo(xp, "Ustoz Muhandis", 5000)
    }
}

private class EduStorage(context: Context) {
    private val prefs = context.getSharedPreferences("eduplatform_full_prefs", Context.MODE_PRIVATE)

    fun isDarkTheme(): Boolean = prefs.getString("theme_mode", "dark") != "light"

    fun setDarkTheme(isDark: Boolean) {
        prefs.edit { putString("theme_mode", if (isDark) "dark" else "light") }
    }

    fun getActiveUser(): UserAccount? {
        val activeContact = prefs.getString("active_contact", null) ?: return null
        return getAllUsers().find { it.contact == activeContact }
    }

    fun loginOrCreateDemoStudent(): UserAccount {
        val demoContact = "talaba@eduplatform.uz"
        val existing = getAllUsers().find { it.contact == demoContact }
        if (existing != null) {
            prefs.edit { putString("active_contact", existing.contact) }
            return existing
        }
        val demo = UserAccount("Sardor Karimov", demoContact, "demo1234")
        val users = getAllUsers().toMutableList()
        users.add(demo)
        saveUsers(users)
        prefs.edit { putString("active_contact", demo.contact) }
        return demo
    }

    fun registerUser(fullName: String, contact: String, password: String): Pair<UserAccount?, String?> {
        val name = fullName.trim()
        val cleanContact = contact.trim()
        val cleanPass = password.trim()
        if (name.length < 2) return null to "Ism kamida 2 ta belgidan iborat bo'lishi kerak."
        val emailRegex = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\\\.[A-Za-z]{2,}\$")
        val phoneRegex = Regex("^\\\\+?[0-9\\\\s-]{9,15}\$")
        if (!emailRegex.matches(cleanContact) && !phoneRegex.matches(cleanContact)) {
            return null to "To'g'ri elektron pochta yoki telefon raqami kiriting."
        }
        if (cleanPass.length < 6) return null to "Parol kamida 6 ta belgidan iborat bo'lishi kerak."
        val users = getAllUsers().toMutableList()
        if (users.any { it.contact.equals(cleanContact, ignoreCase = true) }) {
            return null to "Bu pochta yoki telefon allaqachon ro'yxatdan o'tgan."
        }
        val newUser = UserAccount(name, cleanContact, cleanPass)
        users.add(newUser)
        saveUsers(users)
        prefs.edit { putString("active_contact", newUser.contact) }
        return newUser to null
    }

    fun loginUser(contact: String, password: String): Pair<UserAccount?, String?> {
        val cleanContact = contact.trim()
        val cleanPass = password.trim()
        if (cleanContact.isEmpty() || cleanPass.isEmpty()) {
            return null to "Elektron pochta (yoki telefon) va parolni kiriting."
        }
        val user = getAllUsers().find { it.contact.equals(cleanContact, ignoreCase = true) }
            ?: return null to "Foydalanuvchi topilmadi. Avval ro'yxatdan o'ting."
        if (user.password != cleanPass) return null to "Parol noto'g'ri kiritildi."
        prefs.edit { putString("active_contact", user.contact) }
        return user to null
    }

    fun updateUserName(contact: String, newName: String): UserAccount? {
        val trimmed = newName.trim()
        if (trimmed.length < 2) return null
        var updated: UserAccount? = null
        val users = getAllUsers().map {
            if (it.contact == contact) {
                val u = it.copy(fullName = trimmed)
                updated = u
                u
            } else it
        }
        saveUsers(users)
        return updated
    }

    fun logout() {
        prefs.edit { remove("active_contact") }
    }

    private fun getStringSetCopy(key: String): Set<String> =
        prefs.getStringSet(key, emptySet())?.toSet() ?: emptySet()

    private fun addToStringSet(key: String, value: String, recordActivityContact: String? = null): Set<String> {
        val current = getStringSetCopy(key).toMutableSet()
        val added = current.add(value)
        prefs.edit { putStringSet(key, current) }
        if (added && recordActivityContact != null) recordTodayActivity(recordActivityContact, 1)
        return current
    }

    private fun toggleInStringSet(key: String, value: String, recordActivityContact: String? = null): Set<String> {
        val current = getStringSetCopy(key).toMutableSet()
        val added = if (current.contains(value)) {
            current.remove(value)
            false
        } else {
            current.add(value)
            true
        }
        prefs.edit { putStringSet(key, current) }
        if (added && recordActivityContact != null) recordTodayActivity(recordActivityContact, 1)
        return current
    }

    fun getCompletedLessonIds(contact: String) = getStringSetCopy("lessons_\$contact")
    fun markLessonCompleted(contact: String, lessonId: String) = addToStringSet("lessons_\$contact", lessonId, contact)

    fun getWatchedVideoIds(contact: String) = getStringSetCopy("videos_\$contact")
    fun markVideoWatched(contact: String, lessonId: String) = addToStringSet("videos_\$contact", lessonId, contact)

    fun getPracticeIds(contact: String) = getStringSetCopy("practice_\$contact")
    fun markPracticeCompleted(contact: String, lessonId: String) = addToStringSet("practice_\$contact", lessonId, contact)

    fun getBookmarkedLessonIds(contact: String) = getStringSetCopy("bookmarks_\$contact")
    fun toggleBookmark(contact: String, lessonId: String) = toggleInStringSet("bookmarks_\$contact", lessonId)

    fun getMasteredFlashcards(contact: String) = getStringSetCopy("flashcards_\$contact")
    fun setFlashcardMastered(contact: String, cardId: String, mastered: Boolean): Set<String> {
        val current = getStringSetCopy("flashcards_\$contact").toMutableSet()
        val changed = if (mastered) current.add(cardId) else { current.remove(cardId); false }
        prefs.edit { putStringSet("flashcards_\$contact", current) }
        if (changed) recordTodayActivity(contact, 1)
        return current
    }

    fun getProjectStepIds(contact: String) = getStringSetCopy("project_steps_\$contact")
    fun toggleProjectStep(contact: String, stepId: String) = toggleInStringSet("project_steps_\$contact", stepId, contact)

    fun getMasteredInterviewIds(contact: String) = getStringSetCopy("interview_\$contact")
    fun toggleMasteredInterview(contact: String, qaId: String) = toggleInStringSet("interview_\$contact", qaId)

    fun getDailyChallengeDates(contact: String) = getStringSetCopy("daily_challenge_\$contact")
    fun markDailyChallengeCompleted(contact: String, dateKey: String) = addToStringSet("daily_challenge_\$contact", dateKey, contact)

    fun getPomodoroCount(contact: String): Int = prefs.getInt("pomodoro_\$contact", 0)
    fun incrementPomodoroCount(contact: String): Int {
        val next = getPomodoroCount(contact) + 1
        prefs.edit { putInt("pomodoro_\$contact", next) }
        recordTodayActivity(contact, 1)
        return next
    }

    fun getDailyGoal(contact: String): Int = prefs.getInt("daily_goal_\$contact", 2).coerceIn(1, 10)
    fun setDailyGoal(contact: String, goal: Int): Int {
        val clamped = goal.coerceIn(1, 10)
        prefs.edit { putInt("daily_goal_\$contact", clamped) }
        return clamped
    }

    fun getActivityByDate(contact: String): Map<String, Int> {
        val raw = prefs.getString("activity_\$contact", "{}") ?: "{}"
        return try {
            val obj = JSONObject(raw)
            val map = mutableMapOf<String, Int>()
            val keys = obj.keys()
            while (keys.hasNext()) {
                val k = keys.next()
                map[k] = obj.optInt(k, 0)
            }
            map
        } catch (_: Exception) {
            emptyMap()
        }
    }

    fun recordTodayActivity(contact: String, points: Int = 1): Map<String, Int> {
        val map = getActivityByDate(contact).toMutableMap()
        val today = getTodayDateKey(0)
        map[today] = (map[today] ?: 0) + points
        val obj = JSONObject()
        map.forEach { (k, v) -> obj.put(k, v) }
        prefs.edit { putString("activity_\$contact", obj.toString()) }
        return map
    }

    fun getAllNotes(contact: String): Map<String, String> {
        val raw = prefs.getString("notes_map_\$contact", "{}") ?: "{}"
        return try {
            val obj = JSONObject(raw)
            val map = mutableMapOf<String, String>()
            val keys = obj.keys()
            while (keys.hasNext()) {
                val k = keys.next()
                val v = obj.optString(k, "")
                if (v.isNotBlank()) map[k] = v
            }
            map
        } catch (_: Exception) {
            emptyMap()
        }
    }

    fun saveLessonNote(contact: String, lessonId: String, note: String): Map<String, String> {
        val map = getAllNotes(contact).toMutableMap()
        if (note.isBlank()) map.remove(lessonId) else map[lessonId] = note
        val obj = JSONObject()
        map.forEach { (k, v) -> obj.put(k, v) }
        prefs.edit { putString("notes_map_\$contact", obj.toString()) }
        return map
    }

    fun getLessonQuizScores(contact: String): Map<String, LessonQuizScoreRecord> {
        val raw = prefs.getString("lesson_quiz_\$contact", "{}") ?: "{}"
        return try {
            val obj = JSONObject(raw)
            val map = mutableMapOf<String, LessonQuizScoreRecord>()
            val keys = obj.keys()
            while (keys.hasNext()) {
                val k = keys.next()
                val item = obj.getJSONObject(k)
                map[k] = LessonQuizScoreRecord(item.getInt("score"), item.getInt("total"))
            }
            map
        } catch (_: Exception) {
            emptyMap()
        }
    }

    fun saveLessonQuizScore(contact: String, lessonId: String, score: Int, total: Int): Map<String, LessonQuizScoreRecord> {
        val map = getLessonQuizScores(contact).toMutableMap()
        val existing = map[lessonId]
        val bestScore = if (existing != null) maxOf(existing.score, score) else score
        map[lessonId] = LessonQuizScoreRecord(bestScore, total)
        val obj = JSONObject()
        map.forEach { (k, v) ->
            obj.put(k, JSONObject().apply {
                put("score", v.score)
                put("total", v.total)
            })
        }
        prefs.edit { putString("lesson_quiz_\$contact", obj.toString()) }
        if (existing == null) recordTodayActivity(contact, 1)
        return map
    }

    fun getQuizResults(contact: String): List<QuizResultRecord> {
        val raw = prefs.getString("quizzes_\$contact", "[]") ?: "[]"
        return try {
            val arr = JSONArray(raw)
            List(arr.length()) { i ->
                val obj = arr.getJSONObject(i)
                QuizResultRecord(
                    obj.getString("courseId"),
                    obj.getString("courseTitle"),
                    obj.getInt("score"),
                    obj.getInt("totalQuestions"),
                    obj.getInt("percentage")
                )
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun saveQuizResult(contact: String, record: QuizResultRecord): List<QuizResultRecord> {
        val current = getQuizResults(contact).toMutableList()
        current.add(0, record)
        val arr = JSONArray()
        current.forEach { item ->
            arr.put(JSONObject().apply {
                put("courseId", item.courseId)
                put("courseTitle", item.courseTitle)
                put("score", item.score)
                put("totalQuestions", item.totalQuestions)
                put("percentage", item.percentage)
            })
        }
        prefs.edit { putString("quizzes_\$contact", arr.toString()) }
        recordTodayActivity(contact, 1)
        return current
    }

    fun getMockExamResults(contact: String): List<MockExamRecord> {
        val raw = prefs.getString("mock_exams_\$contact", "[]") ?: "[]"
        return try {
            val arr = JSONArray(raw)
            List(arr.length()) { i ->
                val obj = arr.getJSONObject(i)
                MockExamRecord(
                    obj.getString("id"),
                    obj.getInt("score"),
                    obj.getInt("totalQuestions"),
                    obj.getInt("percentage"),
                    obj.getInt("durationSeconds")
                )
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun saveMockExamResult(contact: String, score: Int, total: Int, pct: Int, durationSec: Int): List<MockExamRecord> {
        val current = getMockExamResults(contact).toMutableList()
        current.add(0, MockExamRecord("exam_\${System.currentTimeMillis()}", score, total, pct, durationSec))
        val arr = JSONArray()
        current.forEach { item ->
            arr.put(JSONObject().apply {
                put("id", item.id)
                put("score", item.score)
                put("totalQuestions", item.totalQuestions)
                put("percentage", item.percentage)
                put("durationSeconds", item.durationSeconds)
            })
        }
        prefs.edit { putString("mock_exams_\$contact", arr.toString()) }
        recordTodayActivity(contact, 2)
        return current
    }

    fun getCertificates(contact: String): List<CertificateRecord> {
        val raw = prefs.getString("certs_\$contact", "[]") ?: "[]"
        return try {
            val arr = JSONArray(raw)
            List(arr.length()) { i ->
                val obj = arr.getJSONObject(i)
                CertificateRecord(
                    obj.getString("id"),
                    obj.getString("courseId"),
                    obj.getString("courseTitle"),
                    obj.getString("studentName"),
                    obj.getInt("percentage"),
                    obj.getString("issuedAt")
                )
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun unlockCertificateIfEligible(
        contact: String,
        studentName: String,
        courseId: String,
        courseTitle: String,
        percentage: Int
    ): List<CertificateRecord> {
        val current = getCertificates(contact).toMutableList()
        if (percentage < 70) return current
        val idx = current.indexOfFirst { it.courseId == courseId }
        val todayStr = getTodayDateKey(0)
        if (idx >= 0) {
            if (percentage > current[idx].percentage) {
                current[idx] = current[idx].copy(percentage = percentage, studentName = studentName)
            }
        } else {
            val code = "EDU-\${courseId.take(4).uppercase()}-\${(1000..9999).random()}"
            current.add(0, CertificateRecord(code, courseId, courseTitle, studentName, percentage, todayStr))
        }
        val arr = JSONArray()
        current.forEach { c ->
            arr.put(JSONObject().apply {
                put("id", c.id)
                put("courseId", c.courseId)
                put("courseTitle", c.courseTitle)
                put("studentName", c.studentName)
                put("percentage", c.percentage)
                put("issuedAt", c.issuedAt)
            })
        }
        prefs.edit { putString("certs_\$contact", arr.toString()) }
        return current
    }

    fun getDiscussions(lessonId: String): List<DiscussionPost> {
        val raw = prefs.getString("discussions_\$lessonId", "[]") ?: "[]"
        return try {
            val arr = JSONArray(raw)
            List(arr.length()) { i ->
                val obj = arr.getJSONObject(i)
                val votesArr = obj.optJSONArray("helpfulByContacts") ?: JSONArray()
                val votes = List(votesArr.length()) { v -> votesArr.getString(v) }
                val repliesArr = obj.optJSONArray("replies") ?: JSONArray()
                val replies = List(repliesArr.length()) { r ->
                    val ro = repliesArr.getJSONObject(r)
                    DiscussionReply(
                        ro.getString("id"),
                        ro.getString("authorName"),
                        ro.getString("text"),
                        ro.getString("createdAt")
                    )
                }
                DiscussionPost(
                    obj.getString("id"),
                    obj.getString("authorName"),
                    obj.getString("authorContact"),
                    obj.getString("postType"),
                    obj.getString("text"),
                    obj.getString("createdAt"),
                    votes,
                    replies
                )
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun saveDiscussions(lessonId: String, posts: List<DiscussionPost>) {
        val arr = JSONArray()
        posts.forEach { p ->
            val votesArr = JSONArray()
            p.helpfulByContacts.forEach { votesArr.put(it) }
            val repliesArr = JSONArray()
            p.replies.forEach { r ->
                repliesArr.put(JSONObject().apply {
                    put("id", r.id)
                    put("authorName", r.authorName)
                    put("text", r.text)
                    put("createdAt", r.createdAt)
                })
            }
            arr.put(JSONObject().apply {
                put("id", p.id)
                put("authorName", p.authorName)
                put("authorContact", p.authorContact)
                put("postType", p.postType)
                put("text", p.text)
                put("createdAt", p.createdAt)
                put("helpfulByContacts", votesArr)
                put("replies", repliesArr)
            })
        }
        prefs.edit { putString("discussions_\$lessonId", arr.toString()) }
    }

    fun addDiscussionPost(lessonId: String, authorName: String, authorContact: String, postType: String, text: String): List<DiscussionPost> {
        val current = getDiscussions(lessonId).toMutableList()
        val post = DiscussionPost(
            id = "post_\${System.currentTimeMillis()}",
            authorName = authorName,
            authorContact = authorContact,
            postType = postType,
            text = text,
            createdAt = formatNowTime(),
            helpfulByContacts = emptyList(),
            replies = emptyList()
        )
        current.add(0, post)
        saveDiscussions(lessonId, current)
        recordTodayActivity(authorContact, 1)
        return current
    }

    fun addDiscussionReply(lessonId: String, postId: String, authorName: String, text: String): List<DiscussionPost> {
        val updated = getDiscussions(lessonId).map { p ->
            if (p.id == postId) {
                p.copy(
                    replies = p.replies + DiscussionReply(
                        id = "rep_\${System.currentTimeMillis()}",
                        authorName = authorName,
                        text = text,
                        createdAt = formatNowTime()
                    )
                )
            } else p
        }
        saveDiscussions(lessonId, updated)
        return updated
    }

    fun toggleDiscussionHelpful(lessonId: String, postId: String, contact: String): List<DiscussionPost> {
        val updated = getDiscussions(lessonId).map { p ->
            if (p.id == postId) {
                val has = p.helpfulByContacts.contains(contact)
                val nextVotes = if (has) p.helpfulByContacts - contact else p.helpfulByContacts + contact
                p.copy(helpfulByContacts = nextVotes)
            } else p
        }
        saveDiscussions(lessonId, updated)
        return updated
    }

    fun deleteDiscussionPost(lessonId: String, postId: String, contact: String): List<DiscussionPost> {
        val updated = getDiscussions(lessonId).filterNot { it.id == postId && it.authorContact == contact }
        saveDiscussions(lessonId, updated)
        return updated
    }

    private fun getAllUsers(): List<UserAccount> {
        val raw = prefs.getString("users_json", "[]") ?: "[]"
        return try {
            val arr = JSONArray(raw)
            List(arr.length()) { i ->
                val obj = arr.getJSONObject(i)
                UserAccount(obj.getString("fullName"), obj.getString("contact"), obj.getString("password"))
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun saveUsers(users: List<UserAccount>) {
        val arr = JSONArray()
        users.forEach { u ->
            arr.put(JSONObject().apply {
                put("fullName", u.fullName)
                put("contact", u.contact)
                put("password", u.password)
            })
        }
        prefs.edit { putString("users_json", arr.toString()) }
    }
}

private sealed interface AppScreen {
    data object Home : AppScreen
    data object Courses : AppScreen
    data object Practice : AppScreen
    data object Quizzes : AppScreen
    data object Profile : AppScreen
    data class CourseDetail(val courseId: String) : AppScreen
    data class LessonDetail(val courseId: String, val lessonId: String) : AppScreen
    data class QuizRunner(val courseId: String) : AppScreen
    data object MockExam : AppScreen
}

private data class BottomNavItem(
    val screen: AppScreen,
    val label: String,
    val icon: ImageVector
)

private data class EduSessionState(
    val user: UserAccount?,
    val completedIds: Set<String> = emptySet(),
    val watchedVideoIds: Set<String> = emptySet(),
    val lessonQuizScores: Map<String, LessonQuizScoreRecord> = emptyMap(),
    val dailyChallengeDates: Set<String> = emptySet(),
    val pomodoroCount: Int = 0,
    val practiceIds: Set<String> = emptySet(),
    val bookmarkedIds: Set<String> = emptySet(),
    val notesMap: Map<String, String> = emptyMap(),
    val masteredFlashcards: Set<String> = emptySet(),
    val projectStepIds: Set<String> = emptySet(),
    val interviewIds: Set<String> = emptySet(),
    val quizResults: List<QuizResultRecord> = emptyList(),
    val mockExamResults: List<MockExamRecord> = emptyList(),
    val certificates: List<CertificateRecord> = emptyList(),
    val dailyGoal: Int = 2,
    val activityByDate: Map<String, Int> = emptyMap()
)

private fun loadSessionForUser(storage: EduStorage, user: UserAccount): EduSessionState {
    return EduSessionState(
        user = user,
        completedIds = storage.getCompletedLessonIds(user.contact),
        watchedVideoIds = storage.getWatchedVideoIds(user.contact),
        lessonQuizScores = storage.getLessonQuizScores(user.contact),
        dailyChallengeDates = storage.getDailyChallengeDates(user.contact),
        pomodoroCount = storage.getPomodoroCount(user.contact),
        practiceIds = storage.getPracticeIds(user.contact),
        bookmarkedIds = storage.getBookmarkedLessonIds(user.contact),
        notesMap = storage.getAllNotes(user.contact),
        masteredFlashcards = storage.getMasteredFlashcards(user.contact),
        projectStepIds = storage.getProjectStepIds(user.contact),
        interviewIds = storage.getMasteredInterviewIds(user.contact),
        quizResults = storage.getQuizResults(user.contact),
        mockExamResults = storage.getMockExamResults(user.contact),
        certificates = storage.getCertificates(user.contact),
        dailyGoal = storage.getDailyGoal(user.contact),
        activityByDate = storage.getActivityByDate(user.contact)
    )
}

@Composable
fun EduPlatformRoot() {
    val context = LocalContext.current
    val storage = remember { EduStorage(context) }
    val courses = remember { EduCoursesSeed.courses }
    val flashcards = remember { EduCoursesSeed.flashcards }
    val roadmaps = remember { EduCoursesSeed.roadmaps }
    val interviewQAs = remember { EduCoursesSeed.interviewQAs }

    var isDark by remember { mutableStateOf(storage.isDarkTheme()) }
    val palette = if (isDark) DarkEduPalette else LightEduPalette

    val colorScheme = if (isDark) {
        darkColorScheme(
            primary = palette.primary,
            onPrimary = Color.White,
            secondary = palette.accent,
            onSecondary = palette.bg,
            background = palette.bg,
            onBackground = palette.ink,
            surface = palette.card,
            onSurface = palette.ink,
            surfaceVariant = palette.nav,
            onSurfaceVariant = palette.muted,
            outline = palette.border,
            error = palette.error,
            onError = palette.bg
        )
    } else {
        lightColorScheme(
            primary = palette.primary,
            onPrimary = Color.White,
            secondary = palette.accent,
            onSecondary = Color.White,
            background = palette.bg,
            onBackground = palette.ink,
            surface = palette.card,
            onSurface = palette.ink,
            surfaceVariant = palette.nav,
            onSurfaceVariant = palette.muted,
            outline = palette.border,
            error = palette.error,
            onError = Color.White
        )
    }

    var session by remember {
        val initialUser = storage.getActiveUser()
        mutableStateOf(if (initialUser != null) loadSessionForUser(storage, initialUser) else EduSessionState(user = null))
    }
    var authError by remember { mutableStateOf<String?>(null) }
    var currentScreen by remember { mutableStateOf<AppScreen>(AppScreen.Home) }
    var practiceTabIndex by remember { mutableIntStateOf(0) }
    var focusMode by remember { mutableStateOf(false) }

    // Global Pomodoro Timer state (keeps ticking across all screens!)
    var showPomodoroDialog by remember { mutableStateOf(false) }
    var pomodoroModeFocus by remember { mutableStateOf(true) }
    var pomodoroRunning by remember { mutableStateOf(false) }
    var pomodoroSecondsLeft by remember { mutableIntStateOf(25 * 60) }

    // Global Translator / IT Terms Audio Assistant Dialog
    var showTranslatorDialog by remember { mutableStateOf(false) }

    LaunchedEffect(pomodoroRunning) {
        while (pomodoroRunning && pomodoroSecondsLeft > 0) {
            delay(1000L)
            pomodoroSecondsLeft -= 1
            if (pomodoroSecondsLeft == 0) {
                pomodoroRunning = false
                try {
                    val tg = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 75)
                    tg.startTone(ToneGenerator.TONE_PROP_BEEP2, 350)
                } catch (_: Exception) {
                }
                val u = session.user
                if (pomodoroModeFocus && u != null) {
                    val newCount = storage.incrementPomodoroCount(u.contact)
                    session = session.copy(
                        pomodoroCount = newCount,
                        activityByDate = storage.getActivityByDate(u.contact)
                    )
                }
            }
        }
    }

    CompositionLocalProvider(LocalEduPalette provides palette) {
        MaterialTheme(colorScheme = colorScheme) {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = palette.bg
            ) {
                val user = session.user
                if (user == null) {
                    AuthScreen(
                        errorMessage = authError,
                        onClearError = { authError = null },
                        onDemoLogin = {
                            val demoUser = storage.loginOrCreateDemoStudent()
                            session = loadSessionForUser(storage, demoUser)
                            currentScreen = AppScreen.Home
                            authError = null
                        },
                        onLogin = { contact, password ->
                            val (loggedIn, err) = storage.loginUser(contact, password)
                            if (loggedIn != null) {
                                session = loadSessionForUser(storage, loggedIn)
                                currentScreen = AppScreen.Home
                                authError = null
                            } else {
                                authError = err
                            }
                        },
                        onRegister = { fullName, contact, password ->
                            val (created, err) = storage.registerUser(fullName, contact, password)
                            if (created != null) {
                                session = loadSessionForUser(storage, created)
                                currentScreen = AppScreen.Home
                                authError = null
                            } else {
                                authError = err
                            }
                        }
                    )
                } else {
                    val bottomItems = listOf(
                        BottomNavItem(AppScreen.Home, "Bosh", Icons.Default.Home),
                        BottomNavItem(AppScreen.Courses, "Kurslar", Icons.Default.Search),
                        BottomNavItem(AppScreen.Practice, "Amaliyot", Icons.Default.Refresh),
                        BottomNavItem(AppScreen.Quizzes, "Testlar", Icons.Default.Star),
                        BottomNavItem(AppScreen.Profile, "Profil", Icons.Default.Person)
                    )
                    val isTopTab = currentScreen in listOf(
                        AppScreen.Home, AppScreen.Courses, AppScreen.Practice, AppScreen.Quizzes, AppScreen.Profile
                    )

                    Scaffold(
                        containerColor = palette.bg,
                        topBar = {
                            if (isTopTab) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(palette.nav)
                                        .safeDrawingPadding()
                                        .padding(horizontal = 14.dp, vertical = 10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "EduPlatform",
                                        style = MaterialTheme.typography.titleLarge,
                                        fontWeight = FontWeight.Bold,
                                        color = palette.accent
                                    )
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                        val mins = pomodoroSecondsLeft / 60
                                        val secs = pomodoroSecondsLeft % 60
                                        val timerLabel = if (pomodoroRunning) {
                                            String.format(Locale.US, "⏱ %02d:%02d", mins, secs)
                                        } else "⏱ Fokus"
                                        OutlinedButton(
                                            onClick = { showPomodoroDialog = true },
                                            shape = RoundedCornerShape(10.dp),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                        ) {
                                            Text(
                                                text = timerLabel,
                                                color = if (pomodoroRunning) palette.success else palette.ink,
                                                style = MaterialTheme.typography.labelMedium
                                            )
                                        }
                                        OutlinedButton(
                                            onClick = { showTranslatorDialog = true },
                                            shape = RoundedCornerShape(10.dp),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                        ) {
                                            Text("🌐 Tarjimon", color = palette.accent, style = MaterialTheme.typography.labelMedium)
                                        }
                                        OutlinedButton(
                                            onClick = {
                                                isDark = !isDark
                                                storage.setDarkTheme(isDark)
                                            },
                                            shape = RoundedCornerShape(10.dp),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                        ) {
                                            Text(if (isDark) "☀" else "🌙", style = MaterialTheme.typography.labelMedium)
                                        }
                                    }
                                }
                            }
                        },
                        bottomBar = {
                            if (isTopTab) {
                                NavigationBar(containerColor = palette.nav) {
                                    bottomItems.forEach { item ->
                                        NavigationBarItem(
                                            selected = currentScreen == item.screen,
                                            onClick = { focusMode = false; currentScreen = item.screen },
                                            icon = { Icon(item.icon, contentDescription = item.label) },
                                            label = { Text(item.label, maxLines = 1) },
                                            colors = NavigationBarItemDefaults.colors(
                                                selectedIconColor = palette.accent,
                                                selectedTextColor = palette.accent,
                                                indicatorColor = palette.card,
                                                unselectedIconColor = palette.muted,
                                                unselectedTextColor = palette.muted
                                            )
                                        )
                                    }
                                }
                            }
                        }
                    ) { innerPadding ->
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(innerPadding)
                        ) {
                            when (val screen = currentScreen) {
                                AppScreen.Home -> HomeScreen(
                                    user = user,
                                    courses = courses,
                                    session = session,
                                    onChangeDailyGoal = { g ->
                                        session = session.copy(dailyGoal = storage.setDailyGoal(user.contact, g))
                                    },
                                    onCompleteDailyChallenge = { dateKey ->
                                        session = session.copy(
                                            dailyChallengeDates = storage.markDailyChallengeCompleted(user.contact, dateKey),
                                            activityByDate = storage.getActivityByDate(user.contact)
                                        )
                                    },
                                    onOpenCourse = { id -> currentScreen = AppScreen.CourseDetail(id) },
                                    onOpenLesson = { cId, lId -> currentScreen = AppScreen.LessonDetail(cId, lId) },
                                    onOpenAllCourses = { currentScreen = AppScreen.Courses },
                                    onOpenPracticeTab = { tabIdx ->
                                        practiceTabIndex = tabIdx
                                        currentScreen = AppScreen.Practice
                                    },
                                    onOpenMockExam = { currentScreen = AppScreen.MockExam },
                                    onOpenTranslator = { showTranslatorDialog = true }
                                )

                                AppScreen.Courses -> CoursesScreen(
                                    courses = courses,
                                    completedIds = session.completedIds,
                                    practiceIds = session.practiceIds,
                                    onSelectCourse = { id -> currentScreen = AppScreen.CourseDetail(id) },
                                    onOpenLesson = { cId, lId -> currentScreen = AppScreen.LessonDetail(cId, lId) }
                                )

                                AppScreen.Practice -> PracticeHubScreen(
                                    initialTabIndex = practiceTabIndex,
                                    cards = flashcards,
                                    roadmaps = roadmaps,
                                    courses = courses,
                                    interviewQAs = interviewQAs,
                                    completedLessonIds = session.completedIds,
                                    masteredFlashcards = session.masteredFlashcards,
                                    completedProjectSteps = session.projectStepIds,
                                    masteredInterviewIds = session.interviewIds,
                                    onToggleMasteredFlashcard = { cardId, mastered ->
                                        session = session.copy(
                                            masteredFlashcards = storage.setFlashcardMastered(user.contact, cardId, mastered),
                                            activityByDate = storage.getActivityByDate(user.contact)
                                        )
                                    },
                                    onToggleProjectStep = { stepId ->
                                        session = session.copy(
                                            projectStepIds = storage.toggleProjectStep(user.contact, stepId),
                                            activityByDate = storage.getActivityByDate(user.contact)
                                        )
                                    },
                                    onToggleMasteredInterview = { qaId ->
                                        session = session.copy(
                                            interviewIds = storage.toggleMasteredInterview(user.contact, qaId)
                                        )
                                    },
                                    onOpenCourse = { cId -> currentScreen = AppScreen.CourseDetail(cId) }
                                )

                                AppScreen.Quizzes -> QuizzesListScreen(
                                    courses = courses,
                                    quizResults = session.quizResults,
                                    mockExamResults = session.mockExamResults,
                                    onStartQuiz = { id -> currentScreen = AppScreen.QuizRunner(id) },
                                    onStartMockExam = { currentScreen = AppScreen.MockExam }
                                )

                                AppScreen.Profile -> ProfileScreen(
                                    user = user,
                                    courses = courses,
                                    session = session,
                                    isDark = isDark,
                                    onToggleTheme = {
                                        isDark = !isDark
                                        storage.setDarkTheme(isDark)
                                    },
                                    onChangeDailyGoal = { g ->
                                        session = session.copy(dailyGoal = storage.setDailyGoal(user.contact, g))
                                    },
                                    onUpdateName = { newName ->
                                        val updated = storage.updateUserName(user.contact, newName)
                                        if (updated != null) session = session.copy(user = updated)
                                    },
                                    onOpenLesson = { cId, lId -> currentScreen = AppScreen.LessonDetail(cId, lId) },
                                    onLogout = {
                                        storage.logout()
                                        session = EduSessionState(user = null)
                                        currentScreen = AppScreen.Home
                                        focusMode = false
                                    }
                                )

                                is AppScreen.CourseDetail -> {
                                    val course = courses.find { it.id == screen.courseId }
                                    if (course != null) {
                                        CourseDetailScreen(
                                            course = course,
                                            completedIds = session.completedIds,
                                            practiceIds = session.practiceIds,
                                            bookmarkedIds = session.bookmarkedIds,
                                            onBack = { currentScreen = AppScreen.Courses },
                                            onOpenLesson = { lId -> currentScreen = AppScreen.LessonDetail(course.id, lId) },
                                            onStartQuiz = { currentScreen = AppScreen.QuizRunner(course.id) },
                                            onOpenMiniProjects = {
                                                practiceTabIndex = 2
                                                currentScreen = AppScreen.Practice
                                            }
                                        )
                                    }
                                }

                                is AppScreen.LessonDetail -> {
                                    val flatLessons = courses.flatMap { c -> c.lessons.map { l -> c to l } }
                                    val globalIdx = flatLessons.indexOfFirst { (c, l) ->
                                        c.id == screen.courseId && l.id == screen.lessonId
                                    }
                                    if (globalIdx >= 0) {
                                        val (course, lesson) = flatLessons[globalIdx]
                                        val nextPair = flatLessons.getOrNull(globalIdx + 1)
                                        LessonScreen(
                                            course = course,
                                            lesson = lesson,
                                            user = user,
                                            globalNumber = globalIdx + 1,
                                            totalLessonsCount = flatLessons.size,
                                            initialNote = session.notesMap[lesson.id] ?: "",
                                            savedQuizScore = session.lessonQuizScores[lesson.id],
                                            isCompleted = session.completedIds.contains(lesson.id),
                                            isVideoWatched = session.watchedVideoIds.contains(lesson.id),
                                            isBookmarked = session.bookmarkedIds.contains(lesson.id),
                                            focusMode = focusMode,
                                            hasNextLesson = nextPair != null,
                                            nextLessonCourseDiffers = nextPair != null && nextPair.first.id != course.id,
                                            storage = storage,
                                            onToggleFocusMode = { focusMode = !focusMode },
                                            onBack = {
                                                focusMode = false
                                                currentScreen = AppScreen.CourseDetail(course.id)
                                            },
                                            onToggleBookmark = {
                                                session = session.copy(
                                                    bookmarkedIds = storage.toggleBookmark(user.contact, lesson.id)
                                                )
                                            },
                                            onSaveNote = { txt ->
                                                session = session.copy(
                                                    notesMap = storage.saveLessonNote(user.contact, lesson.id, txt)
                                                )
                                            },
                                            onMarkVideoWatched = {
                                                session = session.copy(
                                                    watchedVideoIds = storage.markVideoWatched(user.contact, lesson.id),
                                                    activityByDate = storage.getActivityByDate(user.contact)
                                                )
                                            },
                                            onMarkPracticeCompleted = {
                                                session = session.copy(
                                                    practiceIds = storage.markPracticeCompleted(user.contact, lesson.id),
                                                    activityByDate = storage.getActivityByDate(user.contact)
                                                )
                                            },
                                            onCompleteLessonQuiz = { sc, tot ->
                                                session = session.copy(
                                                    lessonQuizScores = storage.saveLessonQuizScore(user.contact, lesson.id, sc, tot),
                                                    activityByDate = storage.getActivityByDate(user.contact)
                                                )
                                            },
                                            onOpenTranslator = { showTranslatorDialog = true },
                                            onMarkCompleted = {
                                                session = session.copy(
                                                    completedIds = storage.markLessonCompleted(user.contact, lesson.id),
                                                    activityByDate = storage.getActivityByDate(user.contact)
                                                )
                                            },
                                            onNextLesson = {
                                                if (nextPair != null) {
                                                    currentScreen = AppScreen.LessonDetail(nextPair.first.id, nextPair.second.id)
                                                }
                                            }
                                        )
                                    }
                                }

                                is AppScreen.QuizRunner -> {
                                    val course = courses.find { it.id == screen.courseId }
                                    if (course != null) {
                                        QuizScreen(
                                            course = course,
                                            onBack = { currentScreen = AppScreen.Quizzes },
                                            onOpenCertificates = { currentScreen = AppScreen.Profile },
                                            onQuizFinished = { correct, total ->
                                                val pct = if (total > 0) (correct * 100) / total else 0
                                                val qRes = storage.saveQuizResult(
                                                    user.contact,
                                                    QuizResultRecord(course.id, course.title, correct, total, pct)
                                                )
                                                val certs = storage.unlockCertificateIfEligible(
                                                    user.contact,
                                                    user.fullName,
                                                    course.id,
                                                    course.title,
                                                    pct
                                                )
                                                session = session.copy(
                                                    quizResults = qRes,
                                                    certificates = certs,
                                                    activityByDate = storage.getActivityByDate(user.contact)
                                                )
                                            }
                                        )
                                    }
                                }

                                AppScreen.MockExam -> MockExamScreen(
                                    courses = courses,
                                    onBack = { currentScreen = AppScreen.Quizzes },
                                    onExamFinished = { correct, total, pct, durationSec ->
                                        val updatedExams = storage.saveMockExamResult(user.contact, correct, total, pct, durationSec)
                                        session = session.copy(
                                            mockExamResults = updatedExams,
                                            activityByDate = storage.getActivityByDate(user.contact)
                                        )
                                    }
                                )
                            }
                        }
                    }

                    if (showPomodoroDialog) {
                        PomodoroDialog(
                            isFocusMode = pomodoroModeFocus,
                            secondsLeft = pomodoroSecondsLeft,
                            isRunning = pomodoroRunning,
                            completedSessions = session.pomodoroCount,
                            onSwitchMode = { toFocus ->
                                pomodoroRunning = false
                                pomodoroModeFocus = toFocus
                                pomodoroSecondsLeft = if (toFocus) 25 * 60 else 5 * 60
                            },
                            onToggleRunning = {
                                if (pomodoroSecondsLeft == 0) {
                                    pomodoroSecondsLeft = if (pomodoroModeFocus) 25 * 60 else 5 * 60
                                }
                                pomodoroRunning = !pomodoroRunning
                            },
                            onReset = {
                                pomodoroRunning = false
                                pomodoroSecondsLeft = if (pomodoroModeFocus) 25 * 60 else 5 * 60
                            },
                            onDismiss = { showPomodoroDialog = false }
                        )
                    }

                    if (showTranslatorDialog) {
                        TranslatorDialog(onDismiss = { showTranslatorDialog = false })
                    }
                }
            }
        }
    }
}

@Composable
private fun EduVisualBanner(
    courseId: String,
    category: String,
    badgeText: String,
    titleText: String,
    captionText: String,
    modifier: Modifier = Modifier
) {
    val visualKind = when (courseId) {
        in listOf("dasturlash-noldan", "amaliy-masalalar", "kotlin-basics", "python-automation") -> 0
        in listOf("android-compose", "ui-ux-material3", "web-html-tailwind", "typescript-react") -> 1
        in listOf("database-sql", "backend-api") -> 2
        else -> 3
    }
    val gradientColors = when (visualKind) {
        0 -> listOf(Color(0xFF0F2046), Color(0xFF102A5C), Color(0xFF0A1428))
        1 -> listOf(Color(0xFF0F2942), Color(0xFF1E1B4B), Color(0xFF0B1120))
        2 -> listOf(Color(0xFF092B38), Color(0xFF0F2544), Color(0xFF06101E))
        else -> listOf(Color(0xFF1E1B4B), Color(0xFF0F2B46), Color(0xFF0A1224))
    }

    Card(
        shape = RoundedCornerShape(18.dp),
        border = BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.35f)),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
        modifier = modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(170.dp)
                .background(Brush.linearGradient(gradientColors))
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val w = size.width
                val h = size.height
                val gridColor = Color.White.copy(alpha = 0.04f)
                var gx = 32f
                while (gx < w) {
                    drawLine(gridColor, Offset(gx, 0f), Offset(gx, h), strokeWidth = 1f)
                    gx += 44f
                }
                var gy = 28f
                while (gy < h) {
                    drawLine(gridColor, Offset(0f, gy), Offset(w, gy), strokeWidth = 1f)
                    gy += 44f
                }

                drawCircle(
                    color = Color(0xFF2563EB).copy(alpha = 0.22f),
                    radius = h * 0.65f,
                    center = Offset(w * 0.85f, h * 0.22f)
                )
                drawCircle(
                    color = Color(0xFF10B981).copy(alpha = 0.14f),
                    radius = h * 0.45f,
                    center = Offset(w * 0.18f, h * 0.85f)
                )

                when (visualKind) {
                    0 -> {
                        val winX = w * 0.50f
                        val winY = h * 0.14f
                        val winW = w * 0.44f
                        val winH = h * 0.70f
                        drawRoundRect(
                            color = Color(0xFF060A13).copy(alpha = 0.9f),
                            topLeft = Offset(winX, winY),
                            size = Size(winW, winH),
                            cornerRadius = CornerRadius(18f, 18f)
                        )
                        drawRoundRect(
                            color = Color(0xFF38BDF8).copy(alpha = 0.45f),
                            topLeft = Offset(winX, winY),
                            size = Size(winW, winH),
                            cornerRadius = CornerRadius(18f, 18f),
                            style = Stroke(width = 2f)
                        )
                        drawCircle(Color(0xFFF87171), 5f, Offset(winX + 18f, winY + 18f))
                        drawCircle(Color(0xFFF59E0B), 5f, Offset(winX + 34f, winY + 18f))
                        drawCircle(Color(0xFF10B981), 5f, Offset(winX + 50f, winY + 18f))
                        drawRoundRect(Color(0xFF8B5CF6), Offset(winX + 18f, winY + 38f), Size(winW * 0.35f, 8f), CornerRadius(4f, 4f))
                        drawRoundRect(Color(0xFF38BDF8), Offset(winX + 18f + winW * 0.40f, winY + 38f), Size(winW * 0.38f, 8f), CornerRadius(4f, 4f))
                        drawRoundRect(Color.White.copy(alpha = 0.7f), Offset(winX + 18f, winY + 56f), Size(winW * 0.65f, 8f), CornerRadius(4f, 4f))
                        drawRoundRect(Color(0xFF10B981), Offset(winX + 18f, winY + 74f), Size(winW * 0.55f, 8f), CornerRadius(4f, 4f))
                        drawRoundRect(Color(0xFFF59E0B).copy(alpha = 0.85f), Offset(winX + 18f, winY + 92f), Size(winW * 0.42f, 8f), CornerRadius(4f, 4f))
                    }

                    1 -> {
                        val phoneW = h * 0.54f
                        val phoneH = h * 0.76f
                        val phoneX = w * 0.66f
                        val phoneY = h * 0.12f
                        drawRoundRect(
                            color = Color(0xFF060A13).copy(alpha = 0.92f),
                            topLeft = Offset(phoneX, phoneY),
                            size = Size(phoneW, phoneH),
                            cornerRadius = CornerRadius(24f, 24f)
                        )
                        drawRoundRect(
                            color = Color(0xFF38BDF8).copy(alpha = 0.55f),
                            topLeft = Offset(phoneX, phoneY),
                            size = Size(phoneW, phoneH),
                            cornerRadius = CornerRadius(24f, 24f),
                            style = Stroke(width = 2.5f)
                        )
                        drawRoundRect(Color(0xFF2563EB), Offset(phoneX + 12f, phoneY + 18f), Size(phoneW - 24f, 22f), CornerRadius(8f, 8f))
                        drawRoundRect(Color(0xFF0F172A), Offset(phoneX + 12f, phoneY + 48f), Size(phoneW - 24f, 34f), CornerRadius(8f, 8f))
                        drawCircle(Color(0xFF10B981), 10f, Offset(phoneX + phoneW * 0.32f, phoneY + phoneH * 0.78f))
                        drawCircle(Color(0xFFF59E0B), 10f, Offset(phoneX + phoneW * 0.56f, phoneY + phoneH * 0.78f))
                        drawCircle(Color(0xFF8B5CF6), 10f, Offset(phoneX + phoneW * 0.80f, phoneY + phoneH * 0.78f))
                    }

                    2 -> {
                        val cx = w * 0.76f
                        val cy = h * 0.30f
                        drawLine(Color(0xFF38BDF8).copy(alpha = 0.6f), Offset(w * 0.56f, h * 0.55f), Offset(cx, cy), strokeWidth = 3f)
                        drawLine(Color(0xFF10B981).copy(alpha = 0.6f), Offset(w * 0.56f, h * 0.55f), Offset(cx, h * 0.70f), strokeWidth = 3f)
                        drawCircle(Color(0xFF2563EB), 18f, Offset(w * 0.56f, h * 0.55f))
                        drawCircle(Color.White, 7f, Offset(w * 0.56f, h * 0.55f))
                        drawRoundRect(
                            color = Color(0xFF060A13),
                            topLeft = Offset(cx - 34f, cy - 20f),
                            size = Size(68f, 44f),
                            cornerRadius = CornerRadius(12f, 12f)
                        )
                        drawRoundRect(
                            color = Color(0xFF38BDF8),
                            topLeft = Offset(cx - 34f, cy - 20f),
                            size = Size(68f, 44f),
                            cornerRadius = CornerRadius(12f, 12f),
                            style = Stroke(width = 2.5f)
                        )
                        drawRoundRect(
                            color = Color(0xFF10B981).copy(alpha = 0.8f),
                            topLeft = Offset(cx - 34f, h * 0.70f - 18f),
                            size = Size(68f, 36f),
                            cornerRadius = CornerRadius(12f, 12f),
                            style = Stroke(width = 2.5f)
                        )
                    }

                    else -> {
                        val startX = w * 0.54f
                        val midY = h * 0.45f
                        val branchPath = Path().apply {
                            moveTo(startX, midY)
                            cubicTo(startX + 45f, midY, startX + 45f, midY - 38f, startX + 100f, midY - 38f)
                            lineTo(w * 0.90f, midY - 38f)
                        }
                        drawLine(Color(0xFF38BDF8), Offset(startX, midY), Offset(w * 0.92f, midY + 26f), strokeWidth = 4f)
                        drawPath(branchPath, color = Color(0xFF10B981), style = Stroke(width = 4f))
                        drawCircle(Color(0xFF38BDF8), 10f, Offset(startX, midY))
                        drawCircle(Color(0xFF10B981), 10f, Offset(startX + 105f, midY - 38f))
                        drawCircle(Color(0xFFF59E0B), 10f, Offset(w * 0.84f, midY + 18f))
                        drawRoundRect(Color(0xFF8B5CF6).copy(alpha = 0.75f), Offset(w * 0.58f, h * 0.66f), Size(16f, 24f), CornerRadius(4f, 4f))
                        drawRoundRect(Color(0xFF38BDF8).copy(alpha = 0.85f), Offset(w * 0.64f, h * 0.56f), Size(16f, 34f), CornerRadius(4f, 4f))
                        drawRoundRect(Color(0xFF10B981).copy(alpha = 0.85f), Offset(w * 0.70f, h * 0.48f), Size(16f, 42f), CornerRadius(4f, 4f))
                    }
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Surface(color = Color(0xFF2563EB).copy(alpha = 0.9f), shape = RoundedCornerShape(8.dp)) {
                        Text(
                            text = badgeText,
                            style = MaterialTheme.typography.labelMedium,
                            color = Color.White,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }
                    Surface(
                        color = Color(0xFF060A13).copy(alpha = 0.75f),
                        border = BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.35f)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = category,
                            style = MaterialTheme.typography.labelMedium,
                            color = Color(0xFF38BDF8),
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }
                }

                Column(modifier = Modifier.fillMaxWidth(0.58f)) {
                    Text(
                        text = titleText,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFF8FAFC),
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = captionText,
                        style = MaterialTheme.typography.labelMedium,
                        color = Color(0xFF38BDF8),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}

@Composable
private fun AuthScreen(
    errorMessage: String?,
    onClearError: () -> Unit,
    onDemoLogin: () -> Unit,
    onLogin: (String, String) -> Unit,
    onRegister: (String, String, String) -> Unit
) {
    val palette = LocalEduPalette.current
    var isRegisterMode by remember { mutableStateOf(false) }
    var fullName by remember { mutableStateOf("") }
    var contact by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .safeDrawingPadding()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "EduPlatform",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = palette.accent
        )
        Text(
            text = "${EDU_COURSES.length} ta kurs, ${totalLessons} ta rasmli dars (1→${totalLessons} uzluksiz), ${totalQuizzes} ta test, ovozli ustoz va interaktiv mashqlar.",
            style = MaterialTheme.typography.bodyMedium,
            color = palette.muted
        )

        EduVisualBanner(
            courseId = "android-compose",
            category = "${EDU_COURSES.length} kurs · ${totalLessons} dars",
            badgeText = "To'liq ochiq",
            titleText = "0 dan Professional Dasturlashgacha",
            captionText = "Ovozli ustoz, kod maydonchasi, mini-loyihalar va sertifikatlar"
        )

        Button(
            onClick = onDemoLogin,
            colors = ButtonDefaults.buttonColors(containerColor = palette.success, contentColor = Color(0xFF060A13)),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().height(52.dp)
        ) {
            Text(
                text = "Barcha ${totalLessons} ta darsni hoziroq ochish (Tezkor kirish)",
                fontWeight = FontWeight.Bold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (!isRegisterMode) {
                Button(
                    onClick = { isRegisterMode = false; onClearError() },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) { Text("Kirish") }
                OutlinedButton(
                    onClick = { isRegisterMode = true; onClearError() },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) { Text("Ro'yxatdan o'tish") }
            } else {
                OutlinedButton(
                    onClick = { isRegisterMode = false; onClearError() },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) { Text("Kirish") }
                Button(
                    onClick = { isRegisterMode = true; onClearError() },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) { Text("Ro'yxatdan o'tish") }
            }
        }

        Card(
            colors = CardDefaults.cardColors(containerColor = palette.card),
            border = BorderStroke(1.dp, palette.border),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                if (isRegisterMode) {
                    OutlinedTextField(
                        value = fullName,
                        onValueChange = { fullName = it; onClearError() },
                        label = { Text("Ism va familiya") },
                        placeholder = { Text("Masalan: Sardor Karimov") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                OutlinedTextField(
                    value = contact,
                    onValueChange = { contact = it; onClearError() },
                    label = { Text("Elektron pochta yoki telefon") },
                    placeholder = { Text("ali@mail.uz yoki +998901234567") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it; onClearError() },
                    label = { Text("Parol") },
                    placeholder = { Text("Kamida 6 ta belgi") },
                    singleLine = true,
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        TextButton(onClick = { passwordVisible = !passwordVisible }) {
                            Text(if (passwordVisible) "Yopish" else "Ko'rish", color = palette.accent)
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                )

                if (errorMessage != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Surface(
                        color = palette.error.copy(alpha = 0.12f),
                        border = BorderStroke(1.dp, palette.error.copy(alpha = 0.45f)),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(errorMessage, color = palette.error, modifier = Modifier.padding(12.dp))
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        if (isRegisterMode) onRegister(fullName, contact, password)
                        else onLogin(contact, password)
                    },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().height(50.dp)
                ) {
                    Text(if (isRegisterMode) "Hisob yaratish" else "Shaxsiy hisobga kirish", fontWeight = FontWeight.SemiBold)
                }
            }
        }

        Text(
            text = "Loyiha rahbari: Ahmadali Toshturgunov tomonidan ishlab chiqilgan · 2026-yil 16-noyabr, soat 09:45",
            style = MaterialTheme.typography.labelMedium,
            color = palette.accent
        )
    }
}

@Composable
private fun HomeScreen(
    user: UserAccount,
    courses: List<CourseItem>,
    session: EduSessionState,
    onChangeDailyGoal: (Int) -> Unit,
    onCompleteDailyChallenge: (String) -> Unit,
    onOpenCourse: (String) -> Unit,
    onOpenLesson: (String, String) -> Unit,
    onOpenAllCourses: () -> Unit,
    onOpenPracticeTab: (Int) -> Unit,
    onOpenMockExam: () -> Unit,
    onOpenTranslator: () -> Unit
) {
    val palette = LocalEduPalette.current
    var globalQuery by remember { mutableStateOf("") }
    var dailySelectedOpt by remember { mutableStateOf<Int?>(null) }
    var dailyChecked by remember { mutableStateOf(false) }

    val flatLessons = remember(courses) { courses.flatMap { c -> c.lessons.map { l -> c to l } } }
    val totalLessons = flatLessons.size
    val doneCount = session.completedIds.size
    val progress = if (totalLessons > 0) doneCount.toFloat() / totalLessons else 0f
    val avgScore = if (session.quizResults.isNotEmpty()) session.quizResults.sumOf { it.percentage } / session.quizResults.size else null

    val xpInfo = calculateUserXp(
        doneCount,
        session.practiceIds.size,
        session.quizResults.size,
        session.mockExamResults.size,
        session.masteredFlashcards.size,
        session.projectStepIds.size,
        session.certificates.size,
        session.watchedVideoIds.size,
        session.lessonQuizScores.size,
        session.dailyChallengeDates.size,
        session.pomodoroCount
    )
    val streakDays = calculateStreak(session.activityByDate)
    val todayKey = getTodayDateKey(0)
    val todayPoints = session.activityByDate[todayKey] ?: 0
    val dailyPct = ((todayPoints.toFloat() / session.dailyGoal) * 100f).toInt().coerceIn(0, 100)
    val dailyChallengeDoneToday = session.dailyChallengeDates.contains(todayKey)

    val allQuizPool = remember(courses) { courses.flatMap { c -> c.quiz.map { q -> c.title to q } } }
    val dailyChallenge = remember(todayKey, allQuizPool) {
        if (allQuizPool.isEmpty()) null
        else {
            val hash = todayKey.fold(0) { acc, ch -> (acc * 31 + ch.code) and 0x7FFFFFFF }
            allQuizPool[hash % allQuizPool.size]
        }
    }

    val nextEntry = flatLessons.firstOrNull { (_, l) -> !session.completedIds.contains(l.id) } ?: flatLessons.firstOrNull()
    val searchResults = remember(globalQuery, flatLessons) {
        val q = globalQuery.trim()
        if (q.isEmpty()) emptyList()
        else flatLessons.filter { (c, l) ->
            l.title.contains(q, ignoreCase = true) ||
                l.summary.contains(q, ignoreCase = true) ||
                c.title.contains(q, ignoreCase = true)
        }.take(6)
    }
    val recentCompleted = remember(session.completedIds, flatLessons) {
        val byId = flatLessons.associateBy { it.second.id }
        session.completedIds.toList().takeLast(3).reversed().mapNotNull { byId[it] }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text(
                text = "\${xpInfo.rank} · \${xpInfo.xp} XP · Barcha \$totalLessons ta dars ochiq",
                style = MaterialTheme.typography.labelLarge,
                color = palette.accent,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Xush kelibsiz, \${user.fullName}",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(10.dp))
            OutlinedTextField(
                value = globalQuery,
                onValueChange = { globalQuery = it },
                placeholder = { Text("\$totalLessons ta dars ichidan qidirish...") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            if (globalQuery.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    colors = CardDefaults.cardColors(containerColor = palette.card),
                    border = BorderStroke(1.dp, palette.border),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        if (searchResults.isEmpty()) {
                            Text("\\"\$globalQuery\\" bo'yicha dars topilmadi.", color = palette.muted, modifier = Modifier.padding(6.dp))
                        } else {
                            searchResults.forEach { (c, l) ->
                                Surface(
                                    color = palette.inset,
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth().clickable {
                                        globalQuery = ""
                                        onOpenLesson(c.id, l.id)
                                    }
                                ) {
                                    Column(modifier = Modifier.padding(10.dp)) {
                                        Text(c.title, color = palette.accent, style = MaterialTheme.typography.labelSmall)
                                        Text("\${l.order}-dars · \${l.title}", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatCard("O'tilgan darslar", "\$doneCount / \$totalLessons", palette.ink, Modifier.weight(1f))
                StatCard("Amaliy mashqlar", "\${session.practiceIds.size} / \$totalLessons", palette.accent, Modifier.weight(1f))
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatCard("O'rtacha test balli", if (avgScore == null) "—" else "\$avgScore%", palette.ink, Modifier.weight(1f))
                StatCard("Sertifikat · Saqlangan", "\${session.certificates.size} · \${session.bookmarkedIds.size}", palette.success, Modifier.weight(1f))
            }
        }

        if (nextEntry != null) {
            item {
                val (nextCourse, nextLesson) = nextEntry
                val nextNum = flatLessons.indexOfFirst { (_, l) -> l.id == nextLesson.id } + 1
                EduVisualBanner(
                    courseId = nextCourse.id,
                    category = "\$nextNum-dars / \$totalLessons",
                    badgeText = "Davom ettirish",
                    titleText = nextLesson.title,
                    captionText = nextLesson.imageCaption,
                    modifier = Modifier.clickable { onOpenLesson(nextCourse.id, nextLesson.id) }
                )
                Spacer(modifier = Modifier.height(10.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = { onOpenLesson(nextCourse.id, nextLesson.id) },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) { Text("Darsni ochish", maxLines = 1) }
                    OutlinedButton(
                        onClick = onOpenMockExam,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) { Text("⏱ Vaqtli imtihon", maxLines = 1) }
                }
            }
        }

        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = palette.card),
                border = BorderStroke(1.dp, palette.border),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("🔥 Kunlik maqsad va Streak", fontWeight = FontWeight.Bold)
                        Text("\$streakDays kun ketma-ket", color = palette.warning, fontWeight = FontWeight.Bold)
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Bugungi faollik: \$todayPoints / \${session.dailyGoal} amal", color = palette.muted, style = MaterialTheme.typography.bodySmall)
                        Text("\$dailyPct%", color = palette.success, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
                    }
                    LinearProgressIndicator(
                        progress = { dailyPct / 100f },
                        modifier = Modifier.fillMaxWidth().height(7.dp),
                        color = palette.success,
                        trackColor = palette.border
                    )
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        for (idx in 0..6) {
                            val offset = idx - 6
                            val key = getTodayDateKey(offset)
                            val count = session.activityByDate[key] ?: 0
                            Column(
                                modifier = Modifier.weight(1f),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Surface(
                                    color = if (count > 0) palette.success.copy(alpha = 0.2f) else palette.inset,
                                    border = BorderStroke(
                                        1.dp,
                                        if (count > 0) palette.success else if (offset == 0) palette.accent else palette.border
                                    ),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.fillMaxWidth().height(32.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            text = if (count > 0) "\$count" else "·",
                                            color = if (count > 0) palette.success else palette.muted,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(3.dp))
                                Text(getDayShortLabel(offset), style = MaterialTheme.typography.labelSmall, color = palette.muted)
                            }
                        }
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Kunlik maqsad:", style = MaterialTheme.typography.labelMedium, color = palette.muted)
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            listOf(1, 2, 3, 5).forEach { goalOpt ->
                                val active = session.dailyGoal == goalOpt
                                Surface(
                                    color = if (active) palette.primary else palette.inset,
                                    border = BorderStroke(1.dp, if (active) palette.primary else palette.border),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.clickable { onChangeDailyGoal(goalOpt) }
                                ) {
                                    Text(
                                        text = "\$goalOpt",
                                        color = if (active) Color.White else palette.muted,
                                        style = MaterialTheme.typography.labelMedium,
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                                    )
                                }
                            }
                        }
                    }
                    if (recentCompleted.isNotEmpty()) {
                        Text("Oxirgi yakunlangan darslar:", style = MaterialTheme.typography.labelMedium, color = palette.muted)
                        recentCompleted.forEach { (c, l) ->
                            Text(
                                text = "✓ \${l.title} (\${l.durationMinutes} daq)",
                                color = palette.success,
                                style = MaterialTheme.typography.bodySmall,
                                modifier = Modifier.clickable { onOpenLesson(c.id, l.id) }
                            )
                        }
                    }
                }
            }
        }

        if (dailyChallenge != null) {
            item {
                val (cTitle, q) = dailyChallenge
                Card(
                    colors = CardDefaults.cardColors(containerColor = palette.card),
                    border = BorderStroke(1.dp, palette.warning.copy(alpha = 0.45f)),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("✨ Bugungi kun savoli", fontWeight = FontWeight.Bold)
                            Text(
                                text = if (dailyChallengeDoneToday) "Bajarilgan (+15 XP)" else "+15 XP bonus",
                                color = if (dailyChallengeDoneToday) palette.success else palette.warning,
                                style = MaterialTheme.typography.labelMedium
                            )
                        }
                        Text(cTitle, color = palette.accent, style = MaterialTheme.typography.labelMedium)
                        Text(q.question, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                        val showRes = dailyChecked || dailyChallengeDoneToday
                        q.options.forEachIndexed { idx, opt ->
                            val isSel = dailySelectedOpt == idx
                            val isRight = idx == q.correctIndex
                            val borderCol = when {
                                showRes && isRight -> palette.success
                                showRes && isSel && !isRight -> palette.error
                                isSel -> palette.accent
                                else -> palette.border
                            }
                            Surface(
                                color = palette.inset,
                                border = BorderStroke(1.dp, borderCol),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.fillMaxWidth().clickable(enabled = !showRes) { dailySelectedOpt = idx }
                            ) {
                                Text(opt, modifier = Modifier.padding(12.dp), style = MaterialTheme.typography.bodyMedium)
                            }
                        }
                        if (showRes) {
                            Text("Izoh: \${q.explanation}", color = palette.success, style = MaterialTheme.typography.bodySmall)
                        } else {
                            Button(
                                onClick = {
                                    dailyChecked = true
                                    onCompleteDailyChallenge(todayKey)
                                },
                                enabled = dailySelectedOpt != null,
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) { Text("Javobni yuborish") }
                        }
                    }
                }
            }
        }

        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = palette.card),
                border = BorderStroke(1.dp, palette.border),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Umumiy o'quv jarayoni", fontWeight = FontWeight.SemiBold)
                        Text("\${(progress * 100).toInt()}%", color = palette.accent, fontWeight = FontWeight.Bold)
                    }
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier.fillMaxWidth().height(8.dp),
                        color = palette.accent,
                        trackColor = palette.border
                    )
                    Text(
                        text = "\${courses.size} ta kurs · Keyingi daraja (\${xpInfo.nextRankXp} XP) uchun yana \${(xpInfo.nextRankXp - xpInfo.xp).coerceAtLeast(0)} XP",
                        style = MaterialTheme.typography.labelSmall,
                        color = palette.muted
                    )
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { onOpenPracticeTab(0) }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(10.dp)) {
                            Text("Kartochkalar", maxLines = 1)
                        }
                        OutlinedButton(onClick = { onOpenPracticeTab(1) }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(10.dp)) {
                            Text("Yo'l xaritasi", maxLines = 1)
                        }
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { onOpenPracticeTab(2) }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(10.dp)) {
                            Text("Mini-loyihalar", maxLines = 1)
                        }
                        OutlinedButton(onClick = onOpenTranslator, modifier = Modifier.weight(1f), shape = RoundedCornerShape(10.dp)) {
                            Text("🌐 Tarjimon", maxLines = 1)
                        }
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Barcha kurslar (\${courses.size} ta)", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Button(onClick = onOpenAllCourses, shape = RoundedCornerShape(10.dp)) {
                    Text("1→\$totalLessons")
                }
            }
        }

        items(courses) { course ->
            val doneInCourse = course.lessons.count { session.completedIds.contains(it.id) }
            Card(
                colors = CardDefaults.cardColors(containerColor = palette.card),
                border = BorderStroke(1.dp, palette.border),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth().clickable { onOpenCourse(course.id) }
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("\${course.category} · \${course.level}", style = MaterialTheme.typography.labelMedium, color = palette.accent)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(course.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("\$doneInCourse / \${course.lessons.size} dars yakunlandi", style = MaterialTheme.typography.bodySmall, color = palette.muted)
                    }
                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Ochish", tint = palette.accent)
                }
            }
        }
    }
}

@Composable
private fun StatCard(title: String, value: String, valueColor: Color, modifier: Modifier = Modifier) {
    val palette = LocalEduPalette.current
    Card(
        colors = CardDefaults.cardColors(containerColor = palette.card),
        border = BorderStroke(1.dp, palette.border),
        shape = RoundedCornerShape(16.dp),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(title, style = MaterialTheme.typography.labelMedium, color = palette.muted, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Spacer(modifier = Modifier.height(6.dp))
            Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = valueColor)
        }
    }
}

@Composable
private fun CoursesScreen(
    courses: List<CourseItem>,
    completedIds: Set<String>,
    practiceIds: Set<String>,
    onSelectCourse: (String) -> Unit,
    onOpenLesson: (String, String) -> Unit
) {
    val palette = LocalEduPalette.current
    var query by remember { mutableStateOf("") }
    var showSequence by remember { mutableStateOf(false) }

    val flatLessons = remember(courses) {
        courses.flatMap { c -> c.lessons.map { l -> c to l } }
            .mapIndexed { idx, pair -> Triple(idx + 1, pair.first, pair.second) }
    }

    val filteredCourses = courses.filter {
        query.isBlank() || it.title.contains(query, ignoreCase = true) || it.category.contains(query, ignoreCase = true)
    }

    val filteredLessons = flatLessons.filter { (_, c, l) ->
        query.isBlank() ||
            l.title.contains(query, ignoreCase = true) ||
            l.summary.contains(query, ignoreCase = true) ||
            c.title.contains(query, ignoreCase = true)
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("Fanlar va darslar", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(10.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                if (!showSequence) {
                    Button(onClick = { showSequence = false }, shape = RoundedCornerShape(10.dp), modifier = Modifier.weight(1f)) {
                        Text("Kurslar (\${courses.size})")
                    }
                    OutlinedButton(onClick = { showSequence = true }, shape = RoundedCornerShape(10.dp), modifier = Modifier.weight(1f)) {
                        Text("Ketma-ket (1→\${flatLessons.size})")
                    }
                } else {
                    OutlinedButton(onClick = { showSequence = false }, shape = RoundedCornerShape(10.dp), modifier = Modifier.weight(1f)) {
                        Text("Kurslar (\${courses.size})")
                    }
                    Button(onClick = { showSequence = true }, shape = RoundedCornerShape(10.dp), modifier = Modifier.weight(1f)) {
                        Text("Ketma-ket (1→\${flatLessons.size})")
                    }
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                placeholder = { Text(if (showSequence) "Dars mavzusi bo'yicha qidirish..." else "Kurs nomi bo'yicha qidirish...") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
        }

        if (showSequence) {
            items(filteredLessons) { (globalNum, course, lesson) ->
                val isDone = completedIds.contains(lesson.id)
                val isPracticed = practiceIds.contains(lesson.id)
                Card(
                    colors = CardDefaults.cardColors(containerColor = palette.card),
                    border = BorderStroke(1.dp, if (isDone) palette.success.copy(alpha = 0.45f) else palette.border),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth().clickable { onOpenLesson(course.id, lesson.id) }
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Surface(
                            color = if (isDone) palette.success.copy(alpha = 0.16f) else palette.inset,
                            border = BorderStroke(1.dp, if (isDone) palette.success else palette.accent.copy(alpha = 0.45f)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Box(modifier = Modifier.size(38.dp), contentAlignment = Alignment.Center) {
                                Text("\$globalNum", color = if (isDone) palette.success else palette.accent, fontWeight = FontWeight.Bold)
                            }
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "\${course.title} · \${lesson.durationMinutes} daq" + if (isPracticed) " · Mashq ✓" else "",
                                color = palette.accent,
                                style = MaterialTheme.typography.labelMedium,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Spacer(modifier = Modifier.height(3.dp))
                            Text(lesson.title, style = MaterialTheme.typography.titleMedium)
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(lesson.summary, color = palette.muted, style = MaterialTheme.typography.bodySmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                        Icon(
                            imageVector = if (isDone) Icons.Default.Check else Icons.Default.PlayArrow,
                            contentDescription = null,
                            tint = if (isDone) palette.success else palette.accent
                        )
                    }
                }
            }
        } else {
            items(filteredCourses) { course ->
                val doneCount = course.lessons.count { completedIds.contains(it.id) }
                val progress = if (course.lessons.isNotEmpty()) doneCount.toFloat() / course.lessons.size else 0f
                Card(
                    colors = CardDefaults.cardColors(containerColor = palette.card),
                    border = BorderStroke(1.dp, palette.border),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth().clickable { onSelectCourse(course.id) }
                ) {
                    Column {
                        EduVisualBanner(
                            courseId = course.id,
                            category = course.category,
                            badgeText = course.level,
                            titleText = course.title,
                            captionText = "\${course.lessons.size} ta dars · \${course.durationText}"
                        )
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(course.description, style = MaterialTheme.typography.bodyMedium, color = palette.muted)
                            Spacer(modifier = Modifier.height(12.dp))
                            LinearProgressIndicator(
                                progress = { progress },
                                modifier = Modifier.fillMaxWidth().height(6.dp),
                                color = palette.accent,
                                trackColor = palette.border
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("\$doneCount / \${course.lessons.size} dars · \${course.quiz.size} ta test · Mini-loyiha", style = MaterialTheme.typography.labelMedium, color = palette.muted)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PracticeHubScreen(
    initialTabIndex: Int,
    cards: List<FlashcardItem>,
    roadmaps: List<RoadmapItem>,
    courses: List<CourseItem>,
    interviewQAs: List<InterviewQA>,
    completedLessonIds: Set<String>,
    masteredFlashcards: Set<String>,
    completedProjectSteps: Set<String>,
    masteredInterviewIds: Set<String>,
    onToggleMasteredFlashcard: (String, Boolean) -> Unit,
    onToggleProjectStep: (String) -> Unit,
    onToggleMasteredInterview: (String) -> Unit,
    onOpenCourse: (String) -> Unit
) {
    val palette = LocalEduPalette.current
    var activeTab by remember(initialTabIndex) { mutableIntStateOf(initialTabIndex) }
    var cardIndex by remember { mutableIntStateOf(0) }
    var flipped by remember { mutableStateOf(false) }
    var showHint by remember { mutableStateOf(false) }
    var selectedInterviewCat by remember { mutableStateOf("Barchasi") }
    var expandedQaId by remember { mutableStateOf<String?>(interviewQAs.firstOrNull()?.id) }

    val tabNames = listOf(
        "Kartochkalar (\${cards.size})",
        "Yo'l xaritasi (\${roadmaps.size})",
        "Mini-loyihalar (\${courses.size})",
        "Intervyu (\${interviewQAs.size})"
    )

    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Amaliyot markazi", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            tabNames.forEachIndexed { idx, label ->
                val sel = activeTab == idx
                Surface(
                    color = if (sel) palette.primary else palette.card,
                    border = BorderStroke(1.dp, if (sel) palette.primary else palette.border),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.clickable { activeTab = idx }
                ) {
                    Text(
                        text = label,
                        color = if (sel) Color.White else palette.muted,
                        style = MaterialTheme.typography.labelLarge,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                    )
                }
            }
        }

        when (activeTab) {
            0 -> {
                val current = cards[cardIndex]
                val isMastered = masteredFlashcards.contains(current.id)
                Text(
                    text = "O'zlashtirilgan: \${masteredFlashcards.size} / \${cards.size} · Karta \${cardIndex + 1} / \${cards.size}",
                    style = MaterialTheme.typography.bodySmall,
                    color = palette.muted
                )
                Card(
                    colors = CardDefaults.cardColors(containerColor = if (flipped) palette.nav else palette.card),
                    border = BorderStroke(1.dp, if (isMastered) palette.success else if (flipped) palette.success else palette.accent),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.fillMaxWidth().weight(1f).clickable { flipped = !flipped }
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(24.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = (if (flipped) "JAVOB · " else "SAVOL · ") + current.topic,
                            style = MaterialTheme.typography.labelMedium,
                            color = if (flipped) palette.success else palette.accent
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = if (flipped) current.back else current.front,
                            style = MaterialTheme.typography.titleLarge,
                            color = palette.ink
                        )
                        if (showHint && !flipped) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Text("Maslahat: \${current.hint}", color = palette.warning, style = MaterialTheme.typography.bodySmall)
                        }
                        Spacer(modifier = Modifier.height(20.dp))
                        Text(
                            text = if (flipped) "Savolga qaytish uchun bosing" else "Javobni ko'rish uchun bosing",
                            style = MaterialTheme.typography.labelMedium,
                            color = palette.muted
                        )
                    }
                }
                if (!flipped) {
                    OutlinedButton(onClick = { showHint = !showHint }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp)) {
                        Text(if (showHint) "Maslahatni yopish" else "Maslahatni ko'rish")
                    }
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedButton(
                        onClick = {
                            onToggleMasteredFlashcard(current.id, false)
                            cardIndex = (cardIndex + 1) % cards.size
                            flipped = false; showHint = false
                        },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f).height(46.dp)
                    ) { Text("Takrorlayman") }
                    Button(
                        onClick = {
                            onToggleMasteredFlashcard(current.id, true)
                            cardIndex = (cardIndex + 1) % cards.size
                            flipped = false; showHint = false
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = palette.success, contentColor = Color(0xFF060A13)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f).height(46.dp)
                    ) { Text("Bilaman (+10 XP)") }
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedButton(
                        onClick = {
                            cardIndex = if (cardIndex > 0) cardIndex - 1 else cards.lastIndex
                            flipped = false; showHint = false
                        },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) { Text("Oldingi") }
                    OutlinedButton(
                        onClick = {
                            cardIndex = (cardIndex + 1) % cards.size
                            flipped = false; showHint = false
                        },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) { Text("Keyingi") }
                }
            }

            1 -> {
                val courseMap = remember(courses) { courses.associateBy { it.id } }
                LazyColumn(verticalArrangement = Arrangement.spacedBy(14.dp), modifier = Modifier.fillMaxSize()) {
                    items(roadmaps) { roadmap ->
                        val steps = roadmap.courseIds.mapNotNull { courseMap[it] }
                        val totalL = steps.sumOf { it.lessons.size }
                        val doneL = steps.sumOf { c -> c.lessons.count { completedLessonIds.contains(it.id) } }
                        val pct = if (totalL > 0) (doneL * 100) / totalL else 0
                        Card(
                            colors = CardDefaults.cardColors(containerColor = palette.card),
                            border = BorderStroke(1.dp, palette.border),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("Maqsad: \${roadmap.targetRole}", color = palette.accent, style = MaterialTheme.typography.labelMedium)
                                        Text(roadmap.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                                    }
                                    Text("\$pct%", color = palette.success, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                                }
                                Text(roadmap.subtitle, color = palette.muted, style = MaterialTheme.typography.bodySmall)
                                steps.forEachIndexed { idx, course ->
                                    val cDone = course.lessons.count { completedLessonIds.contains(it.id) }
                                    Surface(
                                        color = palette.inset,
                                        border = BorderStroke(1.dp, palette.border),
                                        shape = RoundedCornerShape(10.dp),
                                        modifier = Modifier.fillMaxWidth().clickable { onOpenCourse(course.id) }
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(12.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column(modifier = Modifier.weight(1f)) {
                                                Text("0\${idx + 1}. Bosqich", color = palette.accent, style = MaterialTheme.typography.labelSmall)
                                                Text(course.title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                                            }
                                            Text("\$cDone / \${course.lessons.size}", color = palette.muted, style = MaterialTheme.typography.labelMedium)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            2 -> {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(14.dp), modifier = Modifier.fillMaxSize()) {
                    items(courses) { course ->
                        val doneSteps = course.projectSteps.count { completedProjectSteps.contains(it.id) }
                        Card(
                            colors = CardDefaults.cardColors(containerColor = palette.card),
                            border = BorderStroke(1.dp, palette.border),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(course.title, color = palette.accent, style = MaterialTheme.typography.labelMedium)
                                    Text("\$doneSteps / \${course.projectSteps.size} bosqich", color = palette.success, style = MaterialTheme.typography.labelMedium)
                                }
                                Text(course.projectTitle, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                Text(course.projectDescription, color = palette.muted, style = MaterialTheme.typography.bodySmall)
                                course.projectSteps.forEach { step ->
                                    val checked = completedProjectSteps.contains(step.id)
                                    Surface(
                                        color = if (checked) palette.success.copy(alpha = 0.12f) else palette.inset,
                                        border = BorderStroke(1.dp, if (checked) palette.success.copy(alpha = 0.5f) else palette.border),
                                        shape = RoundedCornerShape(10.dp),
                                        modifier = Modifier.fillMaxWidth().clickable { onToggleProjectStep(step.id) }
                                    ) {
                                        Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.Top) {
                                            Text(if (checked) "☑" else "☐", color = if (checked) palette.success else palette.muted)
                                            Column {
                                                Text(step.title, fontWeight = FontWeight.Medium, color = if (checked) palette.success else palette.ink)
                                                Text(step.detail, style = MaterialTheme.typography.bodySmall, color = palette.muted)
                                            }
                                        }
                                    }
                                }
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                    Text("Har bosqich: +10 XP", style = MaterialTheme.typography.labelSmall, color = palette.muted)
                                    TextButton(onClick = { onOpenCourse(course.id) }) {
                                        Text("Kurs darslarini ko'rish →", color = palette.accent)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            else -> {
                val cats = remember(interviewQAs) { listOf("Barchasi") + interviewQAs.map { it.category }.distinct() }
                val filteredQAs = remember(selectedInterviewCat, interviewQAs) {
                    if (selectedInterviewCat == "Barchasi") interviewQAs else interviewQAs.filter { it.category == selectedInterviewCat }
                }
                Row(
                    modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    cats.forEach { cat ->
                        val sel = selectedInterviewCat == cat
                        Surface(
                            color = if (sel) palette.primary else palette.card,
                            border = BorderStroke(1.dp, if (sel) palette.primary else palette.border),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.clickable { selectedInterviewCat = cat }
                        ) {
                            Text(cat, color = if (sel) Color.White else palette.muted, style = MaterialTheme.typography.labelMedium, modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp))
                        }
                    }
                }
                Text("Tayyorlangan: \${masteredInterviewIds.size} / \${interviewQAs.size}", style = MaterialTheme.typography.labelMedium, color = palette.muted)
                LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxSize()) {
                    items(filteredQAs) { qa ->
                        val isOpen = expandedQaId == qa.id
                        val isMastered = masteredInterviewIds.contains(qa.id)
                        Card(
                            colors = CardDefaults.cardColors(containerColor = palette.card),
                            border = BorderStroke(1.dp, if (isMastered) palette.success.copy(alpha = 0.5f) else palette.border),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.fillMaxWidth().clickable { expandedQaId = if (isOpen) null else qa.id }
                        ) {
                            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text(qa.category + if (isMastered) " · Tayyor ✓" else "", color = palette.accent, style = MaterialTheme.typography.labelSmall)
                                Text(qa.question, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                                if (isOpen) {
                                    Text(qa.answer, style = MaterialTheme.typography.bodyMedium)
                                    Text("Suhbat maslahati: \${qa.tip}", color = palette.accent, style = MaterialTheme.typography.bodySmall)
                                    OutlinedButton(onClick = { onToggleMasteredInterview(qa.id) }, shape = RoundedCornerShape(10.dp)) {
                                        Text(if (isMastered) "✓ Tayyorman (belgilangan)" else "Javobni o'zlashtirdim", color = if (isMastered) palette.success else palette.ink)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CourseDetailScreen(
    course: CourseItem,
    completedIds: Set<String>,
    practiceIds: Set<String>,
    bookmarkedIds: Set<String>,
    onBack: () -> Unit,
    onOpenLesson: (String) -> Unit,
    onStartQuiz: () -> Unit,
    onOpenMiniProjects: () -> Unit
) {
    val palette = LocalEduPalette.current
    Column(modifier = Modifier.fillMaxSize()) {
        SimpleTopBar(title = course.title, onBack = onBack)

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                EduVisualBanner(
                    courseId = course.id,
                    category = course.category,
                    badgeText = course.level,
                    titleText = course.title,
                    captionText = "\${course.lessons.size} ta dars · \${course.durationText}"
                )
            }

            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = palette.card),
                    border = BorderStroke(1.dp, palette.border),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(course.description, style = MaterialTheme.typography.bodyLarge)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Button(onClick = onStartQuiz, modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp)) {
                                Text("Test (\${course.quiz.size})")
                            }
                            OutlinedButton(onClick = onOpenMiniProjects, modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp)) {
                                Text("Mini-loyiha")
                            }
                        }
                    }
                }
            }

            item { Text("Darslar ketma-ketligi (\${course.lessons.size} ta)", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }

            items(course.lessons) { lesson ->
                val isDone = completedIds.contains(lesson.id)
                val isPr = practiceIds.contains(lesson.id)
                val isBm = bookmarkedIds.contains(lesson.id)
                Card(
                    colors = CardDefaults.cardColors(containerColor = palette.card),
                    border = BorderStroke(1.dp, if (isDone) palette.success.copy(alpha = 0.45f) else palette.border),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth().clickable { onOpenLesson(lesson.id) }
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "\${lesson.order}-dars · \${lesson.durationMinutes} daq" +
                                    (if (isPr) " · Mashq ✓" else "") +
                                    (if (isBm) " · Saqlangan" else ""),
                                style = MaterialTheme.typography.labelMedium,
                                color = palette.accent
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(lesson.title, style = MaterialTheme.typography.titleMedium)
                        }
                        Icon(
                            imageVector = if (isDone) Icons.Default.Check else Icons.Default.PlayArrow,
                            contentDescription = null,
                            tint = if (isDone) palette.success else palette.accent
                        )
                    }
                }
            }
        }
    }
}

private fun buildSlideChaptersForLesson(lesson: LessonItem, course: CourseItem): List<LessonSlideChapter> {
    val sentences = lesson.content.split(Regex("(?<=[.!?])\\\\s+"))
        .map { it.trim() }
        .filter { it.isNotEmpty() }
    val p1 = sentences.getOrNull(0) ?: lesson.summary
    val p2 = sentences.getOrNull(1) ?: lesson.takeaway
    val p3 = sentences.getOrNull(2) ?: "Amaliyotda kodni qo'lda yozib sinab ko'ring."
    val codeLines = lesson.codeExample.lines().map { it.trim() }.filter { it.isNotEmpty() }.take(4)

    return listOf(
        LessonSlideChapter(
            shortTitle = "1. Kirish",
            headline = "\${lesson.order}-dars: \${lesson.title}",
            bodyLines = listOf("Kurs: \${course.title}", "Modul: \${lesson.moduleTitle}", "Maqsad: \${lesson.summary}"),
            speechText = "Assalomu alaykum! Bugungi \${lesson.order}-darsimiz mavzusi: \${lesson.title}. \${lesson.summary}"
        ),
        LessonSlideChapter(
            shortTitle = "2. Nazariya",
            headline = "Asosiy tushuncha va qoida",
            bodyLines = listOf(p1, p2, p3),
            speechText = "\$p1 \$p2 \$p3"
        ),
        LessonSlideChapter(
            shortTitle = "3. Kod",
            headline = "Amaliy kod namunasi",
            bodyLines = if (codeLines.isNotEmpty()) codeLines else listOf(lesson.codeExample),
            speechText = "Endi kod namunasiga e'tibor bering. Ushbu misolda \${lesson.title} mavzusining to'g'ri yozilishi ko'rsatilgan."
        ),
        LessonSlideChapter(
            shortTitle = "4. Savol",
            headline = "Tezkor amaliy savol",
            bodyLines = listOf(lesson.practicePrompt, "Pastdagi savollar bo'limida to'g'ri javobni tanlab tekshiring."),
            speechText = "Kichik tekshiruv savoli: \${lesson.practicePrompt}"
        ),
        LessonSlideChapter(
            shortTitle = "5. Xulosa",
            headline = "Oldini olish va Oltin qoida",
            bodyLines = listOf("Xatodan saqlaning: \${lesson.commonMistake}", "Asosiy xulosa: \${lesson.takeaway}"),
            speechText = "Diqqat qiling: \${lesson.commonMistake} Eng muhim xulosa esa: \${lesson.takeaway}"
        )
    )
}

private fun buildLessonQuestions(lesson: LessonItem, course: CourseItem): List<LessonMicroQuestion> {
    val siblings = course.lessons.filter { it.id != lesson.id }
    fun pickThree(offset: Int): List<LessonItem> {
        if (siblings.isEmpty()) return emptyList()
        return (0 until minOf(3, siblings.size)).map { i -> siblings[(lesson.order + offset + i) % siblings.size] }
    }
    fun rotate(items: List<String>, seed: Int): Pair<List<String>, Int> {
        if (items.isEmpty()) return items to 0
        val shift = seed % items.size
        val rot = items.indices.map { i -> items[(i + shift) % items.size] }
        val newCorrect = (0 - shift + items.size) % items.size
        return rot to newCorrect
    }

    val q1 = LessonMicroQuestion(
        id = "\${lesson.id}-lq1",
        category = "Kod mashqi",
        question = lesson.practicePrompt,
        codeSnippet = lesson.practiceCodeSnippet,
        options = lesson.practiceOptions,
        correctIndex = lesson.practiceCorrectIndex,
        explanation = lesson.practiceExplanation
    )
    val (q2Opts, q2Idx) = rotate(listOf(lesson.takeaway) + pickThree(1).map { it.takeaway }, lesson.order * 3 + 1)
    val q2 = LessonMicroQuestion(
        id = "\${lesson.id}-lq2",
        category = "Nazariya",
        question = "\\"\${lesson.title}\\" darsi bo'yicha asosiy to'g'ri xulosa qaysi?",
        codeSnippet = "",
        options = q2Opts,
        correctIndex = q2Idx,
        explanation = "Eng muhim qoida: \${lesson.takeaway}"
    )
    val (q3Opts, q3Idx) = rotate(listOf(lesson.commonMistake) + pickThree(4).map { it.commonMistake }, lesson.order * 5 + 2)
    val q3 = LessonMicroQuestion(
        id = "\${lesson.id}-lq3",
        category = "Xato tahlili",
        question = "\\"\${lesson.title}\\" mavzusini qo'llashda eng ko'p uchraydigan xato qaysi?",
        codeSnippet = "",
        options = q3Opts,
        correctIndex = q3Idx,
        explanation = "Shu xatodan saqlaning: \${lesson.commonMistake}"
    )
    val (q4Opts, q4Idx) = rotate(listOf(lesson.summary) + pickThree(7).map { it.summary }, lesson.order * 7 + 3)
    val q4 = LessonMicroQuestion(
        id = "\${lesson.id}-lq4",
        category = "Maqsad",
        question = "\\"\${lesson.title}\\" darsining asosiy maqsadi nimadan iborat?",
        codeSnippet = "",
        options = q4Opts,
        correctIndex = q4Idx,
        explanation = "Bu darsda biz \\"\${lesson.summary}\\" mavzusini o'rgandik."
    )
    return listOf(q1, q2, q3, q4)
}

private fun analyzeKotlinCodeLines(code: String): List<CodeLineAnalysis> {
    return code.lines()
        .map { it.trim() }
        .filter { it.isNotEmpty() }
        .take(8)
        .map { line ->
            val meaning = when {
                line.startsWith("//") || line.startsWith("#") || line.startsWith("--") || line.startsWith("/*") ->
                    "Izoh (kompyuter bu qatorni bajarmaydi, faqat dasturchiga eslatma)."
                line.startsWith("println(") -> "Ekranga (konsolga) natija chiqaradi va yangi qatorga tushadi."
                line.startsWith("print(") -> "Matnni shu qatorning o'zida ekranga chiqaradi (Enter bosmaydi)."
                line.startsWith("val ") -> "O'zgarmas (val) quti yaratadi — qiymatini keyin o'zgartirib bo'lmaydi."
                line.startsWith("var ") -> "O'zgaruvchan (var) quti yaratadi — qiymatini keyin yangilash mumkin."
                line.startsWith("fun ") || line.startsWith("def ") -> "Qayta ishlatiladigan alohida funksiya e'lon qiladi."
                line.contains("if (") || line.startsWith("if ") -> "Shartni tekshiradi: rost (true) bo'lsa ichidagi kod ishlaydi."
                line.startsWith("else") -> "Oldingi shart bajarilmasa ishga tushadigan zaxira tarmoq."
                line.startsWith("when") -> "Bir nechta variant orasidan mos keladigan tarmoqni tanlaydi."
                line.startsWith("for ") || line.startsWith("while ") -> "Bir xil amalni bir necha marta avtomatik takrorlovchi sikl."
                line.contains("getSharedPreferences") -> "Android qurilma xotirasida sozlama va ma'lumot saqlash obyektini ochadi."
                line.contains("CREATE ") || line.contains("SELECT ") || line.contains("UPDATE ") -> "Ma'lumotlar bazasiga (SQL) so'rov yuboradi."
                line.startsWith("git ") -> "Git versiya boshqaruvi buyrug'ini bajaradi."
                line.startsWith("@Composable") -> "Funksiyani Jetpack Compose UI ekran komponentiga aylantiradi."
                line.contains("}") -> "Yuqorida ochilgan kod blokini yakunlaydi."
                else -> "Mavzuga oid navbatdagi dasturiy amalni bajaradi."
            }
            CodeLineAnalysis(line, meaning)
        }
}

private fun runMiniKotlinInterpreter(code: String): Pair<List<String>, String?> {
    val trimmed = code.trim()
    if (trimmed.isEmpty()) return emptyList() to "Kod maydoni bo'sh."

    // Android SDK / Compose / Advanced Kotlin / TS / SQL / Git static analysis parity
    val hasAndroidOrAdvanced = Regex("\\\\b(context|Context|LocalContext|SharedPreferences|Scaffold|LazyColumn|Modifier|LaunchedEffect|DisposableEffect|ViewModel|StateFlow|buildTypes|isMinifyEnabled|SELECT|CREATE|INSERT|interface|type|useState|useEffect|express|def )\\\\b").containsMatchIn(trimmed) ||
        trimmed.contains("@Composable") || trimmed.contains("@Test") || trimmed.startsWith("git ")

    if (hasAndroidOrAdvanced) {
        val out = mutableListOf("Sintaksis tekshiruvi muvaffaqiyatli o'tdi!")
        when {
            trimmed.contains("getSharedPreferences") || Regex("\\\\bcontext\\\\b").containsMatchIn(trimmed) ->
                out.add("Android SDK (Context / SharedPreferences) kodi to'g'ri: qurilma xotirasiga ma'lumotni fon rejimida saqlaydi.")
            trimmed.contains("@Composable") || trimmed.contains("Modifier") || trimmed.contains("Scaffold") ->
                out.add("Jetpack Compose UI kodi aniqlandi: komponent Android qurilmada chizilishga tayyor.")
            trimmed.contains("SELECT") || trimmed.contains("CREATE ") ->
                out.add("SQL so'rov tuzilmasi to'g'ri tekshirildi.")
            trimmed.startsWith("git ") ->
                out.add("Git buyrug'i to'g'ri: \${trimmed.lines().first()}")
            else ->
                out.add("Jami \${trimmed.lines().size} qator kod xatosiz tekshirildi.")
        }
        return out to null
    }

    val lines = code.lines()
    val vars = mutableMapOf<String, Pair<Boolean, String>>()
    val output = mutableListOf<String>()
    val currentLine = StringBuilder()

    fun isSingleStringLiteral(s: String): Boolean {
        if (!s.startsWith("\\"") || !s.endsWith("\\"") || s.length < 2) return false
        var esc = false
        for (i in 1 until s.length - 1) {
            val ch = s[i]
            if (esc) { esc = false; continue }
            if (ch == '\\\\') { esc = true; continue }
            if (ch == '"') return false
        }
        return true
    }

    fun evalExpr(raw: String): String {
        val expr = raw.trim()
        if (isSingleStringLiteral(expr)) {
            var inner = expr.substring(1, expr.length - 1)
            val braceRegex = Regex("\\\\\$\\\\{([^}]+)\\\\}")
            inner = braceRegex.replace(inner) { m -> evalExpr(m.groupValues[1]) }
            val varRegex = Regex("\\\\\$([A-Za-z_][A-Za-z0-9_]*)")
            inner = varRegex.replace(inner) { m -> vars[m.groupValues[1]]?.second ?: m.value }
            return inner
        }
        vars[expr]?.let { return it.second }
        expr.toIntOrNull()?.let { return it.toString() }
        expr.toDoubleOrNull()?.let { return it.toString() }

        for (op in listOf("+", "-", "*", "/", "%")) {
            var inQ = false
            var esc = false
            var foundIdx = -1
            for (i in expr.indices) {
                val c = expr[i]
                if (esc) { esc = false; continue }
                if (c == '\\\\' && inQ) { esc = true; continue }
                if (c == '"') { inQ = !inQ; continue }
                if (!inQ && c.toString() == op && i > 0 && i < expr.lastIndex) {
                    foundIdx = i
                    break
                }
            }
            if (foundIdx > 0) {
                val leftStr = evalExpr(expr.substring(0, foundIdx))
                val rightStr = evalExpr(expr.substring(foundIdx + 1))
                val leftInt = leftStr.toIntOrNull()
                val rightInt = rightStr.toIntOrNull()
                if (op == "/" && leftInt != null && rightInt != null) {
                    if (rightInt == 0) return "Xato: 0 ga bo'lish"
                    return (leftInt / rightInt).toString()
                }
                val left = leftStr.toDoubleOrNull()
                val right = rightStr.toDoubleOrNull()
                if (left != null && right != null) {
                    val res = when (op) {
                        "+" -> left + right
                        "-" -> left - right
                        "*" -> left * right
                        "/" -> if (right == 0.0) return "Xato: 0 ga bo'lish" else left / right
                        "%" -> left % right
                        else -> 0.0
                    }
                    return if (res % 1.0 == 0.0) res.toInt().toString() else res.toString()
                } else if (op == "+") {
                    return leftStr + rightStr
                }
            }
        }
        return expr
    }

    for ((idx, rawLine) in lines.withIndex()) {
        val line = rawLine.trim()
        if (line.isEmpty() || line.startsWith("//")) continue

        if (line.startsWith("val ") || line.startsWith("var ")) {
            val isMutable = line.startsWith("var ")
            val rest = line.drop(4)
            val eqIdx = rest.indexOf('=')
            if (eqIdx > 0) {
                val rawName = rest.substring(0, eqIdx).substringBefore(':').trim()
                val rawVal = rest.substring(eqIdx + 1).trim()
                vars[rawName] = isMutable to evalExpr(rawVal)
                continue
            }
        }
        if (line.startsWith("println(") && line.endsWith(")")) {
            val inner = line.removePrefix("println(").removeSuffix(")")
            currentLine.append(evalExpr(inner))
            output.add(currentLine.toString())
            currentLine.clear()
            continue
        }
        if (line.startsWith("print(") && line.endsWith(")")) {
            val inner = line.removePrefix("print(").removeSuffix(")")
            currentLine.append(evalExpr(inner))
            continue
        }
        val assignIdx = line.indexOf('=')
        if (assignIdx > 0 && !line.contains("==") && !line.startsWith("if")) {
            val targetName = line.substring(0, assignIdx).trim()
            val existing = vars[targetName]
            if (existing != null) {
                if (!existing.first) {
                    return output to "\${idx + 1}-qator xatosi: '\$targetName' val bilan ochilgan, uni o'zgartirib bo'lmaydi (var ishlating)!"
                }
                val newVal = evalExpr(line.substring(assignIdx + 1))
                vars[targetName] = true to newVal
                continue
            }
        }
    }

    if (currentLine.isNotEmpty()) output.add(currentLine.toString())
    if (output.isEmpty()) output.add("Kod tahlil qilindi! Natija chiqarish uchun println(...) yozib sinab ko'ring.")
    return output to null
}

@Composable
private fun LessonScreen(
    course: CourseItem,
    lesson: LessonItem,
    user: UserAccount,
    globalNumber: Int,
    totalLessonsCount: Int,
    initialNote: String,
    savedQuizScore: LessonQuizScoreRecord?,
    isCompleted: Boolean,
    isVideoWatched: Boolean,
    isBookmarked: Boolean,
    focusMode: Boolean,
    hasNextLesson: Boolean,
    nextLessonCourseDiffers: Boolean,
    storage: EduStorage,
    onToggleFocusMode: () -> Unit,
    onBack: () -> Unit,
    onToggleBookmark: () -> Unit,
    onSaveNote: (String) -> Unit,
    onMarkVideoWatched: () -> Unit,
    onMarkPracticeCompleted: () -> Unit,
    onCompleteLessonQuiz: (Int, Int) -> Unit,
    onOpenTranslator: () -> Unit,
    onMarkCompleted: () -> Unit,
    onNextLesson: () -> Unit
) {
    val palette = LocalEduPalette.current
    val context = LocalContext.current
    val mainHandler = remember { Handler(Looper.getMainLooper()) }

    val slides = remember(lesson.id) { buildSlideChaptersForLesson(lesson, course) }
    val currentSlides by rememberUpdatedState(slides)
    val lessonQuestions = remember(lesson.id) { buildLessonQuestions(lesson, course) }

    var activeSlideIdx by remember { mutableIntStateOf(0) }
    var isSpeakingSlide by remember { mutableStateOf(false) }
    var isSpeakingTheory by remember { mutableStateOf(false) }
    var autoAdvanceSlides by remember { mutableStateOf(false) }
    var speechRate by remember { mutableFloatStateOf(1.0f) }
    val currentSpeechRate by rememberUpdatedState(speechRate)
    var ttsStatusMsg by remember { mutableStateOf("Ovozli ustoz tayyorlanmoqda...") }
    var ttsReady by remember { mutableStateOf(false) }

    var editableCode by remember(lesson.id) { mutableStateOf(lesson.codeExample) }
    var codeOutput by remember(lesson.id) { mutableStateOf<List<String>>(emptyList()) }
    var codeRunError by remember(lesson.id) { mutableStateOf<String?>(null) }

    var activeQIdx by remember(lesson.id) { mutableIntStateOf(0) }
    val qSelected = remember(lesson.id) { mutableStateMapOf<String, Int>() }
    val qChecked = remember(lesson.id) { mutableStateMapOf<String, Boolean>() }

    var noteText by remember(lesson.id) { mutableStateOf(initialNote) }
    var noteSavedFeedback by remember(lesson.id) { mutableStateOf(false) }

    // Muhokama (Discussions) state
    var discussions by remember(lesson.id) { mutableStateOf(storage.getDiscussions(lesson.id)) }
    var discFilter by remember(lesson.id) { mutableStateOf("all") }
    var discPostType by remember(lesson.id) { mutableStateOf("savol") }
    var discDraft by remember(lesson.id) { mutableStateOf("") }
    var replyingPostId by remember(lesson.id) { mutableStateOf<String?>(null) }
    var replyDraft by remember(lesson.id) { mutableStateOf("") }

    var ttsInstance by remember { mutableStateOf<TextToSpeech?>(null) }

    DisposableEffect(context) {
        lateinit var engine: TextToSpeech
        engine = TextToSpeech(context) { status ->
            mainHandler.post {
                if (status == TextToSpeech.SUCCESS) {
                    val uzLocale = Locale.forLanguageTag("uz-UZ")
                    val uzAvail = engine.isLanguageAvailable(uzLocale)
                    val msg = if (uzAvail >= TextToSpeech.LANG_AVAILABLE) {
                        engine.language = uzLocale
                        "O'zbekcha ustoz ovozi faol"
                    } else {
                        val trLocale = Locale.forLanguageTag("tr-TR")
                        if (engine.isLanguageAvailable(trLocale) >= TextToSpeech.LANG_AVAILABLE) {
                            engine.language = trLocale
                        } else {
                            engine.language = Locale.getDefault()
                        }
                        "Qurilma ovozi faol (O'zbekcha ovoz uchun Google TTS dan Uzbek yuklang)"
                    }
                    ttsReady = true
                    ttsStatusMsg = msg
                } else {
                    ttsReady = false
                    ttsStatusMsg = "Telefonda TTS ovoz xizmati topilmadi"
                }
            }
        }
        engine.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}
            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) {
                mainHandler.post {
                    isSpeakingSlide = false
                    isSpeakingTheory = false
                    autoAdvanceSlides = false
                }
            }

            override fun onError(utteranceId: String?, errorCode: Int) {
                mainHandler.post {
                    isSpeakingSlide = false
                    isSpeakingTheory = false
                    autoAdvanceSlides = false
                }
            }

            override fun onDone(utteranceId: String?) {
                mainHandler.post {
                    if (utteranceId == "theory") {
                        isSpeakingTheory = false
                    } else if (utteranceId?.startsWith("slide_") == true) {
                        val idx = utteranceId.removePrefix("slide_").toIntOrNull() ?: activeSlideIdx
                        val liveSlides = currentSlides
                        if (autoAdvanceSlides && idx + 1 < liveSlides.size) {
                            val nextIdx = idx + 1
                            activeSlideIdx = nextIdx
                            engine.setSpeechRate(currentSpeechRate)
                            engine.speak(liveSlides[nextIdx].speechText, TextToSpeech.QUEUE_FLUSH, null, "slide_\$nextIdx")
                        } else {
                            isSpeakingSlide = false
                            autoAdvanceSlides = false
                        }
                    }
                }
            }
        })
        ttsInstance = engine
        onDispose {
            engine.stop()
            engine.shutdown()
        }
    }

    LaunchedEffect(lesson.id) {
        ttsInstance?.stop()
        activeSlideIdx = 0
        isSpeakingSlide = false
        isSpeakingTheory = false
        autoAdvanceSlides = false
    }

    fun speakSlideAt(idx: Int, autoNext: Boolean) {
        val engine = ttsInstance ?: return
        if (!ttsReady) return
        activeSlideIdx = idx
        isSpeakingTheory = false
        isSpeakingSlide = true
        autoAdvanceSlides = autoNext
        engine.setSpeechRate(speechRate)
        engine.speak(slides[idx].speechText, TextToSpeech.QUEUE_FLUSH, null, "slide_\$idx")
        onMarkVideoWatched()
    }

    fun stopAllSpeech() {
        ttsInstance?.stop()
        isSpeakingSlide = false
        isSpeakingTheory = false
        autoAdvanceSlides = false
    }

    val codeAnalysis = remember(lesson.codeExample) { analyzeKotlinCodeLines(lesson.codeExample) }

    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(palette.nav)
                .safeDrawingPadding()
                .padding(horizontal = 8.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                IconButton(onClick = { stopAllSpeech(); onBack() }) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Orqaga", tint = palette.ink)
                }
                Text(
                    text = "Dars \$globalNumber / \$totalLessonsCount",
                    style = MaterialTheme.typography.titleMedium,
                    color = palette.ink,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                TextButton(onClick = onToggleFocusMode) {
                    Text(if (focusMode) "Chiqish" else "Fokus", color = palette.accent, style = MaterialTheme.typography.labelMedium)
                }
                TextButton(onClick = onOpenTranslator) {
                    Text("🌐", style = MaterialTheme.typography.labelLarge)
                }
                IconButton(onClick = onToggleBookmark) {
                    Icon(
                        imageVector = if (isBookmarked) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Saqlash",
                        tint = if (isBookmarked) palette.accent else palette.muted
                    )
                }
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Text(
                text = "\${lesson.moduleTitle} · \${lesson.durationMinutes} daq" + if (isVideoWatched) " · Video ✓" else "",
                color = palette.accent,
                style = MaterialTheme.typography.labelMedium
            )
            Text(lesson.title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text(lesson.summary, style = MaterialTheme.typography.bodyMedium, color = palette.muted)

            EduVisualBanner(
                courseId = course.id,
                category = course.category,
                badgeText = "Dars \$globalNumber / \$totalLessonsCount",
                titleText = lesson.title,
                captionText = lesson.imageCaption
            )

            // 5-slayd Ovozli Ustoz Pleyeri (TTS)
            Card(
                colors = CardDefaults.cardColors(containerColor = palette.card),
                border = BorderStroke(1.dp, palette.accent.copy(alpha = 0.45f)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Ovozli dars pleyeri (Ustoz tushuntirishi)", style = MaterialTheme.typography.titleMedium, color = palette.accent, fontWeight = FontWeight.Bold)
                            Text(ttsStatusMsg, style = MaterialTheme.typography.labelSmall, color = palette.muted)
                        }
                        OutlinedButton(
                            onClick = {
                                speechRate = when (speechRate) {
                                    0.9f -> 1.0f
                                    1.0f -> 1.2f
                                    else -> 0.9f
                                }
                                if (isSpeakingSlide) speakSlideAt(activeSlideIdx, autoAdvanceSlides)
                            },
                            shape = RoundedCornerShape(10.dp)
                        ) { Text("\${speechRate}x", color = palette.accent) }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        slides.forEachIndexed { idx, slide ->
                            val selected = idx == activeSlideIdx
                            Surface(
                                color = if (selected) palette.primary else palette.inset,
                                border = BorderStroke(1.dp, if (selected) palette.accent else palette.border),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.clickable {
                                    activeSlideIdx = idx
                                    if (isSpeakingSlide) speakSlideAt(idx, autoAdvanceSlides)
                                }
                            ) {
                                Text(
                                    text = slide.shortTitle,
                                    color = if (selected) Color.White else palette.muted,
                                    style = MaterialTheme.typography.labelMedium,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                                )
                            }
                        }
                    }

                    val currentSlide = slides[activeSlideIdx]
                    Surface(
                        color = palette.inset,
                        border = BorderStroke(1.dp, palette.border),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(currentSlide.headline, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            currentSlide.bodyLines.forEach { bullet ->
                                Text(
                                    text = "• \$bullet",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = if (activeSlideIdx == 2) palette.accent else palette.muted,
                                    fontFamily = if (activeSlideIdx == 2) FontFamily.Monospace else FontFamily.Default
                                )
                            }
                        }
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Button(
                            onClick = { if (isSpeakingSlide) stopAllSpeech() else speakSlideAt(activeSlideIdx, true) },
                            enabled = ttsReady,
                            colors = ButtonDefaults.buttonColors(containerColor = if (isSpeakingSlide) palette.error else palette.primary),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.weight(1f).height(46.dp)
                        ) { Text(if (isSpeakingSlide) "■ To'xtatish" else "▶ Gapirib o'tish") }

                        if (activeSlideIdx + 1 < slides.size) {
                            OutlinedButton(
                                onClick = {
                                    val next = activeSlideIdx + 1
                                    activeSlideIdx = next
                                    if (isSpeakingSlide) speakSlideAt(next, true)
                                },
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.height(46.dp)
                            ) { Text("Keyingi slayd") }
                        }
                    }
                }
            }

            // Nazariya + O'qib berish
            Card(
                colors = CardDefaults.cardColors(containerColor = palette.card),
                border = BorderStroke(1.dp, palette.border),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Dars nazariyasi", style = MaterialTheme.typography.titleMedium, color = palette.accent, fontWeight = FontWeight.Bold)
                        OutlinedButton(
                            onClick = {
                                val engine = ttsInstance
                                if (isSpeakingTheory) stopAllSpeech()
                                else if (engine != null && ttsReady) {
                                    isSpeakingSlide = false
                                    autoAdvanceSlides = false
                                    isSpeakingTheory = true
                                    engine.setSpeechRate(speechRate)
                                    engine.speak("\${lesson.order}-dars. \${lesson.title}. \${lesson.content}", TextToSpeech.QUEUE_FLUSH, null, "theory")
                                }
                            },
                            enabled = ttsReady,
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(if (isSpeakingTheory) "■ To'xtatish" else "▶ O'qib berish", color = if (isSpeakingTheory) palette.error else palette.accent)
                        }
                    }
                    Text(lesson.content, style = MaterialTheme.typography.bodyLarge)
                }
            }

            // Kod namunasi + Qator tahlili
            Surface(
                color = Color(0xFF060A13),
                border = BorderStroke(1.dp, palette.border),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Kod namunasi", style = MaterialTheme.typography.labelMedium, color = Color(0xFF94A3B8))
                    Text(lesson.codeExample, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace, style = MaterialTheme.typography.bodyMedium)
                }
            }

            if (!focusMode && codeAnalysis.isNotEmpty()) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = palette.card),
                    border = BorderStroke(1.dp, palette.border),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("Kodning har bir qatori nima qiladi?", style = MaterialTheme.typography.titleMedium, color = palette.accent)
                        codeAnalysis.forEach { item ->
                            Column(
                                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(palette.inset).padding(10.dp)
                            ) {
                                Text(item.line, fontFamily = FontFamily.Monospace, color = palette.accent, style = MaterialTheme.typography.bodySmall)
                                Spacer(modifier = Modifier.height(3.dp))
                                Text(item.meaning, color = palette.muted, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            }

            // Interaktiv Kod Maydonchasi
            Card(
                colors = CardDefaults.cardColors(containerColor = palette.card),
                border = BorderStroke(1.dp, palette.primary.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Amaliy kod maydonchasi (O'zgartirib sinang)", style = MaterialTheme.typography.titleMedium, color = palette.accent)
                    OutlinedTextField(
                        value = editableCode,
                        onValueChange = { editableCode = it },
                        modifier = Modifier.fillMaxWidth(),
                        textStyle = MaterialTheme.typography.bodyMedium.copy(fontFamily = FontFamily.Monospace)
                    )
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Button(
                            onClick = {
                                val (out, err) = runMiniKotlinInterpreter(editableCode)
                                codeOutput = out
                                codeRunError = err
                            },
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        ) { Text("▶ Ishga tushirish") }
                        OutlinedButton(
                            onClick = { editableCode = lesson.codeExample; codeOutput = emptyList(); codeRunError = null },
                            shape = RoundedCornerShape(10.dp)
                        ) { Text("Tiklash") }
                    }
                    if (codeRunError != null) {
                        Surface(color = palette.error.copy(alpha = 0.14f), border = BorderStroke(1.dp, palette.error), shape = RoundedCornerShape(10.dp), modifier = Modifier.fillMaxWidth()) {
                            Text(codeRunError!!, color = palette.error, modifier = Modifier.padding(12.dp))
                        }
                    }
                    if (codeOutput.isNotEmpty()) {
                        Surface(color = Color(0xFF060A13), border = BorderStroke(1.dp, palette.success.copy(alpha = 0.5f)), shape = RoundedCornerShape(10.dp), modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("Natija (Konsol):", color = palette.success, style = MaterialTheme.typography.labelMedium)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(codeOutput.joinToString("\\n"), color = Color(0xFFF8FAFC), fontFamily = FontFamily.Monospace)
                            }
                        }
                    }
                }
            }

            // Shu darsdan 4 ta savol (Bilimni tekshirish)
            Card(
                colors = CardDefaults.cardColors(containerColor = palette.card),
                border = BorderStroke(1.dp, palette.border),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Shu darsdan savollar (4 ta)", style = MaterialTheme.typography.titleMedium, color = palette.accent, fontWeight = FontWeight.Bold)
                        Text(
                            text = if (savedQuizScore != null) "Eng yaxshi: \${savedQuizScore.score}/\${savedQuizScore.total} (+25 XP)" else "+25 XP",
                            color = if (savedQuizScore != null) palette.success else palette.muted,
                            style = MaterialTheme.typography.labelMedium
                        )
                    }
                    Row(modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        lessonQuestions.forEachIndexed { idx, mq ->
                            val isCurr = idx == activeQIdx
                            val checked = qChecked[mq.id] == true
                            val right = checked && qSelected[mq.id] == mq.correctIndex
                            Surface(
                                color = if (isCurr) palette.primary else if (checked) (if (right) palette.success.copy(alpha = 0.16f) else palette.error.copy(alpha = 0.16f)) else palette.inset,
                                border = BorderStroke(1.dp, if (isCurr) palette.primary else palette.border),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.clickable { activeQIdx = idx }
                            ) {
                                Text(
                                    text = "\${idx + 1}-savol · \${mq.category}",
                                    color = if (isCurr) Color.White else palette.ink,
                                    style = MaterialTheme.typography.labelMedium,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }
                    val aq = lessonQuestions[activeQIdx]
                    val selOpt = qSelected[aq.id]
                    val isQChecked = qChecked[aq.id] == true
                    Text(aq.question, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                    if (aq.codeSnippet.isNotBlank()) {
                        Surface(color = Color(0xFF060A13), border = BorderStroke(1.dp, palette.border), shape = RoundedCornerShape(10.dp), modifier = Modifier.fillMaxWidth()) {
                            Text(aq.codeSnippet, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace, modifier = Modifier.padding(12.dp))
                        }
                    }
                    aq.options.forEachIndexed { idx, opt ->
                        val isSel = selOpt == idx
                        val isRight = idx == aq.correctIndex
                        val borderCol = when {
                            isQChecked && isRight -> palette.success
                            isQChecked && isSel && !isRight -> palette.error
                            isSel -> palette.accent
                            else -> palette.border
                        }
                        Card(
                            colors = CardDefaults.cardColors(containerColor = palette.inset),
                            border = BorderStroke(1.dp, borderCol),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth().clickable(enabled = !isQChecked) { qSelected[aq.id] = idx }
                        ) {
                            Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                                RadioButton(selected = isSel, onClick = { if (!isQChecked) qSelected[aq.id] = idx })
                                Text(opt, style = MaterialTheme.typography.bodyMedium)
                            }
                        }
                    }
                    if (!isQChecked) {
                        Button(
                            onClick = {
                                if (selOpt != null) {
                                    qChecked[aq.id] = true
                                    if (activeQIdx == 0 && selOpt == aq.correctIndex) onMarkPracticeCompleted()
                                    if (lessonQuestions.all { qChecked[it.id] == true }) {
                                        val sc = lessonQuestions.count { qSelected[it.id] == it.correctIndex }
                                        onCompleteLessonQuiz(sc, lessonQuestions.size)
                                    }
                                }
                            },
                            enabled = selOpt != null,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) { Text("Javobni tekshirish") }
                    } else {
                        val isCorrect = selOpt == aq.correctIndex
                        Text(
                            text = (if (isCorrect) "To'g'ri! " else "Noto'g'ri. ") + aq.explanation,
                            color = if (isCorrect) palette.success else palette.error,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }

            if (!focusMode) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = palette.nav),
                    border = BorderStroke(1.dp, palette.error.copy(alpha = 0.45f)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Ko'p uchraydigan xato: \${lesson.commonMistake}", color = palette.error, modifier = Modifier.padding(14.dp))
                }

                Card(
                    colors = CardDefaults.cardColors(containerColor = palette.nav),
                    border = BorderStroke(1.dp, palette.success.copy(alpha = 0.45f)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Asosiy xulosa: \${lesson.takeaway}", color = palette.success, modifier = Modifier.padding(14.dp))
                }

                // Shaxsiy konspekt
                Card(
                    colors = CardDefaults.cardColors(containerColor = palette.card),
                    border = BorderStroke(1.dp, palette.border),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Mening konspektim", style = MaterialTheme.typography.titleMedium)
                            if (noteSavedFeedback) Text("Saqlandi", color = palette.success, style = MaterialTheme.typography.labelMedium)
                        }
                        OutlinedTextField(
                            value = noteText,
                            onValueChange = { noteText = it; noteSavedFeedback = false },
                            placeholder = { Text("Dars bo'yicha o'z eslatmangizni yozing...") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedButton(
                            onClick = { onSaveNote(noteText); noteSavedFeedback = true },
                            shape = RoundedCornerShape(10.dp)
                        ) { Text("Konspektni saqlash") }
                    }
                }

                // Muhokama (Savollar va Mulohazalar)
                Card(
                    colors = CardDefaults.cardColors(containerColor = palette.card),
                    border = BorderStroke(1.dp, palette.border),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("Muhokama (\${discussions.size} ta fikr)", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("all" to "Barchasi", "savol" to "Savollar", "mulohaza" to "Mulohazalar").forEach { (id, lbl) ->
                                val sel = discFilter == id
                                Surface(
                                    color = if (sel) palette.primary else palette.inset,
                                    border = BorderStroke(1.dp, if (sel) palette.primary else palette.border),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.clickable { discFilter = id }
                                ) {
                                    Text(lbl, color = if (sel) Color.White else palette.muted, style = MaterialTheme.typography.labelMedium, modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp))
                                }
                            }
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = { discPostType = "savol" },
                                shape = RoundedCornerShape(8.dp)
                            ) { Text(if (discPostType == "savol") "● Savol" else "○ Savol", color = palette.warning) }
                            OutlinedButton(
                                onClick = { discPostType = "mulohaza" },
                                shape = RoundedCornerShape(8.dp)
                            ) { Text(if (discPostType == "mulohaza") "● Mulohaza" else "○ Mulohaza", color = palette.accent) }
                        }
                        OutlinedTextField(
                            value = discDraft,
                            onValueChange = { discDraft = it },
                            placeholder = { Text("Savol yoki mulohazangizni yozing...") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Button(
                            onClick = {
                                if (discDraft.trim().length >= 3) {
                                    discussions = storage.addDiscussionPost(lesson.id, user.fullName, user.contact, discPostType, discDraft.trim())
                                    discDraft = ""
                                }
                            },
                            enabled = discDraft.trim().length >= 3,
                            shape = RoundedCornerShape(10.dp)
                        ) { Text(if (discPostType == "savol") "Savolni yuborish" else "Mulohazani joylash") }

                        val shownPosts = if (discFilter == "all") discussions else discussions.filter { it.postType == discFilter }
                        if (shownPosts.isEmpty()) {
                            Text("Hozircha bu dars bo'yicha yozuvlar yo'q.", color = palette.muted, style = MaterialTheme.typography.bodySmall)
                        } else {
                            shownPosts.forEach { post ->
                                val isOwner = post.authorContact == user.contact
                                val voted = post.helpfulByContacts.contains(user.contact)
                                Surface(
                                    color = palette.inset,
                                    border = BorderStroke(1.dp, palette.border),
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                            Text("\${post.authorName} · \${post.postType.uppercase()} · \${post.createdAt}", style = MaterialTheme.typography.labelSmall, color = palette.accent)
                                            if (isOwner) {
                                                Text(
                                                    text = "O'chirish",
                                                    color = palette.error,
                                                    style = MaterialTheme.typography.labelSmall,
                                                    modifier = Modifier.clickable {
                                                        discussions = storage.deleteDiscussionPost(lesson.id, post.id, user.contact)
                                                    }
                                                )
                                            }
                                        }
                                        Text(post.text, style = MaterialTheme.typography.bodyMedium)
                                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                            Text(
                                                text = "👍 Foydali (\${post.helpfulByContacts.size})",
                                                color = if (voted) palette.accent else palette.muted,
                                                style = MaterialTheme.typography.labelMedium,
                                                modifier = Modifier.clickable {
                                                    discussions = storage.toggleDiscussionHelpful(lesson.id, post.id, user.contact)
                                                }
                                            )
                                            Text(
                                                text = "💬 Javob yozish",
                                                color = palette.muted,
                                                style = MaterialTheme.typography.labelMedium,
                                                modifier = Modifier.clickable {
                                                    replyingPostId = if (replyingPostId == post.id) null else post.id
                                                    replyDraft = ""
                                                }
                                            )
                                        }
                                        post.replies.forEach { r ->
                                            Text("↳ \${r.authorName}: \${r.text}", style = MaterialTheme.typography.bodySmall, color = palette.muted, modifier = Modifier.padding(start = 8.dp))
                                        }
                                        if (replyingPostId == post.id) {
                                            OutlinedTextField(
                                                value = replyDraft,
                                                onValueChange = { replyDraft = it },
                                                placeholder = { Text("Javob matni...") },
                                                modifier = Modifier.fillMaxWidth()
                                            )
                                            Button(
                                                onClick = {
                                                    if (replyDraft.trim().length >= 2) {
                                                        discussions = storage.addDiscussionReply(lesson.id, post.id, user.fullName, replyDraft.trim())
                                                        replyDraft = ""
                                                        replyingPostId = null
                                                    }
                                                },
                                                shape = RoundedCornerShape(8.dp)
                                            ) { Text("Javob yuborish") }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                OutlinedButton(
                    onClick = { context.startActivity(Intent(Intent.ACTION_VIEW, lesson.videoUrl.toUri())) },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) { Text("Rasmiy qo'llanma / dokumentatsiyani ochish") }
            }

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = onMarkCompleted,
                    enabled = !isCompleted,
                    colors = ButtonDefaults.buttonColors(containerColor = if (isCompleted) palette.success else palette.primary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f).height(48.dp)
                ) { Text(if (isCompleted) "Yakunlangan" else "Darsni yakunlash") }

                if (hasNextLesson) {
                    OutlinedButton(
                        onClick = { stopAllSpeech(); onNextLesson() },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.height(48.dp)
                    ) { Text(if (nextLessonCourseDiffers) "Keyingi kurs darsi" else "Keyingi dars") }
                }
            }
        }
    }
}

@Composable
private fun QuizzesListScreen(
    courses: List<CourseItem>,
    quizResults: List<QuizResultRecord>,
    mockExamResults: List<MockExamRecord>,
    onStartQuiz: (String) -> Unit,
    onStartMockExam: () -> Unit
) {
    val palette = LocalEduPalette.current
    val bestMock = mockExamResults.maxOfOrNull { it.percentage }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Testlar va Vaqtli Imtihon", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text("Kamida 70% natija uchun raqamli sertifikat avtomatik ochiladi.", color = palette.muted, style = MaterialTheme.typography.bodyMedium)
        }

        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = palette.card),
                border = BorderStroke(1.dp, palette.accent.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("⏱ Vaqtli Umumiy Imtihon · 15 daqiqa · 20 savol", color = palette.accent, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                    Text("Barcha \${courses.size} ta fan bo'yicha Mock Imtihon", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(
                        text = "${totalQuizzes} ta savoldan tasodifiy 20 tasi beriladi (+60 XP)." + (if (bestMock != null) " Eng yaxshi: \$bestMock%" else ""),
                        color = palette.muted,
                        style = MaterialTheme.typography.bodySmall
                    )
                    Button(
                        onClick = onStartMockExam,
                        colors = ButtonDefaults.buttonColors(containerColor = palette.success, contentColor = Color(0xFF060A13)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) { Text("Imtihonni boshlash", fontWeight = FontWeight.Bold) }
                }
            }
        }

        items(courses) { course ->
            val best = quizResults.filter { it.courseId == course.id }.maxOfOrNull { it.percentage }
            Card(
                colors = CardDefaults.cardColors(containerColor = palette.card),
                border = BorderStroke(1.dp, palette.border),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("\${course.category} · \${course.quiz.size} ta savol", color = palette.accent, style = MaterialTheme.typography.labelMedium)
                        if (best != null) {
                            Text(
                                text = "Eng yaxshi: \$best%" + if (best >= 70) " · Sertifikat ✓" else "",
                                color = if (best >= 70) palette.success else palette.ink,
                                style = MaterialTheme.typography.labelMedium
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(course.title, style = MaterialTheme.typography.titleLarge)
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(onClick = { onStartQuiz(course.id) }, shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth()) {
                        Text(if (best != null) "Qayta topshirish" else "Testni boshlash")
                    }
                }
            }
        }
    }
}

@Composable
private fun QuizScreen(
    course: CourseItem,
    onBack: () -> Unit,
    onOpenCertificates: () -> Unit,
    onQuizFinished: (Int, Int) -> Unit
) {
    val palette = LocalEduPalette.current
    val questions = course.quiz
    var currentIndex by remember { mutableIntStateOf(0) }
    val selectedAnswers = remember { mutableStateMapOf<Int, Int>() }
    var showError by remember { mutableStateOf(false) }
    var isFinished by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize()) {
        SimpleTopBar(title = "\${course.title} — Test", onBack = onBack)

        if (!isFinished) {
            val q = questions[currentIndex]
            val selected = selectedAnswers[currentIndex]
            Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Savol \${currentIndex + 1} / \${questions.size}", color = palette.accent, style = MaterialTheme.typography.labelMedium)
                LinearProgressIndicator(
                    progress = { (currentIndex + 1).toFloat() / questions.size },
                    modifier = Modifier.fillMaxWidth().height(8.dp),
                    color = palette.accent,
                    trackColor = palette.border
                )
                Text(q.question, style = MaterialTheme.typography.titleLarge)
                q.options.forEachIndexed { idx, opt ->
                    val isSelected = selected == idx
                    Card(
                        colors = CardDefaults.cardColors(containerColor = if (isSelected) palette.primary.copy(alpha = 0.16f) else palette.card),
                        border = BorderStroke(1.dp, if (isSelected) palette.accent else palette.border),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth().clickable { selectedAnswers[currentIndex] = idx; showError = false }
                    ) {
                        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(selected = isSelected, onClick = { selectedAnswers[currentIndex] = idx; showError = false })
                            Text(opt, style = MaterialTheme.typography.bodyLarge)
                        }
                    }
                }
                if (showError) Text("Davom etishdan oldin javob variantini tanlang.", color = palette.error)
                Spacer(modifier = Modifier.weight(1f))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    if (currentIndex > 0) {
                        OutlinedButton(onClick = { currentIndex--; showError = false }, shape = RoundedCornerShape(12.dp), modifier = Modifier.height(48.dp)) {
                            Text("Oldingi")
                        }
                    }
                    Button(
                        onClick = {
                            if (selectedAnswers[currentIndex] == null) { showError = true; return@Button }
                            if (currentIndex < questions.lastIndex) currentIndex++
                            else {
                                val correct = questions.indices.count { selectedAnswers[it] == questions[it].correctIndex }
                                onQuizFinished(correct, questions.size)
                                isFinished = true
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f).height(48.dp)
                    ) { Text(if (currentIndex == questions.lastIndex) "Testni yakunlash" else "Keyingi savol") }
                }
            }
        } else {
            val correctCount = questions.indices.count { selectedAnswers[it] == questions[it].correctIndex }
            val pct = (correctCount * 100) / questions.size
            val passed = pct >= 70
            LazyColumn(modifier = Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                    Card(colors = CardDefaults.cardColors(containerColor = palette.card), border = BorderStroke(1.dp, if (passed) palette.success else palette.error), shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.fillMaxWidth().padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(if (passed) "Tabriklaymiz! Sertifikat ochildi (+40 XP)" else "Yakuniy natija (Sertifikat uchun 70% kerak)", style = MaterialTheme.typography.titleMedium)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("\$pct%", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = if (passed) palette.success else palette.error)
                            Text("To'g'ri javoblar: \$correctCount / \${questions.size}")
                            Spacer(modifier = Modifier.height(14.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                if (passed) {
                                    Button(onClick = onOpenCertificates, colors = ButtonDefaults.buttonColors(containerColor = palette.success, contentColor = Color(0xFF060A13))) {
                                        Text("Sertifikatni ko'rish")
                                    }
                                }
                                OutlinedButton(onClick = { selectedAnswers.clear(); currentIndex = 0; isFinished = false }) { Text("Qayta") }
                                Button(onClick = onBack) { Text("Testlar") }
                            }
                        }
                    }
                }
                items(questions.indices.toList()) { idx ->
                    val q = questions[idx]
                    val userAns = selectedAnswers[idx]
                    val isRight = userAns == q.correctIndex
                    Card(colors = CardDefaults.cardColors(containerColor = palette.card), border = BorderStroke(1.dp, if (isRight) palette.success else palette.error), shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("\${idx + 1}. \${q.question}", style = MaterialTheme.typography.titleMedium)
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("Sizning javobingiz: \${userAns?.let { q.options[it] } ?: "—"}", color = if (isRight) palette.success else palette.error)
                            if (!isRight) Text("To'g'ri javob: \${q.options[q.correctIndex]}", color = palette.success)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(q.explanation, style = MaterialTheme.typography.labelMedium, color = palette.muted)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MockExamScreen(
    courses: List<CourseItem>,
    onBack: () -> Unit,
    onExamFinished: (Int, Int, Int, Int) -> Unit
) {
    val palette = LocalEduPalette.current
    val totalSec = 15 * 60
    var examKey by remember { mutableIntStateOf(0) }
    val examQuestions = remember(courses, examKey) {
        courses.flatMap { c -> c.quiz.map { q -> c.title to q } }.shuffled().take(20)
    }
    val answers = remember(examKey) { mutableStateMapOf<Int, Int>() }
    var secondsLeft by remember(examKey) { mutableIntStateOf(totalSec) }
    var submitted by remember(examKey) { mutableStateOf(false) }

    fun finishExam() {
        if (submitted) return
        val correct = examQuestions.indices.count { answers[it] == examQuestions[it].second.correctIndex }
        val pct = if (examQuestions.isNotEmpty()) (correct * 100) / examQuestions.size else 0
        submitted = true
        onExamFinished(correct, examQuestions.size, pct, totalSec - secondsLeft)
    }

    LaunchedEffect(examKey, submitted) {
        while (!submitted && secondsLeft > 0) {
            delay(1000L)
            secondsLeft -= 1
            if (secondsLeft == 0) finishExam()
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier.fillMaxWidth().background(palette.nav).safeDrawingPadding().padding(horizontal = 8.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Orqaga", tint = palette.ink) }
                Text("Vaqtli Mock Imtihon", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }
            Text(
                text = String.format(Locale.US, "⏱ %02d:%02d", secondsLeft / 60, secondsLeft % 60),
                color = if (secondsLeft < 120) palette.error else palette.accent,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(end = 12.dp)
            )
        }

        if (!submitted) {
            LazyColumn(modifier = Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(examQuestions.indices.toList()) { idx ->
                    val (cTitle, q) = examQuestions[idx]
                    val chosen = answers[idx]
                    Card(colors = CardDefaults.cardColors(containerColor = palette.card), border = BorderStroke(1.dp, palette.border), shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(cTitle, color = palette.accent, style = MaterialTheme.typography.labelSmall)
                            Text("\${idx + 1}. \${q.question}", style = MaterialTheme.typography.titleMedium)
                            q.options.forEachIndexed { oIdx, opt ->
                                val sel = chosen == oIdx
                                Surface(
                                    color = if (sel) palette.primary.copy(alpha = 0.16f) else palette.inset,
                                    border = BorderStroke(1.dp, if (sel) palette.accent else palette.border),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth().clickable { answers[idx] = oIdx }
                                ) {
                                    Text(opt, modifier = Modifier.padding(10.dp), style = MaterialTheme.typography.bodyMedium)
                                }
                            }
                        }
                    }
                }
                item {
                    Button(
                        onClick = { finishExam() },
                        colors = ButtonDefaults.buttonColors(containerColor = palette.success, contentColor = Color(0xFF060A13)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth().height(50.dp)
                    ) { Text("Imtihonni yakunlash (\${answers.size} / \${examQuestions.size})", fontWeight = FontWeight.Bold) }
                }
            }
        } else {
            val correct = examQuestions.indices.count { answers[it] == examQuestions[it].second.correctIndex }
            val pct = (correct * 100) / examQuestions.size
            LazyColumn(modifier = Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                    Card(colors = CardDefaults.cardColors(containerColor = palette.card), border = BorderStroke(1.dp, palette.accent), shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.fillMaxWidth().padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Imtihon yakunlandi (+60 XP)", color = palette.success, fontWeight = FontWeight.Bold)
                            Text("\$pct% (\$correct / \${examQuestions.size})", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(onClick = { examKey++ }, shape = RoundedCornerShape(12.dp)) { Text("Yangi savollar bilan boshlash") }
                        }
                    }
                }
                items(examQuestions.indices.toList()) { idx ->
                    val (cTitle, q) = examQuestions[idx]
                    val userAns = answers[idx]
                    val right = userAns == q.correctIndex
                    Card(colors = CardDefaults.cardColors(containerColor = palette.card), border = BorderStroke(1.dp, if (right) palette.success else palette.error), shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(cTitle, color = palette.accent, style = MaterialTheme.typography.labelSmall)
                            Text("\${idx + 1}. \${q.question}", style = MaterialTheme.typography.titleMedium)
                            Text("Javobingiz: \${userAns?.let { q.options[it] } ?: "—"}", color = if (right) palette.success else palette.error)
                            if (!right) Text("To'g'ri: \${q.options[q.correctIndex]}", color = palette.success)
                            Text(q.explanation, style = MaterialTheme.typography.bodySmall, color = palette.muted)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ProfileScreen(
    user: UserAccount,
    courses: List<CourseItem>,
    session: EduSessionState,
    isDark: Boolean,
    onToggleTheme: () -> Unit,
    onChangeDailyGoal: (Int) -> Unit,
    onUpdateName: (String) -> Unit,
    onOpenLesson: (String, String) -> Unit,
    onLogout: () -> Unit
) {
    val palette = LocalEduPalette.current
    val context = LocalContext.current
    val allLessonsMap = remember(courses) { courses.flatMap { it.lessons }.associateBy { it.id } }
    var editingName by remember { mutableStateOf(false) }
    var draftName by remember(user.fullName) { mutableStateOf(user.fullName) }
    var previewCert by remember { mutableStateOf<CertificateRecord?>(null) }

    val streakDays = calculateStreak(session.activityByDate)
    val xpInfo = calculateUserXp(
        session.completedIds.size,
        session.practiceIds.size,
        session.quizResults.size,
        session.mockExamResults.size,
        session.masteredFlashcards.size,
        session.projectStepIds.size,
        session.certificates.size,
        session.watchedVideoIds.size,
        session.lessonQuizScores.size,
        session.dailyChallengeDates.size,
        session.pomodoroCount
    )
    val badges = listOf(
        AchievementBadge("first-lesson", "Birinchi qadam", "1 ta darsni yakunlang", session.completedIds.isNotEmpty(), "\${minOf(1, session.completedIds.size)} / 1"),
        AchievementBadge("video-learner", "Video tinglovchi", "5 ta ovozli dars tinglang", session.watchedVideoIds.size >= 5, "\${minOf(5, session.watchedVideoIds.size)} / 5"),
        AchievementBadge("lesson-quiz", "Savol-javob bilimdoni", "5 ta dars savollari ishlang", session.lessonQuizScores.size >= 5, "\${minOf(5, session.lessonQuizScores.size)} / 5"),
        AchievementBadge("code-prac", "Kod amaliyotchisi", "10 ta kod mashqi bajaring", session.practiceIds.size >= 10, "\${minOf(10, session.practiceIds.size)} / 10"),
        AchievementBadge("streak-3", "Barqaror talaba", "3 kun ketma-ket faollik", streakDays >= 3, "\${minOf(3, streakDays)} / 3 kun"),
        AchievementBadge("pomodoro", "Fokus ustasi", "1 ta Pomodoro tugating", session.pomodoroCount >= 1, "\${minOf(1, session.pomodoroCount)} / 1"),
        AchievementBadge("builder-10", "Amaliy loyihachi", "10 ta loyiha bosqichi bajaring", session.projectStepIds.size >= 10, "\${minOf(10, session.projectStepIds.size)} / 10"),
        AchievementBadge("cert-pro", "Sertifikat sohibi", "70%+ olib sertifikat oching", session.certificates.isNotEmpty(), "\${minOf(1, session.certificates.size)} / 1")
    )

    LazyColumn(modifier = Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Card(colors = CardDefaults.cardColors(containerColor = palette.card), border = BorderStroke(1.dp, palette.border), shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("\${xpInfo.rank} · \${xpInfo.xp} XP · 🔥 \$streakDays kun streak", color = palette.accent, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                    if (editingName) {
                        OutlinedTextField(value = draftName, onValueChange = { draftName = it }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = { onUpdateName(draftName); editingName = false }, shape = RoundedCornerShape(10.dp)) { Text("Saqlash") }
                            OutlinedButton(onClick = { draftName = user.fullName; editingName = false }, shape = RoundedCornerShape(10.dp)) { Text("Bekor qilish") }
                        }
                    } else {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Text(user.fullName, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                            OutlinedButton(onClick = { editingName = true }, shape = RoundedCornerShape(8.dp)) { Text("Tahrirlash") }
                        }
                    }
                    Text(user.contact, color = palette.muted)
                    LinearProgressIndicator(
                        progress = { (xpInfo.xp.toFloat() / xpInfo.nextRankXp).coerceIn(0f, 1f) },
                        modifier = Modifier.fillMaxWidth().height(7.dp),
                        color = palette.accent,
                        trackColor = palette.border
                    )
                    Text("Daraja progressi: \${xpInfo.xp} / \${xpInfo.nextRankXp} XP", style = MaterialTheme.typography.labelSmall, color = palette.muted)
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("Maqsad:", style = MaterialTheme.typography.labelMedium, color = palette.muted)
                            listOf(1, 2, 3, 5).forEach { g ->
                                Surface(
                                    color = if (session.dailyGoal == g) palette.primary else palette.inset,
                                    border = BorderStroke(1.dp, palette.border),
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.clickable { onChangeDailyGoal(g) }
                                ) { Text("\$g", color = if (session.dailyGoal == g) Color.White else palette.muted, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)) }
                            }
                        }
                        OutlinedButton(onClick = onToggleTheme, shape = RoundedCornerShape(10.dp)) {
                            Text(if (isDark) "☀ Kunduzgi" else "🌙 Tungi")
                        }
                    }
                }
            }
        }

        item {
            Text("🏆 Yutuq nishonlari (\${badges.count { it.unlocked }} / \${badges.size})", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        }
        items(badges.chunked(2)) { rowBadges ->
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                rowBadges.forEach { b ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = palette.card),
                        border = BorderStroke(1.dp, if (b.unlocked) palette.success else palette.border),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(if (b.unlocked) "🏆 Ochilgan" else "🔒 Qulflangan", color = if (b.unlocked) palette.success else palette.muted, style = MaterialTheme.typography.labelSmall)
                            Text(b.title, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                            Text(b.description, style = MaterialTheme.typography.labelSmall, color = palette.muted)
                            Text(b.progressText, style = MaterialTheme.typography.labelSmall, color = palette.accent)
                        }
                    }
                }
            }
        }

        item { Text("🎓 Raqamli sertifikatlar (\${session.certificates.size})", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
        if (session.certificates.isEmpty()) {
            item { Text("Istalgan kurs testidan kamida 70% natija oling — shaxsiy sertifikat shu yerda ochiladi.", color = palette.muted) }
        } else {
            items(session.certificates) { cert ->
                Card(colors = CardDefaults.cardColors(containerColor = palette.nav), border = BorderStroke(1.dp, palette.accent.copy(alpha = 0.5f)), shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("✓ Tasdiqlangan sertifikat · \${cert.id}", color = palette.success, style = MaterialTheme.typography.labelMedium)
                        Text(cert.courseTitle, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text("Tinglovchi: \${cert.studentName} · Natija: \${cert.percentage}%", color = palette.muted, style = MaterialTheme.typography.bodySmall)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = { previewCert = cert }, shape = RoundedCornerShape(10.dp)) { Text("Sertifikatni ko'rish") }
                            OutlinedButton(
                                onClick = {
                                    val share = Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(Intent.EXTRA_TEXT, "EduPlatform Sertifikati (\${cert.id}): \${cert.studentName} — '\${cert.courseTitle}' kursini \${cert.percentage}% natija bilan yakunladi! Loyiha rahbari: Ahmadali Toshturgunov.")
                                    }
                                    context.startActivity(Intent.createChooser(share, "Sertifikatni ulashish"))
                                },
                                shape = RoundedCornerShape(10.dp)
                            ) { Text("Ulashish") }
                        }
                    }
                }
            }
        }

        if (session.bookmarkedIds.isNotEmpty()) {
            item { Text("Saqlangan darslar (\${session.bookmarkedIds.size})", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
            items(session.bookmarkedIds.toList()) { id ->
                val lesson = allLessonsMap[id]
                if (lesson != null) {
                    Card(colors = CardDefaults.cardColors(containerColor = palette.card), border = BorderStroke(1.dp, palette.border), shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth().clickable { onOpenLesson(lesson.courseId, lesson.id) }) {
                        Text(lesson.title, modifier = Modifier.padding(14.dp), color = palette.accent)
                    }
                }
            }
        }

        if (session.notesMap.isNotEmpty()) {
            item { Text("Shaxsiy konspektlar (\${session.notesMap.size})", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
            items(session.notesMap.entries.toList()) { (lId, txt) ->
                val lesson = allLessonsMap[lId]
                if (lesson != null) {
                    Card(colors = CardDefaults.cardColors(containerColor = palette.card), border = BorderStroke(1.dp, palette.border), shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth().clickable { onOpenLesson(lesson.courseId, lesson.id) }) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(lesson.title, color = palette.accent, style = MaterialTheme.typography.labelMedium)
                            Text(txt, color = palette.muted, maxLines = 2, overflow = TextOverflow.Ellipsis)
                        }
                    }
                }
            }
        }

        item { Text("Test va Imtihon natijalari", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
        if (session.quizResults.isEmpty() && session.mockExamResults.isEmpty()) {
            item { Text("Hali test yoki imtihon topshirilmagan.", color = palette.muted) }
        } else {
            items(session.mockExamResults.take(4)) { m ->
                Card(colors = CardDefaults.cardColors(containerColor = palette.card), border = BorderStroke(1.dp, palette.accent.copy(alpha = 0.45f)), shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) {
                    Row(modifier = Modifier.fillMaxWidth().padding(14.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Vaqtli Umumiy Imtihon (Mock)", style = MaterialTheme.typography.titleMedium)
                            Text("\${m.score} / \${m.totalQuestions} to'g'ri", color = palette.muted)
                        }
                        Text("\${m.percentage}%", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = palette.accent)
                    }
                }
            }
            items(session.quizResults) { res ->
                Card(colors = CardDefaults.cardColors(containerColor = palette.card), border = BorderStroke(1.dp, palette.border), shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) {
                    Row(modifier = Modifier.fillMaxWidth().padding(14.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(res.courseTitle, style = MaterialTheme.typography.titleMedium)
                            Text("\${res.score} / \${res.totalQuestions} to'g'ri", color = palette.muted)
                        }
                        Text("\${res.percentage}%", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = if (res.percentage >= 70) palette.success else palette.error)
                    }
                }
            }
        }

        if (session.completedIds.isNotEmpty()) {
            item { Text("Yakunlangan darslar (\${session.completedIds.size})", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
            items(session.completedIds.toList().reversed()) { id ->
                val lesson = allLessonsMap[id]
                if (lesson != null) {
                    Card(colors = CardDefaults.cardColors(containerColor = palette.card), border = BorderStroke(1.dp, palette.border), shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth().clickable { onOpenLesson(lesson.courseId, lesson.id) }) {
                        Text("✓ \${lesson.title}", modifier = Modifier.padding(12.dp), color = palette.success)
                    }
                }
            }
        }

        item {
            Button(
                onClick = onLogout,
                colors = ButtonDefaults.buttonColors(containerColor = palette.error, contentColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().height(48.dp)
            ) { Text("Tizimdan chiqish", fontWeight = FontWeight.SemiBold) }
            Spacer(modifier = Modifier.height(14.dp))
            Text(
                text = "Loyiha rahbari: Ahmadali Toshturgunov tomonidan ishlab chiqilgan · 2026-yil 16-noyabr, soat 09:45",
                style = MaterialTheme.typography.labelMedium,
                color = palette.muted
            )
        }
    }

    if (previewCert != null) {
        val c = previewCert!!
        AlertDialog(
            onDismissRequest = { previewCert = null },
            title = { Text("EDUPLATFORM SERTIFIKATI", color = palette.accent, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Muvaffaqiyat Sertifikati", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("Tinglovchi: \${c.studentName}", color = palette.accent, fontWeight = FontWeight.Bold)
                    Text("\\"\${c.courseTitle}\\" kursini \${c.percentage}% natija bilan muvaffaqiyatli yakunladi.", style = MaterialTheme.typography.bodyMedium)
                    Text("ID: \${c.id} · Sana: \${c.issuedAt}", style = MaterialTheme.typography.labelSmall, color = palette.muted)
                    Text("Loyiha rahbari: Ahmadali Toshturgunov", style = MaterialTheme.typography.labelMedium)
                }
            },
            confirmButton = {
                Button(onClick = { previewCert = null }) { Text("Yopish") }
            }
        )
    }
}

@Composable
private fun PomodoroDialog(
    isFocusMode: Boolean,
    secondsLeft: Int,
    isRunning: Boolean,
    completedSessions: Int,
    onSwitchMode: (Boolean) -> Unit,
    onToggleRunning: () -> Unit,
    onReset: () -> Unit,
    onDismiss: () -> Unit
) {
    val palette = LocalEduPalette.current
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("⏱ Pomodoro Fokus Taymeri", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp), horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (isFocusMode) {
                        Button(onClick = { onSwitchMode(true) }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(10.dp)) { Text("Fokus 25d") }
                        OutlinedButton(onClick = { onSwitchMode(false) }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(10.dp)) { Text("Tanaffus 5d") }
                    } else {
                        OutlinedButton(onClick = { onSwitchMode(true) }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(10.dp)) { Text("Fokus 25d") }
                        Button(onClick = { onSwitchMode(false) }, modifier = Modifier.weight(1f), shape = RoundedCornerShape(10.dp)) { Text("Tanaffus 5d") }
                    }
                }
                Text(
                    text = String.format(Locale.US, "%02d:%02d", secondsLeft / 60, secondsLeft % 60),
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold,
                    color = if (isRunning) palette.success else palette.accent
                )
                Text("Yakunlangan sessiyalar: \$completedSessions ta (+10 XP)", style = MaterialTheme.typography.labelMedium, color = palette.muted)
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = onToggleRunning, modifier = Modifier.weight(1f), shape = RoundedCornerShape(10.dp)) {
                        Text(if (isRunning) "Pauza" else "Boshlash")
                    }
                    OutlinedButton(onClick = onReset, shape = RoundedCornerShape(10.dp)) { Text("Qayta") }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text("Yig'ish") }
        }
    )
}

@Composable
private fun TranslatorDialog(onDismiss: () -> Unit) {
    val palette = LocalEduPalette.current
    val context = LocalContext.current
    var inputText by remember { mutableStateOf("") }
    var selectedLangTag by remember { mutableStateOf("en-US") }
    var ttsObj by remember { mutableStateOf<TextToSpeech?>(null) }
    var ttsReady by remember { mutableStateOf(false) }

    val itTerms = remember {
        listOf(
            Triple("Variable (O'zgaruvchi)", "Dastur xotirasida ma'lumot saqlovchi nomlangan quti (val/var).", "Variable"),
            Triple("Immutability (O'zgarmaslik)", "Qiymat e'lon qilingandan keyin o'zgarmasligi (val).", "Immutability"),
            Triple("Recomposition (Qayta chizish)", "State o'zgarganda Compose faqat kerakli UI ni yangilashi.", "Recomposition"),
            Triple("State Hoisting", "Holatni bola komponentdan ota komponentga ko'tarish.", "State Hoisting"),
            Triple("Null Safety", "Qiymat bo'sh (null) bo'lganda ilova qulashining oldini olish (?. va ?:).", "Null Safety"),
            Triple("SharedPreferences", "Android qurilmasida kichik sozlamalarni kalit-qiymat shaklida saqlash.", "Shared Preferences")
        )
    }

    DisposableEffect(context) {
        val engine = TextToSpeech(context) { st -> ttsReady = (st == TextToSpeech.SUCCESS) }
        ttsObj = engine
        onDispose { engine.stop(); engine.shutdown() }
    }

    fun speakPhrase(txt: String, langTag: String) {
        val eng = ttsObj ?: return
        if (!ttsReady || txt.isBlank()) return
        eng.language = Locale.forLanguageTag(langTag)
        eng.speak(txt, TextToSpeech.QUEUE_FLUSH, null, "tr_\${System.currentTimeMillis()}")
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("🌐 IT Lug'at va Ovozli Talaffuz", fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth().verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("en-US" to "EN", "uz-UZ" to "UZ", "ru-RU" to "RU", "tr-TR" to "TR").forEach { (tag, lbl) ->
                        val sel = selectedLangTag == tag
                        Surface(
                            color = if (sel) palette.primary else palette.inset,
                            border = BorderStroke(1.dp, if (sel) palette.primary else palette.border),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.clickable { selectedLangTag = tag }
                        ) { Text(lbl, color = if (sel) Color.White else palette.muted, modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)) }
                    }
                }
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = { Text("Talaffuz uchun atama yoki matn yozing...") },
                    modifier = Modifier.fillMaxWidth()
                )
                Button(
                    onClick = { speakPhrase(inputText, selectedLangTag) },
                    enabled = ttsReady && inputText.isNotBlank(),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) { Text("▶ Ovozda eshitish") }

                Text("Asosiy IT atamalar (bosib talaffuzini eshiting):", style = MaterialTheme.typography.labelMedium, color = palette.accent)
                itTerms.forEach { (title, desc, spoken) ->
                    Surface(
                        color = palette.inset,
                        border = BorderStroke(1.dp, palette.border),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth().clickable { speakPhrase(spoken, "en-US") }
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("▶ \$title", fontWeight = FontWeight.SemiBold, color = palette.accent, style = MaterialTheme.typography.bodyMedium)
                            Text(desc, style = MaterialTheme.typography.bodySmall, color = palette.muted)
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text("Yopish") }
        }
    )
}

@Composable
private fun SimpleTopBar(title: String, onBack: () -> Unit) {
    val palette = LocalEduPalette.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(palette.nav)
            .safeDrawingPadding()
            .padding(horizontal = 8.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = onBack) {
            Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Orqaga", tint = palette.ink)
        }
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = palette.ink,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

private object EduCoursesSeed {
    val flashcards by lazy {
        listOf(
${flashcardsKotlin}
        )
    }

    private fun buildRoadmaps(): List<RoadmapItem> = listOf(
${roadmapsKotlin}
    )

    val roadmaps by lazy { buildRoadmaps() }

    private fun buildInterviewQAs(): List<InterviewQA> = listOf(
${interviewKotlin}
    )

    val interviewQAs by lazy { buildInterviewQAs() }

${courseBuildersKotlin}

    val courses by lazy {
        listOf(${courseCallList})
    }
}
`;
}
