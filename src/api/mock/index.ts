/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  MOCK BACKEND  (UI-design mode)
 * ─────────────────────────────────────────────────────────────────────────────
 * A self-contained, in-memory stand-in for the real API so the whole app can be
 * designed and demoed with no server running. It is wired in exactly one place —
 * `client.ts` short-circuits to `resolveMock()` when `Env.useMock` is true.
 *
 * TO RE-ENABLE THE REAL BACKEND: set `useMock: false` in `src/config/env.ts`.
 * Nothing else changes — every screen and endpoint keeps calling the same
 * `api.get/post/...`, so integration is a one-line flip.
 *
 * This module has no side effects and imports only wire types, so it can never
 * affect the real network path.
 */
import type {
  ApiAiReply,
  ApiAiSessionDetail,
  ApiAiSessionSummary,
  ApiAttempt,
  ApiAttemptResult,
  ApiBadgeCollection,
  ApiChapter,
  ApiChapterLessons,
  ApiChatContact,
  ApiChatThread,
  ApiConversation,
  ApiJoinResult,
  ApiLesson,
  ApiLessonProgress,
  ApiLiveClass,
  ApiLiveClassBuckets,
  ApiLiveClassDetail,
  ApiMeta,
  ApiNotification,
  ApiQuizDetail,
  ApiQuizQuestion,
  ApiQuizSummary,
  ApiStudentHome,
  ApiStudentProfile,
  ApiSubject,
  ApiSubjectDetail,
  ApiUser,
  AuthPayload,
  Role,
  School,
} from '../types';

export interface MockResult {
  data: unknown;
  meta: ApiMeta | null;
  message: string | null;
}

interface MockCtx {
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  token: string | null;
}

// ── helpers ───────────────────────────────────────────────────────────────────

const ok = (data: unknown, meta: ApiMeta | null = null, message: string | null = null): MockResult => ({
  data,
  meta,
  message,
});

/** ISO timestamp `min` minutes from now (negative = in the past). */
const iso = (min: number): string => new Date(Date.now() + min * 60_000).toISOString();

const ROLES: Role[] = ['student', 'teacher', 'parent', 'admin', 'super_admin'];

// Schools the mock knows about, keyed by login code. Each ships a brand colour so
// the app re-themes when a student signs in with that school.
const SCHOOLS: Record<string, School> = {
  'DPS-DEL': { id: 1, name: 'Delhi Public School', code: 'DPS-DEL', logo: null, theme_color: '#2F6FED' },
  'GIS-MUM': { id: 2, name: 'Greenwood International', code: 'GIS-MUM', logo: null, theme_color: '#0E9E6E' },
  'VIS-HYD': { id: 3, name: 'Vivekananda Intl School', code: 'VIS-HYD', logo: null, theme_color: '#9E2438' },
};
const DEFAULT_SCHOOL_CODE = 'DPS-DEL';

interface SessionOpts {
  /** School code the user joined with; null/absent = personal (B2C) student. */
  schoolCode?: string | null;
  /** Personal (B2C) student — no school, private performance, monthly plan. */
  personal?: boolean;
}

/** mock-token-<role>[:<schoolCode>|:personal] */
function parseToken(token: string | null): { role: Role; opts: SessionOpts } {
  const m = token ? /^mock-token-([a-z_]+)(?::(.+))?$/.exec(token) : null;
  const r = m?.[1] as Role | undefined;
  const role = r && ROLES.includes(r) ? r : 'student';
  const suffix = m?.[2];
  if (role === 'student') {
    if (suffix === 'personal') return { role, opts: { personal: true } };
    return { role, opts: { schoolCode: suffix ?? DEFAULT_SCHOOL_CODE } };
  }
  return { role, opts: {} };
}

const tokenFor = (role: Role, opts: SessionOpts): string => {
  if (role === 'student') {
    return opts.personal ? 'mock-token-student:personal' : `mock-token-student:${opts.schoolCode ?? DEFAULT_SCHOOL_CODE}`;
  }
  return `mock-token-${role}`;
};

