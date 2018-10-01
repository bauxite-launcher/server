module.exports = {
  reporters: ['default', 'jest-junit'],
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    'testUtil\\.js',
  ],
};
