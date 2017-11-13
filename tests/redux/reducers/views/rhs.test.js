// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {PostTypes, SearchTypes} from 'mattermost-redux/action_types';

import rhsReducer from 'reducers/views/rhs';

import {ActionTypes, RHSStates} from 'utils/constants.jsx';

describe('Reducers.RHS', () => {
    const initialState = {
        selectedPostId: '',
        selectedChannelId: '',
        fromSearch: false,
        fromFlaggedPosts: false,
        fromPinnedPosts: false,
        fromMentions: false,
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
                channelId: '321',
                fromFlaggedPosts: true,
                fromMentions: false,
                fromPinnedPosts: false,
                fromSearch: false
            }
        );

        expect(nextState1).toEqual({
            ...initialState,
            selectedPostId: '123',
            selectedChannelId: '321',
            fromFlaggedPosts: true
        });

        const nextState2 = rhsReducer(
            {},
            {
                type: ActionTypes.SELECT_POST,
                postId: '123',
                channelId: '321',
                fromFlaggedPosts: false,
                fromMentions: false,
                fromPinnedPosts: true,
                fromSearch: false
            }
        );

        expect(nextState2).toEqual({
            ...initialState,
            selectedPostId: '123',
            selectedChannelId: '321',
            fromPinnedPosts: true
        });

        const nextState3 = rhsReducer(
            {},
            {
                type: ActionTypes.SELECT_POST,
                postId: '123',
                channelId: '321',
                fromFlaggedPosts: false,
                fromMentions: false,
                fromPinnedPosts: false,
                fromSearch: true
            }
        );

        expect(nextState3).toEqual({
            ...initialState,
            selectedPostId: '123',
            selectedChannelId: '321',
            fromSearch: true
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
                fromFlaggedPosts: false,
                fromMentions: true,
                fromPinnedPosts: false,
                fromSearch: false
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            selectedPostId: '123',
            selectedChannelId: '321',
            fromMentions: true
        });
    });
});