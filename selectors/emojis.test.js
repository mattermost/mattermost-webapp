// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import LocalStorageStore from 'stores/local_storage_store';

import * as Selectors from 'selectors/emojis';

describe('Selectors.Emojis', () => {
    it('getRecentEmojis', () => {
        const recentEmojis = ['rage', 'nauseated_face', 'innocent', '+1', 'sob', 'grinning', 'mm'];
        const userId1 = 'user_id_1';
        const testState = {
            entities: {
                users: {
                    currentUserId: userId1,
                },
            },
        };

        assert.deepEqual(Selectors.getRecentEmojis(testState), []);

        LocalStorageStore.setRecentEmojis(userId1, recentEmojis);
        setTimeout(() => {
            assert.deepEqual(Selectors.getRecentEmojis(testState), recentEmojis);
        }, 0);
    });
});
