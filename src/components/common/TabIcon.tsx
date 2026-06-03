/**
 * Bodhira LMS — Flat Tab Icons
 * Built with react-native-svg (no extra native installs required).
 * Each icon has an "outlined" (inactive) and "filled" (active) variant.
 */
import React from 'react';
import Svg, {
  Path, Circle, Rect, Line, Polyline, G,
} from 'react-native-svg';

interface Props {
  name: string;
  color: string;
  size?: number;
  focused: boolean;
}

export const TabIcon: React.FC<Props> = ({ name, color, size = 24, focused }) => {
  const sw  = focused ? 2.1 : 1.8;                 // stroke-width
  const fc  = focused ? color + '28' : 'none';      // subtle fill tint when active
  const lc  = 'round' as const;

  const base = {
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: lc,
    strokeLinejoin: lc,
    fill: 'none' as const,
  };

  switch (name) {

    /* ── HOME ──────────────────────────────────────── */
    case 'Home':
    case 'Dashboard':
    case 'PHome':
    case 'ADash':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Roof */}
          <Path {...base} d="M3 10.5L12 3l9 7.5" />
          {/* Walls */}
          <Path {...base} fill={fc} d="M5 10.5V20a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10.5" />
        </Svg>
      );

    /* ── COURSES / BOOK ─────────────────────────────── */
    case 'Courses':
    case 'Classes':
    case 'AClasses':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            {...base}
            fill={fc}
            d="M4 19.5A2.5 2.5 0 016.5 17H20V4H6.5A2.5 2.5 0 004 6.5v13z"
          />
          <Path {...base} d="M6.5 17H20" />
          <Path {...base} d="M9 9h6M9 12h4" />
        </Svg>
      );

    /* ── AI TUTOR (sparkle) ─────────────────────────── */
    case 'AITutor':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Big 4-point star */}
          <Path
            {...base}
            fill={fc}
            d="M12 2l2.09 6.26L20.5 10l-6.41 1.74L12 18l-2.09-6.26L3.5 10l6.41-1.74L12 2z"
          />
          {/* Small sparkle */}
          <Path
            {...base}
            strokeWidth={focused ? 1.8 : 1.4}
            d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3z"
          />
        </Svg>
      );

    /* ── PROGRESS / BAR CHART ───────────────────────── */
    case 'Progress':
    case 'Reports':
    case 'PReports':
    case 'AAnalytics':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Bars */}
          <Rect {...base} fill={focused ? color + '35' : 'none'} x="3"  y="12" width="4" height="9" rx="1" />
          <Rect {...base} fill={focused ? color + '55' : 'none'} x="10" y="7"  width="4" height="14" rx="1" />
          <Rect {...base} fill={focused ? color + '80' : 'none'} x="17" y="3"  width="4" height="18" rx="1" />
          {/* Baseline */}
          <Line {...base} x1="2" y1="21" x2="22" y2="21" />
        </Svg>
      );

    /* ── PROFILE / PERSON ───────────────────────────── */
    case 'Profile':
    case 'TeacherProfile':
    case 'PProfile':
    case 'AProfile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle {...base} fill={fc} cx="12" cy="8" r="4" />
          <Path   {...base} fill={fc} d="M4 20a8 8 0 0116 0" />
        </Svg>
      );

    /* ── STUDENTS / GROUP ───────────────────────────── */
    case 'Students':
    case 'Users':
    case 'AUsers':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Front person */}
          <Circle {...base} fill={fc} cx="9" cy="8" r="3.5" />
          <Path   {...base} fill={fc} d="M2 20a7 7 0 0114 0" />
          {/* Back person (right) */}
          <Circle {...base} cx="17" cy="8" r="3" />
          <Path   {...base} d="M16 20a6 6 0 016 0" />
        </Svg>
      );

    /* ── CONTENT / FILE ─────────────────────────────── */
    case 'Content':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            {...base}
            fill={fc}
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
          />
          <Polyline {...base} points="14 2 14 8 20 8" />
          <Line {...base} x1="16" y1="13" x2="8" y2="13" />
          <Line {...base} x1="16" y1="17" x2="8" y2="17" />
          <Polyline {...base} points="10 9 9 9 8 9" />
        </Svg>
      );

    /* ── MY CHILD ───────────────────────────────────── */
    case 'PChild':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle {...base} fill={fc} cx="12" cy="8" r="3" />
          <Path   {...base} fill={fc} d="M5 20a7 7 0 0114 0" />
          {/* Heart */}
          <Path
            {...base}
            strokeWidth={focused ? 1.6 : 1.4}
            fill={focused ? color + '50' : 'none'}
            d="M12 20.5l-3-2.8a4 4 0 010-5.6 4 4 0 015.6 0l.4.4.4-.4a4 4 0 015.6 0 4 4 0 010 5.6L18 20"
          />
        </Svg>
      );

    /* ── ATTENDANCE / CALENDAR ──────────────────────── */
    case 'PAttendance':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect {...base} fill={fc} x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <Line {...base} x1="16" y1="2" x2="16" y2="6" />
          <Line {...base} x1="8"  y1="2" x2="8"  y2="6" />
          <Line {...base} x1="3"  y1="10" x2="21" y2="10" />
          <Path {...base} strokeWidth={focused ? 2.2 : 1.8} d="M9 16l2 2 4-4" />
        </Svg>
      );

    /* ── FALLBACK ────────────────────────────────────── */
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle {...base} fill={fc} cx="12" cy="12" r="9" />
        </Svg>
      );
  }
};
