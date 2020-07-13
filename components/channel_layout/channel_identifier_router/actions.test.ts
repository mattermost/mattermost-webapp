// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {joinChannel} from 'mattermost-redux/actions/channels';
import {getUserByEmail} from 'mattermost-redux/actions/users';

import {emitChannelClickEvent} from 'actions/global_actions.jsx';
import {
    goToChannelByChannelName,
    goToDirectChannelByUserId,
    goToDirectChannelByUserIds,
    goToChannelByChannelId,
    goToDirectChannelByEmail,
    getPathFromIdentifier,
} from 'components/channel_layout/channel_identifier_router/actions';

jest.mock('actions/global_actions.jsx', () => ({
    emitChannelClickEvent: jest.fn(),
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    joinChannel: jest.fn(() => ({type: '', data: {channel: {id: 'channel_id3', name: 'achannel3', team_id: 'team_id1', type: 'O'}}})),
}));

jest.mock('mattermost-redux/actions/users', () => ({
    getUserByEmail: jest.fn(() => ({type: '', data: {id: 'user_id3', email: 'user3@bladekick.com', username: 'user3'}})),
    getUser: jest.fn(() => ({type: '', data: {id: 'user_id3', email: 'user3@bladekick.com', username: 'user3'}})),
}));

const mockStore = configureStore([thunk]);

