/**
 * Wire types for the Bodhira API (see api.md). These mirror the JSON the
 * backend returns — keep them faithful to the contract, not to the UI's
 * convenience shapes. UI-friendly models live in `src/types`.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Envelope
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  /** Present on the notifications list. */
  unread_count?: number;
  [key: string]: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  message: string | null;
  data: T;
  meta?: ApiMeta;
}

export interface ApiFailure {
  success: false;
  message: string | null;
  /** Machine-readable hint, e.g. `otp_invalid`, `account_inactive`. */
  code?: string;
  /** Present on 422 — mirrors Laravel's validation bag. */
  errors?: Record<string, string[]>;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

// ─────────────────────────────────────────────────────────────────────────────
// Identity
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'student' | 'teacher' | 'parent' | 'admin' | 'super_admin';

export interface School {
  id: number;
  name: string;
  code: string | null;
  logo: string | null;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  role_label: string;
  avatar: string | null;
  grade: string | null;
  gender: string | null;
  dob: string | null;
  status: string;
  school: School | null;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
}

export interface AuthPayload {
  user: ApiUser;
  token: string;
  token_type: 'Bearer';
}

// ─────────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiNotification {
  id: string; // UUID
  type: string;
  icon: string | null;
  title: string;
  body: string | null;
  meta: Record<string, unknown> | null;
  url: string | null;
  read_at: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Learning
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiSubject {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  grade: string | null;
  chapters_count: number;
}

export interface ApiChapter {
  id: number;
  title: string;
  subject_id: number;
  sort_order?: number;
  lessons_count?: number;
}

export interface ApiSubjectDetail {
  subject: ApiSubject;
  chapters: ApiChapter[];
}

export type LessonType = 'video' | 'text' | 'pdf' | 'quiz';

export interface ApiLessonProgress {
  status: string; // e.g. 'not_started' | 'in_progress' | 'completed'
  watched_seconds: number;
  progress_percent: number;
}

export interface ApiLesson {
  id: number;
  chapter_id: number;
  title: string;
  slug: string;
  type: LessonType;
  thumbnail: string | null;
  content_url: string | null;
  duration_sec: number | null;
  duration_label: string | null;
  is_free: boolean;
  sort_order: number;
  /** Only on the single-lesson endpoint. */
  content_body?: string | null;
  progress?: ApiLessonProgress | null;
  siblings?: Array<Pick<ApiLesson, 'id' | 'title' | 'type'>>;
  /** Quiz-type lessons may link a quiz to attempt. */
  quiz_id?: number | null;
}

export interface ApiChapterLessons {
  chapter: ApiChapter;
  lessons: ApiLesson[];
}

export interface ProgressInput {
  watched_seconds: number;
  completed: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Quizzes
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiQuizSummary {
  id: number;
  title: string;
  subject_id?: number | null;
  subject?: string | null;
  duration_min?: number | null;
  total_marks?: number | null;
  questions_count?: number | null;
  status?: string | null;
  starts_at?: string | null;
}

export interface ApiQuizOption {
  id: number;
  text: string;
}

export interface ApiQuizQuestion {
  id: number;
  text: string;
  type: 'mcq' | 'multi' | 'boolean' | 'fill' | string;
  marks?: number | null;
  options?: ApiQuizOption[];
}

export interface ApiQuizDetail extends ApiQuizSummary {
  description?: string | null;
  questions: ApiQuizQuestion[];
}

export interface ApiAttempt {
  id: number;
  quiz_id: number;
  status: string;
  started_at?: string | null;
}

/** The answer shape varies by question type — kept generic on purpose. */
export interface AnswerValue {
  selected_option_ids?: number[];
  text?: string;
  boolean?: boolean;
}

export interface AnswerInput {
  question_id: number;
  answer: AnswerValue;
}

export interface ApiAttemptResult {
  attempt_id: number;
  score: number;
  total_marks: number;
  percent: number;
  submitted_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI doubt solver
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiAiMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ApiAiSessionSummary {
  id: number;
  title: string | null;
  messages_count?: number;
  last_message_at?: string | null;
  created_at: string;
}

export interface ApiAiSessionDetail extends ApiAiSessionSummary {
  messages: ApiAiMessage[];
}

export interface ApiAiReply {
  user: ApiAiMessage;
  assistant: ApiAiMessage;
}

// ─────────────────────────────────────────────────────────────────────────────
// Live classes
// ─────────────────────────────────────────────────────────────────────────────

export type LiveStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

export interface ApiLiveClass {
  id: number;
  title: string;
  description?: string | null;
  scheduled_at: string;
  duration_min: number;
  host_name: string;
  live_status: LiveStatus;
  subject_id: number | null;
}

export interface ApiLiveClassBuckets {
  live_now: ApiLiveClass[];
  upcoming: ApiLiveClass[];
  past: ApiLiveClass[];
}

export interface ApiLiveAttendee {
  user_id: number;
  name: string;
  joined_at: string | null;
  left_at: string | null;
}

export interface ApiLiveClassDetail extends ApiLiveClass {
  attendees?: ApiLiveAttendee[];
}

export interface ApiJoinResult {
  meeting_url: string;
  provider: string;
  live_status: LiveStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// Student dashboards (kept loose — the backend renders these as open shapes)
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiStudentHome {
  greeting: string;
  streak_days: number;
  subjects: ApiSubject[];
  todays_classes: ApiLiveClass[];
  pending_assignments: number;
  next_quiz: ApiQuizSummary | null;
  [key: string]: unknown;
}

/** Profile aggregate stats — treat as free-form. */
export type ApiStudentProfile = Record<string, unknown>;
