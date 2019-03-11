// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import LocalStorageStore from 'stores/local_storage_store';

import * as Selectors from 'selectors/emojis';

describe('Selectors.Emojis', () => {
    it('getRecentEmojis', () => {
        const userId1 = 'user_id_1';
        const testState = {
            entities: {
                users: {
                    currentUserId: userId1,
                },
            },
            storage: {storage: {}},
        };

        assert.deepEqual(Selectors.getRecentEmojis(testState), []);

        const recentEmojis = ['rage', 'nauseated_face', 'innocent', '+1', 'sob', 'grinning', 'mm'];
        LocalStorageStore.setRecentEmojis(userId1, recentEmojis);
        setTimeout(() => {
            assert.deepEqual(Selectors.getRecentEmojis(testState), recentEmojis);
        }, 0);

        recentEmojis.push('joy');
        LocalStorageStore.setRecentEmojis(userId1, recentEmojis);
        setTimeout(() => {
            assert.deepEqual(Selectors.getRecentEmojis(testState), recentEmojis);
        }, 0);
    });
});
