module.exports = {
  preset: 'jest-expo',
  rootDir: 'src',
  collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}', '!**/node_modules/**'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
    '^@components/(.*)$': '<rootDir>/../src/components/$1',
    '^@constants/(.*)$': '<rootDir>/../src/constants/$1',
    '^@config/(.*)$': '<rootDir>/../src/constants/$1',
    '^@hooks/(.*)$': '<rootDir>/../src/hooks/$1',
    '^@navigation/(.*)$': '<rootDir>/../src/navigation/$1',
    '^@screens/(.*)$': '<rootDir>/../src/screens/$1',
  },
  coverageThreshold: {
    global: {
      lines: 50,
    },
  },
};
