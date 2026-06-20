import { api } from '../client';

/**
 * Parent endpoints (`role:parent`). All `{student}` calls 403 if the parent
 * isn't linked to that child.
 *
 * The real backend's JSON has drifted from the shapes the parent screens were
 * built against (the screens were prototyped on static consts / the mock). Each
 * function below curls the live response and ADAPTS it into the clean, UI-ready
 * shape a screen renders, so screens can consume `ParentApi.*` directly without
 * reshaping. Wire (raw) types are kept local to this file; UI-facing return
 * types are exported so screens can import them.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Raw wire shapes (what the Laravel backend actually returns) — local only.
// ─────────────────────────────────────────────────────────────────────────────

interface RawChildStats {
  attendance_total: number;
  attendance_present: number;
  attendance_percent: number;
  quizzes_attempted: number;
  avg_quiz_percent: number;
  pending_assignments: number;
  lessons_started: number;
  lessons_completed: number;
}

interface RawHome {
  parent: { id: number; name: string; children_count: number };
  children: Array<{
    id: number;
    name: string;
    grade: string | null;
    avatar_letter: string | null;
    relation: string | null;
    school: string | null;
    stats: RawChildStats;
  }>;
  alerts: Array<{ type: string; child: string; message: string }>;
}

interface RawChildListItem {
  id: number;
  name: string;
  grade: string | null;
  relation: string | null;
}

interface RawStudent {
  id: number;
  name: string;
  grade: string | null;
  avatar: string | null;
  gender: string | null;
  school?: { id: number; name: string } | null;
}

interface RawChildOverview {
  student: RawStudent;
  stats: RawChildStats;
  recent_lessons: Array<{
    title: string;
    subject: string;
    status: string;
    progress: number;
    last_viewed_at: string;
  }>;
  recent_quizzes: Array<{
    title: string;
    subject: string;
    score: number;
    total: number;
    percent: number;
    submitted_at: string;
  }>;
}

type RawAttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface RawAttendance {
  student: RawStudent;
  month: string;
  month_label: string;
  totals: { present: number; absent: number; late: number; excused: number; total: number; percent: number };
  records: Array<{ date: string; date_label: string; status: RawAttendanceStatus; remarks: string | null }>;
}

interface RawPerformance {
  student: RawStudent;
  by_subject: Array<{
    subject_id: number;
    subject: string;
    icon: string | null;
    color: string | null;
    attempts: number;
    avg_percent: number;
    highest: number;
    rating: string;
  }>;
  progress: Array<{ subject: string; started: number; completed: number }>;
  overall_avg: number;
}

interface RawAssignments {
  student: RawStudent;
  assignments: Array<{
    id: number;
    title: string;
    subject: string;
    class: string;
    due_date: string;
    max_marks: number;
    status: string;
    score: number | null;
    feedback: string | null;
    submitted_at: string | null;
  }>;
  totals: { total: number; graded: number; submitted: number; pending: number; missed: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// UI-ready shapes (what the parent screens render) — exported for screens.
// ─────────────────────────────────────────────────────────────────────────────

/** One child summarised for the Home hero / child switcher. */
export interface ParentChildSummary {
  id: number;
  name: string;
  /** "Class 10 · Bodhira Demo School" — what screens show under the name. */
  meta: string;
  grade: string | null;
  relation: string | null;
  avatarLetter: string;
  avgScore: number;
  attendance: number;
  lessonsStarted: number;
  lessonsCompleted: number;
  quizzesAttempted: number;
  pendingAssignments: number;
}

export interface ParentAlert {
  type: string;
  child: string;
  message: string;
}

/** ParentHomeScreen aggregate. */
export interface ParentHome {
  parentName: string;
  childrenCount: number;
  /** First/active child, surfaced for the hero card. Null if no children. */
  child: ParentChildSummary | null;
  children: ParentChildSummary[];
  alerts: ParentAlert[];
}

/** ParentProfileScreen child switcher row. */
export interface ParentChildRow {
  id: number;
  name: string;
  meta: string;
  relation: string | null;
}

export interface ParentSubjectMastery {
  subjectId: number;
  name: string;
  pct: number;
  rating: string;
}

export interface ParentActivityItem {
  title: string;
  meta: string;
}

/** ParentChildScreen overview. */
export interface ParentChildDetail {
  id: number;
  name: string;
  meta: string;
  avatar: string | null;
  avg: number;
  attendance: number;
  pendingAssignments: number;
  subjects: ParentSubjectMastery[];
  activity: ParentActivityItem[];
}

