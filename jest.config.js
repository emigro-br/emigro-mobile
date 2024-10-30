module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  testPathIgnorePatterns: [
    '/__fixtures__/',
    '__mocks__',
    '/__utils__/',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/config/',
    '<rootDir>/build/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|@sentry/.*|sentry-expo|native-base|react-native-svg|@gluestack-ui|@legendapp)',
  ],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
  ],
  moduleDirectories: [
    'node_modules',
    '__utils__',
  ],
};
