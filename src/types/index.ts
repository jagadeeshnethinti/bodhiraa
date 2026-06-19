/**
 * Navigation param lists. Data models for the API live in `src/api/types.ts`;
 * screens consume those directly. Route params carry only what the destination
 * needs to fetch (ids + a little display context for instant headers).
 */
import type { ApiAttemptResult } from '../api/types';

// ── Root (role-gated) ─────────────────────────────────────────────────────────
export type AppStackParamList = {
  Auth: undefined;
  Student: undefined;
  Teacher: undefined;
  Parent: undefined;
  Admin: undefined;
};

// ── Auth flow ─────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  PhoneLogin: undefined;
  ForgotPassword: undefined;
  /** `devOtp` is only set in local env where the backend echoes the code. */
  OTP: { phone: string; devOtp?: string };
};

// ── Student ───────────────────────────────────────────────────────────────────
export type StudentTabParamList = {
  Home: undefined;
  Courses: undefined;
  AITutor: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type StudentStackParamList = {
  StudentTabs: { screen?: keyof StudentTabParamList } | undefined;
  SubjectList: undefined;
  ChapterList: {
    subjectId: number;
    subjectName: string;
    icon?: string | null;
    color?: string | null;
  };
  ChapterLessons: { chapterId: number; chapterTitle: string; subjectName?: string };
  LessonDetail: { lessonId: number; title?: string };
  LessonVideo: {
    lessonId: number;
    url: string;
    title?: string;
    subjectName?: string;
    durationSec?: number | null;
  };
  QuizList: undefined;
  QuizDetail: { quizId: number; title?: string };
  QuizActive: { attemptId: number; quizId: number; title?: string; durationMin?: number | null };
  QuizResult: { result: ApiAttemptResult; quizTitle?: string };
  LiveClasses: undefined;
  LiveClassDetail: { liveId: number; title?: string };
  Notifications: undefined;
  Subscription: undefined;
  Settings: undefined;
  Account: undefined;
  Language: undefined;
};

// ── Teacher / Parent / Admin (screens wired in a later pass) ────────────────────
export type TeacherTabParamList = {
  Dashboard: undefined;
  Students: undefined;
  Content: undefined;
  Reports: undefined;
  TeacherProfile: undefined;
};

export type ParentTabParamList = {
  PHome: undefined;
  PChild: undefined;
  PAttendance: undefined;
  PReports: undefined;
  PProfile: undefined;
};
