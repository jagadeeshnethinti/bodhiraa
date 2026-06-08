import { api } from '../client';
import type {
  AnswerInput,
  ApiAiReply,
  ApiAiSessionDetail,
  ApiAiSessionSummary,
  ApiAttempt,
  ApiAttemptResult,
  ApiChapterLessons,
  ApiJoinResult,
  ApiLesson,
  ApiLessonProgress,
  ApiLiveClassBuckets,
  ApiLiveClassDetail,
  ApiQuizDetail,
  ApiQuizSummary,
  ApiStudentHome,
  ApiStudentProfile,
  ApiSubject,
  ApiSubjectDetail,
  ProgressInput,
} from '../types';

export const StudentApi = {
  // ── Home / profile ────────────────────────────────────────────────────────
  home: (signal?: AbortSignal) => api.getData<ApiStudentHome>('/student/home', { signal }),
  profile: (signal?: AbortSignal) => api.getData<ApiStudentProfile>('/student/profile', { signal }),

  // ── Subjects → chapters → lessons ───────────────────────────────────────────
  subjects: (signal?: AbortSignal) => api.getData<ApiSubject[]>('/student/subjects', { signal }),
  subject: (id: number, signal?: AbortSignal) =>
    api.getData<ApiSubjectDetail>(`/student/subjects/${id}`, { signal }),
  chapterLessons: (chapterId: number, signal?: AbortSignal) =>
    api.getData<ApiChapterLessons>(`/student/chapters/${chapterId}/lessons`, { signal }),
  lesson: (id: number, signal?: AbortSignal) =>
    api.getData<ApiLesson>(`/student/lessons/${id}`, { signal }),

  /** Fire-and-forget every ~10s while playing; send `completed: true` at the end. */
  postProgress: (lessonId: number, body: ProgressInput) =>
    api.post<ApiLessonProgress>(`/student/lessons/${lessonId}/progress`, body).then(r => r.data),

  // ── Quizzes ─────────────────────────────────────────────────────────────────
  quizzes: (signal?: AbortSignal) => api.getData<ApiQuizSummary[]>('/student/quizzes', { signal }),
  quiz: (id: number, signal?: AbortSignal) =>
    api.getData<ApiQuizDetail>(`/student/quizzes/${id}`, { signal }),
  startQuiz: (id: number) =>
    api.post<{ attempt: ApiAttempt } | ApiAttempt>(`/student/quizzes/${id}/start`).then(r => {
      const d = r.data as { attempt?: ApiAttempt } & Partial<ApiAttempt>;
      return (d.attempt ?? (d as ApiAttempt));
    }),
  answer: (attemptId: number, body: AnswerInput) =>
    api.post(`/student/attempts/${attemptId}/answer`, body),
  submit: (attemptId: number) =>
    api.post<ApiAttemptResult>(`/student/attempts/${attemptId}/submit`).then(r => r.data),

  // ── AI doubt solver (throttle:ai — 30/min) ──────────────────────────────────
  aiSessions: (signal?: AbortSignal) =>
    api.getData<ApiAiSessionSummary[]>('/student/ai/sessions', { signal }),
  aiSession: (id: number, signal?: AbortSignal) =>
    api.getData<ApiAiSessionDetail>(`/student/ai/sessions/${id}`, { signal }),
  /** Start a new session; an optional first message returns the assistant reply. */
  createAiSession: (body?: string) =>
    api
      .post<ApiAiSessionDetail | ApiAiReply>('/student/ai/sessions', body ? { body } : undefined)
      .then(r => r.data),
  aiSend: (sessionId: number, body: string) =>
    api.post<ApiAiReply>(`/student/ai/sessions/${sessionId}/messages`, { body }).then(r => r.data),
  aiRecommendations: (signal?: AbortSignal) =>
    api.getData<string[]>('/student/ai/recommendations', { signal }),

  // ── Live classes ────────────────────────────────────────────────────────────
  liveClasses: (signal?: AbortSignal) =>
    api.getData<ApiLiveClassBuckets>('/student/live-classes', { signal }),
  liveClass: (id: number, signal?: AbortSignal) =>
    api.getData<ApiLiveClassDetail>(`/student/live-classes/${id}`, { signal }),
  joinLiveClass: (id: number) =>
    api.post<ApiJoinResult>(`/student/live-classes/${id}/join`).then(r => r.data),
};
