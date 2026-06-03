// ── User Roles
export type UserRole = 'student' | 'teacher' | 'parent' | 'admin' | 'superadmin';

// ── Auth
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  school?: string;
  grade?: string;
}

// ── Learning
export interface Subject {
  id: string;
  name: string;
  icon: string;
  chaptersCount: number;
  lessonsCount: number;
  progress: number; // 0-100
  color: string;
  lightColor: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  number: number;
  title: string;
  lessonsCount: number;
  status: 'completed' | 'in_progress' | 'locked';
  progress?: number;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz' | 'discussion';
  duration?: string;
  completed: boolean;
}

// ── Quiz
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizResult {
  totalQuestions: number;
  correct: number;
  incorrect: number;
  skipped: number;
  timeTaken: string;
  score: number;
}

// ── Progress
export interface DailyProgress {
  date: string;
  minutesStudied: number;
  lessonsCompleted: number;
}

// ── Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Student: undefined;
  Teacher: undefined;
  Parent: undefined;
  Admin: undefined;
  SuperAdmin: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  OTP: { phone: string; email: string };
  RoleSelection: undefined;
};

export type StudentTabParamList = {
  Home: undefined;
  Courses: undefined;
  AITutor: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type StudentStackParamList = {
  StudentTabs: undefined;
  SubjectList: undefined;
  ChapterList: { subject: Subject };
  Lesson: { lesson: Lesson };
  VideoPlayer: { videoIndex?: number; title?: string };
  PDFNotes: { lesson: Lesson };
  Discussion: { chapterId: string };
  AIDoubt: undefined;
  AISearch: undefined;
  AIRecommend: undefined;
  QuizActive: { subjectId?: string };
  QuizResult: { result: QuizResult };
  Assignment: undefined;
  Achievements: undefined;
  WeakAreas: undefined;
  Notifications: undefined;
  RecentlyViewed: undefined;
};

export type TeacherTabParamList = {
  Dashboard: undefined;
  Students: undefined;
  Content: undefined;
  Reports: undefined;
  Profile: undefined;
};

export type ParentTabParamList = {
  Dashboard: undefined;
  Child: undefined;
  Attendance: undefined;
  Reports: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Classes: undefined;
  Analytics: undefined;
  Reports: undefined;
};