function makeUser(role: Role, opts: SessionOpts = {}): ApiUser {
  const personal = role === 'student' && !!opts.personal;
  const school = personal ? null : SCHOOLS[opts.schoolCode ?? DEFAULT_SCHOOL_CODE] ?? SCHOOLS[DEFAULT_SCHOOL_CODE];
  const base = {
    avatar: null,
    gender: null,
    dob: null,
    status: 'active',
    school,
    // Personal students are on a paid monthly plan (12 days left, for the
    // countdown); everyone inside a school is on the school plan.
    plan: personal
      ? { tier: 'monthly' as const, expires_at: iso(12 * 24 * 60) }
      : { tier: 'school' as const, expires_at: null },
    // Private learners hide their performance from teachers; school members share it.
    visibility: personal ? ('private' as const) : ('school' as const),
    email_verified: true,
    phone_verified: true,
    created_at: iso(-60 * 24 * 120),
  };
  switch (role) {
    case 'teacher':
      return { ...base, id: 201, name: 'Dr. Meera Sharma', email: 'meera@dps.edu', phone: '+919800000201', role: 'teacher', role_label: 'Teacher', grade: null };
    case 'parent':
      return { ...base, id: 301, name: 'Rajesh Sharma', email: 'rajesh@example.com', phone: '+919800000301', role: 'parent', role_label: 'Parent', grade: null };
    case 'admin':
    case 'super_admin':
      return { ...base, id: 401, name: 'School Admin', email: 'admin@dps.edu', phone: '+919800000401', role, role_label: role === 'super_admin' ? 'Super Admin' : 'Administrator', grade: null };
    case 'student':
    default:
      return { ...base, id: 101, name: personal ? 'Arjun Sharma' : 'Arjun Sharma', email: personal ? 'arjun@gmail.com' : 'arjun@dps.edu', phone: '+919800000101', role: 'student', role_label: 'Student', grade: '11' };
  }
}

const authPayload = (role: Role, opts: SessionOpts = {}): AuthPayload => ({
  user: makeUser(role, opts),
  token: tokenFor(role, opts),
  token_type: 'Bearer',
});

// ── student data ────────────────────────────────────────────────────────────

const SUBJECTS: ApiSubject[] = [
  { id: 1, name: 'Physics', icon: 'physics', color: '#2F6FED', grade: '11', chapters_count: 8 },
  { id: 2, name: 'Chemistry', icon: 'chemistry', color: '#0E7C5A', grade: '11', chapters_count: 7 },
  { id: 3, name: 'Mathematics', icon: 'math', color: '#7A3FF2', grade: '11', chapters_count: 10 },
  { id: 4, name: 'Biology', icon: 'biology', color: '#C47A20', grade: '11', chapters_count: 6 },
  { id: 5, name: 'English', icon: 'english', color: '#C42060', grade: '11', chapters_count: 5 },
  { id: 6, name: 'Computer Science', icon: 'computer', color: '#1E3A8A', grade: '11', chapters_count: 9 },
];

// ▶️ LESSON VIDEO — paste your own direct video URL here to use it for all lessons.
//    Must be a direct, playable file (e.g. https://.../Rexy-and-the-Volcano-1080p.mp4
//    or an .m3u8 stream). YouTube / vidssave *page* links won't play — use the direct
//    download link. Replace the placeholder below:
const SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const QUIZZES: ApiQuizSummary[] = [
  { id: 1, title: 'Physics: Kinematics', subject_id: 1, subject: 'Physics', duration_min: 20, total_marks: 20, questions_count: 5, status: 'available', starts_at: null },
  { id: 2, title: 'Chemistry: Periodic Table', subject_id: 2, subject: 'Chemistry', duration_min: 15, total_marks: 15, questions_count: 5, status: 'available', starts_at: null },
  { id: 3, title: 'Maths: Quadratic Equations', subject_id: 3, subject: 'Mathematics', duration_min: 30, total_marks: 30, questions_count: 5, status: 'available', starts_at: iso(180) },
];

