// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {getRecentEmojis} from 'selectors/emojis';
import * as Actions from 'actions/emoji_actions';
import configureStore from 'store';

describe('Actions.Emojis', () => {
    let store;
    beforeEach(async () => {
        store = await configureStore();
    });

    test('Emoji alias is stored in recent emojis', async () => {
        store.dispatch(Actions.addRecentEmoji('grinning'));
        assert.ok(getRecentEmojis(store.getState()).includes('grinning'));
    });

    test('First alias is stored in recent emojis even if second alias used', async () => {
        store.dispatch(Actions.addRecentEmoji('thumbsup'));
        console.log(getRecentEmojis(store.getState()));
        assert.ok(getRecentEmojis(store.getState()).includes('+1'));
    });

    test('Invalid emoji are not stored in recents', async () => {
        store.dispatch(Actions.addRecentEmoji('joramwilander'));
        assert.ok(!getRecentEmojis(store.getState()).includes('joramwilander'));
    });
});
