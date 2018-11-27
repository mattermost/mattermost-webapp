// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {leaveChannel} from 'mattermost-redux/actions/channels';

import {browserHistory} from 'utils/browser_history';
import * as Actions from 'actions/views/channel';
import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';

const mockStore = configureStore([thunk]);

jest.mock('utils/browser_history', () => ({
    browserHistory: {
        push: jest.fn(),
    },
}));

jest.mock('actions/channel_actions.jsx', () => ({
    openDirectChannelToUserId: jest.fn(() => {
        return {type: ''};
    }),
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    leaveChannel: jest.fn(() => {
        return {type: ''};
    }),
}));

describe('channel view actions', () => {
    const channel1 = {id: 'channelid1', name: 'channel1', display_name: 'Channel 1', type: 'O'};
    const gmChannel = {id: 'gmchannelid', name: 'gmchannel', display_name: 'GM Channel 1', type: 'G'};
    const team1 = {id: 'teamid1', name: 'team1'};

    const initialState = {
        entities: {
            users: {
                currentUserId: 'userid1',
                profiles: {userid1: {id: 'userid1', username: 'username1'}, userid2: {id: 'userid2', username: 'username2'}},
                profilesInChannel: {},
            },
            teams: {
                currentTeamId: 'teamid1',
                teams: {teamid1: team1},
            },
            channels: {
                channels: {channelid1: channel1, gmchannelid: gmChannel},
                myMembers: {gmchannelid: {channel_id: 'gmchannelid', user_id: 'userid1'}},
            },
            general: {
                config: {},
            },
            preferences: {
                myPreferences: {},
            },
        },
    };

    let store;

    beforeEach(() => {
        store = mockStore(initialState);
    });

    describe('switchToChannel', () => {
        test('switch to public channel', () => {
            store.dispatch(Actions.switchToChannel(channel1));
            expect(browserHistory.push).toHaveBeenCalledWith(`/${team1.name}/channels/${channel1.name}`);
        });

        test('switch to fake direct channel', async () => {
            await store.dispatch(Actions.switchToChannel({fake: true, userId: 'userid2', name: 'username2'}));
            expect(openDirectChannelToUserId).toHaveBeenCalledWith('userid2');
            expect(browserHistory.push).toHaveBeenCalledWith(`/${team1.name}/messages/@username2`);
        });

        test('switch to gm channel', async () => {
            await store.dispatch(Actions.switchToChannel(gmChannel));
            expect(browserHistory.push).toHaveBeenCalledWith(`/${team1.name}/channels/${gmChannel.name}`);
        });
    });

    describe('leaveChannel', () => {
        test('leave a channel successfully', async () => {
            await store.dispatch(Actions.leaveChannel('channelid'));
            expect(browserHistory.push).toHaveBeenCalledWith(`/${team1.name}/channels/town-square`);
            expect(leaveChannel).toHaveBeenCalledWith('channelid');
        });
    });
});
