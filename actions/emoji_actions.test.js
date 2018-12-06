// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {getRecentEmojis} from 'selectors/emojis';
import * as Actions from 'actions/emoji_actions.jsx';
import configureStore from 'store';

describe('Actions.Emojis', () => {
    let store;
    beforeEach(async () => {
        store = await configureStore();
    });

    it('addRecentEmoji', async () => {
        store.dispatch(Actions.addRecentEmoji('grinning'));
        assert.ok(getRecentEmojis(store.getState()).includes('grinning'));
        store.dispatch(Actions.addRecentEmoji('joramwilander'));
        assert.ok(!getRecentEmojis(store.getState()).includes('joramwilander'));
    });
});
