// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {TeamTypes} from 'mattermost-redux/action_types';

import lhsReducer from 'reducers/views/lhs';
import {ActionTypes} from 'utils/constants';

describe('Reducers.LHS', () => {
    const initialState = {
        isOpen: false,
    };

    test('Initial state', () => {
        const nextState = lhsReducer(
            {},
            {},
        );

        expect(nextState).toEqual(initialState);
    });

    test(`should close on ${ActionTypes.TOGGLE_LHS}`, () => {
        const nextState = lhsReducer(
            {
                isOpen: true,
            },
            {
                type: ActionTypes.TOGGLE_LHS,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isOpen: false,
        });
    });

    test(`should open on ${ActionTypes.TOGGLE_LHS}`, () => {
        const nextState = lhsReducer(
            {
                isOpen: false,
            },
            {
                type: ActionTypes.TOGGLE_LHS,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isOpen: true,
        });
    });

    test(`should open on ${ActionTypes.OPEN_LHS}`, () => {
        const nextState = lhsReducer(
            {
                isOpen: false,
            },
            {
                type: ActionTypes.OPEN_LHS,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isOpen: true,
        });
    });

    test(`should close on ${ActionTypes.CLOSE_LHS}`, () => {
        const nextState = lhsReducer(
            {
                isOpen: true,
            },
            {
                type: ActionTypes.CLOSE_LHS,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isOpen: false,
        });
    });

    describe('should close', () => {
        [
            ActionTypes.TOGGLE_RHS_MENU,
            ActionTypes.OPEN_RHS_MENU,
            TeamTypes.SELECT_TEAM,
        ].forEach((action) => {
            it(`on ${action}`, () => {
                const nextState = lhsReducer(
                    {
                        isOpen: true,
                    },
                    {
                        type: action,
                    },
                );

                expect(nextState).toEqual({
                    ...initialState,
                    isOpen: false,
                });
            });
        });
    });
});
