// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as EmojiActions from 'mattermost-redux/actions/emojis';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import store from 'stores/redux_store.jsx';
import {setGlobalItem} from 'actions/storage';
import {getEmojiMap, getRecentEmojis} from 'selectors/emojis';

import {ActionTypes, Constants} from 'utils/constants.jsx';

export async function addEmoji(emoji, image, success, error) {
    const {data, error: err} = await EmojiActions.createCustomEmoji(emoji, image)(store.dispatch, store.getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function deleteEmoji(emojiId, success, error) {
    const {data, error: err} = await EmojiActions.deleteCustomEmoji(emojiId)(store.dispatch, store.getState);
    if (data) {
        // Needed to remove recently used emoji
        AppDispatcher.handleServerAction({
            type: ActionTypes.REMOVED_CUSTOM_EMOJI,
            id: emojiId,
        });

        if (success) {
            success(data);
        }
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function loadRecentlyUsedCustomEmojis() {
    return async (dispatch, getState) => {
        if (getState().entities.general.config.EnableCustomEmoji !== 'true') {
            return {data: true};
        }

        const recentEmojis = getRecentEmojis(getState());
        const emojiMap = getEmojiMap(getState());
        const missingEmojis = recentEmojis.filter((name) => !emojiMap.has(name));

        missingEmojis.forEach((name) => {
            EmojiActions.getCustomEmojiByName(name)(dispatch, getState);
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
        const recentEmojis = getRecentEmojis(getState());
        const emojiMap = getEmojiMap(getState());

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

        dispatch(setGlobalItem(Constants.RECENT_EMOJI_KEY, JSON.stringify(recentEmojis)));
    };
}