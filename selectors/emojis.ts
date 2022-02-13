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

export const getRecentEmojis = createSelector(
    'getRecentEmojis',

    // if getSimplifiedData is true then return array of emoji names instead of RecentEmojiData object
    (state: GlobalState, getSimplifiedData = true) => {
        const recentEmojis = get(
            state,
            Preferences.RECENT_EMOJIS,
            getCurrentUserId(state),
            '[]',
        );
        return {
            recentEmojis,
            getSimplifiedData,
        };
    },
    ({recentEmojis, getSimplifiedData}: { recentEmojis: string; getSimplifiedData: boolean}) => {
        if (!recentEmojis) {
            return [];
        }
        const parsedEmojiData: RecentEmojiData[] = JSON.parse(recentEmojis);
        const toReturnRecentEmojis = getSimplifiedData ? parsedEmojiData.map((emoji) => emoji.name) : parsedEmojiData;
        return toReturnRecentEmojis;
    },
);

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
    (emojiMap, recentEmojis: RecentEmojiData[] | string[]) => {
        if (recentEmojis.length === 0) {
            return [];
        }

        return (recentEmojis as string[]).
            map((recentEmoji) => emojiMap.get(recentEmoji)).
            filter(Boolean).
            slice(-3).
            reverse();
    },
);