const LIVE_NOW: ApiLiveClass = { id: 11, title: 'Wave Optics — Live Doubt Session', description: 'Interference, diffraction & polarisation.', scheduled_at: iso(-10), duration_min: 60, host_name: 'Dr. Meera Sharma', live_status: 'live', subject_id: 1 };
const UPCOMING: ApiLiveClass[] = [
  { id: 12, title: 'Organic Chemistry: Aldehydes & Ketones', description: 'Reactions and mechanisms.', scheduled_at: iso(150), duration_min: 45, host_name: 'Mr. A. Verma', live_status: 'scheduled', subject_id: 2 },
  { id: 13, title: 'Calculus Revision Marathon', description: 'Limits, derivatives & integrals.', scheduled_at: iso(330), duration_min: 90, host_name: 'Ms. P. Nair', live_status: 'scheduled', subject_id: 3 },
];
const PAST: ApiLiveClass[] = [
  { id: 14, title: "Newton's Laws of Motion", description: 'Recap session.', scheduled_at: iso(-60 * 24), duration_min: 60, host_name: 'Dr. Meera Sharma', live_status: 'ended', subject_id: 1 },
];

const PROFILE: ApiStudentProfile = {
  lessons_completed: 48,
  quizzes_taken: 12,
  day_streak: 14,
  avg_score: 82,
  hours_learned: 36,
  rank: 4,
  level: 7,
  level_progress: 68,
  xp_points: 2480,
};

const TIER_COLORS: Record<string, { colors: string[]; glow: string; label: string }> = {
  bronze: { label: 'Bronze', colors: ['#F6D9B8', '#CD7F32', '#8C5A24'], glow: 'rgba(205,127,50,.55)' },
  silver: { label: 'Silver', colors: ['#F4F7FA', '#AEB8C2', '#7D8893'], glow: 'rgba(174,184,194,.55)' },
  gold: { label: 'Gold', colors: ['#FFF1C9', '#F5C84B', '#C9982E'], glow: 'rgba(245,200,75,.6)' },
  platinum: { label: 'Platinum', colors: ['#EAFBFF', '#B9F2FF', '#6DD5FA'], glow: 'rgba(109,213,250,.6)' },
};

const mockBadge = (
  key: string,
  title: string,
  icon: string,
  tier: 'bronze' | 'silver' | 'gold' | 'platinum',
  xp: number,
  desc: string,
  earned: boolean,
) => ({
  key, title, icon, tier, xp, desc, earned,
  tier_label: TIER_COLORS[tier].label,
  colors: TIER_COLORS[tier].colors,
  glow: TIER_COLORS[tier].glow,
  earned_at: earned ? '2026-06-18T10:00:00+00:00' : null,
});

const BADGE_LIST = [
  mockBadge('perfect_score', 'Perfect Score', '💯', 'platinum', 120, 'A flawless 100% — not a single mistake.', true),
  mockBadge('flawless_combo', 'Flawless Victory', '👑', 'platinum', 150, 'Perfect score, lightning fast. Elite.', false),
  mockBadge('quiz_conqueror', 'Quiz Conqueror', '🔥', 'gold', 70, 'Crushed the quiz with a top score.', true),
  mockBadge('fast_finisher', 'Fast Finisher', '🚀', 'gold', 55, 'Aced it in record time.', true),
  mockBadge('number_ninja', 'Number Ninja', '🧮', 'gold', 55, 'Mastered a Mathematics challenge.', false),
  mockBadge('logic_explorer', 'Logic Explorer', '🧪', 'gold', 55, 'Conquered a Science quiz.', false),
  mockBadge('word_wizard', 'Word Wizard', '📖', 'gold', 55, 'Top marks in language & literature.', false),
  mockBadge('concept_master', 'Concept Master', '🎓', 'gold', 55, 'Deep mastery of the subject.', false),
  mockBadge('sharp_mind', 'Sharp Mind', '🧠', 'silver', 45, 'Scored 80% or higher. Crisp thinking!', true),
  mockBadge('quiz_winner', 'Quiz Winner', '🎉', 'bronze', 30, 'Passed the quiz — momentum building!', true),
  mockBadge('first_steps', 'First Steps', '🌱', 'bronze', 25, 'Completed your very first quiz.', true),
];

