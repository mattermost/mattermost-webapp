// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as EmojiActions from 'mattermost-redux/actions/emojis';
import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {getEmojiMap, getRecentEmojis, isCustomEmojiEnabled} from 'selectors/emojis';
import {isCustomStatusEnabled, makeGetCustomStatus} from 'selectors/views/custom_status';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import LocalStorageStore from 'stores/local_storage_store';

import {ActionTypes, Preferences} from 'utils/constants';
import {EmojiIndicesByAlias} from 'utils/emoji';

export function loadRecentlyUsedCustomEmojis() {
    return async (dispatch, getState) => {
        const state = getState();
        const config = getConfig(state);

        if (config.EnableCustomEmoji !== 'true') {
            return {data: true};
        }

        const recentEmojis = getRecentEmojis(state);
        const emojiMap = getEmojiMap(state);
        const missingEmojis = recentEmojis.filter((name) => !emojiMap.has(name));

        missingEmojis.forEach((name) => {
            dispatch(EmojiActions.getCustomEmojiByName(name));
        });

        return {data: true};
    };
}

export function incrementEmojiPickerPage() {
    return async (dispatch) => {
        dispatch({
            type: ActionTypes.INCREMENT_EMOJI_PICKER_PAGE,
        });

        return {data: true};
    };
}

export function setUserSkinTone(skin) {
    return async (dispatch, getState) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const skinTonePreference = [{
            user_id: currentUserId,
            name: Preferences.EMOJI_SKINTONE,
            category: Preferences.CATEGORY_EMOJI,
            value: skin,
        }];
        dispatch(savePreferences(currentUserId, skinTonePreference));
    };
}

export const MAXIMUM_RECENT_EMOJI = 27;

export function addRecentEmoji(alias) {
    return (_dispatch, getState) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const recentEmojis = getRecentEmojis(state);
        const emojiMap = getEmojiMap(state);

        let name;
        const emoji = emojiMap.get(alias);
        if (!emoji) {
            return {data: false};
        } else if (emoji.short_name) {
            name = emoji.short_name;
        } else {
            name = emoji.name;
        }

        let updatedRecentEmojis;
        if (recentEmojis.includes(name)) {
            // If the emoji is already in the recent list, remove it and add it to the front
            const recentEmojisFiltered = recentEmojis.filter((recentEmoji) => recentEmoji !== name);
            updatedRecentEmojis = [...recentEmojisFiltered, name].slice(-MAXIMUM_RECENT_EMOJI);
        } else {
            updatedRecentEmojis = [...recentEmojis, name].slice(-MAXIMUM_RECENT_EMOJI);
        }

        LocalStorageStore.setRecentEmojis(currentUserId, updatedRecentEmojis);

        return {data: true};
    };
}

export function loadCustomEmojisForCustomStatusesByUserIds(userIds) {
    const getCustomStatus = makeGetCustomStatus();
    return (dispatch, getState) => {
        const state = getState();
        const customEmojiEnabled = isCustomEmojiEnabled(state);
        const customStatusEnabled = isCustomStatusEnabled(state);
        if (!customEmojiEnabled || !customStatusEnabled) {
            return {data: false};
        }

        const emojisToLoad = new Set();

        userIds.forEach((userId) => {
            const customStatus = getCustomStatus(state, userId);
            if (!customStatus || !customStatus.emoji) {
                return;
            }

            emojisToLoad.add(customStatus.emoji);
        });

        return dispatch(loadCustomEmojisIfNeeded(Array.from(emojisToLoad)));
    };
}

export function loadCustomEmojisIfNeeded(emojis) {
    return (dispatch, getState) => {
        if (!emojis || emojis.length === 0) {
            return {data: false};
        }

        const state = getState();
        const customEmojiEnabled = isCustomEmojiEnabled(state);
        if (!customEmojiEnabled) {
            return {data: false};
        }

        const systemEmojis = EmojiIndicesByAlias;
        const customEmojisByName = getCustomEmojisByName(state);
        const nonExistentCustomEmoji = state.entities.emojis.nonExistentEmoji;
        const emojisToLoad = [];

        emojis.forEach((emoji) => {
            if (!emoji) {
                return;
            }

            if (systemEmojis.has(emoji)) {
                // It's a system emoji, no need to fetch
                return;
            }

            if (nonExistentCustomEmoji.has(emoji)) {
                // We've previously confirmed this is not a custom emoji
                return;
            }

            if (customEmojisByName.has(emoji)) {
                // We have the emoji, no need to fetch
                return;
            }

            emojisToLoad.push(emoji);
        });

        return dispatch(EmojiActions.getCustomEmojisByName(emojisToLoad));
    };
}

export function loadCustomStatusEmojisForPostList(posts) {
    return (dispatch) => {
        if (!posts || posts.length === 0) {
            return {data: false};
        }

        const userIds = new Set();
        Object.keys(posts).forEach((postId) => {
            const post = posts[postId];
            if (post.user_id) {
                userIds.add(post.user_id);
            }
        });
        return dispatch(loadCustomEmojisForCustomStatusesByUserIds(userIds));
    };
}