describe('Actions', () => {
    const channel1 = {id: 'channel_id1', name: 'achannel', team_id: 'team_id1'};
    const channel2 = {id: 'channel_id2', name: 'achannel', team_id: 'team_id2'};
    const channel3 = {id: 'channel_id3', name: 'achannel3', team_id: 'team_id1', type: 'O'};
    const channel4 = {id: 'channel_id4', name: 'additional-abilities---community-systems', team_id: 'team_id1', type: 'O'};
    const channel5 = {id: 'channel_id5', name: 'some-group-channel', team_id: 'team_id1', type: 'G'};

    const initialState = {
        entities: {
            channels: {
                currentChannelId: 'channel_id1',
                channels: {channel_id1: channel1, channel_id2: channel2, channel_id3: channel3, channel_id4: channel4, channel_id5: channel5},
                myMembers: {channel_id1: {channel_id: 'channel_id1', user_id: 'current_user_id'}, channel_id2: {channel_id: 'channel_id2', user_id: 'current_user_id'}},
                channelsInTeam: {team_id1: ['channel_id1'], team_id2: ['channel_id2']},
            },
            teams: {
                currentTeamId: 'team_id1',
                teams: {
                    team_id1: {
                        id: 'team_id1',
                        name: 'team1',
                    },
                    team_id2: {
                        id: 'team_id2',
                        name: 'team2',
                    },
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {user_id2: {id: 'user_id2', username: 'user2', email: 'user2@bladekick.com'}},
            },
            general: {license: {IsLicensed: 'false'}, config: {}},
            preferences: {myPreferences: {}},
        },
    };

    describe('getPathFromIdentifier', () => {
        test('Should return channel_name if identifier is a channel name', () => {
            const path = getPathFromIdentifier((initialState as any), 'channels', 'channelName');
            expect(path).toEqual('channel_name');
        });
        test('Should return channel_id if identifier is a channel id', () => {
            const path = getPathFromIdentifier((initialState as any), 'channels', 'pjz4yj7jw7nzmmo3upi4htmt1y');
            expect(path).toEqual('channel_id');
        });
        test('Should return group_id path if identifier is a group id', () => {
            const path = getPathFromIdentifier((initialState as any), 'channels', '9c992e32cc7b3e5651f68b0ead4935fdf40d67ff');
            expect(path).toEqual('group_channel_group_id');
        });
        test('Should return group_id path if channel exists and is type G', () => {
            const path = getPathFromIdentifier((initialState as any), 'channels', 'some-group-channel');
            expect(path).toEqual('group_channel_group_id');
        });
        test('Should return group_id path if identifier is a group id', () => {
            const path = getPathFromIdentifier((initialState as any), 'messages', '9c992e32cc7b3e5651f68b0ead4935fdf40d67ff');
            expect(path).toEqual('group_channel_group_id');
        });
        test('Should return direct channel path if identifier is in the format userid__userid2', () => {
            const path = getPathFromIdentifier((initialState as any), 'channels', '3y8ujrgtbfn78ja5nfms3qm5jw__3y8ujrgtbfn78ja5nfms3qm5jw');
            expect(path).toEqual('direct_channel_user_ids');
        });
        test('Should return channel by name path if identifier looks like a group id but matching channel is an open channel', () => {
            const path = getPathFromIdentifier((initialState as any), 'channels', 'additional-abilities---community-systems');
            expect(path).toEqual('channel_name');
        });
        test('Should return channel by name path if identifier is in the format userid--userid2', () => {
            const path = getPathFromIdentifier((initialState as any), 'channels', '3y8ujrgtbfn78ja5nfms3qm5jw--3y8ujrgtbfn78ja5nfms3qm5jw');
            expect(path).toEqual('channel_name');
        });
        test('Should return direct channel by username if identifier is the username', () => {
            const path = getPathFromIdentifier((initialState as any), 'messages', '@user1');
            expect(path).toEqual('direct_channel_username');
        });
        test('Should return direct channel by email if identifier is the user email', () => {
            const path = getPathFromIdentifier((initialState as any), 'messages', 'user1@bladekick.com');
            expect(path).toEqual('direct_channel_email');
        });
        test('Should return direct channel by id if identifier is the user id', () => {
            const path = getPathFromIdentifier((initialState as any), 'messages', '3y8ujrgtbfn78ja5nfms3qm5jw');
            expect(path).toEqual('direct_channel_user_id');
        });
        test('Should return error in case the path is not right', () => {
            const path = getPathFromIdentifier((initialState as any), 'messages', 'test');
            expect(path).toEqual('error');
        });
    });

    describe('goToChannelByChannelId', () => {
        test('switch to public channel we have locally but need to join', async () => {
            const testStore = await mockStore(initialState);
            const history = {replace: jest.fn()};

            await testStore.dispatch((goToChannelByChannelId({params: {team: 'team1', identifier: 'channel_id3', path: '/'}, url: ''}, history as any) as any));
            expect(joinChannel).toHaveBeenCalledWith('current_user_id', 'team_id1', 'channel_id3', '');
            expect(history.replace).toHaveBeenCalledWith('/team1/channels/achannel3');
        });
    });

    describe('goToChannelByChannelName', () => {
        test('switch to channel on different team with same name', async () => {
            const testStore = await mockStore(initialState);

            await testStore.dispatch((goToChannelByChannelName({params: {team: 'team2', identifier: 'achannel', path: '/'}, url: ''}, {} as any) as any));
            expect(emitChannelClickEvent).toHaveBeenCalledWith(channel2);
        });

        test('switch to public channel we have locally but need to join', async () => {
            const testStore = await mockStore(initialState);

            await testStore.dispatch((goToChannelByChannelName({params: {team: 'team1', identifier: 'achannel3', path: '/'}, url: ''}, {} as any) as any));
            expect(joinChannel).toHaveBeenCalledWith('current_user_id', 'team_id1', '', 'achannel3');
            expect(emitChannelClickEvent).toHaveBeenCalledWith(channel3);
        });
    });

    describe('goToDirectChannelByUserId', () => {
        test('switch to a direct channel by user id on the same team', async () => {
            const testStore = await mockStore(initialState);
            const history = {replace: jest.fn()};

            await testStore.dispatch((goToDirectChannelByUserId({params: {team: 'team1', identifier: 'channel', path: '/'}, url: ''}, history as any, 'user_id2') as any));
            expect(history.replace).toHaveBeenCalledWith('/team1/messages/@user2');
        });

        test('switch to a direct channel by user id on different team', async () => {
            const testStore = await mockStore(initialState);
            const history = {replace: jest.fn()};

            await testStore.dispatch((goToDirectChannelByUserId({params: {team: 'team2', identifier: 'channel', path: '/'}, url: ''}, history as any, 'user_id2') as any));
            expect(history.replace).toHaveBeenCalledWith('/team2/messages/@user2');
        });
    });

    describe('goToDirectChannelByUserIds', () => {
        test('switch to a direct channel by name on the same team', async () => {
            const testStore = await mockStore(initialState);
            const history = {replace: jest.fn()};

            await testStore.dispatch((goToDirectChannelByUserIds({params: {team: 'team1', identifier: 'current_user_id__user_id2', path: '/'}, url: ''}, history as any) as any));
            expect(history.replace).toHaveBeenCalledWith('/team1/messages/@user2');
        });

        test('switch to a direct channel by name on different team', async () => {
            const testStore = await mockStore(initialState);
            const history = {replace: jest.fn()};

            await testStore.dispatch((goToDirectChannelByUserIds({params: {team: 'team2', identifier: 'current_user_id__user_id2', path: '/'}, url: ''}, history as any) as any));
            expect(history.replace).toHaveBeenCalledWith('/team2/messages/@user2');
        });
    });

    describe('goToDirectChannelByEmail', () => {
        test('switch to a direct channel by email with user already existing locally', async () => {
            const testStore = await mockStore(initialState);
            const history = {replace: jest.fn()};

            await testStore.dispatch((goToDirectChannelByEmail({params: {team: 'team1', identifier: 'user2@bladekick.com', path: '/'}, url: ''}, history as any) as any));
            expect(getUserByEmail).not.toHaveBeenCalled();
            expect(history.replace).toHaveBeenCalledWith('/team1/messages/@user2');
        });

        test('switch to a direct channel by email with user not existing locally', async () => {
            const testStore = await mockStore(initialState);
            const history = {replace: jest.fn()};

            await testStore.dispatch((goToDirectChannelByEmail({params: {team: 'team1', identifier: 'user3@bladekick.com', path: '/'}, url: ''}, history as any) as any));
            expect(getUserByEmail).toHaveBeenCalledWith('user3@bladekick.com');
            expect(history.replace).toHaveBeenCalledWith('/team1/messages/@user3');
        });
    });
});
