/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!**/node_modules/**"
  ],
  roots: [ '<rootDir>/src' ],
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  moduleNameMapper: {
    "@settings/(.*)": '<rootDir>/src/settings/$1',
    "@models/(.*)": '<rootDir>/src/models/$1',
    "@editor/(.*)": '<rootDir>/src/editor/$1',
    "@utils/(.*)": '<rootDir>/src/utils/$1',
    "@apis/(.*)": '<rootDir>/src/apis/$1',
    "@src/(.*)": '<rootDir>/src/$1'
  }
};