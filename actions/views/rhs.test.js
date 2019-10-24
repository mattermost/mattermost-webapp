// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as PostActions from 'mattermost-redux/actions/posts';
import * as SearchActions from 'mattermost-redux/actions/search';
import {SearchTypes} from 'mattermost-redux/action_types';

import {
    updateRhsState,
    selectPostFromRightHandSideSearch,
    updateSearchTerms,
    performSearch,
    showSearchResults,
    showFlaggedPosts,
    showPinnedPosts,
    showMentions,
    closeRightHandSide,
    showRHSPlugin,
    hideRHSPlugin,
    toggleRHSPlugin,
    toggleMenu,
    openMenu,
    closeMenu,
} from 'actions/views/rhs';
import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {ActionTypes, RHSStates} from 'utils/constants';
import {getBrowserUtcOffset} from 'utils/timezone.jsx';

const mockStore = configureStore([thunk]);

const currentChannelId = '123';
const currentTeamId = '321';
const currentUserId = 'user123';
const pluginId = 'pluginId';

const UserSelectors = require('mattermost-redux/selectors/entities/users');
UserSelectors.getCurrentUserMentionKeys = jest.fn(() => [{key: '@here'}, {key: '@mattermost'}, {key: '@channel'}, {key: '@all'}]);

// Mock Date.now() to return a constant value.
const POST_CREATED_TIME = Date.now();
global.Date.now = jest.fn(() => POST_CREATED_TIME);

jest.mock('mattermost-redux/actions/posts', () => ({
    getPostThread: (...args) => ({type: 'MOCK_GET_POST_THREAD', args}),
    getProfilesAndStatusesForPosts: (...args) => ({type: 'MOCK_GET_PROFILES_AND_STATUSES_FOR_POSTS', args}),
}));

jest.mock('mattermost-redux/actions/search', () => ({
    searchPostsWithParams: (...args) => ({type: 'MOCK_SEARCH_POSTS', args}),
    getFlaggedPosts: jest.fn(),
    getPinnedPosts: jest.fn(),
}));

jest.mock('actions/diagnostics_actions.jsx', () => ({
    trackEvent: jest.fn(),
}));

