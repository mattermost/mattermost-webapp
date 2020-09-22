// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * @module lineBreakHelpers
 * consolidate testing of similar behavior across components
 */

import Constants from 'utils/constants';
import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

export const INPUT = 'Hello world!';
export const OUTPUT_APPEND = 'Hello world!\n';
export const OUTPUT_REPLACE = 'Hello\norld!';
const REPLACE_START = 5;
const REPLACE_END = 7;
export const BASE_EVENT = {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ctrlKey: true,
    key: Constants.KeyCodes.ENTER[0],
    keyCode: Constants.KeyCodes.ENTER[1],
};

/**
 * @param  {object} [e={}] keydown event object
 * @return {object} keydown event object
 */
export function getAppendEvent(e = {}) {
    return {
        ...BASE_EVENT,
        ...e,
        target: {
            selectionStart: INPUT.length,
            selectionEnd: INPUT.length,
            value: INPUT,
        },
    };
}

/**
 * @param  {object} [e={}] keydown event object
 * @return {object} keydown event object
 */
export function getReplaceEvent(e = {}) {
    return {
        ...BASE_EVENT,
        ...e,
        target: {
            selectionStart: REPLACE_START,
            selectionEnd: REPLACE_END,
            value: INPUT,
        },
    };
}

/**
 * @param  {object} [e={}] keydown event object
 * @return {object} keydown event object
 */
export const getAltKeyEvent = (e = {}) => ({...BASE_EVENT, ...e, altKey: true});
export const getCtrlKeyEvent = (e = {}) => ({...BASE_EVENT, ...e, ctrlKey: true});
export const getMetaKeyEvent = (e = {}) => ({...BASE_EVENT, ...e, metaKey: true});
export const getShiftKeyEvent = (e = {}) => ({...BASE_EVENT, ...e, shiftKey: true});

/**
 * helper to test line break on key down behavior common to many textarea inputs
 * @param  {function} generateInstance - single paramater "value" of the initial value
 * @param  {function} getValue - single parameter for the React Component instance
 * NOTE: runs Jest tests
 */
export function testComponentForLineBreak(generateInstance, getValue) {
    test('component appends line break to input on shift + enter', () => {
        const event = getAppendEvent(getShiftKeyEvent());
        const instance = shallowWithIntl(generateInstance(INPUT));
        instance.simulate('keyDown', event);
        setTimeout(() => {
            expect(getValue(instance)).toBe(OUTPUT_APPEND);
            expect(event.target.value).toBe(OUTPUT_APPEND);
        }, 0);
    });

    test('component appends line break to input on alt + enter', () => {
        const event = getAppendEvent(getAltKeyEvent());
        const instance = shallowWithIntl(generateInstance(INPUT));
        instance.simulate('keyDown', event);
        setTimeout(() => {
            expect(getValue(instance)).toBe(OUTPUT_APPEND);
            expect(event.target.value).toBe(OUTPUT_APPEND);
        }, 0);
    });

    test('component inserts line break and replaces selection on shift + enter', () => {
        const event = getReplaceEvent(getShiftKeyEvent());
        const instance = shallowWithIntl(generateInstance(INPUT));
        instance.simulate('keyDown', event);
        setTimeout(() => {
            expect(getValue(instance)).toBe(OUTPUT_REPLACE);
            expect(event.target.value).toBe(OUTPUT_REPLACE);
        }, 0);
    });

    test('component inserts line break and replaces selection on alt + enter', () => {
        const event = getReplaceEvent(getAltKeyEvent());
        const instance = shallowWithIntl(generateInstance(INPUT));
        instance.simulate('keyDown', event);
        setTimeout(() => {
            expect(getValue(instance)).toBe(OUTPUT_REPLACE);
            expect(event.target.value).toBe(OUTPUT_REPLACE);
        }, 0);
    });
}
