// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Adapter from 'enzyme-adapter-react-16';
import {configure} from 'enzyme';
import $ from 'jquery';

global.$ = $;
global.jQuery = $;
global.performance = {};

configure({adapter: new Adapter()});

const supportedCommands = ['copy'];

Object.defineProperty(document, 'queryCommandSupported', {
    value: (cmd) => supportedCommands.includes(cmd),
});

Object.defineProperty(document, 'execCommand', {
    value: (cmd) => supportedCommands.includes(cmd),
});

let logs;
let warns;
let errors;
beforeAll(() => {
    console.originalLog = console.log;
    console.log = jest.fn((...params) => {
        console.originalLog(...params);
        logs.push(params);
    });

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
    logs = [];
    warns = [];
    errors = [];
});

afterEach(() => {
    if (logs.length > 0 || warns.length > 0 || errors.length > 0) {
        throw new Error('Unexpected console logs' + logs + warns + errors);
    }
});
