import { Colors } from '../theme';
import type { IconName } from '../components/common/Icon';

/** "Riya Sharma" → "R". Falls back to a neutral glyph. */
export function initials(name?: string | null): string {
  if (!name) return '?';
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

/** A soft, translucent background derived from a subject's hex color. */
export function subjectTint(color?: string | null): string {
  if (color && /^#([0-9a-fA-F]{6})$/.test(color)) return `${color}1A`; // ~10% alpha
  return Colors.primaryLight;
}

/** Subject accent color with a safe fallback to the brand gold. */
export function subjectColor(color?: string | null): string {
  if (color && /^#([0-9a-fA-F]{3,8})$/.test(color)) return color;
  return Colors.primary;
}

/**
 * Maps a subject (by its backend icon/emoji or name) to one of our flat
 * `Icon` names. Falls back to a book. Used wherever a subject is shown with an
 * accent tile, so the app stays on the bundled flat-icon set instead of emoji.
 */
export function subjectIconName(raw?: string | null): IconName {
  const v = (raw || '').toLowerCase();
  if (/chem|⚗|🧪|🧫/.test(v)) return 'flask';
  if (/phys|⚛|🧲|🔭/.test(v)) return 'microscope';
  if (/🔬/.test(v)) return 'microscope';
  if (/math|algebra|geometr|trig|calc|📐|➗|🔢|📏/.test(v)) return 'calculator';
  if (/bio|🧬|🌱|🍃/.test(v)) return 'flask';
  if (/comp|coding|code|💻|🖥/.test(v)) return 'desktop';
  if (/social|history|civic|geograph|🌍|🗺|🏛/.test(v)) return 'school';
  if (/eng|lang|hindi|literat|grammar|📖|✍|📝|📚/.test(v)) return 'book';
  return 'book';
}

/**
 * Render an ISO-8601 timestamp as a local time like "10:00 AM". Returns '' if
 * the value can't be parsed.
 */
export function clockTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "Jun 6, 2026 · 10:00 AM" from an ISO timestamp. */
export function dateTimeLabel(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${date} · ${clockTime(iso)}`;
}

/**
 * Human "time until" an upcoming timestamp: "in 2h 15m", "in 45m", "Starting
 * now". Returns '' for past times.
 */
export function relativeUntil(iso?: string | null, now: number = Date.now()): string {
  if (!iso) return '';
  const target = new Date(iso).getTime();
  if (isNaN(target)) return '';
  const diffMs = target - now;
  if (diffMs <= 0) return 'Starting now';
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hours < 24) return rem ? `in ${hours}h ${rem}m` : `in ${hours}h`;
  const days = Math.floor(hours / 24);
  return `in ${days}d`;
}

/** "9m", "45s" passthrough or derive from seconds. */
export function durationLabel(label?: string | null, seconds?: number | null): string {
  if (label) return label;
  if (seconds == null) return '';
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)}m`;
}
