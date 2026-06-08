import { api } from '../client';

/**
 * Teacher endpoints (`role:teacher`). Service layer is complete and typed
 * loosely where the backend renders open dashboard shapes; the teacher *screens*
 * are wired in a later pass (see api.md §6).
 */
export const TeacherApi = {
  home: (signal?: AbortSignal) => api.getData('/teacher/home', { signal }),

  classes: (signal?: AbortSignal) => api.getData('/teacher/classes', { signal }),
  klass: (id: number, signal?: AbortSignal) => api.getData(`/teacher/classes/${id}`, { signal }),

  attendance: (classId: number, date: string, signal?: AbortSignal) =>
    api.getData(`/teacher/classes/${classId}/attendance`, { query: { date }, signal }),
  saveAttendance: (classId: number, date: string, records: Record<string, string>) =>
    api.post(`/teacher/classes/${classId}/attendance`, { date, records }).then(r => r.data),

  assignments: (signal?: AbortSignal) => api.getData('/teacher/assignments', { signal }),
  assignment: (id: number, signal?: AbortSignal) => api.getData(`/teacher/assignments/${id}`, { signal }),
  createAssignment: (body: Record<string, unknown>) =>
    api.post('/teacher/assignments', body).then(r => r.data),
  gradeSubmission: (submissionId: number, body: { score: number; feedback?: string }) =>
    api.post(`/teacher/submissions/${submissionId}/grade`, body).then(r => r.data),

  quizzes: (signal?: AbortSignal) => api.getData('/teacher/quizzes', { signal }),
  quizAnalytics: (quizId: number, signal?: AbortSignal) =>
    api.getData(`/teacher/quizzes/${quizId}/analytics`, { signal }),

  liveClasses: (signal?: AbortSignal) => api.getData('/teacher/live-classes', { signal }),
  liveClass: (id: number, signal?: AbortSignal) => api.getData(`/teacher/live-classes/${id}`, { signal }),
  scheduleLiveClass: (body: Record<string, unknown>) =>
    api.post('/teacher/live-classes', body).then(r => r.data),
  cancelLiveClass: (id: number) => api.post(`/teacher/live-classes/${id}/cancel`).then(r => r.data),
};
