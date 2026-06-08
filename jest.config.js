module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // The RN preset ignores all of node_modules; these packages ship ES modules /
  // Flow and must be transformed so Jest can load them.
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|@react-native-community|@react-navigation|react-native-linear-gradient|react-native-safe-area-context|react-native-screens|react-native-svg|react-native-video|@react-native-async-storage/async-storage))',
  ],
};
