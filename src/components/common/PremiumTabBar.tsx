/**
 * Bodhira — premium bottom tab bar.
 *
 * A single custom tab bar shared by every role (student / parent / teacher /
 * admin). It renders a rounded, elevated "sheet" with a soft upward shadow and a
 * gold **ring** that springs between tabs as you switch — the ring wraps only the
 * active icon (the label stays plain beneath it). The active icon swaps to its
 * filled glyph, lifts, and tints gold while its label goes bold.
 * Wired into each navigator via `tabBar={props => <PremiumTabBar {...props} />}`.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors, useTheme } from '../../theme';
import { TabIcon } from './TabIcon';

const RING = 42; // icon ring diameter

export const PremiumTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme(); // re-skins the active tab to the school's brand
  const [barW, setBarW] = useState(0);
  const count = state.routes.length;
  const tabW = barW > 0 ? barW / count : 0;

  // The ring slides to sit around the active tab's icon.
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (tabW <= 0) return;
    Animated.spring(x, { toValue: state.index * tabW, useNativeDriver: true, friction: 11, tension: 120 }).start();
  }, [state.index, tabW, x]);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar} onLayout={(e: LayoutChangeEvent) => setBarW(e.nativeEvent.layout.width)}>
        {tabW > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[styles.ring, { borderColor: theme.accent + '66', backgroundColor: theme.accentLight, left: (tabW - RING) / 2, transform: [{ translateX: x }] }]}
          />
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;
          const focused = state.index === index;
          const color = focused ? theme.accentDark : Colors.text3;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={typeof label === 'string' ? label : route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              android_ripple={{ borderless: true, radius: 30, color: theme.accent + '22' }}
              style={styles.item}
            >
              <View style={styles.iconZone}>
                <TabIcon name={route.name} color={color} size={22} focused={focused} />
              </View>
              <Text numberOfLines={1} style={[styles.label, { color }, focused && styles.labelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196,149,96,0.18)',
    paddingTop: 10,
    paddingHorizontal: 8,
    // Soft shadow lifting the bar off the content.
    shadowColor: '#2A0E13',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 18,
  },
  bar: {
    flexDirection: 'row',
    minHeight: 60,
    position: 'relative',
  },
  // Soft gold background + ring around the active icon.
  ring: {
    position: 'absolute',
    top: 0,
    width: RING,
    height: RING,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(196,149,96,0.4)',
    backgroundColor: Colors.primaryLight,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  iconZone: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
    marginTop: 2,
  },
  labelActive: {
    fontWeight: '800',
  },
});
