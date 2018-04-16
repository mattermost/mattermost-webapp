// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {SearchTypes, TeamTypes} from 'mattermost-redux/action_types';

import rhsReducer from 'reducers/views/rhs';
import {ActionTypes, RHSStates} from 'utils/constants.jsx';

describe('Reducers.RHS', () => {
    const initialState = {
        selectedPostId: '',
        selectedChannelId: '',
        previousRhsState: null,
        rhsState: null,
        searchTerms: '',
        searchResultsTerms: '',
        isSearchingTerm: false,
        isSearchingFlaggedPost: false,
        isSearchingPinnedPost: false,
        isMenuOpen: false,
        isSidebarOpen: false,
    };

    test('Initial state', () => {
        const nextState = rhsReducer(
            {},
            {}
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
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            selectedChannelId: '123',
            rhsState: RHSStates.PIN,
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
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            selectedPostId: '',
            rhsState: RHSStates.SEARCH,
            isSidebarOpen: true,
        });
    });

    test('should match isSearchingTerm state to true', () => {
        const nextState = rhsReducer(
            {},
            {
                type: SearchTypes.SEARCH_POSTS_REQUEST,
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            isSearchingTerm: true,
        });
    });

    test('should match isSearchingTerm state to false', () => {
        const nextState = rhsReducer(
            {
                isSearchingTerm: true,
            },
            {
                type: SearchTypes.SEARCH_POSTS_FAILURE,
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            isSearchingTerm: false,
        });
    });

    test('should match isSearchingTerm state to false', () => {
        const nextState = rhsReducer(
            {
                isSearchingTerm: true,
            },
            {
                type: SearchTypes.SEARCH_POSTS_SUCCESS,
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            isSearchingTerm: false,
        });
    });

    test('should match isSearchingFlaggedPost state to true', () => {
        const nextState = rhsReducer(
            {},
            {
                type: ActionTypes.SEARCH_FLAGGED_POSTS_REQUEST,
            }
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
                type: ActionTypes.SEARCH_FLAGGED_POSTS_SUCCESS,
            }
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
            }
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
            }
        );

        expect(nextState1).toEqual({
            ...initialState,
            selectedPostId: '123',
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
            }
        );

        expect(nextState2).toEqual({
            ...initialState,
            selectedPostId: '123',
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
            }
        );

        expect(nextState3).toEqual({
            ...initialState,
            selectedPostId: '123',
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
            }
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

    test(`should open menu, closing sidebar on ${ActionTypes.TOGGLE_RHS_MENU}`, () => {
        const nextState = rhsReducer(
            {
                isSidebarOpen: true,
                isMenuOpen: false,
            },
            {
                type: ActionTypes.TOGGLE_RHS_MENU,
            }
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
            }
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
            }
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
            }
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
            TeamTypes.SELECT_TEAM,
        ].forEach((action) => {
            it(`on ${action}`, () => {
                const nextState = rhsReducer(
                    {
                        isSidebarOpen: true,
                        isMenuOpen: true,
                    },
                    {
                        type: action,
                    }
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