describe('rhs view actions', () => {
    const initialState = {
        entities: {
            general: {
                config: {
                    ExperimentalViewArchivedChannels: 'false',
                },
            },
            channels: {
                currentChannelId,
            },
            teams: {
                currentTeamId,
            },
            users: {
                currentUserId,
                profiles: {
                    user123: {
                        timezone: {
                            useAutomaticTimezone: true,
                            automaticTimezone: '',
                            manualTimezone: '',
                        },
                    },
                },
            },
        },
        views: {
            rhs: {
                rhsState: null,
            },
        },
    };

    let store;

    beforeEach(() => {
        store = mockStore(initialState);
    });

    describe('updateRhsState', () => {
        test(`it dispatches ${ActionTypes.UPDATE_RHS_STATE} correctly`, () => {
            store.dispatch(updateRhsState(RHSStates.PIN));

            const action = {
                type: ActionTypes.UPDATE_RHS_STATE,
                state: RHSStates.PIN,
                channelId: currentChannelId,
            };

            expect(store.getActions()).toEqual([action]);
        });
    });

    describe('selectPostFromRightHandSideSearch', () => {
        const post = {
            id: 'post123',
            channel_id: 'channel123',
            root_id: 'root123',
        };

        test('it dispatches PostActions.getPostThread correctly', () => {
            store.dispatch(selectPostFromRightHandSideSearch(post));

            const compareStore = mockStore(initialState);
            compareStore.dispatch(PostActions.getPostThread(post.root_id));

            expect(store.getActions()[0]).toEqual(compareStore.getActions()[0]);
        });

        describe(`it dispatches ${ActionTypes.SELECT_POST} correctly`, () => {
            it('with mocked date', async () => {
                store = mockStore({
                    ...initialState,
                    views: {
                        rhs: {
                            rhsState: RHSStates.FLAG,
                        },
                    },
                });

                await store.dispatch(selectPostFromRightHandSideSearch(post));

                const action = {
                    type: ActionTypes.SELECT_POST,
                    postId: post.root_id,
                    channelId: post.channel_id,
                    previousRhsState: RHSStates.FLAG,
                    timestamp: POST_CREATED_TIME,
                };

                expect(store.getActions()[1]).toEqual(action);
            });
        });
    });

    describe('updateSearchTerms', () => {
        test(`it dispatches ${ActionTypes.UPDATE_RHS_SEARCH_TERMS} correctly`, () => {
            const terms = '@here test terms';

            store.dispatch(updateSearchTerms(terms));

            const action = {
                type: ActionTypes.UPDATE_RHS_SEARCH_TERMS,
                terms,
            };

            expect(store.getActions()).toEqual([action]);
        });
    });

    describe('performSearch', () => {
        const terms = '@here test search';

        test('it dispatches searchPosts correctly', () => {
            store.dispatch(performSearch(terms, false));

            // timezone offset in seconds
            const timeZoneOffset = getBrowserUtcOffset() * 60;

            const compareStore = mockStore(initialState);
            compareStore.dispatch(SearchActions.searchPostsWithParams(currentTeamId, {include_deleted_channels: false, terms, is_or_search: false, time_zone_offset: timeZoneOffset, page: 0, per_page: 20}, true));

            expect(store.getActions()).toEqual(compareStore.getActions());

            store.dispatch(performSearch(terms, true));
            compareStore.dispatch(SearchActions.searchPostsWithParams(currentTeamId, {include_deleted_channels: false, terms, is_or_search: true, time_zone_offset: timeZoneOffset, page: 0, per_page: 20}, true));

            expect(store.getActions()).toEqual(compareStore.getActions());
        });
    });

    describe('showSearchResults', () => {
        const terms = '@here test search';

        const testInitialState = {
            ...initialState,
            views: {
                rhs: {
                    searchTerms: terms,
                },
            },
        };

        test('it dispatches the right actions', () => {
            store = mockStore(testInitialState);

            store.dispatch(showSearchResults());

            const compareStore = mockStore(testInitialState);
            compareStore.dispatch(updateRhsState(RHSStates.SEARCH));
            compareStore.dispatch({
                type: ActionTypes.UPDATE_RHS_SEARCH_RESULTS_TERMS,
                terms,
            });
            compareStore.dispatch(performSearch(terms));

            expect(store.getActions()).toEqual(compareStore.getActions());
        });
    });

    describe('showFlaggedPosts', () => {
        test('it dispatches the right actions', async () => {
            SearchActions.getFlaggedPosts.mockReturnValue((dispatch) => {
                dispatch({type: 'MOCK_GET_FLAGGED_POSTS'});

                return {data: 'data'};
            });

            await store.dispatch(showFlaggedPosts());

            expect(SearchActions.getFlaggedPosts).toHaveBeenCalled();

            expect(store.getActions()).toEqual([
                {
                    type: ActionTypes.UPDATE_RHS_STATE,
                    state: RHSStates.FLAG,
                },
                {
                    type: 'MOCK_GET_FLAGGED_POSTS',
                },
                {
                    type: 'BATCHING_REDUCER.BATCH',
                    meta: {
                        batch: true,
                    },
                    payload: [
                        {
                            type: SearchTypes.RECEIVED_SEARCH_POSTS,
                            data: 'data',
                        },
                        {
                            type: SearchTypes.RECEIVED_SEARCH_TERM,
                            data: {
                                teamId: currentTeamId,
                                terms: null,
                                isOrSearch: false,
                            },
                        },
                    ],
                },
            ]);
        });
    });

    describe('showPinnedPosts', () => {
        test('it dispatches the right actions for the current channel', async () => {
            SearchActions.getPinnedPosts.mockReturnValue((dispatch) => {
                dispatch({type: 'MOCK_GET_PINNED_POSTS'});

                return {data: 'data'};
            });

            await store.dispatch(showPinnedPosts());

            expect(SearchActions.getPinnedPosts).toHaveBeenCalledWith(currentChannelId);

            expect(store.getActions()).toEqual([
                {
                    type: 'BATCHING_REDUCER.BATCH',
                    meta: {
                        batch: true,
                    },
                    payload: [
                        {
                            type: ActionTypes.UPDATE_RHS_STATE,
                            channelId: currentChannelId,
                            state: RHSStates.PIN,
                        },
                    ],
                },
                {
                    type: 'MOCK_GET_PINNED_POSTS',
                },
                {
                    type: 'BATCHING_REDUCER.BATCH',
                    meta: {
                        batch: true,
                    },
                    payload: [
                        {
                            type: SearchTypes.RECEIVED_SEARCH_POSTS,
                            data: 'data',
                        },
                        {
                            type: SearchTypes.RECEIVED_SEARCH_TERM,
                            data: {
                                teamId: currentTeamId,
                                terms: null,
                                isOrSearch: false,
                            },
                        },
                    ],
                },
            ]);
        });

        test('it dispatches the right actions for a specific channel', async () => {
            const channelId = 'channel1';

            SearchActions.getPinnedPosts.mockReturnValue((dispatch) => {
                dispatch({type: 'MOCK_GET_PINNED_POSTS'});

                return {data: 'data'};
            });

            await store.dispatch(showPinnedPosts(channelId));

            expect(SearchActions.getPinnedPosts).toHaveBeenCalledWith(channelId);

            expect(store.getActions()).toEqual([
                {
                    type: 'BATCHING_REDUCER.BATCH',
                    meta: {
                        batch: true,
                    },
                    payload: [
                        {
                            type: ActionTypes.UPDATE_RHS_STATE,
                            channelId,
                            state: RHSStates.PIN,
                        },
                    ],
                },
                {
                    type: 'MOCK_GET_PINNED_POSTS',
                },
                {
                    type: 'BATCHING_REDUCER.BATCH',
                    meta: {
                        batch: true,
                    },
                    payload: [
                        {
                            type: SearchTypes.RECEIVED_SEARCH_POSTS,
                            data: 'data',
                        },
                        {
                            type: SearchTypes.RECEIVED_SEARCH_TERM,
                            data: {
                                teamId: currentTeamId,
                                terms: null,
                                isOrSearch: false,
                            },
                        },
                    ],
                },
            ]);
        });
    });

    describe('showMentions', () => {
        test('it dispatches the right actions', () => {
            store.dispatch(showMentions());

            const compareStore = mockStore(initialState);

            compareStore.dispatch(performSearch('@mattermost ', true));
            compareStore.dispatch(batchActions([
                {
                    type: ActionTypes.UPDATE_RHS_SEARCH_TERMS,
                    terms: '@mattermost ',
                },
                {
                    type: ActionTypes.UPDATE_RHS_STATE,
                    state: RHSStates.MENTION,
                },
            ]));

            expect(store.getActions()).toEqual(compareStore.getActions());
        });

        test('it calls trackEvent correctly', () => {
            trackEvent.mockClear();

            store.dispatch(showMentions());

            expect(trackEvent).toHaveBeenCalledTimes(1);

            expect(trackEvent.mock.calls[0][0]).toEqual('api');
            expect(trackEvent.mock.calls[0][1]).toEqual('api_posts_search_mention');
        });
    });

    describe('closeRightHandSide', () => {
        test('it dispatches the right actions', () => {
            store.dispatch(closeRightHandSide());

            const compareStore = mockStore(initialState);
            compareStore.dispatch(batchActions([
                {
                    type: ActionTypes.UPDATE_RHS_STATE,
                    state: null,
                },
                {
                    type: ActionTypes.SELECT_POST,
                    postId: '',
                    channelId: '',
                    timestamp: 0,
                },
            ]));

            expect(store.getActions()).toEqual(compareStore.getActions());
        });
    });

    it('toggleMenu dispatches the right action', () => {
        store.dispatch(toggleMenu());

        const compareStore = mockStore(initialState);
        compareStore.dispatch({
            type: ActionTypes.TOGGLE_RHS_MENU,
        });

        expect(store.getActions()).toEqual(compareStore.getActions());
    });

    it('openMenu dispatches the right action', () => {
        store.dispatch(openMenu());

        const compareStore = mockStore(initialState);
        compareStore.dispatch({
            type: ActionTypes.OPEN_RHS_MENU,
        });

        expect(store.getActions()).toEqual(compareStore.getActions());
    });

    it('closeMenu dispatches the right action', () => {
        store.dispatch(closeMenu());

        const compareStore = mockStore(initialState);
        compareStore.dispatch({
            type: ActionTypes.CLOSE_RHS_MENU,
        });

        expect(store.getActions()).toEqual(compareStore.getActions());
    });

    describe('Plugin actions', () => {
        const stateWithPluginRhs = {
            ...initialState,
            views: {
                rhs: {
                    state: RHSStates.PLUGIN,
                    pluginId,
                },
            },
        };

        const stateWithoutPluginRhs = {
            ...initialState,
            views: {
                rhs: {
                    state: RHSStates.PIN,
                },
            },
        };

        describe('showRHSPlugin', () => {
            it('dispatches the right action', () => {
                store.dispatch(showRHSPlugin(pluginId));

                const compareStore = mockStore(initialState);
                compareStore.dispatch({
                    type: ActionTypes.UPDATE_RHS_STATE,
                    state: RHSStates.PLUGIN,
                    pluginId,
                });

                expect(store.getActions()).toEqual(compareStore.getActions());
            });
        });

        describe('hideRHSPlugin', () => {
            it('it dispatches the right action when plugin rhs is opened', () => {
                store = mockStore(stateWithPluginRhs);

                store.dispatch(hideRHSPlugin(pluginId));

                const compareStore = mockStore(stateWithPluginRhs);
                compareStore.dispatch(closeRightHandSide());

                expect(store.getActions()).toEqual(compareStore.getActions());
            });

            it('it doesn\'t dispatch the action when plugin rhs is closed', () => {
                store = mockStore(stateWithoutPluginRhs);

                store.dispatch(hideRHSPlugin(pluginId));

                const compareStore = mockStore(initialState);

                expect(store.getActions()).toEqual(compareStore.getActions());
            });

            it('it doesn\'t dispatch the action when other plugin rhs is opened', () => {
                store = mockStore(stateWithPluginRhs);

                store.dispatch(hideRHSPlugin('pluginId2'));

                const compareStore = mockStore(initialState);

                expect(store.getActions()).toEqual(compareStore.getActions());
            });
        });

        describe('toggleRHSPlugin', () => {
            it('it dispatches hide action when rhs is open', () => {
                store = mockStore(stateWithPluginRhs);

                store.dispatch(toggleRHSPlugin(pluginId));

                const compareStore = mockStore(initialState);
                compareStore.dispatch(closeRightHandSide());

                expect(store.getActions()).toEqual(compareStore.getActions());
            });

            it('it dispatches hide action when rhs is closed', () => {
                store = mockStore(stateWithoutPluginRhs);

                store.dispatch(toggleRHSPlugin(pluginId));

                const compareStore = mockStore(initialState);
                compareStore.dispatch(showRHSPlugin(pluginId));

                expect(store.getActions()).toEqual(compareStore.getActions());
            });
        });
    });
});
