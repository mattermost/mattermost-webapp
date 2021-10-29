// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import browserReducer from 'reducers/views/browser';
import {ActionTypes, WindowSizes} from 'utils/constants';

describe('Reducers.Browser', () => {
    const initialState = {
        focused: true,
        windowSize: WindowSizes.DESKTOP_VIEW,
        isNotificationsPermissionGranted: false,
    };

    test('Initial state', () => {
        const nextState = browserReducer(
            initialState,
            {},
        );

        expect(nextState).toEqual(initialState);
    });

    test(`should lose focus on ${ActionTypes.BROWSER_CHANGE_FOCUS}`, () => {
        const nextState = browserReducer(
            initialState,
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
            initialState,
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
            initialState,
            {
                type: ActionTypes.BROWSER_WINDOW_RESIZED,
                data: WindowSizes.MOBILE_VIEW,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            windowSize: WindowSizes.MOBILE_VIEW,
        });
    });

    test(`should save notifications permission status on ${ActionTypes.BROWSER_NOTIFICATIONS_PERMISSION_RECEIVED}`, () => {
        const nextState = browserReducer(
            initialState,
            {
                type: ActionTypes.BROWSER_NOTIFICATIONS_PERMISSION_RECEIVED,
                data: true,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isNotificationsPermissionGranted: true,
        });
    });
});
