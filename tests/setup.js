// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Adapter from 'enzyme-adapter-react-16';
import {configure} from 'enzyme';
import $ from 'jquery';
import '@testing-library/jest-dom';

global.$ = $;
global.jQuery = $;
global.performance = {};
require('isomorphic-fetch');

configure({adapter: new Adapter()});

global.window = Object.create(window);
Object.defineProperty(window, 'location', {
    value: {
        href: 'http://localhost:8065',
        origin: 'http://localhost:8065',
        port: '8065',
        protocol: 'http:',
        search: '',
    },
});

const supportedCommands = ['copy'];

Object.defineProperty(document, 'queryCommandSupported', {
    value: (cmd) => supportedCommands.includes(cmd),
});

Object.defineProperty(document, 'execCommand', {
    value: (cmd) => supportedCommands.includes(cmd),
});

document.documentElement.style.fontSize = '12px';

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
        const message = 'Unexpected console logs' + warns + errors;
        if (message.includes('componentWillReceiveProps')) {
            return;
        }
        throw new Error(message);
    }
});

expect.extend({
    arrayContainingExactly(received, actual) {
        const pass = received.sort().join(',') === actual.sort().join(',');
        if (pass) {
            return {
                message: () =>
                    `expected ${received} to not contain the exact same values as ${actual}`,
                pass: true,
            };
        }
        return {
            message: () =>
                `expected ${received} to not contain the exact same values as ${actual}`,
            pass: false,
        };
    },
});
