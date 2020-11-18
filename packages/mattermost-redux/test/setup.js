// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

global.WebSocket = require('ws');

require('isomorphic-fetch');

let warns;
let errors;
beforeAll(() => {
    console.originalWarn = console.warn;
    console.warn = jest.fn((...params) => {
        console.originalWarn(...params);
        warns.push(params);
    });

    console.originalError = console.error;
    console.error = jest.fn((...params) => {
        console.originalError(...params);
        errors.push(params);
    });
});

beforeEach(() => {
    warns = [];
    errors = [];
});

afterEach(() => {
    if (warns.length > 0 || errors.length > 0) {
        throw new Error('Unexpected console logs' + warns + errors);
    }
});
