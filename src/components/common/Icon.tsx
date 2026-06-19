import React from 'react';
import { StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { Colors } from '../../theme';
import { BoldIcon, BoldIconName } from './BoldIcon';

/**
 * App icon — premium bold duotone vector glyphs (see ./BoldIcon).
 *
 * This used to render thin monochrome PNGs; it now delegates to the bold SVG set
 * so every screen gets the coherent, premium look the bottom tab bar uses. The
 * public API (name / size / color / style) is unchanged, so all existing call
 * sites keep working. `IconName` is an alias of `BoldIconName`, which still
 * includes the legacy `-filled` variants.
 */
export type IconName = BoldIconName;

interface IconProps {
  name: IconName;
  /** Square side length in px. */
  size?: number;
  /** Tint colour applied to the glyph (stroke + soft duotone fill). */
  color?: string;
  style?: StyleProp<ViewStyle | ImageStyle>;
}

export const Icon: React.FC<IconProps> = ({ name, size = 22, color = Colors.text, style }) => (
  <BoldIcon name={name} size={size} color={color} style={style} />
);
