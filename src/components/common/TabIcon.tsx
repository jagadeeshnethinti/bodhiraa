/**
 * Bodhira LMS — Bottom-tab icons.
 * Flat PNG icons (see Icon.tsx). Inactive tabs use the outline glyph; the
 * focused tab swaps to the filled variant. Both are tinted with the color the
 * navigator passes (active = brand, inactive = muted).
 */
import React from 'react';
import { Icon, IconName } from './Icon';

/** Maps every tab route name (student/teacher/parent/admin) to a base icon. */
const ROUTE_ICON: Record<string, IconName> = {
  // Home / dashboards
  Home: 'home', Dashboard: 'home', PHome: 'home', ADash: 'home',
  // Courses / classes / content
  Courses: 'book', Classes: 'book', AClasses: 'book', Content: 'document',
  // AI tutor
  AITutor: 'ai',
  // Progress / reports / analytics
  Progress: 'chart', Reports: 'chart', PReports: 'chart', AAnalytics: 'chart',
  // People
  Students: 'group', Users: 'group', AUsers: 'group',
  // Parent-specific
  PChild: 'child', PAttendance: 'attendance',
  // Profile
  Profile: 'user', TeacherProfile: 'user', PProfile: 'user', AProfile: 'user',
};

interface Props {
  name: string;
  color: string;
  size?: number;
  focused: boolean;
}

export const TabIcon: React.FC<Props> = ({ name, color, size = 23, focused }) => {
  const base = ROUTE_ICON[name] ?? 'home';
  const iconName = (focused ? `${base}-filled` : base) as IconName;
  return <Icon name={iconName} size={size} color={color} />;
};
