// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';

import Constants from 'utils/constants.jsx';
import {getItemFromStorage} from 'selectors/storage';
import EmojiMap from 'utils/emoji_map';

export const getEmojiMap = createSelector(
    getCustomEmojisByName,
    (customEmojisByName) => {
        return new EmojiMap(customEmojisByName);
    }
);

export const getRecentEmojis = createSelector(
    (state) => state.storage,
    (storage) => {
        if (!storage || !storage.storage) {
            return [];
        }

        let recentEmojis;
        try {
            recentEmojis = JSON.parse(getItemFromStorage(storage.storage, Constants.RECENT_EMOJI_KEY, null));
        } catch (e) {
            // Errors are handled below
        }

        if (!recentEmojis) {
            return [];
        }

        if (recentEmojis.length > 0 && typeof recentEmojis[0] === 'object') {
            // Prior to PLT-7267, recent emojis were stored with the entire object for the emoji, but this
            // has been changed to store only the names of the emojis, so we need to change that
            recentEmojis = recentEmojis.map((emoji) => {
                return emoji.name || emoji.aliases[0];
            });
        }

        return recentEmojis;
    },
);
