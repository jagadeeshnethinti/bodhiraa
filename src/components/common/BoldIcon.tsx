/**
 * Bodhira — bold duotone icon set (the app's premium icon system).
 *
 * Hand-drawn vector glyphs (react-native-svg) on a single 24px grid with a thick
 * 2.1px rounded stroke and a soft same-colour duotone fill — the exact premium
 * look the bottom tab bar uses for its *active* tab, applied everywhere. This is
 * the single source of truth for content icons; the old monochrome PNGs (`Icon`)
 * now delegate here, so every screen renders these bold glyphs.
 *
 * Covers every legacy `IconName` (including the `-filled` variants, which map to
 * the same glyph since these icons are inherently filled). API matches the old
 * `Icon` (name / size / color / style) so it is a drop-in replacement.
 */
import React from 'react';
import { View, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { Colors } from '../../theme';

export type BoldIconName =
  | 'ai' | 'ai-filled' | 'attendance' | 'attendance-filled' | 'bell' | 'book'
  | 'book-filled' | 'brain' | 'calculator' | 'calendar' | 'card' | 'chart'
  | 'chart-filled' | 'chat' | 'checkmark' | 'child' | 'child-filled' | 'clipboard'
  | 'clock' | 'close' | 'desktop' | 'document' | 'document-filled' | 'edit'
  | 'fire' | 'flag' | 'flask' | 'folder' | 'forward' | 'fullscreen' | 'group'
  | 'group-filled' | 'help' | 'home' | 'home-filled' | 'library' | 'lock'
  | 'megaphone' | 'microscope' | 'mute' | 'pause' | 'pdf' | 'phone' | 'play'
  | 'rewind' | 'robot' | 'rocket' | 'school' | 'search' | 'send' | 'signal'
  | 'star' | 'target' | 'teacher' | 'trophy' | 'upload' | 'user' | 'user-filled'
  | 'video' | 'volume' | 'warning' | 'logout';

interface Props {
  name: BoldIconName;
  /** Square side length in px. */
  size?: number;
  /** Stroke + duotone fill colour. */
  color?: string;
  style?: StyleProp<ViewStyle | ImageStyle>;
}

const Glyph: React.FC<{ k: string; color: string }> = ({ k, color }) => {
  // Bold rounded stroke; the body fills with a soft tint of the same colour.
  const s = { stroke: color, strokeWidth: 2.1, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const F = color;       // duotone fill colour
  const FO = 0.16;       // duotone fill opacity
  const solid = { fill: color, stroke: 'none' as const };

  switch (k) {
    case 'home':
      return (
        <>
          <Path d="M4 11 L12 4 L20 11 V20 H4 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M9.5 20 V14.5 H14.5 V20" fill="none" {...s} />
        </>
      );
    case 'ai':
      return (
        <>
          <Path d="M5 4.5 H19 A1.6 1.6 0 0 1 20.6 6.1 V13.9 A1.6 1.6 0 0 1 19 15.5 H10 L6 19 V15.5 H5 A1.6 1.6 0 0 1 3.4 13.9 V6.1 A1.6 1.6 0 0 1 5 4.5 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M12 7.2 L13 9.8 L15.6 10.8 L13 11.8 L12 14.4 L11 11.8 L8.4 10.8 L11 9.8 Z" {...solid} />
        </>
      );
    case 'robot':
      return (
        <>
          <Rect x="5" y="7" width="14" height="11" rx="3.2" fill={F} fillOpacity={FO} {...s} />
          <Line x1="12" y1="7" x2="12" y2="4.2" {...s} />
          <Circle cx="12" cy="3.4" r="1" {...solid} />
          <Circle cx="9.3" cy="12" r="1.25" {...solid} />
          <Circle cx="14.7" cy="12" r="1.25" {...solid} />
          <Line x1="9.5" y1="15.3" x2="14.5" y2="15.3" {...s} />
        </>
      );
    case 'attendance':
    case 'checkmark':
      return (
        <>
          <Circle cx="12" cy="12" r="8.2" fill={F} fillOpacity={FO} {...s} />
          <Path d="M8.3 12.2 L10.8 14.7 L15.7 9.4" fill="none" {...s} />
        </>
      );
    case 'card':
      return (
        <>
          <Rect x="3.5" y="5.5" width="17" height="13" rx="3" fill={F} fillOpacity={FO} {...s} />
          <Line x1="3.5" y1="9.8" x2="20.5" y2="9.8" {...s} />
          <Line x1="7" y1="14" x2="11" y2="14" {...s} />
        </>
      );
    case 'video':
      return (
        <>
          <Rect x="3" y="6.5" width="13" height="11" rx="2.6" fill={F} fillOpacity={FO} {...s} />
          <Path d="M16 10.2 L21 7.5 V16.5 L16 13.8 Z" fill={F} fillOpacity={FO} {...s} />
        </>
      );
    case 'user':
    case 'child':
      return (
        <>
          <Circle cx="12" cy="8" r="3.8" fill={F} fillOpacity={FO} {...s} />
          <Path d="M5.5 19.5 C5.5 15.5 8.4 13.8 12 13.8 C15.6 13.8 18.5 15.5 18.5 19.5 Z" fill={F} fillOpacity={FO} {...s} />
        </>
      );
    case 'group':
      return (
        <>
          <Circle cx="9" cy="9" r="3.1" fill={F} fillOpacity={FO} {...s} />
          <Path d="M3.6 19.6 C3.6 16.2 6 14.7 9 14.7 C12 14.7 14.4 16.2 14.4 19.6 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M15.4 6.4 A3.1 3.1 0 0 1 15.4 11.7" fill="none" {...s} />
          <Path d="M16.2 14.9 C18.8 15.2 20.5 16.6 20.5 19.6" fill="none" {...s} />
        </>
      );
    case 'teacher':
      return (
        <>
          <Rect x="3.8" y="4" width="16.4" height="11" rx="2.2" fill={F} fillOpacity={FO} {...s} />
          <Path d="M6.8 11.5 L9.6 9 L12 11 L17.4 7" fill="none" {...s} />
          <Line x1="12" y1="15" x2="12" y2="18" {...s} />
          <Path d="M9 20 L12 18 L15 20" fill="none" {...s} />
        </>
      );
    case 'school':
      return (
        <>
          <Path d="M3.5 9.5 L12 4 L20.5 9.5 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M5.5 9.5 V19.5 H18.5 V9.5" fill={F} fillOpacity={FO} {...s} />
          <Path d="M10 19.5 V14.5 H14 V19.5" fill="none" {...s} />
          <Line x1="3.5" y1="19.5" x2="20.5" y2="19.5" {...s} />
        </>
      );
    case 'chart':
      return (
        <>
          <Line x1="4" y1="20" x2="20.5" y2="20" {...s} />
          <Rect x="5" y="12" width="3.4" height="8" rx="1.3" fill={F} fillOpacity={FO} {...s} />
          <Rect x="10.3" y="8" width="3.4" height="12" rx="1.3" fill={F} fillOpacity={FO} {...s} />
          <Rect x="15.6" y="5" width="3.4" height="15" rx="1.3" fill={F} fillOpacity={FO} {...s} />
        </>
      );
    case 'megaphone':
      return (
        <>
          <Path d="M4.5 10 L14 6.5 V17.5 L4.5 14 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M8 16 L9.2 19.5" fill="none" {...s} />
          <Path d="M16.5 9 C18.5 10.5 18.5 13.5 16.5 15" fill="none" {...s} />
        </>
      );
    case 'clipboard':
      return (
        <>
          <Rect x="5" y="5" width="14" height="15" rx="2.5" fill={F} fillOpacity={FO} {...s} />
          <Rect x="9" y="3" width="6" height="3.6" rx="1.6" fill={F} fillOpacity={FO} {...s} />
          <Line x1="8.5" y1="11" x2="15.5" y2="11" {...s} />
          <Line x1="8.5" y1="14" x2="15.5" y2="14" {...s} />
          <Line x1="8.5" y1="17" x2="13" y2="17" {...s} />
        </>
      );
    case 'library':
      return (
        <>
          <Rect x="4.5" y="6.5" width="15" height="4" rx="1.3" fill={F} fillOpacity={FO} {...s} />
          <Rect x="5" y="10.5" width="14" height="4" rx="1.3" fill={F} fillOpacity={FO} {...s} />
          <Rect x="4" y="14.5" width="16" height="4" rx="1.3" fill={F} fillOpacity={FO} {...s} />
          <Line x1="8" y1="6.5" x2="8" y2="10.5" {...s} />
        </>
      );
    case 'book':
      return (
        <>
          <Path d="M12 6.6 C9.8 5 6 5 4 5.7 V18 C6 17.4 9.8 17.4 12 18.9 C14.2 17.4 18 17.4 20 18 V5.7 C18 5 14.2 5 12 6.6 Z" fill={F} fillOpacity={FO} {...s} />
          <Line x1="12" y1="6.6" x2="12" y2="18.9" {...s} />
        </>
      );
    case 'bell':
      return (
        <>
          <Path d="M12 4.5 C8.6 4.5 7 6.8 7 10.2 C7 14 5.6 15.3 5.6 16.5 H18.4 C18.4 15.3 17 14 17 10.2 C17 6.8 15.4 4.5 12 4.5 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M10 16.5 C10 18.2 14 18.2 14 16.5" fill="none" {...s} />
        </>
      );
    case 'rocket':
      return (
        <>
          <Path d="M12 3 C15.2 6 16.2 10 15.5 14 H8.5 C7.8 10 8.8 6 12 3 Z" fill={F} fillOpacity={FO} {...s} />
          <Circle cx="12" cy="9" r="1.9" fill="none" {...s} />
          <Path d="M8.5 12.5 L6 16 L8.8 15" fill="none" {...s} />
          <Path d="M15.5 12.5 L18 16 L15.2 15" fill="none" {...s} />
          <Path d="M10.5 16 L12 20 L13.5 16" fill="none" {...s} />
        </>
      );
    case 'upload':
      return (
        <>
          <Path d="M5 14.5 V18.5 A1 1 0 0 0 6 19.5 H18 A1 1 0 0 0 19 18.5 V14.5" fill={F} fillOpacity={FO} {...s} />
          <Line x1="12" y1="4" x2="12" y2="14.5" {...s} />
          <Path d="M8 8 L12 4 L16 8" fill="none" {...s} />
        </>
      );
    case 'trophy':
      return (
        <>
          <Path d="M7 5 H17 V9 C17 12.5 14.5 14.5 12 14.5 C9.5 14.5 7 12.5 7 9 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M7 6 C4.5 6 4.5 10 7.6 10" fill="none" {...s} />
          <Path d="M17 6 C19.5 6 19.5 10 16.4 10" fill="none" {...s} />
          <Line x1="12" y1="14.5" x2="12" y2="17" {...s} />
          <Path d="M8.5 20 H15.5 M9.5 17 H14.5 V20 H9.5 Z" fill="none" {...s} />
        </>
      );
    case 'warning':
      return (
        <>
          <Path d="M12 4 L21 19.5 H3 Z" fill={F} fillOpacity={FO} {...s} />
          <Line x1="12" y1="10" x2="12" y2="14.5" {...s} />
          <Circle cx="12" cy="17.2" r="1.05" {...solid} />
        </>
      );
    case 'clock':
      return (
        <>
          <Circle cx="12" cy="12" r="8.2" fill={F} fillOpacity={FO} {...s} />
          <Path d="M12 7.5 V12 L15 14" fill="none" {...s} />
        </>
      );
    case 'search':
      return (
        <>
          <Circle cx="11" cy="11" r="6.5" fill={F} fillOpacity={FO} {...s} />
          <Line x1="16" y1="16" x2="20" y2="20" {...s} />
        </>
      );
    case 'edit':
      return (
        <>
          <Path d="M14.5 5.5 L18.5 9.5 L9 19 L5 20 L6 16 Z" fill={F} fillOpacity={FO} {...s} />
          <Line x1="13" y1="7" x2="17" y2="11" {...s} />
        </>
      );
    case 'star':
      return (
        <Path d="M12 3.5 L14.6 9 L20.5 9.8 L16.2 14 L17.3 20 L12 17.1 L6.7 20 L7.8 14 L3.5 9.8 L9.4 9 Z" fill={F} fillOpacity={FO} {...s} />
      );
    case 'phone':
      return (
        <Path d="M6.5 4 C5 4 4 5 4 6.5 C4 13.5 10.5 20 17.5 20 C19 20 20 19 20 17.5 V14.8 L15.5 13.5 L13.8 15.5 C11.5 14.3 9.7 12.5 8.5 10.2 L10.5 8.5 L9.2 4 Z" fill={F} fillOpacity={FO} {...s} />
      );
    case 'flag':
      return (
        <>
          <Line x1="6" y1="4" x2="6" y2="20.5" {...s} />
          <Path d="M6 4.5 H17 L14.5 8 L17 11.5 H6 Z" fill={F} fillOpacity={FO} {...s} />
        </>
      );
    case 'lock':
      return (
        <>
          <Rect x="5" y="10" width="14" height="10" rx="2.5" fill={F} fillOpacity={FO} {...s} />
          <Path d="M8 10 V7.5 A4 4 0 0 1 16 7.5 V10" fill="none" {...s} />
          <Line x1="12" y1="14" x2="12" y2="16.5" {...s} />
        </>
      );
    case 'help':
      return (
        <>
          <Circle cx="12" cy="12" r="8.2" fill={F} fillOpacity={FO} {...s} />
          <Path d="M9.4 9.4 C9.4 7.6 10.7 6.6 12 6.6 C13.5 6.6 14.7 7.6 14.7 9 C14.7 11 12 11 12 13.4" fill="none" {...s} />
          <Circle cx="12" cy="16.6" r="1.05" {...solid} />
        </>
      );
    case 'document':
      return (
        <>
          <Path d="M6.5 3.5 H14 L18.5 8 V20.5 H6.5 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M14 3.5 V8 H18.5" fill="none" {...s} />
          <Line x1="9.5" y1="12" x2="15" y2="12" {...s} />
          <Line x1="9.5" y1="15" x2="15" y2="15" {...s} />
          <Line x1="9.5" y1="18" x2="13" y2="18" {...s} />
        </>
      );
    case 'pdf':
      return (
        <>
          <Path d="M6.5 3.5 H14 L18.5 8 V20.5 H6.5 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M14 3.5 V8 H18.5" fill="none" {...s} />
          <Rect x="8.5" y="13.5" width="8" height="4.6" rx="1" {...solid} />
        </>
      );
    case 'folder':
      return (
        <Path d="M3.5 6.5 A1.5 1.5 0 0 1 5 5 H9 L11 7 H19 A1.5 1.5 0 0 1 20.5 8.5 V17 A1.5 1.5 0 0 1 19 18.5 H5 A1.5 1.5 0 0 1 3.5 17 Z" fill={F} fillOpacity={FO} {...s} />
      );
    case 'chat':
      return (
        <>
          <Path d="M5 4.5 H19 A1.6 1.6 0 0 1 20.6 6.1 V13.9 A1.6 1.6 0 0 1 19 15.5 H10 L6 19 V15.5 H5 A1.6 1.6 0 0 1 3.4 13.9 V6.1 A1.6 1.6 0 0 1 5 4.5 Z" fill={F} fillOpacity={FO} {...s} />
          <Circle cx="9" cy="10" r="1.05" {...solid} />
          <Circle cx="12" cy="10" r="1.05" {...solid} />
          <Circle cx="15" cy="10" r="1.05" {...solid} />
        </>
      );
    case 'calendar':
      return (
        <>
          <Rect x="4" y="5.5" width="16" height="14.5" rx="2.6" fill={F} fillOpacity={FO} {...s} />
          <Line x1="4" y1="9.6" x2="20" y2="9.6" {...s} />
          <Line x1="8" y1="3.4" x2="8" y2="6.6" {...s} />
          <Line x1="16" y1="3.4" x2="16" y2="6.6" {...s} />
          <Path d="M8.4 14.6 L10.8 17 L15.6 12.4" fill="none" {...s} />
        </>
      );
    case 'fire':
      return (
        <>
          <Path d="M12 3 C13 6 16 7.5 16 12 C16 15.3 14.2 17.5 12 17.5 C9.8 17.5 8 15.6 8 12.8 C8 10.8 9 9.8 9.5 9.3 C9.7 11.2 11 11.2 11 9.2 C11 6.7 12 5 12 3 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M12 11.2 C12.6 12.2 13.4 13 13.4 14.2 C13.4 15.5 12.7 16.3 12 16.3 C11.3 16.3 10.6 15.5 10.6 14.4 C10.6 13.4 11.4 13 12 11.2 Z" {...solid} />
        </>
      );
    case 'target':
      return (
        <>
          <Circle cx="12" cy="12" r="8.2" fill={F} fillOpacity={FO} {...s} />
          <Circle cx="12" cy="12" r="4.5" fill="none" {...s} />
          <Circle cx="12" cy="12" r="1.3" {...solid} />
        </>
      );
    case 'send':
      return (
        <>
          <Path d="M20.5 4 L3.5 11 L10 13.2 L12.5 19.8 Z" fill={F} fillOpacity={FO} {...s} />
          <Line x1="10" y1="13.2" x2="20.5" y2="4" {...s} />
        </>
      );
    case 'signal':
      return (
        <>
          <Rect x="4" y="14.5" width="3.2" height="4.5" rx="1.2" fill={F} fillOpacity={FO} {...s} />
          <Rect x="10.4" y="11" width="3.2" height="8" rx="1.2" fill={F} fillOpacity={FO} {...s} />
          <Rect x="16.8" y="6.5" width="3.2" height="12.5" rx="1.2" fill={F} fillOpacity={FO} {...s} />
        </>
      );
    case 'desktop':
      return (
        <>
          <Rect x="3.5" y="4.5" width="17" height="11" rx="2" fill={F} fillOpacity={FO} {...s} />
          <Line x1="12" y1="15.5" x2="12" y2="18.5" {...s} />
          <Line x1="8" y1="19" x2="16" y2="19" {...s} />
        </>
      );
    case 'play':
      return (
        <Path d="M7 5 L19 12 L7 19 Z" fill={F} fillOpacity={FO} {...s} />
      );
    case 'pause':
      return (
        <>
          <Rect x="6.5" y="5" width="3.5" height="14" rx="1.4" fill={F} fillOpacity={FO} {...s} />
          <Rect x="14" y="5" width="3.5" height="14" rx="1.4" fill={F} fillOpacity={FO} {...s} />
        </>
      );
    case 'forward':
      return (
        <>
          <Path d="M4 6.5 L11 12 L4 17.5 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M11 6.5 L18 12 L11 17.5 Z" fill={F} fillOpacity={FO} {...s} />
          <Line x1="20" y1="6.5" x2="20" y2="17.5" {...s} />
        </>
      );
    case 'rewind':
      return (
        <>
          <Path d="M20 6.5 L13 12 L20 17.5 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M13 6.5 L6 12 L13 17.5 Z" fill={F} fillOpacity={FO} {...s} />
          <Line x1="4" y1="6.5" x2="4" y2="17.5" {...s} />
        </>
      );
    case 'fullscreen':
      return (
        <>
          <Path d="M4 8.5 V5 A1 1 0 0 1 5 4 H8.5" fill="none" {...s} />
          <Path d="M15.5 4 H19 A1 1 0 0 1 20 5 V8.5" fill="none" {...s} />
          <Path d="M20 15.5 V19 A1 1 0 0 1 19 20 H15.5" fill="none" {...s} />
          <Path d="M8.5 20 H5 A1 1 0 0 1 4 19 V15.5" fill="none" {...s} />
        </>
      );
    case 'close':
      return (
        <>
          <Line x1="6" y1="6" x2="18" y2="18" {...s} />
          <Line x1="18" y1="6" x2="6" y2="18" {...s} />
        </>
      );
    case 'volume':
      return (
        <>
          <Path d="M4 9.5 H7 L11 6 V18 L7 14.5 H4 Z" fill={F} fillOpacity={FO} {...s} />
          <Path d="M14.5 9 C16 10.5 16 13.5 14.5 15" fill="none" {...s} />
          <Path d="M17 6.8 C19.4 9.2 19.4 14.8 17 17.2" fill="none" {...s} />
        </>
      );
    case 'mute':
      return (
        <>
          <Path d="M4 9.5 H7 L11 6 V18 L7 14.5 H4 Z" fill={F} fillOpacity={FO} {...s} />
          <Line x1="15" y1="9.5" x2="19.5" y2="14.5" {...s} />
          <Line x1="19.5" y1="9.5" x2="15" y2="14.5" {...s} />
        </>
      );
    case 'calculator':
      return (
        <>
          <Rect x="5" y="3.5" width="14" height="17" rx="2.5" fill={F} fillOpacity={FO} {...s} />
          <Rect x="7.8" y="6" width="8.4" height="3" rx="1" fill="none" {...s} />
          <Circle cx="8.6" cy="13" r="0.95" {...solid} />
          <Circle cx="12" cy="13" r="0.95" {...solid} />
          <Circle cx="15.4" cy="13" r="0.95" {...solid} />
          <Circle cx="8.6" cy="16.5" r="0.95" {...solid} />
          <Circle cx="12" cy="16.5" r="0.95" {...solid} />
          <Circle cx="15.4" cy="16.5" r="0.95" {...solid} />
        </>
      );
    case 'flask':
      return (
        <>
          <Path d="M9.5 4 V9.5 L5 17.3 A1.5 1.5 0 0 0 6.3 19.6 H17.7 A1.5 1.5 0 0 0 19 17.3 L14.5 9.5 V4 Z" fill={F} fillOpacity={FO} {...s} />
          <Line x1="8.5" y1="4" x2="15.5" y2="4" {...s} />
          <Line x1="7" y1="14" x2="17" y2="14" {...s} />
        </>
      );
    case 'microscope':
      return (
        <>
          <Circle cx="8.5" cy="6" r="2.2" fill={F} fillOpacity={FO} {...s} />
          <Path d="M8.5 8.2 V13 M5 14 H12" fill="none" {...s} />
          <Path d="M12 13 C16 12 17.5 9 15.8 6.4" fill="none" {...s} />
          <Path d="M7 16.5 H10.5" fill="none" {...s} />
          <Path d="M5.5 19.5 H18.5" fill="none" {...s} />
        </>
      );
    case 'brain':
      return (
        <>
          <Path d="M12 5 C9.6 5 8.6 6.8 8.6 8 C7.1 8.2 6.1 9.5 6.6 11 C5.6 12 6.1 14 7.6 14.3 C7.6 16 9.1 17 10.6 16.5 C11.1 17.5 12.9 17.5 13.4 16.5 C14.9 17 16.4 16 16.4 14.3 C17.9 14 18.4 12 17.4 11 C17.9 9.5 16.9 8.2 15.4 8 C15.4 6.8 14.4 5 12 5 Z" fill={F} fillOpacity={FO} {...s} />
          <Line x1="12" y1="5.5" x2="12" y2="16.8" {...s} />
        </>
      );
    case 'logout':
      return (
        <>
          <Path d="M13.5 4 H6 A1 1 0 0 0 5 5 V19 A1 1 0 0 0 6 20 H13.5" fill={F} fillOpacity={FO} {...s} />
          <Line x1="11" y1="12" x2="20.5" y2="12" {...s} />
          <Path d="M17 8.5 L20.5 12 L17 15.5" fill="none" {...s} />
        </>
      );
    default:
      // Fallback: a soft rounded badge so an unmapped name still renders cleanly.
      return <Circle cx="12" cy="12" r="8" fill={F} fillOpacity={FO} {...s} />;
  }
};

export const BoldIcon: React.FC<Props> = ({ name, size = 22, color = Colors.text, style }) => {
  const base = name.replace(/-filled$/, ''); // bold glyphs are inherently filled
  return (
    <View style={[{ width: size, height: size }, style as StyleProp<ViewStyle>]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Glyph k={base} color={color} />
      </Svg>
    </View>
  );
};
