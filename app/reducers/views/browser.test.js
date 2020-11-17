// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import browserReducer from 'reducers/views/browser';
import {ActionTypes} from 'utils/constants';

describe('Reducers.Browser', () => {
    const initialState = {
        focused: true,
    };

    test('Initial state', () => {
        const nextState = browserReducer(
            {
                focused: true,
            },
            {},
        );

        expect(nextState).toEqual(initialState);
    });

    test(`should lose focus on ${ActionTypes.BROWSER_CHANGE_FOCUS}`, () => {
        const nextState = browserReducer(
            {
                focused: true,
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
});
