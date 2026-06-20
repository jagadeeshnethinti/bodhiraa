import { api } from '../client';

/**
 * Teacher endpoints (`role:teacher`).
 *
 * The real Laravel backend's JSON shapes have drifted from what the teacher
 * screens were designed against (the screens were built on static mock arrays).
 * Each endpoint below therefore curls the REAL response and ADAPTS it, inside
 * this layer, into the exact shape the consuming screen reads — so screens can
 * be wired with no further mapping. Return types are declared locally here
 * (types.ts is intentionally left untouched).
 *
 * Screen ↔ endpoint map:
 *   TeacherHomeScreen     → home (hero stats + schedule + class cards)
 *   TeacherStudentsScreen → classes, klass, attendance (roster + per-student)
 *   TeacherContentScreen  → assignments, quizzes (library cards)
 *   TeacherReportsScreen  → home stats, quizAnalytics (class performance)
 *   TeacherProfile*       → use the auth user; no teacher endpoint of their own
 */

// ─────────────────────────────────────────────────────────────────────────────
// Local return types — the UI-friendly shapes the screens consume
// ─────────────────────────────────────────────────────────────────────────────

/** Class card as shown on Home / Students / Profile. */
export interface TeacherClassCard {
  id: number;
  /** Display label, e.g. "Class 9-A". */
  name: string;
  grade: string;
  section: string;
  students: number;
  academicYear?: string | null;
}

/** Hero stat strip + alert + class cards for the dashboard. */
export interface TeacherHome {
  teacher: { id: number; name: string; school: string | null };
  /** Hero stat strip (Classes / Students / Pending). */
  stats: {
    classes: number;
    students: number;
    pending: number;
    assignmentsActive: number;
    quizzesPublished: number;
    attendanceToday: number;
  };
  classes: TeacherClassCard[];
  /** Recent-submission alert feed (the "needs review" list). */
  recentSubmissions: {
    id: number;
    assignmentTitle: string;
    student: string;
    className: string;
    status: string;
    submittedAt: string;
    graded: boolean;
  }[];
}

/** A single roster row on the Students screen. */
export interface TeacherRosterStudent {
  id: number;
  name: string;
  roll: string;
  avatar: string | null;
  present: boolean | null;
  status: string;
}

/** Class detail: roster + summary tiles, as the Students screen reads them. */
export interface TeacherClassDetail {
  klass: TeacherClassCard;
  students: TeacherRosterStudent[];
  subjects: { id: number; name: string; color: string | null }[];
  summary: {
    students: number;
    subjects: number;
    attendancePercent: number;
    assignmentsCount: number;
  };
}

/** Attendance sheet for a class on a given date. */
export interface TeacherAttendance {
  classId: number;
  date: string;
  records: {
    studentId: number;
    name: string;
    roll: string;
    present: boolean | null;
    status: string | null;
  }[];
}

/** Content-library card for an assignment (TeacherContentScreen). */
export interface TeacherAssignmentCard {
  id: number;
  title: string;
  className: string;
  subject: string | null;
  dueDate: string | null;
  maxMarks: number;
  submissionsCount: number;
  published: boolean;
}

/** Content-library card for a quiz (TeacherContentScreen). */
export interface TeacherQuizCard {
  id: number;
  title: string;
  subject: string | null;
  chapter: string | null;
  durationMin: number;
  totalMarks: number;
  questionsCount: number;
  attemptsCount: number;
  published: boolean;
}

