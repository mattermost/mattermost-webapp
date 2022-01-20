// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import deepEqual from 'fast-deep-equal';

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
        console.log('getRecentEmojis');
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

let prevThreeMostRecentEmojis: string[];
export const getOneClickReactionEmojis = (state: GlobalState) => {
    const threeMostRecentEmojis = getRecentEmojis(state).slice(-3);
    const emojiMap = getEmojiMap(state);

    // Temporary deep equal check to prevent PostInfo components from re-rendering in many unnecessary scenarios.
    // The proper fix is to turn this function into a proper selector but that's more complicated than it seems
    // because getRecentEmojis never returns a new array and the array it returns originally is modified mutably
    // when a new recent emoji is added, meaning that the selector would never recalculate. Fixing that is another
    // rabbit hole that would make more sense to do with the other storage refactor.
    const emojis = threeMostRecentEmojis.map((recentEmoji) => emojiMap.get(recentEmoji)).filter(Boolean).reverse();
    if (deepEqual(emojis, prevThreeMostRecentEmojis)) {
        return prevThreeMostRecentEmojis;
    }

    prevThreeMostRecentEmojis = emojis;
    return emojis;
};
