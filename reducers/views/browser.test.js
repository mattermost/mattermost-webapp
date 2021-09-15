// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import browserReducer from 'reducers/views/browser';
import {ActionTypes} from 'utils/constants';

describe('Reducers.Browser', () => {
    const initialState = {
        focused: true,
        windowSize: {
            width: 1920,
            height: 1080,
        },
    };

    test('Initial state', () => {
        const nextState = browserReducer(
            {
                focused: true,
                windowSize: {
                    width: 1920,
                    height: 1080,
                },
            },
            {},
        );

        expect(nextState).toEqual(initialState);
    });

    test(`should lose focus on ${ActionTypes.BROWSER_CHANGE_FOCUS}`, () => {
        const nextState = browserReducer(
            {
                focused: true,
                windowSize: {
                    width: 1920,
                    height: 1080,
                },
            },
            {
                type: ActionTypes.BROWSER_CHANGE_FOCUS,
                focus: false,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            focused: false,
        });
    });

    test(`should gain focus on ${ActionTypes.BROWSER_CHANGE_FOCUS}`, () => {
        const nextState = browserReducer(
            {
                focused: false,
                windowSize: {
                    width: 1920,
                    height: 1080,
                },
            },
            {
                type: ActionTypes.BROWSER_CHANGE_FOCUS,
                focus: true,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            focused: true,
        });
    });

    test(`should reflect window resize update on ${ActionTypes.BROWSER_WINDOW_RESIZED}`, () => {
        const nextState = browserReducer(
            {
                focused: true,
                windowSize: {
                    width: 1920,
                    height: 1080,
                },
            },
            {
                type: ActionTypes.BROWSER_WINDOW_RESIZED,
                windowSize: {
                    width: 1280,
                    height: 720,
                },
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            windowSize: {
                width: 1280,
                height: 720,
            },
        });
    });
});