const BADGES: ApiBadgeCollection = {
  badges: BADGE_LIST,
  earned_count: BADGE_LIST.filter(b => b.earned).length,
  total: BADGE_LIST.length,
  total_xp: BADGE_LIST.filter(b => b.earned).reduce((s, b) => s + b.xp, 0),
  completion_percent: Math.round((BADGE_LIST.filter(b => b.earned).length / BADGE_LIST.length) * 100),
};

// ── Chat (parent ↔ teacher) ──────────────────────────────────────────────────
const CHAT_PARTNER = { id: 901, name: 'Mrs. Anita Sharma', role: 'teacher', role_label: 'Teacher', avatar: null };
const CHAT_THREADS: Record<number, ApiChatThread> = {
  1: {
    conversation: { id: 1, partner: CHAT_PARTNER },
    messages: [
      { id: 1, body: 'Good morning! Just wanted to share that Aarav did really well in today’s Maths quiz. 🎉', mine: false, read: true, created_at: '2026-06-24T09:10:00+00:00', time: '9:10 AM' },
      { id: 2, body: 'That’s wonderful to hear, thank you for letting me know!', mine: true, read: true, created_at: '2026-06-24T09:14:00+00:00', time: '9:14 AM' },
      { id: 3, body: 'He’s been practising the worksheets at home every evening.', mine: true, read: true, created_at: '2026-06-24T09:15:00+00:00', time: '9:15 AM' },
      { id: 4, body: 'It shows! Could you ensure he revises chapter 6 before Friday’s class test?', mine: false, read: false, created_at: '2026-06-24T09:20:00+00:00', time: '9:20 AM' },
    ],
  },
};
const CONVERSATIONS: ApiConversation[] = [
  { id: 1, partner: CHAT_PARTNER, last_message_at: '2026-06-24T09:20:00+00:00', unread_count: 1, preview: { body: 'Could you ensure he revises chapter 6 before Friday’s class test?', mine: false, time: '9:20 AM' } },
  { id: 2, partner: { id: 902, name: 'Mr. Rahul Verma', role: 'teacher', role_label: 'Teacher', avatar: null }, last_message_at: '2026-06-22T16:02:00+00:00', unread_count: 0, preview: { body: 'Thank you, see you at the PTM.', mine: true, time: '4:02 PM' } },
];
const CHAT_CONTACTS: ApiChatContact[] = [
  { start: 'with-teacher', student: { id: 11, name: 'Aarav' }, partner: CHAT_PARTNER },
  { start: 'with-teacher', student: { id: 12, name: 'Diya' }, partner: { id: 902, name: 'Mr. Rahul Verma', role: 'teacher', role_label: 'Teacher', avatar: null } },
];
let chatMsgSeq = 1000;

const AI_RECOMMENDATIONS: string[] = [
  'Explain Newton’s third law with an example',
  'What is the difference between speed and velocity?',
  'How do I balance a redox reaction?',
  'Solve: x² − 5x + 6 = 0',
  'Summarise the structure of a plant cell',
];

function notifications(): { items: ApiNotification[]; unread: number } {
  const items: ApiNotification[] = [
    { id: 'n1', type: 'live_class', icon: 'video', title: 'Live class starting soon', body: 'Wave Optics with Dr. Meera Sharma begins in 10 minutes.', meta: null, url: null, read_at: null, created_at: iso(-8) },
    { id: 'n2', type: 'quiz', icon: 'edit', title: 'New quiz assigned', body: 'Chemistry: Periodic Table — due this Friday.', meta: null, url: null, read_at: null, created_at: iso(-120) },
    { id: 'n3', type: 'achievement', icon: 'trophy', title: '14-day streak! 🔥', body: 'You’re on a roll — keep it going.', meta: null, url: null, read_at: iso(-200), created_at: iso(-60 * 20) },
    { id: 'n4', type: 'grade', icon: 'chart', title: 'Quiz graded', body: 'You scored 16/20 in Physics: Kinematics.', meta: null, url: null, read_at: iso(-60 * 24), created_at: iso(-60 * 26) },
  ];
  return { items, unread: items.filter(n => n.read_at === null).length };
}

