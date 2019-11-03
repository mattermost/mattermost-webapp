// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as EmojiActions from 'mattermost-redux/actions/emojis';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {setRecentEmojis} from 'actions/local_storage';
import {getEmojiMap, getRecentEmojis} from 'selectors/emojis';

import {ActionTypes} from 'utils/constants';

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

const MAXIMUM_RECENT_EMOJI = 27;

export function addRecentEmoji(alias) {
    return (dispatch, getState) => {
        const state = getState();
        const recentEmojis = getRecentEmojis(state);
        const emojiMap = getEmojiMap(state);

        let name;
        const emoji = emojiMap.get(alias);
        if (!emoji) {
            return;
        } else if (emoji.name) {
            name = emoji.name;
        } else {
            name = emoji.aliases[0];
        }

        const index = recentEmojis.indexOf(name);
        if (index !== -1) {
            recentEmojis.splice(index, 1);
        }

        recentEmojis.push(name);

        if (recentEmojis.length > MAXIMUM_RECENT_EMOJI) {
            recentEmojis.splice(0, recentEmojis.length - MAXIMUM_RECENT_EMOJI);
        }

        dispatch(setRecentEmojis(recentEmojis));
    };
}
