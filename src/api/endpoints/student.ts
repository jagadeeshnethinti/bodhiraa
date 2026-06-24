import { api } from '../client';
import type {
  AnswerInput,
  ApiAiMessage,
  ApiAiReply,
  ApiAiSessionDetail,
  ApiAiSessionSummary,
  ApiAttempt,
  ApiAttemptResult,
  ApiBadgeCollection,
  ApiChapterLessons,
  ApiJoinResult,
  ApiLesson,
  ApiLessonProgress,
  ApiLiveClassBuckets,
  ApiLiveClassDetail,
  ApiQuizDetail,
  ApiQuizOption,
  ApiQuizQuestion,
  ApiQuizSummary,
  ApiStudentHome,
  ApiStudentProfile,
  ApiSubject,
  ApiSubjectDetail,
  ProgressInput,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// ADAPTER NOTES
// ─────────────────────────────────────────────────────────────────────────────
// The real Laravel backend's JSON has drifted from the shapes the student
// screens read (they were built against src/api/mock). Each endpoint below maps
// the live response into exactly what the consuming screen expects, so screens
// need no edits. Endpoints that already match the wire types are passed through.
// ─────────────────────────────────────────────────────────────────────────────

// ── Real (wire) shapes the backend actually returns ──────────────────────────
// Kept local; we only model the fields we read while mapping.

interface RealHomeSubject {
  id: number;
  name: string;
  slug?: string;
  grade?: string | null;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  chapters_count?: number;
}

interface RealContinueLearning {
  lesson_id: number;
  title: string;
  subject: string;
  chapter: string;
  type?: string;
  progress_percent: number;
  last_viewed_at?: string;
}

interface RealStudentHome {
  student?: { id: number; name: string; grade: string | null; avatar: string | null; school: string | null };
  stats?: {
    streak_days?: number;
    xp?: number;
    lessons_completed?: number;
    lessons_total?: number;
    completion_percent?: number;
    subjects_count?: number;
  };
  continue_learning?: RealContinueLearning[];
  subjects?: RealHomeSubject[];
  upcoming_quizzes?: Array<{ id: number; title: string; starts_at?: string | null }>;
}

interface RealProfile {
  lessons_completed?: number;
  quizzes_attempted?: number;
  avg_score_percent?: number;
  streak_days?: number;
  xp?: number;
  [key: string]: unknown;
}

interface RealQuizOption {
  key: string;
  text: string;
}

interface RealQuizQuestion {
  id: number;
  body: string;
  type: string;
  marks?: number | null;
  options?: RealQuizOption[];
  sort_order?: number;
}

interface RealQuizDetail {
  id: number;
  title: string;
  description?: string | null;
  duration_min?: number | null;
  total_marks?: number | null;
  starts_at?: string | null;
  subject?: { id: number; name: string; icon?: string | null } | null;
  questions?: RealQuizQuestion[];
}

interface RealAiSessionSummary {
  id: number;
  title: string | null;
  messages_count?: number;
  last_message_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

interface RealAiSessionDetail {
  session: { id: number; title: string | null; last_message_at?: string | null };
  messages: ApiAiMessage[];
}

interface RealAiRecommendations {
  weak_areas?: Array<{ subject?: string | null; suggestion?: string | null }>;
  next_lesson?: { title?: string | null } | null;
}

// ── Mapping helpers ──────────────────────────────────────────────────────────

/** Options carry a letter key ("A".."D"); the screen works with numeric option
 *  ids. Map key→stable number (A=1, B=2, …) and back so the screen never sees
 *  the keys, while answer() can reconstruct them. */
const keyToId = (key: string): number => (key ? key.toUpperCase().charCodeAt(0) - 64 : 0);
const idToKey = (id: number): string => String.fromCharCode(64 + id);

function mapQuizDetail(d: RealQuizDetail): ApiQuizDetail {
  const questions: ApiQuizQuestion[] = (d.questions ?? []).map(q => ({
    id: q.id,
    text: q.body, // screen reads `text`
    type: q.type,
    marks: q.marks ?? null,
    options: (q.options ?? []).map<ApiQuizOption>(o => ({ id: keyToId(o.key), text: o.text })),
  }));
  return {
    id: d.id,
    title: d.title,
    description: d.description ?? null,
    duration_min: d.duration_min ?? null,
    total_marks: d.total_marks ?? null,
    questions_count: questions.length,
    starts_at: d.starts_at ?? null,
    subject: d.subject?.name ?? null, // screen reads subject as a string
    questions,
  };
}

export const StudentApi = {
  // ── Home / profile ────────────────────────────────────────────────────────
  /**
   * Real backend returns { student, stats, continue_learning[], subjects[],
   * upcoming_quizzes[] }. HomeScreen reads a flat shape (daily_goal_percent,
   * streak_days, xp_points, lessons_today/goal, continue_lesson, subjects with
   * chapters_count, next_quiz). Flatten + reshape here.
   */
  home: async (signal?: AbortSignal): Promise<ApiStudentHome> => {
    const r = await api.getData<RealStudentHome>('/student/home', { signal });
    const stats = r.stats ?? {};
    const subjects: ApiSubject[] = (r.subjects ?? []).map(s => ({
      id: s.id,
      name: s.name,
      icon: s.icon ?? null,
      color: s.color ?? null,
      grade: s.grade ?? null,
      chapters_count: s.chapters_count ?? 0, // not present on home; default 0
    }));

    // First "continue learning" item → continue_lesson; look up its subject in
    // the subjects list to fill icon + colour (the item only carries a name).
    const first = (r.continue_learning ?? [])[0];
    const subjectOf = first ? subjects.find(s => s.name === first.subject) : undefined;
    const continue_lesson = first
      ? {
          lesson_id: first.lesson_id,
          subject_name: first.subject,
          chapter: first.chapter,
          progress_percent: first.progress_percent,
          icon: subjectOf?.icon ?? '',
          color: subjectOf?.color ?? '',
        }
      : undefined;

    const q = (r.upcoming_quizzes ?? [])[0];
    const next_quiz: ApiQuizSummary | null = q
      ? { id: q.id, title: q.title, starts_at: q.starts_at ?? null }
      : null;

    return {
      greeting: '',
      streak_days: stats.streak_days ?? 0,
      daily_goal_percent: stats.completion_percent ?? 0,
      xp_points: stats.xp ?? 0,
      lessons_today: stats.lessons_completed ?? 0,
      lessons_goal: stats.lessons_total ?? 0,
      continue_lesson,
      subjects,
      todays_classes: [], // not provided by the real home endpoint
      pending_assignments: 0,
      next_quiz,
    } as ApiStudentHome;
  },

  /**
   * Real profile returns { student, lessons_completed, quizzes_attempted,
   * avg_score_percent, streak_days, xp, achievements }. Profile/Progress
   * screens read lessons_completed, quizzes_taken, day_streak, avg_score,
   * xp_points, plus level/level_progress/rank. Rename fields and derive level
   * from xp (the backend has no level/rank concept).
   */
  profile: async (signal?: AbortSignal): Promise<ApiStudentProfile> => {
    const r = await api.getData<RealProfile>('/student/profile', { signal });
    const xp = r.xp ?? 0;
    // Simple, deterministic levelling: 500 XP per level.
    const XP_PER_LEVEL = 500;
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const level_progress = Math.round(((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100);
    return {
      lessons_completed: r.lessons_completed ?? 0,
      quizzes_taken: r.quizzes_attempted ?? 0,
      day_streak: r.streak_days ?? 0,
      avg_score: r.avg_score_percent ?? 0,
      xp_points: xp,
      level,
      level_progress,
      // rank has no backend source; screen falls back to "#—" when absent.
    } as ApiStudentProfile;
  },

  /** Full achievement-badge collection (earned + locked) with tier visuals. */
  badges: (signal?: AbortSignal) =>
    api.getData<ApiBadgeCollection>('/student/badges', { signal }),

  // ── Subjects → chapters → lessons ───────────────────────────────────────────
  // subjects / subject already match the wire types — pass through.
  subjects: (signal?: AbortSignal) => api.getData<ApiSubject[]>('/student/subjects', { signal }),
  subject: (id: number, signal?: AbortSignal) =>
    api.getData<ApiSubjectDetail>(`/student/subjects/${id}`, { signal }),
  // chapterLessons already matches (progress / quiz_id are optional) — pass through.
  chapterLessons: (chapterId: number, signal?: AbortSignal) =>
    api.getData<ApiChapterLessons>(`/student/chapters/${chapterId}/lessons`, { signal }),

  /**
   * Real lesson endpoint nests the lesson under `lesson` and returns
   * { lesson, progress, siblings }. The screens read a flat ApiLesson with
   * `.progress` and `.siblings`. Flatten here.
   */
  lesson: async (id: number, signal?: AbortSignal): Promise<ApiLesson> => {
    const r = await api.getData<{ lesson: ApiLesson; progress?: ApiLessonProgress | null; siblings?: ApiLesson['siblings'] }>(
      `/student/lessons/${id}`,
      { signal },
    );
    return { ...r.lesson, progress: r.progress ?? null, siblings: r.siblings ?? [] };
  },

  /** Fire-and-forget every ~10s while playing; send `completed: true` at the end. */
  postProgress: (lessonId: number, body: ProgressInput) =>
    api.post<ApiLessonProgress>(`/student/lessons/${lessonId}/progress`, body).then(r => r.data),

  // ── Quizzes ─────────────────────────────────────────────────────────────────
  // quizzes (list) already matches the wire summary shape — pass through.
  quizzes: (signal?: AbortSignal) => api.getData<ApiQuizSummary[]>('/student/quizzes', { signal }),
  /** Real quiz: subject is an object, questions use `body`, options use letter
   *  `key`. Map to the screen's shape (subject string, `text`, numeric option ids). */
  quiz: async (id: number, signal?: AbortSignal): Promise<ApiQuizDetail> => {
    const r = await api.getData<RealQuizDetail>(`/student/quizzes/${id}`, { signal });
    return mapQuizDetail(r);
  },
  startQuiz: (id: number) =>
    api.post<{ attempt: ApiAttempt } | ApiAttempt>(`/student/quizzes/${id}/start`).then(r => {
      const d = r.data as { attempt?: ApiAttempt } & Partial<ApiAttempt>;
      return (d.attempt ?? (d as ApiAttempt));
    }),
  /**
   * The backend grades by comparing the submitted `answer` array against the
   * question's correct_answer (an array of option letters, e.g. ["B"]). The
   * screen sends AnswerInput with numeric `selected_option_ids` (our synthetic
   * ids) / text / boolean — translate to the letter-key array the backend wants.
   */
  answer: (attemptId: number, body: AnswerInput) => {
    const a = body.answer ?? {};
    let answer: unknown;
    if (a.selected_option_ids && a.selected_option_ids.length > 0) {
      answer = a.selected_option_ids.map(idToKey);
    } else if (typeof a.boolean === 'boolean') {
      answer = [a.boolean ? 'True' : 'False'];
    } else if (typeof a.text === 'string') {
      answer = [a.text];
    } else {
      answer = [];
    }
    return api.post(`/student/attempts/${attemptId}/answer`, { question_id: body.question_id, answer });
  },
  submit: (attemptId: number) =>
    api.post<ApiAttemptResult>(`/student/attempts/${attemptId}/submit`).then(r => r.data),

  // ── AI doubt solver (throttle:ai — 30/min) ──────────────────────────────────
  /** Real session summaries carry `updated_at` instead of `created_at`; alias it
   *  so the wire summary type is satisfied (the screen only reads title + count). */
  aiSessions: async (signal?: AbortSignal): Promise<ApiAiSessionSummary[]> => {
    const r = await api.getData<RealAiSessionSummary[]>('/student/ai/sessions', { signal });
    return r.map(s => ({
      id: s.id,
      title: s.title,
      messages_count: s.messages_count,
      last_message_at: s.last_message_at ?? null,
      created_at: s.created_at ?? s.updated_at ?? '',
    }));
  },
  /** Real detail wraps the summary under `session`; flatten to ApiAiSessionDetail. */
  aiSession: async (id: number, signal?: AbortSignal): Promise<ApiAiSessionDetail> => {
    const r = await api.getData<RealAiSessionDetail>(`/student/ai/sessions/${id}`, { signal });
    return {
      id: r.session.id,
      title: r.session.title,
      last_message_at: r.session.last_message_at ?? null,
      created_at: '',
      messages: r.messages ?? [],
    };
  },
  /** Start a new session. Real returns { session, messages, tokens }; the screen
   *  reads `.id` and `.messages`, so flatten the session up a level. When a first
   *  message is sent the same shape comes back (with the assistant reply). */
  createAiSession: async (body?: string): Promise<ApiAiSessionDetail> => {
    const r = await api
      .post<RealAiSessionDetail>('/student/ai/sessions', body ? { body } : undefined)
      .then(res => res.data);
    return {
      id: r.session.id,
      title: r.session.title,
      last_message_at: r.session.last_message_at ?? null,
      created_at: '',
      messages: r.messages ?? [],
    };
  },
  aiSend: (sessionId: number, body: string) =>
    api.post<ApiAiReply>(`/student/ai/sessions/${sessionId}/messages`, { body }).then(r => r.data),
  /** Real returns { weak_areas[], next_lesson }; the screen renders a list of
   *  string suggestion chips. Flatten to suggestion strings. */
  aiRecommendations: async (signal?: AbortSignal): Promise<string[]> => {
    const r = await api.getData<RealAiRecommendations>('/student/ai/recommendations', { signal });
    const out: string[] = [];
    for (const w of r.weak_areas ?? []) {
      if (w.suggestion) out.push(w.suggestion);
    }
    if (r.next_lesson?.title) out.push(`Continue with "${r.next_lesson.title}"`);
    return out;
  },

  // ── Live classes ────────────────────────────────────────────────────────────
  // Live-class buckets / detail / join already match the wire types — pass through.
  liveClasses: (signal?: AbortSignal) =>
    api.getData<ApiLiveClassBuckets>('/student/live-classes', { signal }),
  liveClass: (id: number, signal?: AbortSignal) =>
    api.getData<ApiLiveClassDetail>(`/student/live-classes/${id}`, { signal }),
  joinLiveClass: (id: number) =>
    api.post<ApiJoinResult>(`/student/live-classes/${id}/join`).then(r => r.data),
};
