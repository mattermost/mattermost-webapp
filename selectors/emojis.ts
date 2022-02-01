// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {Preferences} from 'utils/constants';
import EmojiMap from 'utils/emoji_map';

import type {GlobalState} from 'types/store';
import {RecentEmojiData} from 'mattermost-redux/types/emojis';

export const getEmojiMap = createSelector(
    'getEmojiMap',
    getCustomEmojisByName,
    (customEmojisByName) => {
        return new EmojiMap(customEmojisByName);
    },
);

export const getShortcutReactToLastPostEmittedFrom = (state: GlobalState) =>
    state.views.emoji.shortcutReactToLastPostEmittedFrom;

export function getRecentEmojis(state: GlobalState): RecentEmojiData[] {
    const recentEmojis = get(
        state,
        Preferences.RECENT_EMOJIS,
        getCurrentUserId(state),
        '[]',
    );
    return JSON.parse(recentEmojis);
}

export function getUserSkinTone(state: GlobalState) {
    return get(
        state,
        Preferences.CATEGORY_EMOJI,
        Preferences.EMOJI_SKINTONE,
        'default',
    );
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

        const sortedRecentEmojis = recentEmojis.sort(
            (emojiA, emojiB) => emojiA.usageCount - emojiB.usageCount,
        );

        return sortedRecentEmojis.
            map((recentEmoji) => emojiMap.get(recentEmoji.name)).
            filter(Boolean).
            slice(-3).
            reverse();
    },
);
