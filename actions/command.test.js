// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';

import thunk from 'redux-thunk';

import * as UserAgent from 'utils/user_agent';
import * as GlobalActions from 'actions/global_actions.jsx';

import {executeCommand} from './command';
const mockStore = configureStore([thunk]);

const currentChannelId = '123';
const currentTeamId = '321';
const currentUserId = 'user123';
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
            searchTerms: '',
        },
    },
};

jest.mock('utils/user_agent');
jest.mock('actions/global_actions.jsx');

describe('executeCommand', () => {
    let store;
    beforeEach(async () => {
        store = await mockStore(initialState);
    });

    describe('search', () => {
        test('should fire the UPDATE_RHS_SEARCH_TERMS with the terms', async () => {
            store.dispatch(executeCommand('/search foo bar', []));

            expect(store.getActions()).toEqual([
                {type: 'UPDATE_RHS_SEARCH_TERMS', terms: 'foo bar'},
                {type: 'UPDATE_RHS_STATE', state: 'search'},
                {type: 'UPDATE_RHS_SEARCH_RESULTS_TERMS', terms: ''},
                {type: 'SEARCH_POSTS_REQUEST', isGettingMore: false},
            ]);
        });
    });

    describe('shortcuts', () => {
        UserAgent.isMobile = jest.fn();

        test('should return error in case of mobile', async () => {
            UserAgent.isMobile.mockReturnValueOnce(true);

            const result = await store.dispatch(executeCommand('/shortcuts', []));

            expect(result).toEqual({
                error: {
                    message: 'Keyboard shortcuts are not supported on your device',
                },
            });
        });

        test('should call toggleShortcutsModal in case of no mobile', async () => {
            UserAgent.isMobile.mockReturnValueOnce(false);

            const result = await store.dispatch(executeCommand('/shortcuts', []));

            expect(GlobalActions.toggleShortcutsModal).toHaveBeenCalled();
            expect(result).toEqual({data: true});
        });
    });
});
