// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import LocalStorageStore from 'stores/local_storage_store';

import {Preferences} from 'utils/constants';
import EmojiMap from 'utils/emoji_map';

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
    (state: GlobalState) => LocalStorageStore.getRecentEmojis(getCurrentUserId(state)),
    (recentEmojis) => {
        if (!recentEmojis) {
            return [];
        }

        const recentEmojisArray: string[] = JSON.parse(recentEmojis);
        return recentEmojisArray;
    },
);

export function getUserSkinTone(state: GlobalState): string {
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