function chaptersFor(subjectId: number): ApiChapter[] {
  const subject = SUBJECTS.find(s => s.id === subjectId) ?? SUBJECTS[0];
  const titles = ['Introduction & Basics', 'Core Concepts', 'Applications', 'Problem Solving', 'Advanced Topics', 'Revision & Practice'];
  return Array.from({ length: Math.min(subject.chapters_count, 6) }, (_, i) => ({
    id: subjectId * 100 + i + 1,
    title: `${i + 1}. ${titles[i % titles.length]}`,
    subject_id: subjectId,
    sort_order: i + 1,
    lessons_count: 4 + (i % 3),
  }));
}

function lessonsFor(chapterId: number): ApiLesson[] {
  const types: ApiLesson['type'][] = ['video', 'text', 'pdf', 'video', 'quiz'];
  const titles = ['Concept Overview', 'Worked Examples', 'Reference Notes', 'Deep Dive', 'Practice Quiz'];
  return types.map((type, i) => ({
    id: chapterId * 100 + i + 1,
    chapter_id: chapterId,
    title: `${titles[i]}`,
    slug: `lesson-${chapterId}-${i + 1}`,
    type,
    thumbnail: null,
    content_url: type === 'video' ? SAMPLE_VIDEO : null,
    duration_sec: type === 'video' ? 540 : null,
    duration_label: type === 'video' ? '9m' : type === 'quiz' ? '5 Q' : '4m read',
    is_free: true,
    sort_order: i + 1,
    progress: { status: i === 0 ? 'completed' : 'not_started', watched_seconds: i === 0 ? 540 : 0, progress_percent: i === 0 ? 100 : 0 },
    quiz_id: type === 'quiz' ? 1 : null,
  }));
}

function lessonDetail(id: number): ApiLesson {
  return {
    id,
    chapter_id: Math.floor(id / 100),
    title: 'Concept Overview',
    slug: `lesson-${id}`,
    type: 'text',
    thumbnail: null,
    content_url: null,
    duration_sec: null,
    duration_label: '4m read',
    is_free: true,
    sort_order: 1,
    content_body:
      'This lesson introduces the core idea with clear, worked intuition.\n\n' +
      'Key points:\n• Definition and where it applies\n• A simple derivation\n• Two solved examples\n\n' +
      'Tip: try the practice quiz at the end of this chapter to lock it in.',
    progress: { status: 'in_progress', watched_seconds: 0, progress_percent: 35 },
    siblings: [
      { id: id + 1, title: 'Worked Examples', type: 'video' },
      { id: id + 2, title: 'Reference Notes', type: 'pdf' },
    ],
    quiz_id: null,
  };
}

function quizDetail(id: number): ApiQuizDetail {
  const summary = QUIZZES.find(q => q.id === id) ?? QUIZZES[0];
  const questions: ApiQuizQuestion[] = [
    { id: 1, text: 'What is the SI unit of acceleration?', type: 'mcq', marks: 4, options: [ { id: 1, text: 'm/s' }, { id: 2, text: 'm/s²' }, { id: 3, text: 'm²/s' }, { id: 4, text: 'N' } ] },
    { id: 2, text: 'Velocity is a scalar quantity.', type: 'boolean', marks: 4, options: [ { id: 5, text: 'True' }, { id: 6, text: 'False' } ] },
    { id: 3, text: 'Which of the following are vector quantities?', type: 'multi', marks: 4, options: [ { id: 7, text: 'Displacement' }, { id: 8, text: 'Speed' }, { id: 9, text: 'Force' }, { id: 10, text: 'Mass' } ] },
    { id: 4, text: 'A body at rest stays at rest unless acted on by a force. This is Newton’s ___ law.', type: 'mcq', marks: 4, options: [ { id: 11, text: 'First' }, { id: 12, text: 'Second' }, { id: 13, text: 'Third' }, { id: 14, text: 'Zeroth' } ] },
    { id: 5, text: 'State the formula for kinetic energy.', type: 'fill', marks: 4, options: [] },
  ];
  return { ...summary, description: 'A short practice quiz to test your understanding. Take your time — you can review answers at the end.', questions };
}

