// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';

import LocalStorageStore from 'stores/local_storage_store';

import {Constants, Preferences} from 'utils/constants';
import {getItemFromStorage} from 'selectors/storage';
import EmojiMap from 'utils/emoji_map';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';

export const getEmojiMap = createSelector(
    'getEmojiMap',
    getCustomEmojisByName,
    (customEmojisByName) => {
        return new EmojiMap(customEmojisByName);
    },
);

export const getShortcutReactToLastPostEmittedFrom = (state) => state.views.emoji.shortcutReactToLastPostEmittedFrom;

export const getRecentEmojis = createSelector(
    'getRecentEmojis',
    (state) => state.storage,
    getCurrentUserId,
    (storage, currentUserId) => {
        const recentEmojis = LocalStorageStore.getRecentEmojis(currentUserId) ||
            JSON.parse(getItemFromStorage(storage.storage, Constants.RECENT_EMOJI_KEY, null)); // Prior to release v5.9, recent emojis were saved as object in localforage.

        if (!recentEmojis) {
            return [];
        }

        return recentEmojis;
    },
);

// todo rename to getEmojiSkin
export const getUserSkinTone = createSelector(
    'getUserSkinTone',
    getMyPreferences,
    (prefs) => {
        const key = getPreferenceKey(Preferences.CATEGORY_EMOJI, Preferences.EMOJI_SKINTONE);
        return prefs[key]?.value || 'default';
    },
);

export function isCustomEmojiEnabled(state) {
    const config = getConfig(state);
    return config && config.EnableCustomEmoji === 'true';
}
