// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import * as TeamActions from 'mattermost-redux/actions/teams';
import * as channelActions from 'mattermost-redux/actions/channels';
import * as userActions from 'mattermost-redux/actions/users';

import * as Actions from 'actions/team_actions.jsx';
import {browserHistory} from 'utils/browser_history';

jest.mock('mattermost-redux/actions/teams', () => ({
    addUsersToTeam: jest.fn(() => {
        return {
            type: 'ADD_USER',
        };
    }),
    removeUserFromTeam: jest.fn(() => {
        return {
            type: 'REMOVE_USER_FROM_TEAM',
        };
    }),
    getTeamStats: jest.fn(() => {
        return {
            type: 'GET_TEAM_STATS',
        };
    }),
    addUserToTeamFromInvite: jest.fn(() => {
        return {
            type: 'ADD_USERS_TO_TEAM_INVITE',
            data: {
                team_id: 'teamId',
            },
        };
    }),
    getTeam: jest.fn(() => {
        return {
            type: 'GET_TEAM',
        };
    }),
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    viewChannel: jest.fn(() => {
        return {
            type: 'VIEW_CHANNEL',
        };
    }),
    getChannelStats: jest.fn(() => {
        return {
            type: 'GET_CHANNEL_STAT',
        };
    }),
}));

jest.mock('mattermost-redux/actions/users', () => ({
    getUser: jest.fn(() => {
        return {
            type: 'GET_USER',
        };
    }),
}));

const store = configureStore([thunk]);

describe('Actions.Team', () => {
    let testStore;
    beforeEach(async () => {
        testStore = store({
            entities: {
                channels: {
                    currentChannelId: 'currentChannelId',
                },
            },
        });
    });

    test('switchTeam', () => {
        browserHistory.push = jest.fn();
        testStore.dispatch(Actions.switchTeam('/test'));
        expect(channelActions.viewChannel).toHaveBeenCalledWith('currentChannelId');
        expect(browserHistory.push).toHaveBeenCalledWith('/test');
    });

    test('addUsersToTeam', () => {
        testStore.dispatch(Actions.addUsersToTeam('teamId', ['123', '1234']));
        expect(TeamActions.addUsersToTeam).toHaveBeenCalledWith('teamId', ['123', '1234']);
    });

    test('removeUserFromTeam', async () => {
        await testStore.dispatch(Actions.removeUserFromTeam('teamId', '123'));
        expect(userActions.getUser).toHaveBeenCalledWith('123');
        expect(TeamActions.getTeamStats).toHaveBeenCalledWith('teamId');
        expect(channelActions.getChannelStats).toHaveBeenCalledWith('currentChannelId');
    });

    test('addUserToTeamFromInvite', async () => {
        await testStore.dispatch(Actions.addUserToTeamFromInvite('token', 'inviteId'));
        expect(TeamActions.addUserToTeamFromInvite).toHaveBeenCalledWith('token', 'inviteId');
        expect(TeamActions.getTeam).toHaveBeenCalledWith('teamId');
    });
});
