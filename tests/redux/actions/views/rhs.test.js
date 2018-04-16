// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {batchActions} from 'redux-batched-actions';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as PostActions from 'mattermost-redux/actions/posts';
import {searchPosts} from 'mattermost-redux/actions/search';
import {Client4} from 'mattermost-redux/client';
import {SearchTypes} from 'mattermost-redux/action_types';

import {
    updateRhsState,
    selectPostFromRightHandSideSearch,
    updateSearchTerms,
    performSearch,
    getFlaggedPosts,
    getPinnedPosts,
    showSearchResults,
    showFlaggedPosts,
    showPinnedPosts,
    showMentions,
    closeRightHandSide,
    toggleMenu,
    openMenu,
    closeMenu,
} from 'actions/views/rhs';
import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {ActionTypes, RHSStates} from 'utils/constants.jsx';

const mockStore = configureStore([thunk]);

const currentChannelId = '123';
const currentTeamId = '321';
const currentUserId = 'user123';

const UserSelectors = require('mattermost-redux/selectors/entities/users');
UserSelectors.getCurrentUserMentionKeys = jest.fn(() => [{key: '@here'}, {key: '@mattermost'}, {key: '@channel'}, {key: '@all'}]);

jest.mock('mattermost-redux/actions/posts', () => ({
    getPostThread: (...args) => ({type: 'MOCK_GET_POST_THREAD', args}),
    getProfilesAndStatusesForPosts: (...args) => ({type: 'MOCK_GET_PROFILES_AND_STATUSES_FOR_POSTS', args}),
}));

jest.mock('mattermost-redux/actions/search', () => ({
    searchPosts: (...args) => ({type: 'MOCK_SEARCH_POSTS', args}),
}));

jest.mock('mattermost-redux/client', () => {
    const flaggedPosts = [
        {id: 'post1', channel_id: 'channel1'},
        {id: 'post2', channel_id: 'channel2'},
    ];

    const pinnedPosts = [
        {id: 'post3', channel_id: 'channel3'},
        {id: 'post4', channel_id: 'channel4'},
    ];

    return {
        Client4: {
            getFlaggedPosts: jest.fn(() => ({posts: flaggedPosts, order: [0, 1]})),
            getPinnedPosts: jest.fn(() => ({posts: pinnedPosts, order: [1, 0]})),
        },
    };
});

jest.mock('actions/diagnostics_actions.jsx', () => ({
    trackEvent: jest.fn(),
}));

