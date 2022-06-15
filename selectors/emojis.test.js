// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {savePreferences} from 'mattermost-redux/actions/preferences';

import * as Selectors from 'selectors/emojis';
import Constants from 'utils/constants';

describe('Selectors.Emojis', () => {
    it('getRecentEmojis', () => {
        const userId1 = 'user_id_1';
        const testState = {
            entities: {
                users: {
                    currentUserId: userId1,
                },
                preferences: {
                    myPreferences: {},
                },
            },
        };

        assert.deepStrictEqual(Selectors.getRecentEmojis(testState), []);

        const recentEmojis = [
            {name: 'rage', usageCount: 1},
            {name: 'nauseated_face', usageCount: 1},
            {name: 'innocent', usageCount: 1},
            {name: '+1', usageCount: 1},
            {name: 'sob', usageCount: 1},
            {name: 'grinning', usageCount: 1},
            {name: 'mm', usageCount: 1},
        ];
        savePreferences('user_id_1', [{category: Constants.Preferences.RECENT_EMOJIS, name: 'user_id_1', user_id: 'user_id_1', value: JSON.stringify(recentEmojis)}]);
        setTimeout(() => {
            assert.deepStrictEqual(Selectors.getRecentEmojis(testState), recentEmojis);
        }, 0);

        recentEmojis.push({name: 'joy', usageCount: 1});
        savePreferences('user_id_1', [{category: Constants.Preferences.RECENT_EMOJIS, name: 'user_id_1', user_id: 'user_id_1', value: JSON.stringify(recentEmojis)}]);
        setTimeout(() => {
            assert.deepStrictEqual(Selectors.getRecentEmojis(testState), recentEmojis);
        }, 0);
    });
});
