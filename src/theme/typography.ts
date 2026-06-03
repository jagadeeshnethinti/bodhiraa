import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const FontFamily = {
  inter:       'Inter-Regular',
  interMedium: 'Inter-Medium',
  interSemi:   'Inter-SemiBold',
  interBold:   'Inter-Bold',
  interExtra:  'Inter-ExtraBold',
  interBlack:  'Inter-Black',
  poppins:     'Poppins-SemiBold',
  poppinsBold: 'Poppins-Bold',
  poppinsExtra:'Poppins-ExtraBold',
  poppinsBlack:'Poppins-Black',
  system:      'System',
};

export const Typography = StyleSheet.create({
  // Sizes
  xs:   { fontSize: 10, lineHeight: 14 },
  sm:   { fontSize: 11, lineHeight: 16 },
  base: { fontSize: 12, lineHeight: 18 },
  md:   { fontSize: 13, lineHeight: 19 },
  lg:   { fontSize: 15, lineHeight: 22 },
  xl:   { fontSize: 18, lineHeight: 26 },
  '2xl':{ fontSize: 22, lineHeight: 30 },
  '3xl':{ fontSize: 28, lineHeight: 36 },
  '4xl':{ fontSize: 36, lineHeight: 44 },

  // Weights (cross-platform)
  regular:   { fontWeight: '400' as const },
  medium:    { fontWeight: '500' as const },
  semibold:  { fontWeight: '600' as const },
  bold:      { fontWeight: '700' as const },
  extrabold: { fontWeight: '800' as const },
  black:     { fontWeight: '900' as const },

  // Colors
  primary: { color: Colors.primary },
  brand:   { color: Colors.brand   },
  text:    { color: Colors.text    },
  text2:   { color: Colors.text2   },
  text3:   { color: Colors.text3   },
  white:   { color: Colors.white   },
  success: { color: Colors.success },
  danger:  { color: Colors.danger  },
  warning: { color: Colors.warning },
});
