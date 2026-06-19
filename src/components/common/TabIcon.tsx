/**
 * Bodhira — premium bottom-tab glyphs.
 *
 * Hand-drawn vector icons (react-native-svg) on a single 24px grid with a uniform
 * 1.9px rounded stroke, so the whole tab bar feels like one coherent, premium set
 * (the old mixed PNGs looked inconsistent). The active tab fills its glyph with a
 * soft duotone tint and springs up slightly; inactive tabs are clean outlines.
 *
 * Same Props as before (name / color / size / focused) so the tab bar is unchanged.
 */
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

type GlyphKey = 'home' | 'book' | 'ai' | 'chart' | 'user' | 'group' | 'cap' | 'calendar' | 'document';

/** Every tab route (student / parent / teacher / admin) → a glyph. */
const ROUTE_GLYPH: Record<string, GlyphKey> = {
  Home: 'home', Dashboard: 'home', PHome: 'home', ADash: 'home',
  Courses: 'book', AClasses: 'book',
  Content: 'document',
  AITutor: 'ai',
  Progress: 'chart', Reports: 'chart', PReports: 'chart', AAnalytics: 'chart',
  Students: 'group', Users: 'group', AUsers: 'group',
  PChild: 'cap',
  PAttendance: 'calendar',
  Profile: 'user', TeacherProfile: 'user', PProfile: 'user', AProfile: 'user',
};

interface Props {
  name: string;
  color: string;
  size?: number;
  focused: boolean;
}

const Glyph: React.FC<{ k: GlyphKey; color: string; focused: boolean }> = ({ k, color, focused }) => {
  // Shared stroke styling; the body fills with a soft tint only when active.
  const s = { stroke: color, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const fill = focused ? color : 'none';
  const fo = focused ? 0.16 : 0;

  switch (k) {
    case 'home':
      return (
        <>
          <Path d="M4 11 L12 4 L20 11 V20 H4 Z" fill={fill} fillOpacity={fo} {...s} />
          <Path d="M9.5 20 V14.5 H14.5 V20" fill="none" {...s} />
        </>
      );
    case 'book':
      return (
        <>
          <Path
            d="M12 6.6 C 9.8 5, 6 5, 4 5.7 V18 C 6 17.4, 9.8 17.4, 12 18.9 C 14.2 17.4, 18 17.4, 20 18 V5.7 C 18 5, 14.2 5, 12 6.6 Z"
            fill={fill}
            fillOpacity={fo}
            {...s}
          />
          <Line x1="12" y1="6.6" x2="12" y2="18.9" {...s} />
        </>
      );
    case 'ai':
      // Premium AI "spark" — matches the Bodhira AI brand mark (AIMark).
      return (
        <>
          <Path
            d="M11 4 Q12 10.8 18.4 11.8 Q12 12.8 11 19.6 Q10 12.8 3.6 11.8 Q10 10.8 11 4 Z"
            fill={fill}
            fillOpacity={fo}
            {...s}
          />
          <Path d="M18 5 Q18.5 7.4 20.6 7.9 Q18.5 8.4 18 10.8 Q17.5 8.4 15.4 7.9 Q17.5 7.4 18 5 Z" fill={color} stroke="none" />
        </>
      );
    case 'chart':
      return (
        <>
          <Line x1="4" y1="20" x2="20.5" y2="20" {...s} />
          <Rect x="5" y="12" width="3.4" height="8" rx="1.4" fill={fill} fillOpacity={fo} {...s} />
          <Rect x="10.3" y="8" width="3.4" height="12" rx="1.4" fill={fill} fillOpacity={fo} {...s} />
          <Rect x="15.6" y="5" width="3.4" height="15" rx="1.4" fill={fill} fillOpacity={fo} {...s} />
        </>
      );
    case 'user':
      return (
        <>
          <Circle cx="12" cy="8.4" r="3.7" fill={fill} fillOpacity={fo} {...s} />
          <Path d="M5.5 20 C 5.5 16, 8.4 14.4, 12 14.4 C 15.6 14.4, 18.5 16, 18.5 20 Z" fill={fill} fillOpacity={fo} {...s} />
        </>
      );
    case 'group':
      return (
        <>
          <Circle cx="9" cy="9" r="3.1" fill={fill} fillOpacity={fo} {...s} />
          <Path d="M3.6 19.6 C 3.6 16.2, 6 14.7, 9 14.7 C 12 14.7, 14.4 16.2, 14.4 19.6 Z" fill={fill} fillOpacity={fo} {...s} />
          <Path d="M15.4 6.4 A3.1 3.1 0 0 1 15.4 11.7" fill="none" {...s} />
          <Path d="M16.2 14.9 C 18.8 15.2, 20.5 16.6, 20.5 19.6" fill="none" {...s} />
        </>
      );
    case 'cap':
      return (
        <>
          <Path d="M12 4.2 L21 8.4 L12 12.6 L3 8.4 Z" fill={fill} fillOpacity={fo} {...s} />
          <Path d="M7 10 V14.2 C 7 15.9, 17 15.9, 17 14.2 V10" fill="none" {...s} />
          <Path d="M21 8.4 V13.4" fill="none" {...s} />
          <Circle cx="21" cy="14" r="1" fill={color} stroke="none" />
        </>
      );
    case 'calendar':
      return (
        <>
          <Rect x="4" y="5.5" width="16" height="14.5" rx="2.6" fill={fill} fillOpacity={fo} {...s} />
          <Line x1="4" y1="9.6" x2="20" y2="9.6" {...s} />
          <Line x1="8" y1="3.4" x2="8" y2="6.6" {...s} />
          <Line x1="16" y1="3.4" x2="16" y2="6.6" {...s} />
          <Path d="M8.4 14.6 L10.8 17 L15.6 12.4" fill="none" {...s} />
        </>
      );
    case 'document':
      return (
        <>
          <Path d="M6.5 3.5 H14 L18.5 8 V20.5 H6.5 Z" fill={fill} fillOpacity={fo} {...s} />
          <Path d="M14 3.5 V8 H18.5" fill="none" {...s} />
          <Line x1="9.5" y1="12" x2="15" y2="12" {...s} />
          <Line x1="9.5" y1="15" x2="15" y2="15" {...s} />
          <Line x1="9.5" y1="18" x2="13" y2="18" {...s} />
        </>
      );
  }
};

export const TabIcon: React.FC<Props> = ({ name, color, size = 23, focused }) => {
  const k = ROUTE_GLYPH[name] ?? 'home';

  // Spring-pop the active tab: lift and enlarge slightly when focused.
  const t = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(t, { toValue: focused ? 1 : 0, useNativeDriver: true, friction: 6, tension: 180 }).start();
  }, [focused, t]);

  return (
    <Animated.View
      style={{
        transform: [
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] }) },
        ],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Glyph k={k} color={color} focused={focused} />
      </Svg>
    </Animated.View>
  );
};
