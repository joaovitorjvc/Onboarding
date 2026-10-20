module.exports = {
  rootDir: 'src',
  testRegex: '.*\\.test\\.ts$',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: `${process.cwd()}/tsconfig.json` }],
  },
  collectCoverageFrom: ['**/*.ts', '!**/*.test.ts'],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'cobertura'],
};
