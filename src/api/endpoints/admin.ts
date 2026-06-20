import { api } from '../client';
import type { ApiResult } from '../client';
import type { ApiMeta } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Response shapes (the REAL JSON returned by /admin/* — see
// app/Http/Controllers/Api/V1/Admin/AdminApiController.php + AdminService.php).
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiAdminHome {
  admin: { name: string; school: string | null; school_code: string | null };
  stats: {
    students: number;
    teachers: number;
    parents: number;
    classes: number;
    subjects: number;
    attendance_percent: number;
    active_assignments: number;
  };
  recent_signups: Array<{
    id: number;
    name: string;
    role: string | null;
    role_label: string | null;
    created_at: string;
  }>;
  recent_attempts: Array<{
    student: string | null;
    quiz: string | null;
    subject: string | null;
    score: number;
    total: number;
    percent: number;
    submitted_at: string | null;
  }>;
}

export type AdminUserRole = 'student' | 'teacher' | 'parent' | 'admin' | 'super_admin';

export interface ApiAdminUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  grade: string | null;
  status: string;
}

/** `GET /admin/users` is paginated — the rows live in `data`, paging in `meta`. */
export interface ApiAdminUsersPage {
  users: ApiAdminUser[];
  meta: ApiMeta | null;
}

export interface ApiAdminUsersQuery {
  role?: AdminUserRole;
  q?: string;
  per_page?: number;
}

export interface CreateUserInput {
  name: string;
  email?: string;
  phone?: string;
  username?: string;
  role: 'student' | 'teacher' | 'parent';
  gender?: string;
  grade?: string;
  dob?: string;
  password?: string;
}

export type UpdateUserInput = Partial<CreateUserInput>;

export interface ApiAdminClass {
  id: number;
  label: string;
  grade: string;
  section: string;
  academic_year: string | null;
  class_teacher: string | null;
  students_count: number;
  subjects_count: number;
}

export interface ApiAdminClassDetail {
  class: {
    id: number;
    label: string;
    grade: string;
    section: string;
    academic_year: string | null;
    class_teacher: string | null;
  };
  students: Array<{ id: number; name: string; roll_no: string | null }>;
  subjects: Array<{ id: number; name: string; teacher_id: number | null }>;
}

export interface CreateClassInput {
  grade: string;
  section: string;
  academic_year?: string;
  class_teacher_id?: number;
}

export interface ApiAdminSubject {
  id: number;
  name: string;
  slug: string;
  grade: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  chapters_count: number;
}

export interface CreateSubjectInput {
  name: string;
  grade?: string;
  icon?: string;
  color?: string;
  description?: string;
}

export type UpdateSubjectInput = CreateSubjectInput & { is_active?: boolean };

export interface ApiAdminAnalytics {
  classes: Array<{
    id: number;
    label: string;
    students: number;
    attendance_percent: number;
    avg_quiz_percent: number;
  }>;
  attendance_trend: Array<{ date: string; percent: number }>;
  totals: {
    lessons_completed: number;
    quiz_attempts: number;
    avg_quiz_percent: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────

export const AdminApi = {
  // ── Dashboard ─────────────────────────────────────────────────────────────
  home: (signal?: AbortSignal) => api.getData<ApiAdminHome>('/admin/home', { signal }),

  // ── Users ───────────────────────────────────────────────────────────────────
  /** Paginated; returns rows + paging meta together. */
  users: (query: ApiAdminUsersQuery = {}, signal?: AbortSignal): Promise<ApiAdminUsersPage> =>
    api
      .get<ApiAdminUser[]>('/admin/users', { query: { ...query }, signal })
      .then((r: ApiResult<ApiAdminUser[]>) => ({ users: r.data, meta: r.meta })),
  createUser: (body: CreateUserInput) =>
    api.post<{ id: number }>('/admin/users', body).then(r => r.data),
  updateUser: (id: number, body: UpdateUserInput) =>
    api.patch<{ id: number }>(`/admin/users/${id}`, body).then(r => r.data),
  toggleUser: (id: number) =>
    api.post<{ status: string }>(`/admin/users/${id}/toggle`).then(r => r.data),

  // ── Classes ─────────────────────────────────────────────────────────────────
  classes: (signal?: AbortSignal) => api.getData<ApiAdminClass[]>('/admin/classes', { signal }),
  class: (id: number, signal?: AbortSignal) =>
    api.getData<ApiAdminClassDetail>(`/admin/classes/${id}`, { signal }),
  createClass: (body: CreateClassInput) =>
    api.post<{ id: number }>('/admin/classes', body).then(r => r.data),
  enrollStudent: (classId: number, body: { student_id: number; roll_no?: string }) =>
    api.post(`/admin/classes/${classId}/students`, body),
  unenrollStudent: (classId: number, studentId: number) =>
    api.del(`/admin/classes/${classId}/students/${studentId}`),
  linkSubject: (classId: number, body: { subject_id: number; teacher_id?: number }) =>
    api.post(`/admin/classes/${classId}/subjects`, body),
  unlinkSubject: (classId: number, subjectId: number) =>
    api.del(`/admin/classes/${classId}/subjects/${subjectId}`),

  // ── Subjects ─────────────────────────────────────────────────────────────────
  subjects: (signal?: AbortSignal) => api.getData<ApiAdminSubject[]>('/admin/subjects', { signal }),
  createSubject: (body: CreateSubjectInput) =>
    api.post<{ id: number }>('/admin/subjects', body).then(r => r.data),
  updateSubject: (id: number, body: UpdateSubjectInput) =>
    api.patch<{ id: number }>(`/admin/subjects/${id}`, body).then(r => r.data),
  deleteSubject: (id: number) => api.del(`/admin/subjects/${id}`),

  // ── Analytics ────────────────────────────────────────────────────────────────
  analytics: (signal?: AbortSignal) =>
    api.getData<ApiAdminAnalytics>('/admin/analytics', { signal }),
};
