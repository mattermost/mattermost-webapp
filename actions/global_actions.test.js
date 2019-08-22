// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';

import {browserHistory} from 'utils/browser_history';
import {closeRightHandSide, closeMenu as closeRhsMenu} from 'actions/views/rhs';
import {close as closeLhs} from 'actions/views/lhs';
import LocalStorageStore from 'stores/local_storage_store';
import {getState} from 'stores/redux_store';

import {redirectUserToDefaultTeam, toggleSideBarRightMenuAction} from 'actions/global_actions.jsx';

jest.mock('actions/views/rhs', () => ({
    closeMenu: jest.fn(),
    closeRightHandSide: jest.fn(),
}));

jest.mock('actions/views/lhs', () => ({
    close: jest.fn(),
}));

jest.mock('mattermost-redux/actions/users', () => ({
    loadMe: () => ({type: 'MOCK_RECEIVED_ME'}),
}));

jest.mock('stores/redux_store', () => {
    return {
        dispatch: jest.fn(),
        getState: jest.fn(),
    };
});

describe('actions/global_actions', () => {
    describe('redirectUserToDefaultTeam', () => {
        it('should redirect to /select_team when no team is available', async () => {
            const mockStore = configureStore();
            const store = mockStore({
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'en',
                        },
                    },
                    teams: {
                        teams: {},
                        myMembers: {},
                    },
                    channels: {
                        myMembers: {},
                        channels: {},
                    },
                    users: {
                        currentUserId: 'user1',
                        profiles: {},
                    },
                },
            });

            getState.mockImplementation(store.getState);

            browserHistory.push = jest.fn();
            await redirectUserToDefaultTeam();
            expect(browserHistory.push).toHaveBeenCalledWith('/select_team');
        });

        it('should redirect to last channel on first team when current team is no longer available', async () => {
            const userId = 'user1';
            LocalStorageStore.setPreviousTeamId('non-existent');
            LocalStorageStore.setPreviousChannelName(userId, 'team1', 'channel-in-team-1');
            LocalStorageStore.setPreviousChannelName(userId, 'team2', 'channel-in-team-2');

            const mockStore = configureStore();
            const store = mockStore({
                entities: {
                    general: {
                        config: {
                            DefaultClientLocale: 'en',
                        },
                    },
                    teams: {
                        teams: {
                            team1: {id: 'team1', display_name: 'Team 1', name: 'team1', delete_at: 0},
                            team2: {id: 'team2', display_name: 'Team 2', name: 'team2', delete_at: 0},
                        },
                        myMembers: {
                            team1: {},
                            team2: {},
                        },
                    },
                    channels: {
                        myMembers: {
                            'channel-in-team-1': {},
                            'channel-in-team-2': {},
                        },
                        channels: {
                            'channel-in-team-1': {
                                id: 'channel-in-team-1',
                                team_id: 'team1',
                                name: 'channel-in-team-1',
                            },
                            'channel-in-team-2': {
                                id: 'channel-in-team-2',
                                team_id: 'team2',
                                name: 'channel-in-team-2',
                            },
                        },
                    },
                    users: {
                        currentUserId: userId,
                        profiles: {},
                    },
                },
            });

            getState.mockImplementation(store.getState);

            browserHistory.push = jest.fn();
            await redirectUserToDefaultTeam();
            expect(browserHistory.push).toHaveBeenCalledWith('/team1/channels/channel-in-team-1');
        });
    });

    test('toggleSideBarRightMenuAction', () => {
        const dispatchMock = () => {};
        toggleSideBarRightMenuAction()(dispatchMock);
        expect(closeRhsMenu).toHaveBeenCalled();
        expect(closeRightHandSide).toHaveBeenCalled();
        expect(closeLhs).toHaveBeenCalled();
    });
});