const AI_SESSIONS: ApiAiSessionSummary[] = [
  { id: 1, title: 'Doubt: Wave Optics', messages_count: 4, last_message_at: iso(-60), created_at: iso(-120) },
  { id: 2, title: 'Quadratic equations help', messages_count: 2, last_message_at: iso(-60 * 20), created_at: iso(-60 * 22) },
];

function aiSessionDetail(id: number): ApiAiSessionDetail {
  const summary = AI_SESSIONS.find(s => s.id === id) ?? AI_SESSIONS[0];
  return {
    ...summary,
    messages: [
      { id: 1, role: 'user', content: 'Can you explain interference of light simply?', created_at: iso(-65) },
      { id: 2, role: 'assistant', content: 'Sure! Interference happens when two light waves overlap. Where crests meet crests you get a bright band (constructive); where a crest meets a trough they cancel (destructive). The bright and dark bands you see are the result.', created_at: iso(-64) },
    ],
  };
}

function aiReply(body: string): ApiAiReply {
  return {
    user: { id: Math.floor(Date.now() / 1000), role: 'user', content: body, created_at: iso(0) },
    assistant: {
      id: Math.floor(Date.now() / 1000) + 1,
      role: 'assistant',
      content:
        `Great question! Here’s a clear way to think about “${body.slice(0, 60)}”:\n\n` +
        '1. Start from the core definition.\n2. Apply it to a simple example.\n3. Check your reasoning against the units.\n\n' +
        '(This is a sample AI response — connect the real backend to get live answers.)',
      created_at: iso(0),
    },
  };
}

function studentHome(): ApiStudentHome {
  return {
    greeting: 'Good morning, Arjun 👋',
    streak_days: 14,
    daily_goal_percent: 72,
    lessons_today: 3,
    lessons_goal: 5,
    xp_points: 2480,
    continue_lesson: {
      lesson_id: 10103,
      subject_name: 'Physics',
      chapter: 'Wave Optics & Interference',
      progress_percent: 62,
      icon: 'physics',
      color: '#2F6FED',
    },
    subjects: SUBJECTS,
    todays_classes: [LIVE_NOW, UPCOMING[0]],
    pending_assignments: 3,
    next_quiz: QUIZZES[0],
  };
}

function liveBuckets(): ApiLiveClassBuckets {
  return { live_now: [LIVE_NOW], upcoming: UPCOMING, past: PAST };
}

function liveDetail(id: number): ApiLiveClassDetail {
  const all = [LIVE_NOW, ...UPCOMING, ...PAST];
  const lc = all.find(c => c.id === id) ?? LIVE_NOW;
  return { ...lc, attendees: [ { user_id: 101, name: 'Arjun Sharma', joined_at: iso(-9), left_at: null }, { user_id: 102, name: 'Priya Menon', joined_at: iso(-8), left_at: null } ] };
}

// ── router ────────────────────────────────────────────────────────────────────

/**
 * Resolve a single mock request. Returns `null` for any path we don't model
 * (the caller logs it in dev and returns an empty payload).
 */
