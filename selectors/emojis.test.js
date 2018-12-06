// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {Constants} from 'utils/constants';
import * as Selectors from 'selectors/emojis';

describe('Selectors.Emojis', () => {
    it('getRecentEmojis', () => {
        const recentEmojis = ['rage', 'nauseated_face', 'innocent', '+1', 'sob', 'grinning', 'mm'];
        let testState = {
            storage: {
                storage: {
                    [Constants.RECENT_EMOJI_KEY]: {value: JSON.stringify(recentEmojis), timestamp: new Date()},
                },
            },
        };

        assert.deepEqual(Selectors.getRecentEmojis(testState), recentEmojis);

        testState = {
            storage: {
                storage: {
                },
            },
        };

        assert.deepEqual(Selectors.getRecentEmojis(testState), []);
    });
});
