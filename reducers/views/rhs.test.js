// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SearchTypes} from 'mattermost-redux/action_types';

import rhsReducer from 'reducers/views/rhs';
import {ActionTypes, RHSStates} from 'utils/constants';

describe('Reducers.RHS', () => {
    const initialState = {
        selectedPostId: '',
        selectedPostFocussedAt: 0,
        selectedPostCardId: '',
        selectedChannelId: '',
        previousRhsState: null,
        rhsState: null,
        searchTerms: '',
        searchResultsTerms: '',
        pluggableId: '',
        isSearchingFlaggedPost: false,
        isSearchingPinnedPost: false,
        isMenuOpen: false,
        isSidebarOpen: false,
        isSidebarExpanded: false,
    };

    test('Initial state', () => {
        const nextState = rhsReducer(
            {},
            {},
        );

        expect(nextState).toEqual(initialState);
    });

    test('should match RHS state to pin', () => {
        const nextState = rhsReducer(
            {},
            {
                type: ActionTypes.UPDATE_RHS_STATE,
                state: RHSStates.PIN,
                channelId: '123',
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            selectedChannelId: '123',
            rhsState: RHSStates.PIN,
            isSidebarOpen: true,
        });
    });

    test('should match RHS state to plugin id', () => {
        const nextState = rhsReducer(
            {},
            {
                type: ActionTypes.UPDATE_RHS_STATE,
                state: RHSStates.PLUGIN,
                pluggableId: '123',
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            pluggableId: '123',
            rhsState: RHSStates.PLUGIN,
            isSidebarOpen: true,
        });
    });

    test(`should wipe selectedPostId on ${ActionTypes.UPDATE_RHS_STATE}`, () => {
        const nextState = rhsReducer(
            {
                selectedPostId: '123',
            },
            {
                type: ActionTypes.UPDATE_RHS_STATE,
                state: RHSStates.SEARCH,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            selectedPostId: '',
            rhsState: RHSStates.SEARCH,
            isSidebarOpen: true,
        });
    });

    test(`should wipe selectedPostCardId on ${ActionTypes.UPDATE_RHS_STATE}`, () => {
        const nextState = rhsReducer(
            {
                selectedPostCardId: '123',
            },
            {
                type: ActionTypes.UPDATE_RHS_STATE,
                state: RHSStates.SEARCH,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            selectedPostCardId: '',
            rhsState: RHSStates.SEARCH,
            isSidebarOpen: true,
        });
    });

    test(`should wipe pluggableId on ${ActionTypes.SELECT_POST}`, () => {
        const nextState = rhsReducer(
            {
                pluggableId: 'pluggableId',
            },
            {
                type: ActionTypes.SELECT_POST,
                postId: '123',
                channelId: '321',
                timestamp: 1234,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            pluggableId: '',
            selectedPostId: '123',
            selectedPostFocussedAt: 1234,
            selectedChannelId: '321',
            isSidebarOpen: true,
        });
    });

    test(`should wipe pluggableId on ${ActionTypes.SELECT_POST_CARD}`, () => {
        const nextState = rhsReducer(
            {
                pluggableId: 'pluggableId',
            },
            {
                type: ActionTypes.SELECT_POST_CARD,
                postId: '123',
                channelId: '321',
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            pluggableId: '',
            selectedPostCardId: '123',
            selectedChannelId: '321',
            isSidebarOpen: true,
        });
    });

    test('should match isSearchingFlaggedPost state to true', () => {
        const nextState = rhsReducer(
            {},
            {
                type: SearchTypes.SEARCH_FLAGGED_POSTS_REQUEST,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isSearchingFlaggedPost: true,
        });
    });

    test('should match isSearchingFlaggedPost state to false', () => {
        const nextState = rhsReducer(
            {},
            {
                type: SearchTypes.SEARCH_FLAGGED_POSTS_SUCCESS,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isSearchingFlaggedPost: false,
        });
    });

    test('should match searchTerms state', () => {
        const nextState = rhsReducer(
            {},
            {
                type: ActionTypes.UPDATE_RHS_SEARCH_TERMS,
                terms: 'testing',
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            searchTerms: 'testing',
        });
    });

    test('should match select_post state', () => {
        const nextState1 = rhsReducer(
            {},
            {
                type: ActionTypes.SELECT_POST,
                postId: '123',
                channelId: '321',
                timestamp: 1234,
            },
        );

        expect(nextState1).toEqual({
            ...initialState,
            selectedPostId: '123',
            selectedPostFocussedAt: 1234,
            selectedChannelId: '321',
            isSidebarOpen: true,
        });

        const nextState2 = rhsReducer(
            {
            },
            {
                type: ActionTypes.SELECT_POST,
                postId: '123',
                channelId: '321',
                previousRhsState: RHSStates.SEARCH,
                timestamp: 4567,
            },
        );

        expect(nextState2).toEqual({
            ...initialState,
            selectedPostId: '123',
            selectedPostFocussedAt: 4567,
            selectedChannelId: '321',
            previousRhsState: RHSStates.SEARCH,
            isSidebarOpen: true,
        });

        const nextState3 = rhsReducer(
            {
                previousRhsState: RHSStates.SEARCH,
            },
            {
                type: ActionTypes.SELECT_POST,
                postId: '123',
                channelId: '321',
                previousRhsState: RHSStates.FLAG,
                timestamp: 0,
            },
        );

        expect(nextState3).toEqual({
            ...initialState,
            selectedPostId: '123',
            selectedPostFocussedAt: 0,
            selectedChannelId: '321',
            previousRhsState: RHSStates.FLAG,
            isSidebarOpen: true,
        });
    });

    test('should match select_post_card state', () => {
        const nextState1 = rhsReducer(
            {},
            {
                type: ActionTypes.SELECT_POST_CARD,
                postId: '123',
                channelId: '321',
            },
        );

        expect(nextState1).toEqual({
            ...initialState,
            selectedPostCardId: '123',
            selectedChannelId: '321',
            isSidebarOpen: true,
        });

        const nextState2 = rhsReducer(
            {
            },
            {
                type: ActionTypes.SELECT_POST_CARD,
                postId: '123',
                channelId: '321',
                previousRhsState: RHSStates.SEARCH,
            },
        );

        expect(nextState2).toEqual({
            ...initialState,
            selectedPostCardId: '123',
            selectedChannelId: '321',
            previousRhsState: RHSStates.SEARCH,
            isSidebarOpen: true,
        });

        const nextState3 = rhsReducer(
            {
                previousRhsState: RHSStates.SEARCH,
            },
            {
                type: ActionTypes.SELECT_POST_CARD,
                postId: '123',
                channelId: '321',
                previousRhsState: RHSStates.FLAG,
            },
        );

        expect(nextState3).toEqual({
            ...initialState,
            selectedPostCardId: '123',
            selectedChannelId: '321',
            previousRhsState: RHSStates.FLAG,
            isSidebarOpen: true,
        });
    });

    test(`should wipe rhsState on ${ActionTypes.SELECT_POST}`, () => {
        const nextState = rhsReducer(
            {
                rhsState: RHSStates.PIN,
            },
            {
                type: ActionTypes.SELECT_POST,
                postId: '123',
                channelId: '321',
                previousRhsState: RHSStates.PIN,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            rhsState: null,
            selectedPostId: '123',
            selectedChannelId: '321',
            previousRhsState: RHSStates.PIN,
            isSidebarOpen: true,
        });
    });

    test(`should wipe rhsState on ${ActionTypes.SELECT_POST_CARD}`, () => {
        const nextState = rhsReducer(
            {
                rhsState: RHSStates.PIN,
            },
            {
                type: ActionTypes.SELECT_POST_CARD,
                postId: '123',
                channelId: '321',
                previousRhsState: RHSStates.PIN,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            rhsState: null,
            selectedPostCardId: '123',
            selectedChannelId: '321',
            previousRhsState: RHSStates.PIN,
            isSidebarOpen: true,
        });
    });

    test(`should open menu, closing sidebar on ${ActionTypes.TOGGLE_RHS_MENU}`, () => {
        const nextState = rhsReducer(
            {
                isSidebarOpen: true,
                isMenuOpen: false,
            },
            {
                type: ActionTypes.TOGGLE_RHS_MENU,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isSidebarOpen: false,
            isMenuOpen: true,
        });
    });

    test(`should close menu on ${ActionTypes.TOGGLE_RHS_MENU}`, () => {
        const nextState = rhsReducer(
            {
                isSidebarOpen: false,
                isMenuOpen: true,
            },
            {
                type: ActionTypes.TOGGLE_RHS_MENU,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isSidebarOpen: false,
            isMenuOpen: false,
        });
    });

    test(`should open menu, closing sidebar on ${ActionTypes.OPEN_RHS_MENU}`, () => {
        const nextState = rhsReducer(
            {
                isSidebarOpen: true,
                isMenuOpen: false,
            },
            {
                type: ActionTypes.OPEN_RHS_MENU,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isSidebarOpen: false,
            isMenuOpen: true,
        });
    });

    test(`should close menu on ${ActionTypes.CLOSE_RHS_MENU}`, () => {
        const nextState = rhsReducer(
            {
                isSidebarOpen: false,
                isMenuOpen: true,
            },
            {
                type: ActionTypes.CLOSE_RHS_MENU,
            },
        );

        expect(nextState).toEqual({
            ...initialState,
            isSidebarOpen: false,
            isMenuOpen: false,
        });
    });

    describe('should close menu and sidebar', () => {
        [
            ActionTypes.TOGGLE_LHS,
            ActionTypes.OPEN_LHS,
        ].forEach((action) => {
            it(`on ${action}`, () => {
                const nextState = rhsReducer(
                    {
                        isSidebarOpen: true,
                        isMenuOpen: true,
                    },
                    {
                        type: action,
                    },
                );

                expect(nextState).toEqual({
                    ...initialState,
                    isSidebarOpen: false,
                    isMenuOpen: false,
                });
            });
        });
    });
});
