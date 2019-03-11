// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import LocalStorageStore from 'stores/local_storage_store';

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

export function setRecentEmojis(recentEmojis = []) {
    return (dispatch, getState) => {
        const currentUserId = getCurrentUserId(getState());

        LocalStorageStore.setRecentEmojis(currentUserId, recentEmojis);

        return {data: true};
    };
}
