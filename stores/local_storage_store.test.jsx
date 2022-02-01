// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import LocalStorageStore, {getPenultimateChannelNameKey} from 'stores/local_storage_store';

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

    describe('should persist separately for different subpaths', () => {
        test('getWasLoggedIn', () => {
            delete window.basename;

            // Initially false
            assert.equal(LocalStorageStore.getWasLoggedIn(), false);

            // True after set
            LocalStorageStore.setWasLoggedIn(true);
            assert.equal(LocalStorageStore.getWasLoggedIn(), true);

            // Still true when basename explicitly set
            window.basename = '/';
            assert.equal(LocalStorageStore.getWasLoggedIn(), true);

            // Different with different basename
            window.basename = '/subpath';
            assert.equal(LocalStorageStore.getWasLoggedIn(), false);
            LocalStorageStore.setWasLoggedIn(true);
            assert.equal(LocalStorageStore.getWasLoggedIn(), true);

            // Back to old value with original basename
            window.basename = '/';
            assert.equal(LocalStorageStore.getWasLoggedIn(), true);
            LocalStorageStore.setWasLoggedIn(false);
            assert.equal(LocalStorageStore.getWasLoggedIn(), false);

            // Value with different basename remains unchanged.
            window.basename = '/subpath';
            assert.equal(LocalStorageStore.getWasLoggedIn(), true);
        });
    });

    describe('testing previous channel', () => {
        test('should remove previous channel without subpath', () => {
            const userId1 = 'userId1';
            const teamId1 = 'teamId1';
            const channel1 = 'channel1';
            const channel2 = 'channel2';

            LocalStorageStore.setPreviousChannelName(userId1, teamId1, channel1);
            assert.equal(LocalStorageStore.getPreviousChannelName(userId1, teamId1), channel1);

            LocalStorageStore.setPenultimateChannelName(userId1, teamId1, channel2);
            assert.equal(LocalStorageStore.getPenultimateChannelName(userId1, teamId1), channel2);

            LocalStorageStore.removePreviousChannelName(userId1, teamId1);
            assert.equal(LocalStorageStore.getPreviousChannelName(userId1, teamId1), channel2);
        });

        test('should remove previous channel using subpath', () => {
            const userId1 = 'userId1';
            const teamId1 = 'teamId1';
            const channel1 = 'channel1';
            const channel2 = 'channel2';

            window.basename = '/subpath';
            LocalStorageStore.setPreviousChannelName(userId1, teamId1, channel1);
            assert.equal(LocalStorageStore.getPreviousChannelName(userId1, teamId1), channel1);

            LocalStorageStore.setPenultimateChannelName(userId1, teamId1, channel2);
            assert.equal(LocalStorageStore.getPenultimateChannelName(userId1, teamId1), channel2);

            LocalStorageStore.removePreviousChannelName(userId1, teamId1);
            assert.equal(LocalStorageStore.getPreviousChannelName(userId1, teamId1), channel2);
        });
    });

    describe('test removing penultimate channel', () => {
        test('should remove previous channel without subpath', () => {
            const userId1 = 'userId1';
            const teamId1 = 'teamId1';
            const channel1 = 'channel1';
            const channel2 = 'channel2';

            LocalStorageStore.setPreviousChannelName(userId1, teamId1, channel1);
            assert.equal(LocalStorageStore.getPreviousChannelName(userId1, teamId1), channel1);

            LocalStorageStore.setPenultimateChannelName(userId1, teamId1, channel2);
            assert.equal(LocalStorageStore.getPenultimateChannelName(userId1, teamId1), channel2);

            LocalStorageStore.removePenultimateChannelName(userId1, teamId1);
            assert.equal(LocalStorageStore.getPreviousChannelName(userId1, teamId1), channel1);
            assert.equal(LocalStorageStore.getItem(getPenultimateChannelNameKey(userId1, teamId1)), undefined);
        });
    });
});
