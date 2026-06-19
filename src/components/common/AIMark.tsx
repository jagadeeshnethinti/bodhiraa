/**
 * Bodhira AI — brand mark.
 *
 * A premium gold-gradient squircle badge with a glossy top highlight and a crisp
 * deep-maroon "spark" glyph (plus a small accent sparkle) — the identity for the
 * AI tutor. Replaces the generic robot icon. Self-contained: the badge *is* the
 * avatar, so it needs no background wrapper.
 *
 * `glow` adds a soft gold halo (use on dark surfaces like the chat header).
 */
import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Path, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const AIMark: React.FC<Props> = ({ size = 40, glow = false, style }) => (
  <View style={[{ width: size, height: size }, style]}>
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="aiGold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E7C193" />
          <Stop offset="0.5" stopColor="#C49560" />
          <Stop offset="1" stopColor="#9A6730" />
        </LinearGradient>
        <LinearGradient id="aiGloss" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="aiSpark" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3D1520" />
          <Stop offset="1" stopColor="#1A0A0C" />
        </LinearGradient>
        {glow ? (
          <RadialGradient id="aiGlow" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0.55" stopColor="#C49560" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#C49560" stopOpacity="0" />
          </RadialGradient>
        ) : null}
      </Defs>

      {glow ? <Circle cx="50" cy="50" r="50" fill="url(#aiGlow)" /> : null}

      {/* Gold badge */}
      <Rect x="9" y="9" width="82" height="82" rx="26" fill="url(#aiGold)" />
      {/* Glossy top highlight */}
      <Rect x="9" y="9" width="82" height="46" rx="26" fill="url(#aiGloss)" />
      {/* Crisp inner ring */}
      <Rect x="10.8" y="10.8" width="78.4" height="78.4" rx="24.4" fill="none" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="1.6" />

      {/* Main AI spark (4-point) */}
      <Path d="M50 25 Q53.6 46.4 75 50 Q53.6 53.6 50 75 Q46.4 53.6 25 50 Q46.4 46.4 50 25 Z" fill="url(#aiSpark)" />
      {/* Accent sparkle */}
      <Path d="M71 28 Q72.1 32.9 77 34 Q72.1 35.1 71 40 Q69.9 35.1 65 34 Q69.9 32.9 71 28 Z" fill="#1A0A0C" fillOpacity="0.5" />
    </Svg>
  </View>
);
