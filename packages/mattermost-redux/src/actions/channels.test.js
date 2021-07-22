// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';
import nock from 'nock';

import * as Actions from 'mattermost-redux/actions/channels';
import {addUserToTeam} from 'mattermost-redux/actions/teams';
import {getProfilesByIds, login} from 'mattermost-redux/actions/users';
import {createIncomingHook, createOutgoingHook} from 'mattermost-redux/actions/integrations';

import {Client4} from 'mattermost-redux/client';

import {General, RequestStatus, Preferences, Permissions} from '../constants';
import {CategoryTypes} from '../constants/channel_categories';
import {MarkUnread} from '../constants/channels';

import TestHelper from 'mattermost-redux/test/test_helper';
import configureStore from 'mattermost-redux/test/test_store';

import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';

const OK_RESPONSE = {status: 'OK'};

describe('Actions.Channels', () => {
    let store;
    beforeAll(() => {
        TestHelper.initBasic(Client4);
    });

    beforeEach(() => {
        store = configureStore();
    });

    afterAll(() => {
        TestHelper.tearDown();
    });

    it('selectChannel', async () => {
        const channelId = TestHelper.generateId();

        await store.dispatch(Actions.selectChannel(channelId));
        await TestHelper.wait(100);
        const state = store.getState();

        assert.equal(state.entities.channels.currentChannelId, channelId);
    });

    it('createChannel', async () => {
        nock(Client4.getBaseRoute()).
            post('/channels').
            reply(201, TestHelper.fakeChannelWithId(TestHelper.basicTeam.id));

        await store.dispatch(Actions.createChannel(TestHelper.fakeChannel(TestHelper.basicTeam.id), TestHelper.basicUser.id));

        const createRequest = store.getState().requests.channels.createChannel;

        if (createRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(createRequest.error));
        }

        const {channels, myMembers} = store.getState().entities.channels;
        const channelsCount = Object.keys(channels).length;
        const membersCount = Object.keys(myMembers).length;
        assert.ok(channels);
        assert.ok(myMembers);
        assert.ok(channels[Object.keys(myMembers)[0]]);
        assert.ok(myMembers[Object.keys(channels)[0]]);
        assert.equal(myMembers[Object.keys(channels)[0]].user_id, TestHelper.basicUser.id);
        assert.equal(channelsCount, membersCount);
        assert.equal(channelsCount, 1);
        assert.equal(membersCount, 1);
    });

    it('createDirectChannel', async () => {
        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post('/users/ids').
            reply(200, [user]);

        await store.dispatch(getProfilesByIds([user.id]));

        nock(Client4.getBaseRoute()).
            post('/channels/direct').
            reply(201, {...TestHelper.fakeChannelWithId(), type: 'D'});

        const {data: created} = await store.dispatch(Actions.createDirectChannel(TestHelper.basicUser.id, user.id));

        const createRequest = store.getState().requests.channels.createChannel;
        if (createRequest.status === RequestStatus.FAILURE) {
            throw new Error(createRequest.error);
        }

        const state = store.getState();
        const {channels, myMembers} = state.entities.channels;
        const {profiles, profilesInChannel} = state.entities.users;
        const preferences = state.entities.preferences.myPreferences;
        const channelsCount = Object.keys(channels).length;
        const membersCount = Object.keys(myMembers).length;

        assert.ok(channels, 'channels is empty');
        assert.ok(myMembers, 'members is empty');
        assert.ok(profiles[user.id], 'profiles does not have userId');
        assert.ok(Object.keys(preferences).length, 'preferences is empty');
        assert.ok(channels[Object.keys(myMembers)[0]], 'channels should have the member');
        assert.ok(myMembers[Object.keys(channels)[0]], 'members should belong to channel');
        assert.equal(myMembers[Object.keys(channels)[0]].user_id, TestHelper.basicUser.id);
        assert.equal(channelsCount, membersCount);
        assert.equal(channels[Object.keys(channels)[0]].type, 'D');
        assert.equal(channelsCount, 1);
        assert.equal(membersCount, 1);

        assert.ok(profilesInChannel, 'profiles in channel is empty');
        assert.ok(profilesInChannel[created.id], 'profiles in channel is empty for channel');
        assert.equal(profilesInChannel[created.id].size, 2, 'incorrect number of profiles in channel');
        assert.ok(profilesInChannel[created.id].has(TestHelper.basicUser.id), 'creator is not in channel');
        assert.ok(profilesInChannel[created.id].has(user.id), 'user is not in channel');
    });

    it('createGroupChannel', async () => {
        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user2 = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        TestHelper.mockLogin();
        await store.dispatch(login(TestHelper.basicUser.email, TestHelper.basicUser.password));

        nock(Client4.getBaseRoute()).
            post('/users/ids').
            reply(200, [user, user2]);

        await store.dispatch(getProfilesByIds([user.id, user2.id]));

        nock(Client4.getBaseRoute()).
            post('/channels/group').
            reply(201, {...TestHelper.fakeChannelWithId(), type: 'G'});

        const result = await store.dispatch(Actions.createGroupChannel([TestHelper.basicUser.id, user.id, user2.id]));
        const created = result.data;

        assert.ok(!result.error, 'error was returned');
        assert.ok(created, 'channel was not returned');

        const createRequest = store.getState().requests.channels.createChannel;
        if (createRequest.status === RequestStatus.FAILURE) {
            throw new Error(createRequest.error);
        }

        const state = store.getState();
        const {channels, myMembers} = state.entities.channels;
        const preferences = state.entities.preferences.myPreferences;
        const {profilesInChannel} = state.entities.users;

        assert.ok(channels, 'channels is empty');
        assert.ok(channels[created.id], 'channel does not exist');
        assert.ok(myMembers, 'members is empty');
        assert.ok(myMembers[created.id], 'member does not exist');
        assert.ok(Object.keys(preferences).length, 'preferences is empty');

        assert.ok(profilesInChannel, 'profiles in channel is empty');
        assert.ok(profilesInChannel[created.id], 'profiles in channel is empty for channel');
        assert.equal(profilesInChannel[created.id].size, 3, 'incorrect number of profiles in channel');
        assert.ok(profilesInChannel[created.id].has(TestHelper.basicUser.id), 'creator is not in channel');
        assert.ok(profilesInChannel[created.id].has(user.id), 'user is not in channel');
        assert.ok(profilesInChannel[created.id].has(user2.id), 'user2 is not in channel');
    });

    it('updateChannel', async () => {
        const channel = {
            ...TestHelper.basicChannel,
            purpose: 'This is to test redux',
            header: 'MM with Redux',
        };

        nock(Client4.getBaseRoute()).
            put(`/channels/${channel.id}`).
            reply(200, channel);

        await store.dispatch(Actions.updateChannel(channel));

        const updateRequest = store.getState().requests.channels.updateChannel;
        if (updateRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(updateRequest.error));
        }

        const {channels} = store.getState().entities.channels;
        const channelId = Object.keys(channels)[0];
        assert.ok(channelId);
        assert.ok(channels[channelId]);
        assert.strictEqual(channels[channelId].header, 'MM with Redux');
    });

    it('patchChannel', async () => {
        const channel = {
            header: 'MM with Redux2',
        };

        nock(Client4.getBaseRoute()).
            put(`/channels/${TestHelper.basicChannel.id}/patch`).
            reply(200, {...TestHelper.basicChannel, ...channel});

        await store.dispatch(Actions.patchChannel(TestHelper.basicChannel.id, channel));

        const updateRequest = store.getState().requests.channels.updateChannel;
        if (updateRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(updateRequest.error));
        }

        const {channels} = store.getState().entities.channels;
        const channelId = Object.keys(channels)[0];
        assert.ok(channelId);
        assert.ok(channels[channelId]);
        assert.strictEqual(channels[channelId].header, 'MM with Redux2');
    });

    it('updateChannelPrivacy', async () => {
        const publicChannel = TestHelper.basicChannel;
        nock(Client4.getChannelRoute(publicChannel.id)).
            put('/privacy').
            reply(200, {...publicChannel, type: General.PRIVATE_CHANNEL});

        assert.equal(publicChannel.type, General.OPEN_CHANNEL);

        await store.dispatch(Actions.updateChannelPrivacy(publicChannel.id, General.PRIVATE_CHANNEL));

        const updateRequest = store.getState().requests.channels.updateChannel;
        if (updateRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(updateRequest.error));
        }

        const {channels} = store.getState().entities.channels;
        const channelId = Object.keys(channels)[0];
        assert.ok(channelId);
        assert.ok(channels[channelId]);
        assert.equal(channels[channelId].type, General.PRIVATE_CHANNEL);
    });

    it('convertChannelToPrivate', async () => {
        const publicChannel = TestHelper.basicChannel;
        nock(Client4.getChannelRoute(publicChannel.id)).
            post('/convert').
            reply(200, {...TestHelper.basicChannel, type: General.PRIVATE_CHANNEL});

        assert.equal(TestHelper.basicChannel.type, General.OPEN_CHANNEL);

        await store.dispatch(Actions.convertChannelToPrivate(TestHelper.basicChannel.id));

        const updateRequest = store.getState().requests.channels.updateChannel;
        if (updateRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(updateRequest.error));
        }

        const {channels} = store.getState().entities.channels;
        const channelId = Object.keys(channels)[0];
        assert.ok(channelId);
        assert.ok(channels[channelId]);
        assert.equal(channels[channelId].type, General.PRIVATE_CHANNEL);
    });

    it('getChannel', async () => {
        nock(Client4.getBaseRoute()).
            get(`/channels/${TestHelper.basicChannel.id}`).
            reply(200, TestHelper.basicChannel);

        await store.dispatch(Actions.getChannel(TestHelper.basicChannel.id));

        const {channels} = store.getState().entities.channels;
        assert.ok(channels[TestHelper.basicChannel.id]);
    });

    it('getChannelByNameAndTeamName', async () => {
        nock(Client4.getTeamsRoute()).
            get(`/name/${TestHelper.basicTeam.name}/channels/name/${TestHelper.basicChannel.name}?include_deleted=false`).
            reply(200, TestHelper.basicChannel);

        await store.dispatch(Actions.getChannelByNameAndTeamName(TestHelper.basicTeam.name, TestHelper.basicChannel.name));

        const {channels} = store.getState().entities.channels;
        assert.ok(channels[TestHelper.basicChannel.id]);
    });

    it('getChannelAndMyMember', async () => {
        nock(Client4.getBaseRoute()).
            get(`/channels/${TestHelper.basicChannel.id}`).
            reply(200, TestHelper.basicChannel);

        nock(Client4.getBaseRoute()).
            get(`/channels/${TestHelper.basicChannel.id}/members/me`).
            reply(200, TestHelper.basicChannelMember);

        await store.dispatch(Actions.getChannelAndMyMember(TestHelper.basicChannel.id));

        const {channels, myMembers} = store.getState().entities.channels;
        assert.ok(channels[TestHelper.basicChannel.id]);
        assert.ok(myMembers[TestHelper.basicChannel.id]);
    });

    it('fetchMyChannelsAndMembers', async () => {
        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post('/channels/direct').
            reply(201, {...TestHelper.fakeChannelWithId(), team_id: '', type: 'D'});

        const {data: directChannel} = await store.dispatch(Actions.createDirectChannel(TestHelper.basicUser.id, user.id));

        nock(Client4.getBaseRoute()).
            get(`/users/me/teams/${TestHelper.basicTeam.id}/channels`).
            query(true).
            reply(200, [directChannel, TestHelper.basicChannel]);

        nock(Client4.getBaseRoute()).
            get(`/users/me/teams/${TestHelper.basicTeam.id}/channels/members`).
            reply(200, [{user_id: TestHelper.basicUser.id, roles: 'channel_user', channel_id: directChannel.id}, TestHelper.basicChannelMember]);

        await store.dispatch(Actions.fetchMyChannelsAndMembers(TestHelper.basicTeam.id));

        const {channels, channelsInTeam, myMembers} = store.getState().entities.channels;
        assert.ok(channels);
        assert.ok(myMembers);
        assert.ok(channels[Object.keys(myMembers)[0]]);
        assert.ok(myMembers[Object.keys(channels)[0]]);
        assert.ok(channelsInTeam[''].has(directChannel.id));
        assert.equal(Object.keys(channels).length, Object.keys(myMembers).length);
    });

    it('updateChannelNotifyProps', async () => {
        const notifyProps = {
            mark_unread: MarkUnread.MENTION,
            desktop: 'none',
        };

        nock(Client4.getBaseRoute()).
            get(`/users/me/teams/${TestHelper.basicTeam.id}/channels`).
            query(true).
            reply(200, [TestHelper.basicChannel]);

        nock(Client4.getBaseRoute()).
            get(`/users/me/teams/${TestHelper.basicTeam.id}/channels/members`).
            reply(200, [TestHelper.basicChannelMember]);

        await store.dispatch(Actions.fetchMyChannelsAndMembers(TestHelper.basicTeam.id));

        nock(Client4.getBaseRoute()).
            put(`/channels/${TestHelper.basicChannel.id}/members/${TestHelper.basicUser.id}/notify_props`).
            reply(200, OK_RESPONSE);

        await store.dispatch(Actions.updateChannelNotifyProps(
            TestHelper.basicUser.id,
            TestHelper.basicChannel.id,
            notifyProps));

        const members = store.getState().entities.channels.myMembers;
        const member = members[TestHelper.basicChannel.id];
        assert.ok(member);
        assert.equal(member.notify_props.mark_unread, MarkUnread.MENTION);
        assert.equal(member.notify_props.desktop, 'none');
    });

    it('deleteChannel', async () => {
        const secondClient = TestHelper.createClient4();

        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post('/users/login').
            reply(200, user);
        await secondClient.login(user.email, 'password1');

        nock(Client4.getBaseRoute()).
            post('/channels').
            reply(201, TestHelper.fakeChannelWithId(TestHelper.basicTeam.id));
        const secondChannel = await secondClient.createChannel(
            TestHelper.fakeChannel(TestHelper.basicTeam.id));

        nock(Client4.getBaseRoute()).
            post(`/channels/${secondChannel.id}/members`).
            reply(201, {user_id: TestHelper.basicUser.id, roles: 'channel_user', channel_id: secondChannel.id});

        await store.dispatch(Actions.joinChannel(
            TestHelper.basicUser.id,
            TestHelper.basicTeam.id,
            secondChannel.id,
        ));

        nock(Client4.getBaseRoute()).
            get(`/users/me/teams/${TestHelper.basicTeam.id}/channels`).
            query(true).
            reply(200, [secondChannel, TestHelper.basicChannel]);

        nock(Client4.getBaseRoute()).
            get(`/users/me/teams/${TestHelper.basicTeam.id}/channels/members`).
            reply(200, [{user_id: TestHelper.basicUser.id, roles: 'channel_user', channel_id: secondChannel.id}, TestHelper.basicChannelMember]);

        await store.dispatch(Actions.fetchMyChannelsAndMembers(TestHelper.basicTeam.id));

        nock(Client4.getBaseRoute()).
            post('/hooks/incoming').
            reply(201, {
                id: TestHelper.generateId(),
                create_at: 1507840900004,
                update_at: 1507840900004,
                delete_at: 0,
                user_id: TestHelper.basicUser.id,
                channel_id: secondChannel.id,
                team_id: TestHelper.basicTeam.id,
                display_name: 'TestIncomingHook',
                description: 'Some description.',
            });
        const incomingHook = await store.dispatch(createIncomingHook({channel_id: secondChannel.id, display_name: 'test', description: 'test'}));

        nock(Client4.getBaseRoute()).
            post('/hooks/outgoing').
            reply(201, {
                id: TestHelper.generateId(),
                token: TestHelper.generateId(),
                create_at: 1507841118796,
                update_at: 1507841118796,
                delete_at: 0,
                creator_id: TestHelper.basicUser.id,
                channel_id: secondChannel.id,
                team_id: TestHelper.basicTeam.id,
                trigger_words: ['testword'],
                trigger_when: 0,
                callback_urls: ['http://notarealurl'],
                display_name: 'TestOutgoingHook',
                description: '',
                content_type: 'application/x-www-form-urlencoded',
            });
        const outgoingHook = await store.dispatch(createOutgoingHook({
            channel_id: secondChannel.id,
            team_id: TestHelper.basicTeam.id,
            display_name: 'TestOutgoingHook',
            trigger_words: [TestHelper.generateId()],
            callback_urls: ['http://notarealurl']},
        ));

        nock(Client4.getBaseRoute()).
            delete(`/channels/${secondChannel.id}`).
            reply(200, OK_RESPONSE);

        await store.dispatch(Actions.deleteChannel(secondChannel.id));

        const {incomingHooks, outgoingHooks} = store.getState().entities.integrations;

        assert.ifError(incomingHooks[incomingHook.id]);
        assert.ifError(outgoingHooks[outgoingHook.id]);
    });

    it('unarchiveChannel', async () => {
        const secondClient = TestHelper.createClient4();

        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post('/users/login').
            reply(200, user);
        await secondClient.login(user.email, 'password1');

        nock(Client4.getBaseRoute()).
            post('/channels').
            reply(201, TestHelper.fakeChannelWithId(TestHelper.basicTeam.id));
        const secondChannel = await secondClient.createChannel(
            TestHelper.fakeChannel(TestHelper.basicTeam.id));

        nock(Client4.getBaseRoute()).
            post(`/channels/${secondChannel.id}/members`).
            reply(201, {user_id: TestHelper.basicUser.id, roles: 'channel_user', channel_id: secondChannel.id});

        await store.dispatch(Actions.joinChannel(
            TestHelper.basicUser.id,
            TestHelper.basicTeam.id,
            secondChannel.id,
        ));

        nock(Client4.getBaseRoute()).
            get(`/users/me/teams/${TestHelper.basicTeam.id}/channels`).
            query(true).
            reply(200, [secondChannel, TestHelper.basicChannel]);

        nock(Client4.getBaseRoute()).
            get(`/users/me/teams/${TestHelper.basicTeam.id}/channels/members`).
            reply(200, [{user_id: TestHelper.basicUser.id, roles: 'channel_user', channel_id: secondChannel.id}, TestHelper.basicChannelMember]);

        await store.dispatch(Actions.fetchMyChannelsAndMembers(TestHelper.basicTeam.id));

        nock(Client4.getBaseRoute()).
            post('/hooks/incoming').
            reply(201, {
                id: TestHelper.generateId(),
                create_at: 1507840900004,
                update_at: 1507840900004,
                delete_at: 1609090954545,
                user_id: TestHelper.basicUser.id,
                channel_id: secondChannel.id,
                team_id: TestHelper.basicTeam.id,
                display_name: 'TestIncomingHook',
                description: 'Some description.',
            });
        const incomingHook = await store.dispatch(createIncomingHook({channel_id: secondChannel.id, display_name: 'test', description: 'test'}));

        nock(Client4.getBaseRoute()).
            post('/hooks/outgoing').
            reply(201, {
                id: TestHelper.generateId(),
                token: TestHelper.generateId(),
                create_at: 1507841118796,
                update_at: 1507841118796,
                delete_at: 1609090954545,
                creator_id: TestHelper.basicUser.id,
                channel_id: secondChannel.id,
                team_id: TestHelper.basicTeam.id,
                trigger_words: ['testword'],
                trigger_when: 0,
                callback_urls: ['http://notarealurl'],
                display_name: 'TestOutgoingHook',
                description: '',
                content_type: 'application/x-www-form-urlencoded',
            });
        const outgoingHook = await store.dispatch(createOutgoingHook({
            channel_id: secondChannel.id,
            team_id: TestHelper.basicTeam.id,
            display_name: 'TestOutgoingHook',
            trigger_words: [TestHelper.generateId()],
            callback_urls: ['http://notarealurl']},
        ));

        nock(Client4.getBaseRoute()).
            delete(`/channels/${secondChannel.id}`).
            reply(200, OK_RESPONSE);

        await store.dispatch(Actions.unarchiveChannel(secondChannel.id));

        const {incomingHooks, outgoingHooks} = store.getState().entities.integrations;

        assert.ifError(incomingHooks[incomingHook.id]);
        assert.ifError(outgoingHooks[outgoingHook.id]);
    });

    describe('viewChannel', () => {
        test('should contact server and update last_viewed_at of both channels', async () => {
            const channelId = TestHelper.generateId();
            const prevChannelId = TestHelper.generateId();

            const currentUserId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        myMembers: {
                            [channelId]: {
                                channel_id: channelId,
                                last_viewed_at: 1000,
                                roles: '',
                            },
                            [prevChannelId]: {
                                channel_id: prevChannelId,
                                last_viewed_at: 1000,
                                roles: '',
                            },
                        },
                    },
                    users: {
                        currentUserId,
                    },
                },
            });

            nock(Client4.getBaseRoute()).
                post('/channels/members/me/view', {channel_id: channelId, prev_channel_id: prevChannelId, collapsed_threads_supported: true}).
                reply(200, OK_RESPONSE);

            const now = Date.now();

            const result = await store.dispatch(Actions.viewChannel(channelId, prevChannelId));
            expect(result).toEqual({data: true});

            const state = store.getState();
            expect(state.entities.channels.myMembers[channelId].last_viewed_at).toBeGreaterThan(now);
            expect(state.entities.channels.myMembers[prevChannelId].last_viewed_at).toBeGreaterThan(now);
        });

        test('should clear manually unread state from current channel', async () => {
            const channelId = TestHelper.generateId();

            const currentUserId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        manuallyUnread: {
                            [channelId]: true,
                        },
                        myMembers: {
                            [channelId]: {
                                channel_id: channelId,
                                last_viewed_at: 1000,
                                roles: '',
                            },
                        },
                    },
                    users: {
                        currentUserId,
                    },
                },
            });

            nock(Client4.getBaseRoute()).
                post('/channels/members/me/view', {channel_id: channelId, prev_channel_id: '', collapsed_threads_supported: true}).
                reply(200, OK_RESPONSE);

            const result = await store.dispatch(Actions.viewChannel(channelId));
            expect(result).toEqual({data: true});

            const state = store.getState();
            expect(state.entities.channels.manuallyUnread[channelId]).not.toBe(true);
        });

        test('should not update last_viewed_at of previous channel if it is manually marked as unread', async () => {
            const channelId = TestHelper.generateId();
            const prevChannelId = TestHelper.generateId();

            const currentUserId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        manuallyUnread: {
                            [prevChannelId]: true,
                        },
                        myMembers: {
                            [channelId]: {
                                channel_id: channelId,
                                last_viewed_at: 1000,
                                roles: '',
                            },
                            [prevChannelId]: {
                                channel_id: prevChannelId,
                                last_viewed_at: 1000,
                                roles: '',
                            },
                        },
                    },
                    users: {
                        currentUserId,
                    },
                },
            });

            nock(Client4.getBaseRoute()).
                post('/channels/members/me/view', {channel_id: channelId, prev_channel_id: '', collapsed_threads_supported: true}).
                reply(200, OK_RESPONSE);

            const now = Date.now();

            const result = await store.dispatch(Actions.viewChannel(channelId, prevChannelId));
            expect(result).toEqual({data: true});

            const state = store.getState();
            expect(state.entities.channels.myMembers[channelId].last_viewed_at).toBeGreaterThan(now);
            expect(state.entities.channels.myMembers[prevChannelId].last_viewed_at).toBe(1000);
        });
    });

    it('markChannelAsViewed', async () => {
        nock(Client4.getBaseRoute()).
            post('/channels').
            reply(201, TestHelper.fakeChannelWithId(TestHelper.basicTeam.id));

        const userChannel = await Client4.createChannel(
            TestHelper.fakeChannel(TestHelper.basicTeam.id),
        );

        nock(Client4.getBaseRoute()).
            get(`/users/me/teams/${TestHelper.basicTeam.id}/channels`).
            query(true).
            reply(200, [userChannel, TestHelper.basicChannel]);

        nock(Client4.getBaseRoute()).
            get(`/users/me/teams/${TestHelper.basicTeam.id}/channels/members`).
            reply(200, [{user_id: TestHelper.basicUser.id, roles: 'channel_user', channel_id: userChannel.id}, TestHelper.basicChannelMember]);

        await store.dispatch(Actions.fetchMyChannelsAndMembers(TestHelper.basicTeam.id));

        const timestamp = Date.now();
        let members = store.getState().entities.channels.myMembers;
        let member = members[TestHelper.basicChannel.id];
        const otherMember = members[userChannel.id];
        assert.ok(member);
        assert.ok(otherMember);

        await TestHelper.wait(50);

        await store.dispatch(Actions.markChannelAsViewed(TestHelper.basicChannel.id));

        members = store.getState().entities.channels.myMembers;
        member = members[TestHelper.basicChannel.id];
        assert.ok(member.last_viewed_at > timestamp);
    });

    describe('markChannelAsUnread', () => {
        it('plain message', () => {
            const teamId = TestHelper.generateId();
            const channelId = TestHelper.generateId();
            const userId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId]: {team_id: teamId, total_msg_count: 10},
                        },
                        myMembers: {
                            [channelId]: {msg_count: 10, mention_count: 0},
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId]: {msg_count: 0, mention_count: 0},
                        },
                    },
                    users: {
                        currentUserId: userId,
                    },
                },
            });

            store.dispatch(Actions.markChannelAsUnread(teamId, channelId, [TestHelper.generateId()], false));

            const state = store.getState();
            assert.equal(state.entities.channels.channels[channelId].total_msg_count, 11);
            assert.equal(state.entities.channels.myMembers[channelId].msg_count, 10);
            assert.equal(state.entities.channels.myMembers[channelId].mention_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId].msg_count, 1);
            assert.equal(state.entities.teams.myMembers[teamId].mention_count, 0);
        });

        it('message mentioning current user', () => {
            const teamId = TestHelper.generateId();
            const channelId = TestHelper.generateId();
            const userId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId]: {team_id: teamId, total_msg_count: 10},
                        },
                        myMembers: {
                            [channelId]: {msg_count: 10, mention_count: 0},
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId]: {msg_count: 0, mention_count: 0},
                        },
                    },
                    users: {
                        currentUserId: userId,
                    },
                },
            });

            store.dispatch(Actions.markChannelAsUnread(teamId, channelId, [userId], false));

            const state = store.getState();
            assert.equal(state.entities.channels.channels[channelId].total_msg_count, 11);
            assert.equal(state.entities.channels.myMembers[channelId].msg_count, 10);
            assert.equal(state.entities.channels.myMembers[channelId].mention_count, 1);
            assert.equal(state.entities.teams.myMembers[teamId].msg_count, 1);
            assert.equal(state.entities.teams.myMembers[teamId].mention_count, 1);
        });

        it('plain message with mark_unread="mention"', () => {
            const teamId = TestHelper.generateId();
            const channelId = TestHelper.generateId();
            const userId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId]: {team_id: teamId, total_msg_count: 10},
                        },
                        myMembers: {
                            [channelId]: {msg_count: 10, mention_count: 0, notify_props: {mark_unread: MarkUnread.MENTION}},
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId]: {msg_count: 0, mention_count: 0},
                        },
                    },
                    users: {
                        currentUserId: userId,
                    },
                },
            });

            store.dispatch(Actions.markChannelAsUnread(teamId, channelId, [TestHelper.generateId()], false));

            const state = store.getState();
            assert.equal(state.entities.channels.channels[channelId].total_msg_count, 11);
            assert.equal(state.entities.channels.myMembers[channelId].msg_count, 11);
            assert.equal(state.entities.channels.myMembers[channelId].mention_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId].msg_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId].mention_count, 0);
        });

        it('message mentioning current user with mark_unread="mention"', () => {
            const teamId = TestHelper.generateId();
            const channelId = TestHelper.generateId();
            const userId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId]: {team_id: teamId, total_msg_count: 10},
                        },
                        myMembers: {
                            [channelId]: {msg_count: 10, mention_count: 0, notify_props: {mark_unread: MarkUnread.MENTION}},
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId]: {msg_count: 0, mention_count: 0},
                        },
                    },
                    users: {
                        currentUserId: userId,
                    },
                },
            });

            store.dispatch(Actions.markChannelAsUnread(teamId, channelId, [userId], false));

            const state = store.getState();
            assert.equal(state.entities.channels.channels[channelId].total_msg_count, 11);
            assert.equal(state.entities.channels.myMembers[channelId].msg_count, 11);
            assert.equal(state.entities.channels.myMembers[channelId].mention_count, 1);
            assert.equal(state.entities.teams.myMembers[teamId].msg_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId].mention_count, 1);
        });

        it('channel member should not be updated if it has already been fetched', () => {
            const teamId = TestHelper.generateId();
            const channelId = TestHelper.generateId();
            const userId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId]: {team_id: teamId, total_msg_count: 8},
                        },
                        myMembers: {
                            [channelId]: {msg_count: 5, mention_count: 2},
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId]: {msg_count: 2, mention_count: 1},
                        },
                    },
                    users: {
                        currentUserId: userId,
                    },
                },
            });

            store.dispatch(Actions.markChannelAsUnread(teamId, channelId, [userId], true));

            const state = store.getState();
            assert.equal(state.entities.channels.channels[channelId].total_msg_count, 8);
            assert.equal(state.entities.channels.myMembers[channelId].msg_count, 5);
            assert.equal(state.entities.channels.myMembers[channelId].mention_count, 2);
            assert.equal(state.entities.teams.myMembers[teamId].msg_count, 3);
            assert.equal(state.entities.teams.myMembers[teamId].mention_count, 2);
        });
    });

    describe('markChannelAsRead', () => {
        it('one read channel', async () => {
            const channelId = TestHelper.generateId();
            const teamId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId]: {
                                id: channelId,
                                team_id: teamId,
                                total_msg_count: 10,
                            },
                        },
                        myMembers: {
                            [channelId]: {
                                channel_id: channelId,
                                mention_count: 0,
                                msg_count: 10,
                            },
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId]: {
                                id: teamId,
                                mention_count: 0,
                                msg_count: 0,
                            },
                        },
                    },
                },
            });

            await store.dispatch(Actions.markChannelAsRead(channelId));

            const state = store.getState();

            assert.equal(state.entities.channels.myMembers[channelId].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId].msg_count, state.entities.channels.channels[channelId].total_msg_count);

            assert.equal(state.entities.teams.myMembers[teamId].mention_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId].msg_count, 0);
        });

        it('one unread channel', async () => {
            const channelId = TestHelper.generateId();
            const teamId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId]: {
                                id: channelId,
                                team_id: teamId,
                                total_msg_count: 10,
                            },
                        },
                        myMembers: {
                            [channelId]: {
                                channel_id: channelId,
                                mention_count: 2,
                                msg_count: 5,
                            },
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId]: {
                                id: teamId,
                                mention_count: 2,
                                msg_count: 5,
                            },
                        },
                    },
                },
            });

            await store.dispatch(Actions.markChannelAsRead(channelId));

            const state = store.getState();

            assert.equal(state.entities.channels.myMembers[channelId].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId].msg_count, state.entities.channels.channels[channelId].total_msg_count);

            assert.equal(state.entities.teams.myMembers[teamId].mention_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId].msg_count, 0);
        });

        it('one unread DM channel', async () => {
            const channelId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId]: {
                                id: channelId,
                                team_id: '',
                                total_msg_count: 10,
                            },
                        },
                        myMembers: {
                            [channelId]: {
                                channel_id: channelId,
                                mention_count: 2,
                                msg_count: 5,
                            },
                        },
                    },
                    teams: {
                        myMembers: {
                        },
                    },
                },
            });

            await store.dispatch(Actions.markChannelAsRead(channelId));

            const state = store.getState();

            assert.equal(state.entities.channels.myMembers[channelId].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId].msg_count, state.entities.channels.channels[channelId].total_msg_count);
        });

        it('two unread channels, same team, reading one', async () => {
            const channelId1 = TestHelper.generateId();
            const channelId2 = TestHelper.generateId();
            const teamId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId1]: {
                                id: channelId1,
                                team_id: teamId,
                                total_msg_count: 10,
                            },
                            [channelId2]: {
                                id: channelId2,
                                team_id: teamId,
                                total_msg_count: 12,
                            },
                        },
                        myMembers: {
                            [channelId1]: {
                                channel_id: channelId1,
                                mention_count: 2,
                                msg_count: 5,
                            },
                            [channelId2]: {
                                channel_id: channelId2,
                                mention_count: 4,
                                msg_count: 9,
                            },
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId]: {
                                id: teamId,
                                mention_count: 6,
                                msg_count: 8,
                            },
                        },
                    },
                },
            });

            await store.dispatch(Actions.markChannelAsRead(channelId1));

            const state = store.getState();

            assert.equal(state.entities.channels.myMembers[channelId1].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId1].msg_count, state.entities.channels.channels[channelId1].total_msg_count);

            assert.equal(state.entities.channels.myMembers[channelId2].mention_count, 4);
            assert.equal(state.entities.channels.myMembers[channelId2].msg_count, 9);

            assert.equal(state.entities.teams.myMembers[teamId].mention_count, 4);
            assert.equal(state.entities.teams.myMembers[teamId].msg_count, 3);
        });

        it('two unread channels, same team, reading both', async () => {
            const channelId1 = TestHelper.generateId();
            const channelId2 = TestHelper.generateId();
            const teamId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId1]: {
                                id: channelId1,
                                team_id: teamId,
                                total_msg_count: 10,
                            },
                            [channelId2]: {
                                id: channelId2,
                                team_id: teamId,
                                total_msg_count: 12,
                            },
                        },
                        myMembers: {
                            [channelId1]: {
                                channel_id: channelId1,
                                mention_count: 2,
                                msg_count: 5,
                            },
                            [channelId2]: {
                                channel_id: channelId2,
                                mention_count: 4,
                                msg_count: 9,
                            },
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId]: {
                                id: teamId,
                                mention_count: 6,
                                msg_count: 8,
                            },
                        },
                    },
                },
            });

            await store.dispatch(Actions.markChannelAsRead(channelId1, channelId2));

            const state = store.getState();

            assert.equal(state.entities.channels.myMembers[channelId1].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId1].msg_count, state.entities.channels.channels[channelId1].total_msg_count);

            assert.equal(state.entities.channels.myMembers[channelId2].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId2].msg_count, state.entities.channels.channels[channelId2].total_msg_count);

            assert.equal(state.entities.teams.myMembers[teamId].mention_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId].msg_count, 0);
        });

        it('two unread channels, same team, reading both (opposite order)', async () => {
            const channelId1 = TestHelper.generateId();
            const channelId2 = TestHelper.generateId();
            const teamId = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId1]: {
                                id: channelId1,
                                team_id: teamId,
                                total_msg_count: 10,
                            },
                            [channelId2]: {
                                id: channelId2,
                                team_id: teamId,
                                total_msg_count: 12,
                            },
                        },
                        myMembers: {
                            [channelId1]: {
                                channel_id: channelId1,
                                mention_count: 2,
                                msg_count: 5,
                            },
                            [channelId2]: {
                                channel_id: channelId2,
                                mention_count: 4,
                                msg_count: 9,
                            },
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId]: {
                                id: teamId,
                                mention_count: 6,
                                msg_count: 8,
                            },
                        },
                    },
                },
            });

            await store.dispatch(Actions.markChannelAsRead(channelId2, channelId1));

            const state = store.getState();

            assert.equal(state.entities.channels.myMembers[channelId1].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId1].msg_count, state.entities.channels.channels[channelId1].total_msg_count);

            assert.equal(state.entities.channels.myMembers[channelId2].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId2].msg_count, state.entities.channels.channels[channelId2].total_msg_count);

            assert.equal(state.entities.teams.myMembers[teamId].mention_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId].msg_count, 0);
        });

        it('two unread channels, different teams, reading one', async () => {
            const channelId1 = TestHelper.generateId();
            const channelId2 = TestHelper.generateId();
            const teamId1 = TestHelper.generateId();
            const teamId2 = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId1]: {
                                id: channelId1,
                                team_id: teamId1,
                                total_msg_count: 10,
                            },
                            [channelId2]: {
                                id: channelId2,
                                team_id: teamId2,
                                total_msg_count: 12,
                            },
                        },
                        myMembers: {
                            [channelId1]: {
                                channel_id: channelId1,
                                mention_count: 2,
                                msg_count: 5,
                            },
                            [channelId2]: {
                                channel_id: channelId2,
                                mention_count: 4,
                                msg_count: 9,
                            },
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId1]: {
                                id: teamId1,
                                mention_count: 2,
                                msg_count: 5,
                            },
                            [teamId2]: {
                                id: teamId2,
                                mention_count: 4,
                                msg_count: 3,
                            },
                        },
                    },
                },
            });

            await store.dispatch(Actions.markChannelAsRead(channelId1));

            const state = store.getState();

            assert.equal(state.entities.channels.myMembers[channelId1].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId1].msg_count, state.entities.channels.channels[channelId1].total_msg_count);

            assert.equal(state.entities.channels.myMembers[channelId2].mention_count, 4);
            assert.equal(state.entities.channels.myMembers[channelId2].msg_count, 9);

            assert.equal(state.entities.teams.myMembers[teamId1].mention_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId1].msg_count, 0);

            assert.equal(state.entities.teams.myMembers[teamId2].mention_count, 4);
            assert.equal(state.entities.teams.myMembers[teamId2].msg_count, 3);
        });

        it('two unread channels, different teams, reading both', async () => {
            const channelId1 = TestHelper.generateId();
            const channelId2 = TestHelper.generateId();
            const teamId1 = TestHelper.generateId();
            const teamId2 = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId1]: {
                                id: channelId1,
                                team_id: teamId1,
                                total_msg_count: 10,
                            },
                            [channelId2]: {
                                id: channelId2,
                                team_id: teamId2,
                                total_msg_count: 12,
                            },
                        },
                        myMembers: {
                            [channelId1]: {
                                channel_id: channelId1,
                                mention_count: 2,
                                msg_count: 5,
                            },
                            [channelId2]: {
                                channel_id: channelId2,
                                mention_count: 4,
                                msg_count: 9,
                            },
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId1]: {
                                id: teamId1,
                                mention_count: 2,
                                msg_count: 5,
                            },
                            [teamId2]: {
                                id: teamId2,
                                mention_count: 4,
                                msg_count: 3,
                            },
                        },
                    },
                },
            });

            await store.dispatch(Actions.markChannelAsRead(channelId1, channelId2));

            const state = store.getState();

            assert.equal(state.entities.channels.myMembers[channelId1].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId1].msg_count, state.entities.channels.channels[channelId1].total_msg_count);

            assert.equal(state.entities.channels.myMembers[channelId2].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId2].msg_count, state.entities.channels.channels[channelId2].total_msg_count);

            assert.equal(state.entities.teams.myMembers[teamId1].mention_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId1].msg_count, 0);

            assert.equal(state.entities.teams.myMembers[teamId2].mention_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId2].msg_count, 0);
        });

        it('two unread channels, different teams, reading both (opposite order)', async () => {
            const channelId1 = TestHelper.generateId();
            const channelId2 = TestHelper.generateId();
            const teamId1 = TestHelper.generateId();
            const teamId2 = TestHelper.generateId();

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            [channelId1]: {
                                id: channelId1,
                                team_id: teamId1,
                                total_msg_count: 10,
                            },
                            [channelId2]: {
                                id: channelId2,
                                team_id: teamId2,
                                total_msg_count: 12,
                            },
                        },
                        myMembers: {
                            [channelId1]: {
                                channel_id: channelId1,
                                mention_count: 2,
                                msg_count: 5,
                            },
                            [channelId2]: {
                                channel_id: channelId2,
                                mention_count: 4,
                                msg_count: 9,
                            },
                        },
                    },
                    teams: {
                        myMembers: {
                            [teamId1]: {
                                id: teamId1,
                                mention_count: 2,
                                msg_count: 5,
                            },
                            [teamId2]: {
                                id: teamId2,
                                mention_count: 4,
                                msg_count: 3,
                            },
                        },
                    },
                },
            });

            await store.dispatch(Actions.markChannelAsRead(channelId1, channelId2));

            const state = store.getState();

            assert.equal(state.entities.channels.myMembers[channelId1].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId1].msg_count, state.entities.channels.channels[channelId1].total_msg_count);

            assert.equal(state.entities.channels.myMembers[channelId2].mention_count, 0);
            assert.equal(state.entities.channels.myMembers[channelId2].msg_count, state.entities.channels.channels[channelId2].total_msg_count);

            assert.equal(state.entities.teams.myMembers[teamId1].mention_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId1].msg_count, 0);

            assert.equal(state.entities.teams.myMembers[teamId2].mention_count, 0);
            assert.equal(state.entities.teams.myMembers[teamId2].msg_count, 0);
        });
    });

    it('getChannels', async () => {
        const userClient = TestHelper.createClient4();

        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post('/users/login').
            reply(200, user);

        await userClient.login(user.email, 'password1');

        nock(Client4.getBaseRoute()).
            post('/channels').
            reply(201, TestHelper.fakeChannelWithId(TestHelper.basicTeam.id));

        const userChannel = await userClient.createChannel(
            TestHelper.fakeChannel(TestHelper.basicTeam.id),
        );

        nock(Client4.getTeamsRoute()).
            get(`/${TestHelper.basicTeam.id}/channels`).
            query(true).
            reply(200, [TestHelper.basicChannel, userChannel]);

        await store.dispatch(Actions.getChannels(TestHelper.basicTeam.id, 0));

        const moreRequest = store.getState().requests.channels.getChannels;
        if (moreRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(moreRequest.error));
        }

        const {channels, channelsInTeam, myMembers} = store.getState().entities.channels;
        const channel = channels[userChannel.id];
        const team = channelsInTeam[userChannel.team_id];

        assert.ok(channel);
        assert.ok(team);
        assert.ok(team.has(userChannel.id));
        assert.ifError(myMembers[channel.id]);
    });

    it('getArchivedChannels', async () => {
        const userClient = TestHelper.createClient4();

        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post('/users/login').
            reply(200, user);

        await userClient.login(user.email, 'password1');

        nock(Client4.getBaseRoute()).
            post('/channels').
            reply(201, TestHelper.fakeChannelWithId(TestHelper.basicTeam.id));

        const userChannel = await userClient.createChannel(
            TestHelper.fakeChannel(TestHelper.basicTeam.id),
        );

        nock(Client4.getTeamsRoute()).
            get(`/${TestHelper.basicTeam.id}/channels/deleted`).
            query(true).
            reply(200, [TestHelper.basicChannel, userChannel]);

        await store.dispatch(Actions.getArchivedChannels(TestHelper.basicTeam.id, 0));

        const moreRequest = store.getState().requests.channels.getChannels;
        if (moreRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(moreRequest.error));
        }

        const {channels, channelsInTeam, myMembers} = store.getState().entities.channels;
        const channel = channels[userChannel.id];
        const team = channelsInTeam[userChannel.team_id];

        assert.ok(channel);
        assert.ok(team);
        assert.ok(team.has(userChannel.id));
        assert.ifError(myMembers[channel.id]);
    });

    it('getAllChannels', async () => {
        const userClient = TestHelper.createClient4();

        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post('/users/login').
            reply(200, user);

        await userClient.login(user.email, 'password1');

        nock(Client4.getBaseRoute()).
            post('/channels').
            reply(201, TestHelper.fakeChannelWithId(TestHelper.basicTeam.id));

        const userChannel = await userClient.createChannel(
            TestHelper.fakeChannel(TestHelper.basicTeam.id),
        );

        nock(Client4.getBaseRoute()).
            get('/channels').
            query(true).
            reply(200, [TestHelper.basicChannel, userChannel]);

        const {data} = await store.dispatch(Actions.getAllChannels(0));

        const moreRequest = store.getState().requests.channels.getAllChannels;
        if (moreRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(moreRequest.error));
        }

        assert.ok(data.length === 2);
    });

    it('getAllChannelsWithCount', async () => {
        const userClient = TestHelper.createClient4();

        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post('/users/login').
            reply(200, user);

        await userClient.login(user.email, 'password1');

        nock(Client4.getBaseRoute()).
            post('/channels').
            reply(201, TestHelper.fakeChannelWithId(TestHelper.basicTeam.id));

        const userChannel = await userClient.createChannel(
            TestHelper.fakeChannel(TestHelper.basicTeam.id),
        );

        const mockTotalCount = 84;
        const mockQuery = {
            page: 0,
            per_page: 50,
            not_associated_to_group: '',
            exclude_default_channels: false,
            include_total_count: true,
            include_deleted: false,
            exclude_policy_constrained: false,
        };
        nock(Client4.getBaseRoute()).
            get('/channels').
            query(mockQuery).
            reply(200, {channels: [TestHelper.basicChannel, userChannel], total_count: mockTotalCount});

        assert.ok(store.getState().entities.channels.totalCount === 0);

        const {data} = await store.dispatch(Actions.getAllChannelsWithCount(0));

        const moreRequest = store.getState().requests.channels.getAllChannels;
        if (moreRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(moreRequest.error));
        }

        assert.ok(data.channels.length === 2);
        assert.ok(data.total_count === mockTotalCount);

        assert.ok(store.getState().entities.channels.totalCount === mockTotalCount);

        mockQuery.include_deleted = true;
        nock(Client4.getBaseRoute()).
            get('/channels').
            query(mockQuery).
            reply(200, {channels: [TestHelper.basicChannel, userChannel], total_count: mockTotalCount});

        await store.dispatch(Actions.getAllChannelsWithCount(0, 50, '', false, true));

        const request = store.getState().requests.channels.getAllChannels;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(request.error));
        }
    });

    it('searchAllChannels', async () => {
        const userClient = TestHelper.createClient4();

        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post('/users/login').
            reply(200, user);

        await userClient.login(user.email, 'password1');

        nock(Client4.getBaseRoute()).
            post('/channels').
            reply(201, TestHelper.fakeChannelWithId(TestHelper.basicTeam.id));

        const userChannel = await userClient.createChannel(
            TestHelper.fakeChannel(TestHelper.basicTeam.id),
        );

        nock(Client4.getBaseRoute()).
            post('/channels/search?include_deleted=false').
            reply(200, [TestHelper.basicChannel, userChannel]);

        await store.dispatch(Actions.searchAllChannels('test', {}));

        const moreRequest = store.getState().requests.channels.getAllChannels;
        if (moreRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(moreRequest.error));
        }

        nock(Client4.getBaseRoute()).
            post('/channels/search?include_deleted=false').
            reply(200, {channels: [TestHelper.basicChannel, userChannel], total_count: 2});

        let response = await store.dispatch(Actions.searchAllChannels('test', {exclude_default_channels: false, page: 0, per_page: 100}));

        const paginatedRequest = store.getState().requests.channels.getAllChannels;
        if (paginatedRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(paginatedRequest.error));
        }

        assert.ok(response.data.channels.length === 2);

        nock(Client4.getBaseRoute()).
            post('/channels/search?include_deleted=true').
            reply(200, {channels: [TestHelper.basicChannel, userChannel], total_count: 2});

        response = await store.dispatch(Actions.searchAllChannels('test', {exclude_default_channels: false, page: 0, per_page: 100, include_deleted: true}));

        assert.ok(response.data.channels.length === 2);
    });

    it('searchArchivedChannels', async () => {
        const userClient = TestHelper.createClient4();

        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post('/users/login').
            reply(200, user);

        await userClient.login(user.email, 'password1');

        nock(Client4.getBaseRoute()).
            post('/channels').
            reply(201, TestHelper.fakeChannelWithId(TestHelper.basicTeam.id));

        const userChannel = await userClient.createChannel(
            TestHelper.fakeChannel(TestHelper.basicTeam.id),
        );

        nock(Client4.getTeamsRoute()).
            post(`/${TestHelper.basicTeam.id}/channels/search_archived`).
            reply(200, [TestHelper.basicChannel, userChannel]);

        const {data} = await store.dispatch(Actions.searchChannels(TestHelper.basicTeam.id, 'test', true));

        const moreRequest = store.getState().requests.channels.getChannels;
        if (moreRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(moreRequest.error));
        }

        assert.ok(data.length === 2);
    });

    it('getChannelMembers', async () => {
        nock(Client4.getBaseRoute()).
            get(`/channels/${TestHelper.basicChannel.id}/members`).
            query(true).
            reply(200, [TestHelper.basicChannelMember]);

        await store.dispatch(Actions.getChannelMembers(TestHelper.basicChannel.id));

        const {membersInChannel} = store.getState().entities.channels;

        assert.ok(membersInChannel);
        assert.ok(membersInChannel[TestHelper.basicChannel.id]);
        assert.ok(membersInChannel[TestHelper.basicChannel.id][TestHelper.basicUser.id]);
    });

    it('getChannelMember', async () => {
        nock(Client4.getBaseRoute()).
            get(`/channels/${TestHelper.basicChannel.id}/members/${TestHelper.basicUser.id}`).
            reply(200, TestHelper.basicChannelMember);

        await store.dispatch(Actions.getChannelMember(TestHelper.basicChannel.id, TestHelper.basicUser.id));

        const {membersInChannel} = store.getState().entities.channels;

        assert.ok(membersInChannel);
        assert.ok(membersInChannel[TestHelper.basicChannel.id]);
        assert.ok(membersInChannel[TestHelper.basicChannel.id][TestHelper.basicUser.id]);
    });

    it('getMyChannelMember', async () => {
        nock(Client4.getBaseRoute()).
            get(`/channels/${TestHelper.basicChannel.id}/members/me`).
            reply(200, TestHelper.basicChannelMember);

        await store.dispatch(Actions.getMyChannelMember(TestHelper.basicChannel.id));

        const {myMembers} = store.getState().entities.channels;

        assert.ok(myMembers);
        assert.ok(myMembers[TestHelper.basicChannel.id]);
    });

    it('getChannelMembersByIds', async () => {
        nock(Client4.getBaseRoute()).
            post(`/channels/${TestHelper.basicChannel.id}/members/ids`).
            reply(200, [TestHelper.basicChannelMember]);

        await store.dispatch(Actions.getChannelMembersByIds(TestHelper.basicChannel.id, [TestHelper.basicUser.id]));

        const {membersInChannel} = store.getState().entities.channels;

        assert.ok(membersInChannel);
        assert.ok(membersInChannel[TestHelper.basicChannel.id]);
        assert.ok(membersInChannel[TestHelper.basicChannel.id][TestHelper.basicUser.id]);
    });

    it('getChannelStats', async () => {
        nock(Client4.getBaseRoute()).
            get(`/channels/${TestHelper.basicChannel.id}/stats`).
            reply(200, {channel_id: TestHelper.basicChannel.id, member_count: 1});

        await store.dispatch(Actions.getChannelStats(TestHelper.basicChannel.id));

        const {stats} = store.getState().entities.channels;
        const stat = stats[TestHelper.basicChannel.id];
        assert.ok(stat);
        assert.ok(stat.member_count >= 1);
    });

    it('addChannelMember', async () => {
        const channelId = TestHelper.basicChannel.id;

        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post(`/channels/${TestHelper.basicChannel.id}/members`).
            reply(201, {channel_id: TestHelper.basicChannel.id, roles: 'channel_user', user_id: TestHelper.basicUser.id});

        await store.dispatch(Actions.joinChannel(TestHelper.basicUser.id, TestHelper.basicTeam.id, channelId));

        nock(Client4.getBaseRoute()).
            get(`/channels/${TestHelper.basicChannel.id}/stats`).
            reply(200, {channel_id: TestHelper.basicChannel.id, member_count: 1});

        await store.dispatch(Actions.getChannelStats(channelId));

        let state = store.getState();
        let {stats} = state.entities.channels;
        assert.ok(stats, 'stats');
        assert.ok(stats[channelId], 'stats for channel');
        assert.ok(stats[channelId].member_count, 'member count for channel');
        assert.ok(stats[channelId].member_count >= 1, 'incorrect member count for channel');

        nock(Client4.getBaseRoute()).
            post(`/channels/${TestHelper.basicChannel.id}/members`).
            reply(201, {channel_id: TestHelper.basicChannel.id, roles: 'channel_user', user_id: user.id});

        await store.dispatch(Actions.addChannelMember(channelId, user.id));

        state = store.getState();

        const {profilesInChannel, profilesNotInChannel} = state.entities.users;
        const channel = profilesInChannel[channelId];
        const notChannel = profilesNotInChannel[channelId];
        assert.ok(channel);
        assert.ok(notChannel);
        assert.ok(channel.has(user.id));
        assert.equal(notChannel.has(user.id), false, 'user should not present in profilesNotInChannel');

        stats = state.entities.channels.stats;
        assert.ok(stats, 'stats');
        assert.ok(stats[channelId], 'stats for channel');
        assert.ok(stats[channelId].member_count, 'member count for channel');
        assert.ok(stats[channelId].member_count >= 2, 'incorrect member count for channel');
    });

    it('removeChannelMember', async () => {
        const channelId = TestHelper.basicChannel.id;

        nock(Client4.getBaseRoute()).
            post('/users').
            query(true).
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(
            TestHelper.fakeUser(),
            null,
            null,
            TestHelper.basicTeam.invite_id,
        );

        nock(Client4.getBaseRoute()).
            post(`/channels/${TestHelper.basicChannel.id}/members`).
            reply(201, {channel_id: TestHelper.basicChannel.id, roles: 'channel_user', user_id: TestHelper.basicUser.id});

        await store.dispatch(Actions.joinChannel(TestHelper.basicUser.id, TestHelper.basicTeam.id, channelId));

        nock(Client4.getBaseRoute()).
            get(`/channels/${TestHelper.basicChannel.id}/stats`).
            reply(200, {channel_id: TestHelper.basicChannel.id, member_count: 1});

        await store.dispatch(Actions.getChannelStats(channelId));

        nock(Client4.getBaseRoute()).
            post(`/channels/${TestHelper.basicChannel.id}/members`).
            reply(201, {channel_id: TestHelper.basicChannel.id, roles: 'channel_user', user_id: user.id});

        await store.dispatch(Actions.addChannelMember(channelId, user.id));

        let state = store.getState();
        let {stats} = state.entities.channels;
        assert.ok(stats, 'stats');
        assert.ok(stats[channelId], 'stats for channel');
        assert.ok(stats[channelId].member_count, 'member count for channel');
        assert.ok(stats[channelId].member_count >= 2, 'incorrect member count for channel');

        nock(Client4.getBaseRoute()).
            delete(`/channels/${TestHelper.basicChannel.id}/members/${user.id}`).
            reply(200, OK_RESPONSE);

        await store.dispatch(Actions.removeChannelMember(channelId, user.id));

        state = store.getState();

        const {profilesInChannel, profilesNotInChannel} = state.entities.users;
        const channel = profilesInChannel[channelId];
        const notChannel = profilesNotInChannel[channelId];
        assert.ok(channel);
        assert.ok(notChannel);
        assert.ok(notChannel.has(user.id));
        assert.equal(channel.has(user.id), false, 'user should not present in profilesInChannel');

        stats = state.entities.channels.stats;
        assert.ok(stats, 'stats');
        assert.ok(stats[channelId], 'stats for channel');
        assert.ok(stats[channelId].member_count, 'member count for channel');
        assert.ok(stats[channelId].member_count >= 1, 'incorrect member count for channel');
    });

    it('updateChannelMemberRoles', async () => {
        nock(Client4.getBaseRoute()).
            post('/users').
            reply(201, TestHelper.fakeUserWithId());

        const user = await TestHelper.basicClient4.createUser(TestHelper.fakeUser());

        nock(Client4.getTeamsRoute()).
            post(`/${TestHelper.basicChannel.id}/members`).
            reply(201, {team_id: TestHelper.basicTeam.id, roles: 'channel_user', user_id: user.id});

        await store.dispatch(addUserToTeam(TestHelper.basicTeam.id, user.id));
        nock(Client4.getBaseRoute()).
            post(`/channels/${TestHelper.basicChannel.id}/members`).
            reply(201, {channel_id: TestHelper.basicChannel.id, roles: 'channel_user', user_id: user.id});

        await store.dispatch(Actions.addChannelMember(TestHelper.basicChannel.id, user.id));

        const roles = General.CHANNEL_USER_ROLE + ' ' + General.CHANNEL_ADMIN_ROLE;

        nock(Client4.getBaseRoute()).
            put(`/channels/${TestHelper.basicChannel.id}/members/${user.id}/roles`).
            reply(200, {roles});
        await store.dispatch(Actions.updateChannelMemberRoles(TestHelper.basicChannel.id, user.id, roles));

        const members = store.getState().entities.channels.membersInChannel;

        assert.ok(members[TestHelper.basicChannel.id]);
        assert.ok(members[TestHelper.basicChannel.id][user.id]);
        assert.ok(members[TestHelper.basicChannel.id][user.id].roles === roles);
    });

    it('updateChannelHeader', async () => {
        nock(Client4.getBaseRoute()).
            get(`/channels/${TestHelper.basicChannel.id}`).
            reply(200, TestHelper.basicChannel);

        await store.dispatch(Actions.getChannel(TestHelper.basicChannel.id));

        const header = 'this is an updated test header';

        await store.dispatch(Actions.updateChannelHeader(TestHelper.basicChannel.id, header));

        const {channels} = store.getState().entities.channels;
        const channel = channels[TestHelper.basicChannel.id];
        assert.ok(channel);
        assert.deepEqual(channel.header, header);
    });

    it('updateChannelPurpose', async () => {
        nock(Client4.getBaseRoute()).
            get(`/channels/${TestHelper.basicChannel.id}`).
            reply(200, TestHelper.basicChannel);

        await store.dispatch(Actions.getChannel(TestHelper.basicChannel.id));

        const purpose = 'this is an updated test purpose';
        await store.dispatch(Actions.updateChannelPurpose(TestHelper.basicChannel.id, purpose));
        const {channels} = store.getState().entities.channels;
        const channel = channels[TestHelper.basicChannel.id];
        assert.ok(channel);
        assert.deepEqual(channel.purpose, purpose);
    });

    describe('leaveChannel', () => {
        const team = TestHelper.fakeTeam();
        const user = TestHelper.fakeUserWithId();

        test('should delete the channel member when leaving a public channel', async () => {
            const channel = {id: 'channel', team_id: team.id, type: General.OPEN_CHANNEL};

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            channel,
                        },
                        myMembers: {
                            [channel.id]: {channel_id: channel.id, user_id: user.id},
                        },
                    },
                    users: {
                        currentUserId: user.id,
                    },
                },
            });

            nock(Client4.getBaseRoute()).
                delete(`/channels/${channel.id}/members/${user.id}`).
                reply(200, OK_RESPONSE);

            await store.dispatch(Actions.leaveChannel(channel.id));

            const state = store.getState();

            expect(state.entities.channels.channels[channel.id]).toBeDefined();
            expect(state.entities.channels.myMembers[channel.id]).not.toBeDefined();
        });

        test('should delete the channel member and channel when leaving a private channel', async () => {
            const channel = {id: 'channel', team_id: team.id, type: General.PRIVATE_CHANNEL};

            store = configureStore({
                entities: {
                    channels: {
                        channels: {
                            channel,
                        },
                        myMembers: {
                            [channel.id]: {channel_id: channel.id, user_id: user.id},
                        },
                    },
                    users: {
                        currentUserId: user.id,
                    },
                },
            });

            nock(Client4.getBaseRoute()).
                delete(`/channels/${channel.id}/members/${user.id}`).
                reply(200, OK_RESPONSE);

            await store.dispatch(Actions.leaveChannel(channel.id));

            const state = store.getState();

            expect(state.entities.channels.channels[channel.id]).not.toBeDefined();
            expect(state.entities.channels.myMembers[channel.id]).not.toBeDefined();
        });

        test('should remove a channel from the sidebar when leaving it', async () => {
            const channel = {id: 'channel', team_id: team.id, type: General.OPEN_CHANNEL};
            const category = {id: 'category', team_id: team.id, type: CategoryTypes.CUSTOM, channel_ids: [channel.id]};

            store = configureStore({
                entities: {
                    channelCategories: {
                        byId: {
                            category,
                        },
                        orderByTeam: {
                            [team.id]: [category.id],
                        },
                    },
                    channels: {
                        channels: {
                            channel,
                        },
                        myMembers: {
                            [channel.id]: {channel_id: channel.id, user_id: user.id},
                        },
                    },
                    users: {
                        currentUserId: user.id,
                    },
                },
            });

            nock(Client4.getBaseRoute()).
                delete(`/channels/${channel.id}/members/${user.id}`).
                reply(200, OK_RESPONSE);

            await store.dispatch(Actions.leaveChannel(channel.id));

            const state = store.getState();

            expect(state.entities.channels.channels[channel.id]).toBeDefined();
            expect(state.entities.channels.myMembers[channel.id]).not.toBeDefined();
            expect(state.entities.channelCategories.byId[category.id].channel_ids).toEqual([]);
        });

        test('should restore a channel when failing to leave it (non-custom category)', async () => {
            const channel = {id: 'channel', team_id: team.id, type: General.OPEN_CHANNEL};
            const category = {id: 'category', team_id: team.id, type: CategoryTypes.CHANNELS, channel_ids: [channel.id]};

            store = await configureStore({
                entities: {
                    channelCategories: {
                        byId: {
                            category,
                        },
                        orderByTeam: {
                            [team.id]: [category.id],
                        },
                    },
                    channels: {
                        channels: {
                            channel,
                        },
                        myMembers: {
                            [channel.id]: {channel_id: channel.id, user_id: user.id},
                        },
                    },
                    users: {
                        currentUserId: user.id,
                    },
                },
            });

            nock(Client4.getBaseRoute()).
                delete(`/channels/${channel.id}/members/${user.id}`).
                reply(500, {});

            await store.dispatch(Actions.leaveChannel(channel.id));

            // Allow async Client4 API calls to the dispatched action to run first.
            await new Promise((resolve) => setTimeout(resolve, 500));

            const state = store.getState();

            expect(state.entities.channels.channels[channel.id]).toBeDefined();
            expect(state.entities.channels.myMembers[channel.id]).toBeDefined();
            expect(state.entities.channelCategories.byId[category.id].channel_ids).toEqual([channel.id]);
        });
    });

    test('joinChannel', async () => {
        const channel = TestHelper.basicChannel;
        const team = TestHelper.basicTeam;
        const user = TestHelper.basicUser;

        const channelsCategory = {id: 'channelsCategory', team_id: team.id, type: CategoryTypes.CHANNELS, channel_ids: []};

        store = configureStore({
            entities: {
                channelCategories: {
                    byId: {
                        channelsCategory,
                    },
                    orderByTeam: {
                        [team.id]: ['channelsCategory'],
                    },
                },
                users: {
                    currentUserId: user.id,
                },
            },
        });

        nock(Client4.getBaseRoute()).
            get(`/channels/${channel.id}`).
            reply(200, channel);

        nock(Client4.getBaseRoute()).
            post(`/channels/${channel.id}/members`).
            reply(201, {channel_id: channel.id, roles: 'channel_user', user_id: user.id});

        nock(Client4.getBaseRoute()).
            put(`/users/${user.id}/teams/${team.id}/channels/categories`).
            reply(200, [{...channelsCategory, channel_ids: []}]);

        await store.dispatch(Actions.joinChannel(user.id, team.id, channel.id));

        // Allow async Client4 API calls to the dispatched action to run first.
        await new Promise((resolve) => setTimeout(resolve, 500));

        const state = store.getState();

        expect(state.entities.channels.channels[channel.id]).toBeDefined();
        expect(state.entities.channels.myMembers[channel.id]).toBeDefined();
        expect(state.entities.channelCategories.byId[channelsCategory.id].channel_ids).toEqual([channel.id]);
    });

    test('joinChannelByName', async () => {
        const channel = TestHelper.basicChannel;
        const team = TestHelper.basicTeam;
        const user = TestHelper.basicUser;

        const channelsCategory = {id: 'channelsCategory', team_id: team.id, type: CategoryTypes.CHANNELS, channel_ids: []};

        store = configureStore({
            entities: {
                channelCategories: {
                    byId: {
                        channelsCategory,
                    },
                    orderByTeam: {
                        [team.id]: ['channelsCategory'],
                    },
                },
                users: {
                    currentUserId: user.id,
                },
            },
        });

        nock(Client4.getTeamsRoute()).
            get(`/${TestHelper.basicTeam.id}/channels/name/${channel.name}?include_deleted=true`).
            reply(200, channel);

        nock(Client4.getBaseRoute()).
            post(`/channels/${channel.id}/members`).
            reply(201, {channel_id: channel.id, roles: 'channel_user', user_id: TestHelper.basicUser.id});

        nock(Client4.getBaseRoute()).
            put(`/users/${user.id}/teams/${team.id}/channels/categories`).
            reply(200, [{...channelsCategory, channel_ids: []}]);

        await store.dispatch(Actions.joinChannel(user.id, team.id, '', channel.name));

        const state = store.getState();

        expect(state.entities.channels.channels[channel.id]).toBeDefined();
        expect(state.entities.channels.myMembers[channel.id]).toBeDefined();
        expect(state.entities.channelCategories.byId[channelsCategory.id].channel_ids).toEqual([channel.id]);
    });

    test('favoriteChannel with new sidebar', async () => {
        const channel = TestHelper.basicChannel;
        const team = TestHelper.basicTeam;
        const currentUserId = TestHelper.generateId();

        const favoritesCategory = {id: 'favoritesCategory', team_id: team.id, type: CategoryTypes.FAVORITES, channel_ids: []};
        const channelsCategory = {id: 'channelsCategory', team_id: team.id, type: CategoryTypes.CHANNELS, channel_ids: [channel.id]};

        store = configureStore({
            entities: {
                channels: {
                    channels: {
                        [channel.id]: channel,
                    },
                },
                channelCategories: {
                    byId: {
                        favoritesCategory,
                        channelsCategory,
                    },
                    orderByTeam: {
                        [team.id]: ['favoritesCategory', 'channelsCategory'],
                    },
                },
                users: {
                    currentUserId,
                },
            },
        });

        nock(Client4.getBaseRoute()).
            put(`/users/${currentUserId}/teams/${team.id}/channels/categories`).
            reply(200, [
                {...favoritesCategory, channel_ids: [channel.id]},
                {...channelsCategory, channel_ids: []},
            ]);

        await store.dispatch(Actions.favoriteChannel(channel.id));

        // Allow async Client4 API calls to the dispatched action to run first.
        await new Promise((resolve) => setTimeout(resolve, 500));

        const state = store.getState();

        // Should favorite the channel in preferences
        const prefKey = getPreferenceKey(Preferences.CATEGORY_FAVORITE_CHANNEL, channel.id);
        expect(state.entities.preferences.myPreferences[prefKey]).toMatchObject({value: 'true'});

        // And in channel categories
        expect(state.entities.channelCategories.byId.favoritesCategory.channel_ids).toEqual([channel.id]);
        expect(state.entities.channelCategories.byId.channelsCategory.channel_ids).toEqual([]);
    });

    test('favoriteChannel with old sidebar enabled', async () => {
        const channel = TestHelper.basicChannel;
        const currentUserId = TestHelper.generateId();

        store = configureStore({
            entities: {
                channels: {
                    channels: {
                        [channel.id]: channel,
                    },
                },
                general: {
                    config: {
                        EnableLegacySidebar: 'true',
                    },
                },
                users: {
                    currentUserId,
                },
            },
        });

        nock(Client4.getBaseRoute()).
            put(`/users/${currentUserId}/preferences`).
            reply(200, OK_RESPONSE);

        await store.dispatch(Actions.favoriteChannel(channel.id));

        const state = store.getState();

        // Should favorite the channel in preferences
        const prefKey = getPreferenceKey(Preferences.CATEGORY_FAVORITE_CHANNEL, channel.id);
        expect(state.entities.preferences.myPreferences[prefKey]).toMatchObject({value: 'true'});
    });

    it('unfavoriteChannel with new sidebar enabled', async () => {
        const channel = TestHelper.basicChannel;
        const team = TestHelper.basicTeam;
        const currentUserId = TestHelper.generateId();

        const prefKey = getPreferenceKey(Preferences.CATEGORY_FAVORITE_CHANNEL, channel.id);

        const favoritesCategory = {id: 'favoritesCategory', team_id: team.id, type: CategoryTypes.FAVORITES, channel_ids: [channel.id]};
        const channelsCategory = {id: 'channelsCategory', team_id: team.id, type: CategoryTypes.CHANNELS, channel_ids: []};

        store = configureStore({
            entities: {
                channels: {
                    channels: {
                        [channel.id]: channel,
                    },
                },
                channelCategories: {
                    byId: {
                        favoritesCategory,
                        channelsCategory,
                    },
                    orderByTeam: {
                        [team.id]: ['favoritesCategory', 'channelsCategory'],
                    },
                },
                preferences: {
                    myPreferences: {
                        [prefKey]: {value: 'true'},
                    },
                },
                users: {
                    currentUserId,
                },
            },
        });

        nock(Client4.getBaseRoute()).
            put(`/users/${currentUserId}/teams/${team.id}/channels/categories`).
            reply(200, [
                {...favoritesCategory, channel_ids: []},
                {...channelsCategory, channel_ids: [channel.id]},
            ]);

        await store.dispatch(Actions.unfavoriteChannel(channel.id));

        const state = store.getState();

        // Should unfavorite the channel in preferences
        expect(state.entities.preferences.myPreferences[prefKey]).toBeUndefined();

        // And in channel categories
        expect(state.entities.channelCategories.byId.favoritesCategory.channel_ids).toEqual([]);
        expect(state.entities.channelCategories.byId.channelsCategory.channel_ids).toEqual([channel.id]);
    });

    test('unfavoriteChannel with old sidebar', async () => {
        const channel = TestHelper.basicChannel;
        const currentUserId = TestHelper.generateId();

        const prefKey = getPreferenceKey(Preferences.CATEGORY_FAVORITE_CHANNEL, channel.id);

        store = configureStore({
            entities: {
                channels: {
                    channels: {
                        [channel.id]: channel,
                    },
                },
                general: {
                    config: {
                        EnableLegacySidebar: 'true',
                    },
                },
                preferences: {
                    myPreferences: {
                        [prefKey]: {value: 'true'},
                    },
                },
                users: {
                    currentUserId,
                },
            },
        });

        nock(Client4.getBaseRoute()).
            put(`/users/${TestHelper.basicUser.id}/preferences`).
            reply(200, OK_RESPONSE);

        await store.dispatch(Actions.unfavoriteChannel(channel.id));

        const state = store.getState();

        // Should unfavorite the channel in preferences
        expect(state.entities.preferences.myPreferences[prefKey]).toBeUndefined();
    });

    it('autocompleteChannels', async () => {
        const prefix = TestHelper.basicChannel.name.slice(0, 5);

        nock(Client4.getTeamRoute(TestHelper.basicChannel.team_id)).
            get('/channels/autocomplete').
            query({name: prefix}).
            reply(200, [TestHelper.basicChannel]);

        const result = await store.dispatch(Actions.autocompleteChannels(
            TestHelper.basicChannel.team_id,
            prefix,
        ));

        assert.deepEqual(result, {data: [TestHelper.basicChannel]});
    });

    it('autocompleteChannelsForSearch', async () => {
        const prefix = TestHelper.basicChannel.name.slice(0, 5);

        nock(Client4.getTeamRoute(TestHelper.basicChannel.team_id)).
            get('/channels/search_autocomplete').
            query({name: prefix}).
            reply(200, [TestHelper.basicChannel]);

        const result = await store.dispatch(Actions.autocompleteChannelsForSearch(
            TestHelper.basicChannel.team_id,
            prefix,
        ));

        assert.deepEqual(result, {data: [TestHelper.basicChannel]});
    });

    it('updateChannelScheme', async () => {
        TestHelper.mockLogin();
        await store.dispatch(login(TestHelper.basicChannelMember.email, 'password1'));

        nock(Client4.getBaseRoute()).
            post('/channels').
            reply(201, TestHelper.fakeChannelWithId(TestHelper.basicTeam.id));

        await store.dispatch(Actions.createChannel(TestHelper.fakeChannel(TestHelper.basicTeam.id), TestHelper.basicUser.id));

        const createRequest = store.getState().requests.channels.createChannel;

        if (createRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(createRequest.error));
        }

        const {channels} = store.getState().entities.channels;
        const schemeId = 'xxxxxxxxxxxxxxxxxxxxxxxxxx';
        const {id} = channels[Object.keys(channels)[0]];

        nock(Client4.getBaseRoute()).
            put('/channels/' + id + '/scheme').
            reply(200, OK_RESPONSE);

        await store.dispatch(Actions.updateChannelScheme(id, schemeId));
        const updated = store.getState().entities.channels.channels[id];
        assert.ok(updated);
        assert.equal(updated.scheme_id, schemeId);
    });

    it('updateChannelMemberSchemeRoles', async () => {
        TestHelper.mockLogin();
        await store.dispatch(login(TestHelper.basicChannelMember.email, 'password1'));

        nock(Client4.getBaseRoute()).
            post('/channels').
            reply(201, TestHelper.fakeChannelWithId(TestHelper.basicTeam.id));

        const userId = TestHelper.basicChannelMember.id;

        await store.dispatch(Actions.createChannel(TestHelper.fakeChannel(TestHelper.basicTeam.id), userId));

        const {channels} = store.getState().entities.channels;
        const channelId = channels[Object.keys(channels)[0]].id;

        nock(Client4.getBaseRoute()).
            put(`/channels/${channelId}/members/${userId}/schemeRoles`).
            reply(200, OK_RESPONSE);

        await store.dispatch(Actions.updateChannelMemberSchemeRoles(channelId, userId, true, true));
        const update1 = store.getState().entities.channels.membersInChannel[channelId][userId];
        assert.ok(update1);
        assert.equal(update1.scheme_admin, true);
        assert.equal(update1.scheme_user, true);

        nock(Client4.getBaseRoute()).
            put(`/channels/${channelId}/members/${userId}/schemeRoles`).
            reply(200, OK_RESPONSE);

        await store.dispatch(Actions.updateChannelMemberSchemeRoles(channelId, userId, false, false));

        const update2 = store.getState().entities.channels.membersInChannel[channelId][userId];
        assert.ok(update2);
        assert.equal(update2.scheme_admin, false);
        assert.equal(update2.scheme_user, false);
    });

    it('markGroupChannelOpen', async () => {
        const channelId = TestHelper.generateId();
        const now = new Date().getTime();
        const currentUserId = TestHelper.generateId();

        store = await configureStore({
            entities: {
                users: {
                    currentUserId,
                },
            },
        });

        nock(Client4.getBaseRoute()).
            put(`/users/${currentUserId}/preferences`).
            reply(200, OK_RESPONSE);

        await Actions.markGroupChannelOpen(channelId)(store.dispatch, store.getState);

        const state = store.getState();
        let prefKey = getPreferenceKey(Preferences.CATEGORY_GROUP_CHANNEL_SHOW, channelId);
        let preference = state.entities.preferences.myPreferences[prefKey];
        assert.ok(preference);
        assert.ok(preference.value === 'true');

        prefKey = getPreferenceKey(Preferences.CATEGORY_CHANNEL_OPEN_TIME, channelId);
        preference = state.entities.preferences.myPreferences[prefKey];
        assert.ok(preference);
        assert.ok(parseInt(preference.value, 10) >= now);
    });

    it('getChannelTimezones', async () => {
        const {dispatch, getState} = store;
        const channelId = TestHelper.basicChannel.id;
        const response = {
            useAutomaticTimezone: 'true',
            manualTimezone: '',
            automaticTimezone: 'xoxoxo/blablabla',
        };

        nock(Client4.getBaseRoute()).
            get(`/channels/${TestHelper.basicChannel.id}/timezones`).
            query(true).
            reply(200, response);

        const {data} = await Actions.getChannelTimezones(channelId)(dispatch, getState);

        assert.deepEqual(response, data);
    });

    it('membersMinusGroupMembers', async () => {
        const channelID = 'cid10000000000000000000000';
        const groupIDs = ['gid10000000000000000000000', 'gid20000000000000000000000'];
        const page = 7;
        const perPage = 63;

        nock(Client4.getBaseRoute()).get(
            `/channels/${channelID}/members_minus_group_members?group_ids=${groupIDs.join(',')}&page=${page}&per_page=${perPage}`).
            reply(200, {users: [], total_count: 0});

        const {error} = await Actions.membersMinusGroupMembers(channelID, groupIDs, page, perPage)(store.dispatch, store.getState);

        assert.equal(error, null);
    });

    it('getChannelModerations', async () => {
        const channelID = 'cid10000000000000000000000';

        nock(Client4.getBaseRoute()).get(
            `/channels/${channelID}/moderations`).
            reply(200, [{
                name: Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_POST,
                roles: {
                    members: true,
                    guests: false,
                },
            }]);

        const {error} = await store.dispatch(Actions.getChannelModerations(channelID));
        const moderations = store.getState().entities.channels.channelModerations[channelID];

        assert.equal(error, null);
        assert.equal(moderations[0].name, Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_POST);
        assert.equal(moderations[0].roles.members, true);
        assert.equal(moderations[0].roles.guests, false);
    });

    it('patchChannelModerations', async () => {
        const channelID = 'cid10000000000000000000000';

        nock(Client4.getBaseRoute()).put(
            `/channels/${channelID}/moderations/patch`).
            reply(200, [{
                name: Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_REACTIONS,
                roles: {
                    members: true,
                    guests: false,
                },
            }]);

        const {error} = await store.dispatch(Actions.patchChannelModerations(channelID, {}));
        const moderations = store.getState().entities.channels.channelModerations[channelID];

        assert.equal(error, null);
        assert.equal(moderations[0].name, Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_REACTIONS);
        assert.equal(moderations[0].roles.members, true);
        assert.equal(moderations[0].roles.guests, false);
    });

    it('getChannelMemberCountsByGroup', async () => {
        const channelID = 'cid10000000000000000000000';

        nock(Client4.getBaseRoute()).get(
            `/channels/${channelID}/member_counts_by_group?include_timezones=true`).
            reply(200, [
                {
                    group_id: 'group-1',
                    channel_member_count: 1,
                    channel_member_timezones_count: 1,
                },
                {
                    group_id: 'group-2',
                    channel_member_count: 999,
                    channel_member_timezones_count: 131,
                },
            ]);

        await store.dispatch(Actions.getChannelMemberCountsByGroup(channelID, true));

        const channelMemberCounts = store.getState().entities.channels.channelMemberCountsByGroup[channelID];
        assert.equal(channelMemberCounts['group-1'].group_id, 'group-1');
        assert.equal(channelMemberCounts['group-1'].channel_member_count, 1);
        assert.equal(channelMemberCounts['group-1'].channel_member_timezones_count, 1);

        assert.equal(channelMemberCounts['group-2'].group_id, 'group-2');
        assert.equal(channelMemberCounts['group-2'].channel_member_count, 999);
        assert.equal(channelMemberCounts['group-2'].channel_member_timezones_count, 131);
    });
});
