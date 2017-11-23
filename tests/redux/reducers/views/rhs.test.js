// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {PostTypes, SearchTypes} from 'mattermost-redux/action_types';

import rhsReducer from 'reducers/views/rhs';

import {ActionTypes, RHSStates} from 'utils/constants.jsx';

describe('Reducers.RHS', () => {
    const initialState = {
        selectedPostId: '',
        selectedChannelId: '',
        previousRhsState: null,
        rhsState: null,
        searchTerms: '',
        isSearching: false
    };

    test('Initial state', () => {
        const nextState = rhsReducer(
            {},
            {}
        );

        expect(nextState).toEqual(initialState);
    });

    test(ActionTypes.UPDATE_RHS_STATE, () => {
        const nextState = rhsReducer(
            {},
            {
                type: ActionTypes.UPDATE_RHS_STATE,
                state: RHSStates.PIN,
                channelId: '123'
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            selectedChannelId: '123',
            rhsState: RHSStates.PIN
        });
    });

    test(`should wipe selectedPostId on ${ActionTypes.UPDATE_RHS_STATE}`, () => {
        const nextState = rhsReducer(
            {
                selectedPostId: '123'
            },
            {
                type: ActionTypes.UPDATE_RHS_STATE,
                state: RHSStates.SEARCH
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            selectedPostId: '',
            rhsState: RHSStates.SEARCH
        });
    });

    test(PostTypes.SEARCH_POSTS_REQUEST, () => {
        const nextState = rhsReducer(
            {},
            {
                type: SearchTypes.SEARCH_POSTS_REQUEST
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            isSearching: true
        });
    });

    test(PostTypes.SEARCH_POSTS_FAILURE, () => {
        const nextState = rhsReducer(
            {
                isSearching: true
            },
            {
                type: SearchTypes.SEARCH_POSTS_FAILURE
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            isSearching: false
        });
    });

    test(PostTypes.SEARCH_POSTS_SUCCESS, () => {
        const nextState = rhsReducer(
            {
                isSearching: true
            },
            {
                type: SearchTypes.SEARCH_POSTS_SUCCESS
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            isSearching: false
        });
    });

    test(ActionTypes.UPDATE_RHS_SEARCH_TERMS, () => {
        const nextState = rhsReducer(
            {},
            {
                type: ActionTypes.UPDATE_RHS_SEARCH_TERMS,
                terms: 'testing'
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            searchTerms: 'testing'
        });
    });

    test(ActionTypes.SELECT_POST, () => {
        const nextState1 = rhsReducer(
            {},
            {
                type: ActionTypes.SELECT_POST,
                postId: '123',
                channelId: '321'
            }
        );

        expect(nextState1).toEqual({
            ...initialState,
            selectedPostId: '123',
            selectedChannelId: '321'
        });

        const nextState2 = rhsReducer(
            {
                state: RHSStates.PIN
            },
            {
                type: ActionTypes.SELECT_POST,
                postId: '123',
                channelId: '321',
                previousRhsState: RHSStates.SEARCH
            }
        );

        expect(nextState2).toEqual({
            ...initialState,
            selectedPostId: '123',
            selectedChannelId: '321',
            previousRhsState: RHSStates.SEARCH
        });

        const nextState3 = rhsReducer(
            {
                state: RHSStates.FLAG,
                previousRhsState: RHSStates.SEARCH
            },
            {
                type: ActionTypes.SELECT_POST,
                postId: '123',
                channelId: '321',
                previousRhsState: RHSStates.FLAG
            }
        );

        expect(nextState3).toEqual({
            ...initialState,
            selectedPostId: '123',
            selectedChannelId: '321',
            previousRhsState: RHSStates.FLAG
        });
    });

    test(`should wipe rhsState on ${ActionTypes.SELECT_POST}`, () => {
        const nextState = rhsReducer(
            {
                rhsState: RHSStates.PIN
            },
            {
                type: ActionTypes.SELECT_POST,
                postId: '123',
                channelId: '321',
                previousRhsState: RHSStates.PIN
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            rhsState: null,
            selectedPostId: '123',
            selectedChannelId: '321',
            previousRhsState: RHSStates.PIN
        });
    });
});