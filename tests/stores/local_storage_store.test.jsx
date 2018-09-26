// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import LocalStorageStore from 'stores/local_storage_store';

describe('stores/LocalStorageStore', () => {
    test('should persist previous team id per user', () => {
        const userId1 = 'userId1';
        const userId2 = 'userId2';
        const teamId1 = 'teamId1';
        const teamId2 = 'teamId2';
        LocalStorageStore.setPreviousTeamId(userId1, teamId1);
        LocalStorageStore.setPreviousTeamId(userId2, teamId2);
        assert.equal(LocalStorageStore.getPreviousTeamId(userId1), teamId1);
        assert.equal(LocalStorageStore.getPreviousTeamId(userId2), teamId2);
    });

    test('should persist previous channel name per team and user', () => {
        const userId1 = 'userId1';
        const userId2 = 'userId2';
        const teamId1 = 'teamId1';
        const teamId2 = 'teamId2';
        const channel1 = 'channel1';
        const channel2 = 'channel2';
        const channel3 = 'channel3';
        LocalStorageStore.setPreviousChannelName(userId1, teamId1, channel1);
        LocalStorageStore.setPreviousChannelName(userId2, teamId1, channel2);
        LocalStorageStore.setPreviousChannelName(userId2, teamId2, channel3);
        assert.equal(LocalStorageStore.getPreviousChannelName(userId1, teamId1), channel1);
        assert.equal(LocalStorageStore.getPreviousChannelName(userId2, teamId1), channel2);
        assert.equal(LocalStorageStore.getPreviousChannelName(userId2, teamId2), channel3);
    });
});
