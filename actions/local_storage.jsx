// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import LocalStorageStore from 'stores/local_storage_store';

import Constants from 'utils/constants.jsx';

// setPreviousTeamId is a pseudo-action that writes not to the Redux store, but back to local
// storage.
//
// See LocalStorageStore for context.
export function setPreviousTeamId(teamId) {
    return (dispatch, getState) => {
        const userId = getCurrentUserId(getState());

        LocalStorageStore.setPreviousTeamId(userId, teamId);

        return {data: true};
    };
}

export function setPreviousRecentEmojis() {
    return (dispatch, getState) => {
        const currentUserId = getCurrentUserId(getState());

        const recentEmojis = getState().storage.storage[Constants.RECENT_EMOJI_KEY];
        if (recentEmojis && recentEmojis.value) {
            LocalStorageStore.setPreviousRecentEmojis(currentUserId, recentEmojis.value);
        }

        return {data: true};
    };
}
