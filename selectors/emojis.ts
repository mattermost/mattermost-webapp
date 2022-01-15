// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import LocalStorageStore from 'stores/local_storage_store';

import {Constants, Preferences} from 'utils/constants';
import {getItemFromStorage} from 'selectors/storage';
import EmojiMap from 'utils/emoji_map';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import type {GlobalState} from 'types/store';

export const getEmojiMap = createSelector(
    'getEmojiMap',
    getCustomEmojisByName,
    (customEmojisByName) => {
        return new EmojiMap(customEmojisByName);
    },
);

export const getShortcutReactToLastPostEmittedFrom = (state: GlobalState) => state.views.emoji.shortcutReactToLastPostEmittedFrom;

export const getRecentEmojis = createSelector(
    'getRecentEmojis',
    (state: GlobalState) => state.storage,
    getCurrentUserId,
    (storage, currentUserId) => {
        const recentEmojis: string[] = LocalStorageStore.getRecentEmojis(currentUserId) ||
            JSON.parse(getItemFromStorage(storage.storage, Constants.RECENT_EMOJI_KEY, null)); // Prior to release v5.9, recent emojis were saved as object in localforage.

        if (!recentEmojis) {
            return [];
        }

        return recentEmojis;
    },
);

export function getUserSkinTone(state: GlobalState) {
    return get(state, Preferences.CATEGORY_EMOJI, Preferences.EMOJI_SKINTONE, 'default');
}

export function isCustomEmojiEnabled(state: GlobalState) {
    const config = getConfig(state);
    return config && config.EnableCustomEmoji === 'true';
}

export const getOneClickReactionEmojis = createSelector(
    'getOneClickReactionEmojis',
    getEmojiMap,
    getRecentEmojis,
    (emojiMap, recentEmojis) => {
        if (recentEmojis.length === 0) {
            return [];
        }

        return recentEmojis.map((recentEmoji) => emojiMap.get(recentEmoji)).filter(Boolean).slice(-3).reverse();
    },
);
