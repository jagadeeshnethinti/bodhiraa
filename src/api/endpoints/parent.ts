import { api } from '../client';

/**
 * Parent endpoints (`role:parent`). All `{student}` calls 403 if the parent
 * isn't linked to that child. Service layer is complete; parent *screens* are
 * wired in a later pass (see api.md §7).
 */
export const ParentApi = {
  home: (signal?: AbortSignal) => api.getData('/parent/home', { signal }),
  children: (signal?: AbortSignal) => api.getData('/parent/children', { signal }),
  child: (studentId: number, signal?: AbortSignal) =>
    api.getData(`/parent/children/${studentId}`, { signal }),
  attendance: (studentId: number, month: string, signal?: AbortSignal) =>
    api.getData(`/parent/children/${studentId}/attendance`, { query: { month }, signal }),
  performance: (studentId: number, signal?: AbortSignal) =>
    api.getData(`/parent/children/${studentId}/performance`, { signal }),
  assignments: (studentId: number, signal?: AbortSignal) =>
    api.getData(`/parent/children/${studentId}/assignments`, { signal }),
};
