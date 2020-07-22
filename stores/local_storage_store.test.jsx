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

    test('should persist recent emojis per user', () => {
        const userId1 = 'userId1';
        const userId2 = 'userId2';
        const recentEmojis1 = ['smile', 'joy', 'grin'];
        const recentEmojis2 = ['customEmoji', '+1', 'mattermost'];

        assert.equal(LocalStorageStore.getRecentEmojis(userId1), null);
        assert.equal(LocalStorageStore.getRecentEmojis(userId2), null);

        LocalStorageStore.setRecentEmojis(userId1, []);
        LocalStorageStore.setRecentEmojis(userId2, []);

        assert.equal(LocalStorageStore.getRecentEmojis(userId1), null);
        assert.equal(LocalStorageStore.getRecentEmojis(userId2), null);

        LocalStorageStore.setRecentEmojis(userId1, recentEmojis1);
        LocalStorageStore.setRecentEmojis(userId2, recentEmojis2);

        const recentEmojisForUser1 = LocalStorageStore.getRecentEmojis(userId1);
        assert.deepEqual(recentEmojisForUser1, recentEmojis1);

        const recentEmojisForUser2 = LocalStorageStore.getRecentEmojis(userId2);
        assert.deepEqual(recentEmojisForUser2, recentEmojis2);
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

        test('recentEmojis', () => {
            delete window.basename;

            const userId = 'userId';
            const recentEmojis1 = ['smile', 'joy', 'grin'];
            const recentEmojis2 = ['customEmoji', '+1', 'mattermost'];

            // Initially empty
            assert.equal(LocalStorageStore.getRecentEmojis(userId), null);

            // After set
            LocalStorageStore.setRecentEmojis(userId, recentEmojis1);
            assert.deepEqual(LocalStorageStore.getRecentEmojis(userId), recentEmojis1);

            // Still set when basename explicitly set
            window.basename = '/';
            assert.deepEqual(LocalStorageStore.getRecentEmojis(userId), recentEmojis1);

            // Different with different basename
            window.basename = '/subpath';
            assert.equal(LocalStorageStore.getRecentEmojis(userId), null);
            LocalStorageStore.setRecentEmojis(userId, recentEmojis2);
            assert.deepEqual(LocalStorageStore.getRecentEmojis(userId), recentEmojis2);

            // Back to old value with original basename
            window.basename = '/';
            assert.deepEqual(LocalStorageStore.getRecentEmojis(userId), recentEmojis1);
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
