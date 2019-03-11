// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import LocalStorageStore from 'stores/local_storage_store';

import EmojiMap from 'utils/emoji_map';

export const getEmojiMap = createSelector(
    getCustomEmojisByName,
    (customEmojisByName) => {
        return new EmojiMap(customEmojisByName);
    }
);

export const getRecentEmojis = createSelector(
    getCurrentUserId,
    (currentUserId) => {
        const recentEmojis = LocalStorageStore.getRecentEmojis(currentUserId);
        if (!recentEmojis) {
            return [];
        }

        return recentEmojis.split(',');
    }
);
