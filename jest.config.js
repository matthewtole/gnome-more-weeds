module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(jest).+(ts|js)'],
  transform: {
    '^.+\\.(ts)?$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'ts'],
  collectCoverage: true,
};
