// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

module.exports = {
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json',
            diagnostics: true,
        },
        NODE_ENV: 'test',
    },
    preset: 'ts-jest/presets/js-with-babel',
    rootDir: '.',
    moduleDirectories: ['node_modules', 'src'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
    testMatch: [
        '<rootDir>/src/**/?(*.)(spec|test).(ts|js)?(x)',
    ],
    setupFilesAfterEnv: [
        '<rootDir>/test/setup.js',
    ],
    clearMocks: true,
    collectCoverageFrom: [
        'src/**/*.{js}',
        'src/**/*.{ts}',
    ],
    coverageReporters: [
        'lcov',
        'text-summary',
    ],
    reporters: [
        'default',
        'jest-junit',
    ],
    verbose: true,
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
        '^test/(.*)$': '<rootDir>/test/$1',
        '^utils/(.*)$': '<rootDir>/src/utils/$1',
        '^actions/(.*)$': '<rootDir>/src/actions/$1',
        '^action_types$': '<rootDir>/src/action_types',
        '^constants$': '<rootDir>/src/constants',
        '^action_types/(.*)$': '<rootDir>/src/action_types/$1',
    },
};
