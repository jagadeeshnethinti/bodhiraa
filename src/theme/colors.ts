// Bodhira LMS — Design System v2
// Brand: Antique Gold #C49560 · Deep Maroon #2A0E13

export const Colors = {
  // ── Brand
  primary:       '#C49560',
  primaryDark:   '#A87840',
  primaryLight:  '#FDF4E8',
  brand:         '#2A0E13',
  brandMid:      '#3D1520',
  brandLift:     '#52202E',
  brandGlow:     'rgba(196,149,96,0.22)',

  // ── Surfaces
  bg:    '#FEFAF6',
  bg2:   '#F7F0E6',
  card:  '#FFFFFF',
  pageBg:'#EDE3D4',

  // ── Ink
  text:    '#1A0A0C',
  text2:   '#6B4A38',
  text3:   '#A8896A',
  border:  '#E8D4B8',
  border2: '#F3E9D8',

  // ── Semantic
  success:      '#1A7A48',
  successLight: '#EDFAF4',
  warning:      '#C47A20',
  warningLight: '#FFF8ED',
  danger:       '#C42020',
  dangerLight:  '#FEF2F2',
  info:         '#1E3A8A',

  // ── Utility
  white:       '#FFFFFF',
  black:       '#000000',
  transparent: 'transparent',

  // ── Chip backgrounds
  chipPrimaryBg: '#FDF4E8',
  chipSuccessBg: '#EDFAF4',
  chipWarningBg: '#FFF8ED',
  chipDangerBg:  '#FEF2F2',

  // ── Gradient stops (hero)
  heroGrad: ['#1A0A0C', '#2A0E13', '#3D1520', '#52202E'] as string[],
  goldGrad:  ['#A87840', '#C49560', '#D9AD7A'] as string[],
} as const;

export type ColorKey = keyof typeof Colors;
