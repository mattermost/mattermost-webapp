// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import * as EmojiActions from 'mattermost-redux/actions/emojis';
import {getProfilesByIds} from 'mattermost-redux/actions/users';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import store from 'stores/redux_store.jsx';
import UserStore from 'stores/user_store.jsx';

import {ActionTypes} from 'utils/constants.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export async function loadEmoji(getProfiles = true) {
    const {data} = await EmojiActions.getAllCustomEmojis()(dispatch, getState);

    if (data && getProfiles) {
        loadProfilesForEmoji(data);
    }
}

function loadProfilesForEmoji(emojiList) {
    const profilesToLoad = {};
    for (let i = 0; i < emojiList.length; i++) {
        const emoji = emojiList[i];
        if (!UserStore.hasProfile(emoji.creator_id)) {
            profilesToLoad[emoji.creator_id] = true;
        }
    }

    const list = Object.keys(profilesToLoad);
    if (list.length === 0) {
        return;
    }

    getProfilesByIds(list)(dispatch, getState);
}

export async function addEmoji(emoji, image, success, error) {
    const {data, error: err} = await EmojiActions.createCustomEmoji(emoji, image)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function deleteEmoji(emojiId, success, error) {
    const {data, error: err} = await EmojiActions.deleteCustomEmoji(emojiId)(dispatch, getState);
    if (data) {
        // Needed to remove recently used emoji
        AppDispatcher.handleServerAction({
            type: ActionTypes.REMOVED_CUSTOM_EMOJI,
            id: emojiId
        });

        if (success) {
            success(data);
        }
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}
