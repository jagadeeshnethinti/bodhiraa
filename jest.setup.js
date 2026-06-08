/* eslint-disable no-undef */
/**
 * Jest mocks for the native modules the app depends on. These let the smoke
 * test render the full app (navigation + providers) in a Node test environment.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Full safe-area mock — the package's own mock omits SafeAreaView, which the
// app uses on nearly every screen.
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  return {
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    SafeAreaView: ({ children, ...props }) => React.createElement(View, props, children),
    SafeAreaInsetsContext: React.createContext(insets),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets, frame },
  };
});

// Pure-JS stand-ins for view-only native components.
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-video', () => 'Video');