export function resolveMock(method: string, rawPath: string, ctx: MockCtx): MockResult | null {
  const path = rawPath.replace(/^\//, '').split('?')[0];
  const body = (ctx.body ?? {}) as Record<string, unknown>;
  const num = (re: RegExp): number => Number(re.exec(path)?.[1] ?? 0);

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (method === 'POST' && path === 'auth/login') {
    const role = ROLES.includes(body.role as Role) ? (body.role as Role) : 'student';
    const rawCode = typeof body.school_code === 'string' ? body.school_code.trim().toUpperCase() : '';
    // Student with no school code = personal/B2C; otherwise join their school.
    const opts: SessionOpts = role === 'student' && !rawCode ? { personal: true } : { schoolCode: rawCode || DEFAULT_SCHOOL_CODE };
    return ok(authPayload(role, opts));
  }
  if (method === 'POST' && path === 'auth/register') {
    // Self-service registration is always a personal (B2C) student account.
    return ok(authPayload('student', { personal: true }));
  }
  if (method === 'POST' && path === 'auth/forgot-password') return ok({ email: String(body.email ?? '') });
  if (method === 'POST' && path === 'auth/otp/send') return ok({ phone: String(body.phone ?? ''), otp: '123456' });
  if (method === 'POST' && path === 'auth/otp/verify') return ok(authPayload('student', { personal: true }));
  if (method === 'GET' && path === 'auth/me') {
    const { role, opts } = parseToken(ctx.token);
    return ok(makeUser(role, opts));
  }
  if (method === 'POST' && (path === 'auth/logout' || path === 'auth/logout-all')) return ok(null);

  // ── Notifications ───────────────────────────────────────────────────────────
  if (method === 'GET' && path === 'me/notifications') {
    const { items, unread } = notifications();
    return ok(items, { current_page: 1, per_page: 25, total: items.length, last_page: 1, unread_count: unread });
  }
  if (method === 'POST' && /^me\/notifications\/[^/]+\/read$/.test(path)) return ok(null);
  if (method === 'POST' && path === 'me/notifications/read-all') return ok({ marked: notifications().unread });

  // ── Student ─────────────────────────────────────────────────────────────────
  if (method === 'GET' && path === 'student/home') return ok(studentHome());
  if (method === 'GET' && path === 'student/profile') return ok(PROFILE);
  if (method === 'GET' && path === 'student/badges') return ok(BADGES);

  // ── Chat (parent ↔ teacher) ──
  if (method === 'GET' && path === 'chat') return ok(CONVERSATIONS);
  if (method === 'GET' && path === 'chat/contacts') return ok(CHAT_CONTACTS);
  if (method === 'POST' && (path.startsWith('chat/with-teacher/') || path.startsWith('chat/with-parent/'))) {
    return ok({ id: 1, partner: CHAT_PARTNER });
  }
  if (method === 'POST' && path.startsWith('chat/') && path.endsWith('/messages')) {
    const id = Number(path.split('/')[1]) || 1;
    const msg = {
      id: ++chatMsgSeq,
      body: String(body.body ?? ''),
      mine: true,
      read: false,
      created_at: '2026-06-25T10:00:00+00:00',
      time: '10:00 AM',
    };
    if (CHAT_THREADS[id]) CHAT_THREADS[id].messages.push(msg);
    return ok(msg);
  }
  if (method === 'GET' && /^chat\/\d+$/.test(path)) {
    const id = Number(path.split('/')[1]);
    return ok(CHAT_THREADS[id] ?? { conversation: { id, partner: CHAT_PARTNER }, messages: [] });
  }
  if (method === 'GET' && path === 'student/subjects') return ok(SUBJECTS);
  if (method === 'GET' && /^student\/subjects\/(\d+)$/.test(path)) {
    const id = num(/^student\/subjects\/(\d+)$/);
    const subject = SUBJECTS.find(s => s.id === id) ?? SUBJECTS[0];
    const detail: ApiSubjectDetail = { subject, chapters: chaptersFor(subject.id) };
    return ok(detail);
  }
  if (method === 'GET' && /^student\/chapters\/(\d+)\/lessons$/.test(path)) {
    const chapterId = num(/^student\/chapters\/(\d+)\/lessons$/);
    const payload: ApiChapterLessons = {
      chapter: { id: chapterId, title: 'Core Concepts', subject_id: Math.floor(chapterId / 100), lessons_count: 5 },
      lessons: lessonsFor(chapterId),
    };
    return ok(payload);
  }
  if (method === 'GET' && /^student\/lessons\/(\d+)$/.test(path)) return ok(lessonDetail(num(/^student\/lessons\/(\d+)$/)));
  if (method === 'POST' && /^student\/lessons\/(\d+)\/progress$/.test(path)) {
    const watched = Number((body as { watched_seconds?: number }).watched_seconds ?? 0);
    const completed = Boolean((body as { completed?: boolean }).completed);
    const progress: ApiLessonProgress = { status: completed ? 'completed' : 'in_progress', watched_seconds: watched, progress_percent: completed ? 100 : Math.min(95, Math.round(watched / 6)) };
    return ok(progress);
  }
  if (method === 'GET' && path === 'student/quizzes') return ok(QUIZZES);
  if (method === 'GET' && /^student\/quizzes\/(\d+)$/.test(path)) return ok(quizDetail(num(/^student\/quizzes\/(\d+)$/)));
  if (method === 'POST' && /^student\/quizzes\/(\d+)\/start$/.test(path)) {
    const quizId = num(/^student\/quizzes\/(\d+)\/start$/);
    const attempt: ApiAttempt = { id: 9000 + quizId, quiz_id: quizId, status: 'in_progress', started_at: iso(0) };
    return ok({ attempt });
  }
  if (method === 'POST' && /^student\/attempts\/(\d+)\/answer$/.test(path)) return ok(null);
  if (method === 'POST' && /^student\/attempts\/(\d+)\/submit$/.test(path)) {
    const attemptId = num(/^student\/attempts\/(\d+)\/submit$/);
    const result: ApiAttemptResult = { attempt_id: attemptId, score: 16, total_marks: 20, percent: 80, submitted_at: iso(0) };
    return ok(result);
  }

  // AI doubt solver
  if (method === 'GET' && path === 'student/ai/sessions') return ok(AI_SESSIONS);
  if (method === 'GET' && /^student\/ai\/sessions\/(\d+)$/.test(path)) return ok(aiSessionDetail(num(/^student\/ai\/sessions\/(\d+)$/)));
  if (method === 'POST' && path === 'student/ai/sessions') {
    const firstMessage = (body as { body?: string }).body;
    if (firstMessage) return ok(aiReply(firstMessage));
    const fresh: ApiAiSessionDetail = { id: Math.floor(Date.now() / 1000), title: null, messages_count: 0, last_message_at: null, created_at: iso(0), messages: [] };
    return ok(fresh);
  }
  if (method === 'POST' && /^student\/ai\/sessions\/(\d+)\/messages$/.test(path)) return ok(aiReply(String((body as { body?: string }).body ?? '')));
  if (method === 'GET' && path === 'student/ai/recommendations') return ok(AI_RECOMMENDATIONS);

  // Live classes
  if (method === 'GET' && path === 'student/live-classes') return ok(liveBuckets());
  if (method === 'GET' && /^student\/live-classes\/(\d+)$/.test(path)) return ok(liveDetail(num(/^student\/live-classes\/(\d+)$/)));
  if (method === 'POST' && /^student\/live-classes\/(\d+)\/join$/.test(path)) {
    const result: ApiJoinResult = { meeting_url: 'https://meet.example.com/mock-room', provider: 'mock', live_status: 'live' };
    return ok(result);
  }

  // ── Teacher / Parent generic fallbacks (their home screens use static data) ──
  if (method === 'GET' && (path.startsWith('teacher/') || path.startsWith('parent/'))) {
    return ok(path.match(/(classes|children|assignments|quizzes|live-classes)$/) ? [] : {});
  }
  if ((method === 'POST' || method === 'PATCH') && (path.startsWith('teacher/') || path.startsWith('parent/'))) {
    return ok({ ok: true });
  }

  return null;
}
