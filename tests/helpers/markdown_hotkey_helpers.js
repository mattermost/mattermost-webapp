// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * @module makrdownHotkeyHelpers
 * consolidate testing of similar behavior across components
 */

import Constants from 'utils/constants';
import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

/**
 * @param  {string} [input] text input
 * @param  {int} [start] selection's start index
 * @param  {int} [end] selection's end index
 * @param  {object} [keycode] Keycode constant associated with key press
 * @return {object} keydown event object
 */

export function makeSelectionEvent(input, start, end) {
    return {
        preventDefault: jest.fn(),
        target: {
            selectionStart: start,
            selectionEnd: end,
            value: input,
        },
    };
}

function makeMarkdownHotkeyEvent(input, start, end, keycode) {
    return {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        ctrlKey: true,
        key: keycode[0],
        keyCode: keycode[1],
        target: {
            selectionStart: start,
            selectionEnd: end,
            value: input,
        },
    };
}

/**
 * @param  {string} [input] text input
 * @param  {int} [start] selection's start index
 * @param  {int} [end] selection's end index
 * @return {object} keydown event object
 */
export function makeBoldHotkeyEvent(input, start, end) {
    return makeMarkdownHotkeyEvent(input, start, end, Constants.KeyCodes.B);
}

/**
 * @param  {string} [input] text input
 * @param  {int} [start] selection's start index
 * @param  {int} [end] selection's end index
 * @return {object} keydown event object
 */
export function makeItalicHotkeyEvent(input, start, end) {
    return makeMarkdownHotkeyEvent(input, start, end, Constants.KeyCodes.I);
}

/**
 * helper to test markdown hotkeys on key down behavior common to many textarea inputs
 * @param  {function} generateInstance - single paramater "value" of the initial value
 * @param  {function} initRefs - React Component instance and setSelectionRange function
 * @param  {function} getValue - single parameter for the React Component instance
 * NOTE: runs Jest tests
 */
export function testComponentForMarkdownHotkeys(generateInstance, initRefs, find, getValue) {
    test('component adds bold markdown', () => {
        // "Fafda" is selected with ctrl + B hotkey
        const input = 'Jalebi Fafda & Sambharo';
        const e = makeBoldHotkeyEvent(input, 7, 12);

        const instance = shallowWithIntl(generateInstance(input));

        const setSelectionRange = jest.fn();
        initRefs(instance, setSelectionRange);

        find(instance).props().onKeyDown(e);
        expect(getValue(instance)).toBe('Jalebi **Fafda** & Sambharo');
        expect(setSelectionRange).toHaveBeenCalled();
    });

    test('component adds italic markdown', () => {
        // "Fafda" is selected with ctrl + I hotkey
        const input = 'Jalebi Fafda & Sambharo';
        const e = makeItalicHotkeyEvent(input, 7, 12);

        const instance = shallowWithIntl(generateInstance(input));

        const setSelectionRange = jest.fn();
        initRefs(instance, setSelectionRange);

        find(instance).props().onKeyDown(e);
        expect(getValue(instance)).toBe('Jalebi *Fafda* & Sambharo');
        expect(setSelectionRange).toHaveBeenCalled();
    });

    test('component starts bold markdown', () => {
        // Nothing is selected, caret is just before "Fafde" with ctrl + B
        const input = 'Jalebi Fafda & Sambharo';
        const e = makeBoldHotkeyEvent(input, 7, 7);

        const instance = shallowWithIntl(generateInstance(input));

        const setSelectionRange = jest.fn();
        initRefs(instance, setSelectionRange);

        find(instance).props().onKeyDown(e);
        expect(getValue(instance)).toBe('Jalebi ****Fafda & Sambharo');
        expect(setSelectionRange).toHaveBeenCalled();
    });

    test('component starts italic markdown', () => {
        // Nothing is selected, caret is just before "Fafde" with ctrl + B
        const input = 'Jalebi Fafda & Sambharo';
        const e = makeItalicHotkeyEvent(input, 7, 7);

        const instance = shallowWithIntl(generateInstance(input));

        const setSelectionRange = jest.fn();
        initRefs(instance, setSelectionRange);

        find(instance).props().onKeyDown(e);
        expect(getValue(instance)).toBe('Jalebi **Fafda & Sambharo');
        expect(setSelectionRange).toHaveBeenCalled();
    });
}
