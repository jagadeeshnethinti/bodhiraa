import React from 'react';
import { Image, StyleProp, ImageStyle } from 'react-native';
import { Colors } from '../../theme';

/**
 * Flat icon set (monochrome PNGs from Icons8, bundled under assets/icons).
 * Rendered as a tintable <Image> — pass `color` to theme it (active/inactive,
 * brand, danger, etc.). No SVG, no native icon-font dependency.
 *
 * The name map is generated from the asset folder; add a PNG there and a new
 * `IconName` becomes available automatically (re-run the generator).
 */
const SOURCES = {
  'ai': require('../../assets/icons/ai.png'),
  'ai-filled': require('../../assets/icons/ai-filled.png'),
  'attendance': require('../../assets/icons/attendance.png'),
  'attendance-filled': require('../../assets/icons/attendance-filled.png'),
  'bell': require('../../assets/icons/bell.png'),
  'book': require('../../assets/icons/book.png'),
  'book-filled': require('../../assets/icons/book-filled.png'),
  'brain': require('../../assets/icons/brain.png'),
  'calculator': require('../../assets/icons/calculator.png'),
  'calendar': require('../../assets/icons/calendar.png'),
  'card': require('../../assets/icons/card.png'),
  'chart': require('../../assets/icons/chart.png'),
  'chart-filled': require('../../assets/icons/chart-filled.png'),
  'chat': require('../../assets/icons/chat.png'),
  'checkmark': require('../../assets/icons/checkmark.png'),
  'child': require('../../assets/icons/child.png'),
  'child-filled': require('../../assets/icons/child-filled.png'),
  'clipboard': require('../../assets/icons/clipboard.png'),
  'clock': require('../../assets/icons/clock.png'),
  'close': require('../../assets/icons/close.png'),
  'desktop': require('../../assets/icons/desktop.png'),
  'document': require('../../assets/icons/document.png'),
  'document-filled': require('../../assets/icons/document-filled.png'),
  'edit': require('../../assets/icons/edit.png'),
  'fire': require('../../assets/icons/fire.png'),
  'flag': require('../../assets/icons/flag.png'),
  'flask': require('../../assets/icons/flask.png'),
  'folder': require('../../assets/icons/folder.png'),
  'forward': require('../../assets/icons/forward.png'),
  'fullscreen': require('../../assets/icons/fullscreen.png'),
  'group': require('../../assets/icons/group.png'),
  'group-filled': require('../../assets/icons/group-filled.png'),
  'help': require('../../assets/icons/help.png'),
  'home': require('../../assets/icons/home.png'),
  'home-filled': require('../../assets/icons/home-filled.png'),
  'library': require('../../assets/icons/library.png'),
  'lock': require('../../assets/icons/lock.png'),
  'megaphone': require('../../assets/icons/megaphone.png'),
  'microscope': require('../../assets/icons/microscope.png'),
  'mute': require('../../assets/icons/mute.png'),
  'pause': require('../../assets/icons/pause.png'),
  'pdf': require('../../assets/icons/pdf.png'),
  'phone': require('../../assets/icons/phone.png'),
  'play': require('../../assets/icons/play.png'),
  'rewind': require('../../assets/icons/rewind.png'),
  'robot': require('../../assets/icons/robot.png'),
  'rocket': require('../../assets/icons/rocket.png'),
  'school': require('../../assets/icons/school.png'),
  'search': require('../../assets/icons/search.png'),
  'send': require('../../assets/icons/send.png'),
  'signal': require('../../assets/icons/signal.png'),
  'star': require('../../assets/icons/star.png'),
  'target': require('../../assets/icons/target.png'),
  'teacher': require('../../assets/icons/teacher.png'),
  'trophy': require('../../assets/icons/trophy.png'),
  'upload': require('../../assets/icons/upload.png'),
  'user': require('../../assets/icons/user.png'),
  'user-filled': require('../../assets/icons/user-filled.png'),
  'video': require('../../assets/icons/video.png'),
  'volume': require('../../assets/icons/volume.png'),
  'warning': require('../../assets/icons/warning.png'),
} as const;

export type IconName = keyof typeof SOURCES;

interface IconProps {
  name: IconName;
  /** Square side length in px. */
  size?: number;
  /** Tint color applied to the monochrome glyph. */
  color?: string;
  style?: StyleProp<ImageStyle>;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 22,
  color = Colors.text,
  style,
}) => (
  <Image
    source={SOURCES[name]}
    style={[{ width: size, height: size, tintColor: color }, style]}
    resizeMode="contain"
    fadeDuration={0}
  />
);