export type ParentDayStatus = 'present' | 'absent' | 'late' | 'off' | 'future';

export interface ParentAttendanceDay {
  /** 1-indexed day of month. */
  day: number;
  date: string;
  dateLabel: string;
  status: ParentDayStatus;
}

export interface ParentRecentDay {
  date: string;
  status: ParentDayStatus;
}

/** ParentAttendanceScreen. */
export interface ParentAttendance {
  month: string;
  monthLabel: string;
  presentRate: number;
  summary: { present: number; absent: number; late: number; excused: number; total: number };
  /** Day-of-month indexed statuses for the calendar heatmap. */
  days: ParentAttendanceDay[];
  recent: ParentRecentDay[];
}

export interface ParentSubjectGrade {
  subjectId: number;
  name: string;
  pct: number;
  /** Letter grade derived from pct (A+/A/B/C…). */
  grade: string;
}

/** ParentReportsScreen. */
export interface ParentPerformance {
  overallAvg: number;
  subjects: ParentSubjectGrade[];
}

export interface ParentAssignment {
  id: number;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  maxMarks: number;
  status: string;
  score: number | null;
  feedback: string | null;
  submittedAt: string | null;
}

/** ParentChildScreen / assignments list. */
export interface ParentAssignments {
  assignments: ParentAssignment[];
  totals: { total: number; graded: number; submitted: number; pending: number; missed: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapping helpers
// ─────────────────────────────────────────────────────────────────────────────

/** "Class 10 · Bodhira Demo School" from the parts the screen header shows. */
function childMeta(grade: string | null, school: string | null): string {
  const parts: string[] = [];
  if (grade) parts.push(`Class ${grade}`);
  if (school) parts.push(school);
  return parts.join(' · ');
}

function summariseChild(c: RawHome['children'][number]): ParentChildSummary {
  return {
    id: c.id,
    name: c.name,
    meta: childMeta(c.grade, c.school),
    grade: c.grade,
    relation: c.relation,
    // Backend gives `avatar_letter`; fall back to the first letter of the name.
    avatarLetter: c.avatar_letter || c.name.charAt(0).toUpperCase(),
    avgScore: c.stats.avg_quiz_percent,
    attendance: c.stats.attendance_percent,
    lessonsStarted: c.stats.lessons_started,
    lessonsCompleted: c.stats.lessons_completed,
    quizzesAttempted: c.stats.quizzes_attempted,
    pendingAssignments: c.stats.pending_assignments,
  };
}

/** Calendar/recent-day status — the screen has no `excused`, fold it into `off`. */
function mapDayStatus(s: RawAttendanceStatus): ParentDayStatus {
  return s === 'excused' ? 'off' : s;
}

/** Letter grade from a percentage, matching the screen's gradeColor bands. */
function letterGrade(pct: number): string {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  return 'D';
}

// ─────────────────────────────────────────────────────────────────────────────
// Endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const ParentApi = {
  /** Parent dashboard. Real shape: { parent, children:[{…,stats}], alerts }. */
  home: async (signal?: AbortSignal): Promise<ParentHome> => {
    const raw = await api.getData<RawHome>('/parent/home', { signal });
    const children = (raw.children ?? []).map(summariseChild);
    return {
      parentName: raw.parent?.name ?? '',
      childrenCount: raw.parent?.children_count ?? children.length,
      child: children[0] ?? null,
      children,
      alerts: raw.alerts ?? [],
    };
  },

  /** Child switcher rows. Real shape: [{id,name,grade,relation}] (no school). */
  children: async (signal?: AbortSignal): Promise<ParentChildRow[]> => {
    const raw = await api.getData<RawChildListItem[]>('/parent/children', { signal });
    return (raw ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      // This list endpoint omits school; meta is just the class here.
      meta: childMeta(c.grade, null),
      relation: c.relation,
    }));
  },

  /**
   * Single child overview. Real shape nests { student, stats, recent_lessons,
   * recent_quizzes }; the screen wants flat avg/attendance plus subject mastery
   * (derived from quizzes) and a recent-activity timeline.
   */
  child: async (studentId: number, signal?: AbortSignal): Promise<ParentChildDetail> => {
    const raw = await api.getData<RawChildOverview>(`/parent/children/${studentId}`, { signal });

    // Subject mastery: collapse recent quizzes by subject → average percent.
    const bySubject = new Map<string, { sum: number; n: number }>();
    for (const q of raw.recent_quizzes ?? []) {
      const e = bySubject.get(q.subject) ?? { sum: 0, n: 0 };
      e.sum += q.percent;
      e.n += 1;
      bySubject.set(q.subject, e);
    }
    const subjects: ParentSubjectMastery[] = [...bySubject.entries()].map(([name, e], i) => ({
      subjectId: i,
      name,
      pct: Math.round(e.sum / e.n),
      rating: e.sum / e.n >= 75 ? 'strong' : e.sum / e.n >= 50 ? 'average' : 'weak',
    }));

    // Recent activity timeline: merge lessons + quizzes into "title · meta" rows.
    const activity: ParentActivityItem[] = [
      ...(raw.recent_lessons ?? []).map((l) => ({
        title: l.title,
        meta: `${l.subject} · ${l.last_viewed_at}`,
      })),
      ...(raw.recent_quizzes ?? []).map((q) => ({
        title: `Quiz: ${q.title} — ${q.score}/${q.total}`,
        meta: `${q.subject} · ${q.submitted_at}`,
      })),
    ];

    return {
      id: raw.student.id,
      name: raw.student.name,
      meta: childMeta(raw.student.grade, raw.student.school?.name ?? null),
      avatar: raw.student.avatar,
      avg: raw.stats.avg_quiz_percent,
      attendance: raw.stats.attendance_percent,
      pendingAssignments: raw.stats.pending_assignments,
      subjects,
      activity,
    };
  },

  /**
   * Monthly attendance. Real shape: { student, month, month_label, totals,
   * records:[{date,date_label,status}] }. The calendar wants a day-indexed
   * array; `excused` folds into the screen's `off` bucket.
   */
  attendance: async (
    studentId: number,
    month: string,
    signal?: AbortSignal,
  ): Promise<ParentAttendance> => {
    const raw = await api.getData<RawAttendance>(`/parent/children/${studentId}/attendance`, {
      query: { month },
      signal,
    });

    const days: ParentAttendanceDay[] = (raw.records ?? []).map((r) => ({
      // date is "YYYY-MM-DD" — the day component drives the calendar cell.
      day: Number(r.date.slice(8, 10)),
      date: r.date,
      dateLabel: r.date_label,
      status: mapDayStatus(r.status),
    }));

    // Recent days = last 5 records, newest first.
    const recent: ParentRecentDay[] = [...(raw.records ?? [])]
      .slice(-5)
      .reverse()
      .map((r) => ({ date: r.date_label, status: mapDayStatus(r.status) }));

    return {
      month: raw.month,
      monthLabel: raw.month_label,
      presentRate: raw.totals?.percent ?? 0,
      summary: {
        present: raw.totals?.present ?? 0,
        absent: raw.totals?.absent ?? 0,
        late: raw.totals?.late ?? 0,
        excused: raw.totals?.excused ?? 0,
        total: raw.totals?.total ?? 0,
      },
      days,
      recent,
    };
  },

  /**
   * Subject performance / grades. Real shape: { by_subject, progress,
   * overall_avg }. The reports screen wants per-subject pct + a letter grade.
   */
  performance: async (studentId: number, signal?: AbortSignal): Promise<ParentPerformance> => {
    const raw = await api.getData<RawPerformance>(`/parent/children/${studentId}/performance`, {
      signal,
    });
    return {
      overallAvg: raw.overall_avg ?? 0,
      subjects: (raw.by_subject ?? []).map((s) => ({
        subjectId: s.subject_id,
        name: s.subject,
        pct: s.avg_percent,
        // Backend gives a `rating` (strong/weak); the screen shows a letter grade.
        grade: letterGrade(s.avg_percent),
      })),
    };
  },

  /**
   * Child assignments. Real shape is close already: { assignments:[…], totals }.
   * Just rename `class` (a JS reserved-ish key) → `className` and camelCase keys.
   */
  assignments: async (studentId: number, signal?: AbortSignal): Promise<ParentAssignments> => {
    const raw = await api.getData<RawAssignments>(`/parent/children/${studentId}/assignments`, {
      signal,
    });
    return {
      assignments: (raw.assignments ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        subject: a.subject,
        className: a.class,
        dueDate: a.due_date,
        maxMarks: a.max_marks,
        status: a.status,
        score: a.score,
        feedback: a.feedback,
        submittedAt: a.submitted_at,
      })),
      totals: raw.totals ?? { total: 0, graded: 0, submitted: 0, pending: 0, missed: 0 },
    };
  },
};
