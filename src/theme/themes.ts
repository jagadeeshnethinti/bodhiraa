/**
 * Bodhira — brand themes.
 *
 * The app has ONE neutral palette (`Colors`) for surfaces/text, plus a swappable
 * *brand* layer defined here. Personal (B2C) users get the default Bodhira gold;
 * a student who signs in with their school gets that school's colour — accent +
 * dark hero gradients + glow — so the whole app re-skins per school.
 *
 * Known schools have hand-tuned palettes (below). Any other school that ships a
 * `theme_color` hex is themed automatically via `deriveTheme`.
 */
import type { School } from '../api/types';

export interface BrandTheme {
  key: string;
  /** Brand name shown in the UI (school name, or "Bodhira"). */
  name: string;
  accent: string;
  accentDark: string;
  accentLight: string;
  /** Readable colour for text/icons placed ON the accent. */
  onAccent: string;
  /** 4-stop dark gradient for screen heroes. */
  hero: string[];
  /** Darkest hero stop — use for the screen container bg + status bar. */
  heroSolid: string;
  /** Translucent accent for glow blobs / soft fills on dark heroes. */
  glow: string;
}

// ── Default: Bodhira (Antique Gold · Deep Maroon) ────────────────────────────
export const BODHIRA: BrandTheme = {
  key: 'bodhira',
  name: 'Bodhira',
  accent: '#C49560',
  accentDark: '#A87840',
  accentLight: '#FDF4E8',
  onAccent: '#1A0A0C',
  hero: ['#1A0A0C', '#2A0E13', '#3D1520', '#52202E'],
  heroSolid: '#1A0A0C',
  glow: 'rgba(196,149,96,0.22)',
};

// ── Hand-tuned school palettes (keyed by school code) ────────────────────────
export const SCHOOL_THEMES: Record<string, BrandTheme> = {
  'DPS-DEL': {
    key: 'DPS-DEL',
    name: 'Delhi Public School',
    accent: '#2F6FED',
    accentDark: '#2347B0',
    accentLight: '#EAF1FF',
    onAccent: '#FFFFFF',
    hero: ['#0A1330', '#12224F', '#1B2F6B', '#26408C'],
    heroSolid: '#0A1330',
    glow: 'rgba(47,111,237,0.26)',
  },
  'GIS-MUM': {
    key: 'GIS-MUM',
    name: 'Greenwood International',
    accent: '#0E9E6E',
    accentDark: '#0A7350',
    accentLight: '#E7FAF2',
    onAccent: '#FFFFFF',
    hero: ['#052018', '#0A3A2A', '#0E5640', '#127A5B'],
    heroSolid: '#052018',
    glow: 'rgba(14,158,110,0.26)',
  },
  'VIS-HYD': {
    key: 'VIS-HYD',
    name: 'Vivekananda Intl School',
    accent: '#9E2438',
    accentDark: '#74182A',
    accentLight: '#FAE7EB',
    onAccent: '#FFFFFF',
    hero: ['#1C0609', '#3A0E1A', '#54142A', '#6E1B33'],
    heroSolid: '#1C0609',
    glow: 'rgba(158,36,56,0.26)',
  },
};

// ── Colour maths (so any school hex can be themed) ───────────────────────────
const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};
const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
const mix = (hex: string, withHex: string, t: number): string => {
  const a = hexToRgb(hex);
  const b = hexToRgb(withHex);
  return '#' + a.map((c, i) => toHex(c + (b[i] - c) * t)).join('');
};
const darken = (hex: string, t: number) => mix(hex, '#000000', t);
const tint = (hex: string, t: number) => mix(hex, '#FFFFFF', t);
const luminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

/** Build a full theme from a single brand hex (for schools without a preset). */
export const deriveTheme = (school: School): BrandTheme => {
  const accent = school.theme_color || BODHIRA.accent;
  const [r, g, b] = hexToRgb(accent);
  return {
    key: school.code ?? `school-${school.id}`,
    name: school.name,
    accent,
    accentDark: darken(accent, 0.24),
    accentLight: tint(accent, 0.9),
    onAccent: luminance(accent) > 0.62 ? '#1A0A0C' : '#FFFFFF',
    hero: [darken(accent, 0.9), darken(accent, 0.8), darken(accent, 0.68), darken(accent, 0.55)],
    heroSolid: darken(accent, 0.9),
    glow: `rgba(${r},${g},${b},0.24)`,
  };
};

/** Resolve the active brand theme for a (possibly null) school. */
export const resolveTheme = (school: School | null): BrandTheme => {
  if (!school) return BODHIRA;
  if (school.code && SCHOOL_THEMES[school.code]) return SCHOOL_THEMES[school.code];
  if (school.theme_color) return deriveTheme(school);
  return BODHIRA;
};
