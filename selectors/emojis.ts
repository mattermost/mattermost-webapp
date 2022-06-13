// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {Preferences} from 'utils/constants';
import EmojiMap from 'utils/emoji_map';

import {GlobalState} from 'types/store';
import {RecentEmojiData} from '@mattermost/types/emojis';

export const getEmojiMap = createSelector(
    'getEmojiMap',
    getCustomEmojisByName,
    (customEmojisByName) => {
        return new EmojiMap(customEmojisByName);
    },
);

export const getShortcutReactToLastPostEmittedFrom = (state: GlobalState) =>
    state.views.emoji.shortcutReactToLastPostEmittedFrom;

export const getRecentEmojis = createSelector(
    'getRecentEmojis',
    (state: GlobalState) => {
        return get(
            state,
            Preferences.RECENT_EMOJIS,
            getCurrentUserId(state),
            '[]',
        );
    },
    (recentEmojis: string) => {
        if (!recentEmojis) {
            return [];
        }
        const parsedEmojiData: RecentEmojiData[] = JSON.parse(recentEmojis);
        return parsedEmojiData;
    },
);

export const getRecentEmojisNames = createSelector(
    'getRecentEmojisNames',
    (state: GlobalState) => {
        return get(
            state,
            Preferences.RECENT_EMOJIS,
            getCurrentUserId(state),
            '[]',
        );
    },
    (recentEmojis: string) => {
        if (!recentEmojis) {
            return [];
        }
        const parsedEmojiData: RecentEmojiData[] = JSON.parse(recentEmojis);
        return parsedEmojiData.map((emoji) => emoji.name);
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
    getRecentEmojisNames,
    (emojiMap, recentEmojis: string[]) => {
        if (recentEmojis.length === 0) {
            return [];
        }

        return (recentEmojis).
            map((recentEmoji) => emojiMap.get(recentEmoji)).
            filter(Boolean).
            slice(-3).
            reverse();
    },
);