describe('rhs view actions', () => {
    const initialState = {
        entities: {
            channels: {
                currentChannelId,
            },
            teams: {
                currentTeamId,
            },
            users: {
                currentUserId,
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
            compareStore.dispatch(PostActions.getPostThread(post.id));

            expect(store.getActions()[0]).toEqual(compareStore.getActions()[0]);
        });

        test(`it dispatches ${ActionTypes.SELECT_POST} correctly`, async () => {
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
            };

            expect(store.getActions()[1]).toEqual(action);
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

            const compareStore = mockStore(initialState);
            compareStore.dispatch(searchPosts(currentTeamId, terms, false));

            expect(store.getActions()).toEqual(compareStore.getActions());

            store.dispatch(performSearch(terms, true));
            compareStore.dispatch(searchPosts(currentTeamId, terms, true));

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

    describe('getFlaggedPosts', () => {
        test('it dispatches the right actions', async () => {
            await store.dispatch(getFlaggedPosts());

            const compareStore = mockStore(initialState);
            const result = await Client4.getFlaggedPosts(currentUserId, '', currentTeamId);
            await PostActions.getProfilesAndStatusesForPosts(result.posts, compareStore.dispatch, compareStore.getState);

            compareStore.dispatch(batchActions([
                {
                    type: SearchTypes.RECEIVED_SEARCH_POSTS,
                    data: result,
                },
                {
                    type: SearchTypes.RECEIVED_SEARCH_TERM,
                    data: {
                        teamId: '321',
                        terms: null,
                        isOrSearch: false,
                    },
                },
                {
                    type: SearchTypes.SEARCH_POSTS_SUCCESS,
                },
            ]));

            expect(store.getActions()).toEqual(compareStore.getActions());
        });
    });

    describe('showFlaggedPosts', () => {
        test('it dispatches the right actions', async () => {
            store.dispatch(showFlaggedPosts());

            const compareStore = mockStore(initialState);
            const result = await Client4.getFlaggedPosts(currentUserId, '', currentTeamId);
            await PostActions.getProfilesAndStatusesForPosts(result.posts, compareStore.dispatch, compareStore.getState);

            compareStore.dispatch(batchActions([
                {
                    type: ActionTypes.SEARCH_FLAGGED_POSTS_REQUEST,
                },
                {
                    type: ActionTypes.UPDATE_RHS_SEARCH_TERMS,
                    terms: '',
                },
                {
                    type: ActionTypes.UPDATE_RHS_STATE,
                    state: RHSStates.FLAG,
                },
            ]));

            compareStore.dispatch(batchActions([
                {
                    type: SearchTypes.RECEIVED_SEARCH_POSTS,
                    data: result,
                },
                {
                    type: SearchTypes.RECEIVED_SEARCH_TERM,
                    data: {
                        teamId: '321',
                        terms: null,
                        isOrSearch: false,
                    },
                },
                {
                    type: SearchTypes.SEARCH_POSTS_SUCCESS,
                },
                {
                    type: ActionTypes.SEARCH_FLAGGED_POSTS_SUCCESS,
                },
            ]));

            expect(store.getActions()).toEqual(compareStore.getActions());
        });
    });

    describe('getPinnedPosts', () => {
        test('it dispatches the right actions', async () => {
            await store.dispatch(getPinnedPosts());

            const compareStore = mockStore(initialState);
            const result = await Client4.getPinnedPosts(currentChannelId);
            await PostActions.getProfilesAndStatusesForPosts(result.posts, compareStore.dispatch, compareStore.getState);

            compareStore.dispatch(batchActions([
                {
                    type: SearchTypes.RECEIVED_SEARCH_POSTS,
                    data: result,
                },
                {
                    type: SearchTypes.RECEIVED_SEARCH_TERM,
                    data: {
                        teamId: '321',
                        terms: null,
                        isOrSearch: false,
                    },
                },
                {
                    type: SearchTypes.SEARCH_POSTS_SUCCESS,
                },
            ]));

            expect(store.getActions()).toEqual(compareStore.getActions());
        });
    });

    describe('showPinnedPosts', () => {
        test('it dispatches the right actions', async () => {
            store.dispatch(showPinnedPosts());

            const compareStore = mockStore(initialState);
            const result = await Client4.getPinnedPosts('123');
            await PostActions.getProfilesAndStatusesForPosts(result.posts, compareStore.dispatch, compareStore.getState);

            compareStore.dispatch(batchActions([
                {
                    type: ActionTypes.SEARCH_PINNED_POSTS_REQUEST,
                },
                {
                    type: ActionTypes.UPDATE_RHS_SEARCH_TERMS,
                    terms: '',
                },
                {
                    type: ActionTypes.UPDATE_RHS_STATE,
                    state: RHSStates.PIN,
                    channelId: '123',
                },
            ]));

            compareStore.dispatch(batchActions([
                {
                    type: SearchTypes.RECEIVED_SEARCH_POSTS,
                    data: result,
                },
                {
                    type: SearchTypes.RECEIVED_SEARCH_TERM,
                    data: {
                        teamId: '321',
                        terms: null,
                        isOrSearch: false,
                    },
                },
                {
                    type: SearchTypes.SEARCH_POSTS_SUCCESS,
                },
                {
                    type: ActionTypes.SEARCH_PINNED_POSTS_SUCCESS,
                },
            ]));

            expect(store.getActions()).toEqual(compareStore.getActions());
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
});
