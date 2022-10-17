import { InitialOptionsTsJest } from 'ts-jest';

const jestConfig: InitialOptionsTsJest  = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.(html|svg)$',
    }
  },
  moduleNameMapper: {
    rxjs: '<rootDir>/node_modules/rxjs/dist/cjs/index.js'
  }
};

export default jestConfig;