/** Live-class row, normalised for the schedule/list UIs. */
export interface TeacherLiveClassCard {
  id: number;
  title: string;
  description: string | null;
  scheduledAt: string | null;
  durationMin: number;
  meetingUrl: string | null;
  status: string;
  liveStatus: string;
  classId: number | null;
  subjectId: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw wire shapes (what the backend actually returns) — kept local & minimal
// ─────────────────────────────────────────────────────────────────────────────

interface RawUser {
  id: number;
  name: string;
  avatar: string | null;
  status: string;
  pivot?: { roll_no?: string | null };
}
interface RawClassRow {
  id: number;
  label?: string;
  grade: string;
  section: string;
  students_count?: number;
  academic_year?: string | null;
}
interface RawHome {
  teacher: { id: number; name: string; school: string | null };
  stats: {
    classes_count: number;
    students_count: number;
    pending_grading: number;
    assignments_active: number;
    quizzes_published: number;
    attendance_today: number;
  };
  classes: { id: number; label: string; students_count: number }[];
  recent_submissions: {
    id: number;
    assignment_title: string;
    student: string;
    class: string;
    status: string;
    submitted_at: string;
    graded: boolean;
  }[];
}
interface RawClassDetail {
  class: {
    id: number;
    grade: string;
    section: string;
    academic_year?: string | null;
    students: RawUser[];
    subjects: { id: number; name: string; color: string | null }[];
  };
  stats: { students: number; subjects: number; attendance_percent: number; assignments_count: number };
}
interface RawAttendance {
  class: { id: number };
  date: string;
  records: { student_id: number; name: string; roll_no: string; status: string | null }[];
}
interface RawAssignment {
  id: number;
  title: string;
  class: string;
  subject: string | null;
  due_date: string | null;
  max_marks: number;
  submissions_count: number;
  is_published: boolean;
}
interface RawQuiz {
  id: number;
  title: string;
  subject: string | null;
  chapter: string | null;
  duration_min: number;
  total_marks: number;
  questions_count: number;
  attempts_count: number;
  is_published: boolean;
}
interface RawLiveClass {
  id: number;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  duration_min: number;
  meeting_url: string | null;
  status: string;
  live_status: string;
  class_id: number | null;
  subject_id: number | null;
  attendees?: { user_id: number; name: string | null; joined_at: string | null; left_at: string | null }[];
}
interface RawQuizAnalytics {
  quiz: { id: number; title: string; subject?: { name?: string | null } | null; chapter?: { title?: string | null } | null };
  stats: { attempts: number; avg_percent: number; pass_rate: number; highest: number; lowest: number };
  attempts: { id: number; student: string; score: number; total: number; percent: number; submitted_at: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────────────────────

/** "Class 9-A" style label from a raw class row (backend `label` is "Grade 9 - A"). */
const classLabel = (grade: string, section: string): string => `Class ${grade}-${section}`;

const mapClassCard = (c: RawClassRow): TeacherClassCard => ({
  id: c.id,
  name: classLabel(c.grade, c.section),
  grade: c.grade,
  section: c.section,
  students: c.students_count ?? 0,
  academicYear: c.academic_year ?? null,
});

export const TeacherApi = {
  home: async (signal?: AbortSignal): Promise<TeacherHome> => {
    const d = await api.getData<RawHome>('/teacher/home', { signal });
    return {
      teacher: d.teacher,
      stats: {
        classes: d.stats.classes_count,
        students: d.stats.students_count,
        pending: d.stats.pending_grading,
        assignmentsActive: d.stats.assignments_active,
        quizzesPublished: d.stats.quizzes_published,
        attendanceToday: d.stats.attendance_today,
      },
      // home `classes` carry only `label` ("Grade 9 - A"); derive grade/section from it.
      classes: d.classes.map(c => {
        const m = /(\d+)\s*-\s*([A-Za-z0-9]+)/.exec(c.label);
        const grade = m?.[1] ?? '';
        const section = m?.[2] ?? '';
        return {
          id: c.id,
          name: grade && section ? classLabel(grade, section) : c.label,
          grade,
          section,
          students: c.students_count,
        };
      }),
      recentSubmissions: d.recent_submissions.map(r => ({
        id: r.id,
        assignmentTitle: r.assignment_title,
        student: r.student,
        className: r.class,
        status: r.status,
        submittedAt: r.submitted_at,
        graded: r.graded,
      })),
    };
  },

  classes: async (signal?: AbortSignal): Promise<TeacherClassCard[]> => {
    const rows = await api.getData<RawClassRow[]>('/teacher/classes', { signal });
    return rows.map(mapClassCard);
  },

  klass: async (id: number, signal?: AbortSignal): Promise<TeacherClassDetail> => {
    const d = await api.getData<RawClassDetail>(`/teacher/classes/${id}`, { signal });
    const c = d.class;
    return {
      klass: {
        id: c.id,
        name: classLabel(c.grade, c.section),
        grade: c.grade,
        section: c.section,
        students: d.stats.students,
        academicYear: c.academic_year ?? null,
      },
      students: (c.students ?? []).map(s => ({
        id: s.id,
        name: s.name,
        roll: s.pivot?.roll_no ?? '',
        avatar: s.avatar,
        // No live-attendance flag on this endpoint; treat as unknown until the
        // attendance sheet is loaded. `active` status drives the present dot only
        // as a fallback default.
        present: null,
        status: s.status,
      })),
      subjects: (c.subjects ?? []).map(s => ({ id: s.id, name: s.name, color: s.color })),
      summary: {
        students: d.stats.students,
        subjects: d.stats.subjects,
        attendancePercent: d.stats.attendance_percent,
        assignmentsCount: d.stats.assignments_count,
      },
    };
  },

  attendance: async (classId: number, date: string, signal?: AbortSignal): Promise<TeacherAttendance> => {
    const d = await api.getData<RawAttendance>(`/teacher/classes/${classId}/attendance`, {
      query: { date },
      signal,
    });
    return {
      classId: d.class.id,
      date: d.date,
      records: d.records.map(r => ({
        studentId: r.student_id,
        name: r.name,
        roll: r.roll_no,
        // backend `status` is null when unmarked, else 'present'|'absent'|'late'.
        present: r.status === null ? null : r.status === 'present',
        status: r.status,
      })),
    };
  },

  saveAttendance: (
    classId: number,
    date: string,
    records: Record<string, string>,
  ): Promise<{ saved: number }> =>
    api.post<{ saved: number }>(`/teacher/classes/${classId}/attendance`, { date, records }).then(r => r.data),

  assignments: async (signal?: AbortSignal): Promise<TeacherAssignmentCard[]> => {
    const rows = await api.getData<RawAssignment[]>('/teacher/assignments', { signal });
    return rows.map(a => ({
      id: a.id,
      title: a.title,
      className: a.class,
      subject: a.subject,
      dueDate: a.due_date,
      maxMarks: a.max_marks,
      submissionsCount: a.submissions_count,
      published: a.is_published,
    }));
  },

  // Assignment detail is a rich nested shape (assignment + class + subject +
  // submissions + roster). No teacher screen reads it yet, so pass it through
  // untyped — adapt here once a detail screen exists.
  assignment: (id: number, signal?: AbortSignal) =>
    api.getData<Record<string, unknown>>(`/teacher/assignments/${id}`, { signal }),

  // Backend returns just `{ id }` on create — surface it as `{ id }`.
  createAssignment: (body: Record<string, unknown>): Promise<{ id: number }> =>
    api.post<{ id: number }>('/teacher/assignments', body).then(r => r.data),

  gradeSubmission: (
    submissionId: number,
    body: { score: number; feedback?: string },
  ): Promise<{ id: number; score: number; status: string; graded_at: string }> =>
    api
      .post<{ id: number; score: number; status: string; graded_at: string }>(
        `/teacher/submissions/${submissionId}/grade`,
        body,
      )
      .then(r => r.data),

  quizzes: async (signal?: AbortSignal): Promise<TeacherQuizCard[]> => {
    const rows = await api.getData<RawQuiz[]>('/teacher/quizzes', { signal });
    return rows.map(q => ({
      id: q.id,
      title: q.title,
      subject: q.subject,
      chapter: q.chapter,
      durationMin: q.duration_min,
      totalMarks: q.total_marks,
      questionsCount: q.questions_count,
      attemptsCount: q.attempts_count,
      published: q.is_published,
    }));
  },

  quizAnalytics: async (quizId: number, signal?: AbortSignal) => {
    const d = await api.getData<RawQuizAnalytics>(`/teacher/quizzes/${quizId}/analytics`, { signal });
    return {
      quiz: {
        id: d.quiz.id,
        title: d.quiz.title,
        subject: d.quiz.subject?.name ?? null,
        chapter: d.quiz.chapter?.title ?? null,
      },
      stats: {
        attempts: d.stats.attempts,
        avgPercent: d.stats.avg_percent,
        passRate: d.stats.pass_rate,
        highest: d.stats.highest,
        lowest: d.stats.lowest,
      },
      attempts: d.attempts.map(a => ({
        id: a.id,
        student: a.student,
        score: a.score,
        total: a.total,
        percent: a.percent,
        submittedAt: a.submitted_at,
      })),
    };
  },

  liveClasses: async (signal?: AbortSignal): Promise<TeacherLiveClassCard[]> => {
    const rows = await api.getData<RawLiveClass[]>('/teacher/live-classes', { signal });
    return rows.map(mapLiveClass);
  },

  liveClass: async (
    id: number,
    signal?: AbortSignal,
  ): Promise<TeacherLiveClassCard & { attendees: { userId: number; name: string | null; joinedAt: string | null; leftAt: string | null }[] }> => {
    const d = await api.getData<RawLiveClass>(`/teacher/live-classes/${id}`, { signal });
    return {
      ...mapLiveClass(d),
      attendees: (d.attendees ?? []).map(a => ({
        userId: a.user_id,
        name: a.name,
        joinedAt: a.joined_at,
        leftAt: a.left_at,
      })),
    };
  },

  scheduleLiveClass: async (body: Record<string, unknown>): Promise<TeacherLiveClassCard> => {
    const d = (await api.post<RawLiveClass>('/teacher/live-classes', body)).data;
    return mapLiveClass(d);
  },

  cancelLiveClass: async (id: number): Promise<TeacherLiveClassCard> => {
    const d = (await api.post<RawLiveClass>(`/teacher/live-classes/${id}/cancel`)).data;
    return mapLiveClass(d);
  },
};

const mapLiveClass = (lc: RawLiveClass): TeacherLiveClassCard => ({
  id: lc.id,
  title: lc.title,
  description: lc.description,
  scheduledAt: lc.scheduled_at,
  durationMin: lc.duration_min,
  meetingUrl: lc.meeting_url,
  status: lc.status,
  liveStatus: lc.live_status,
  classId: lc.class_id,
  subjectId: lc.subject_id,
});
