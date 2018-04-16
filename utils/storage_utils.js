// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

export function getPrefix(state) {
    if (state && state.entities && state.entities.users && state.entities.users.profiles) {
        const user = state.entities.users.profiles[state.entities.users.currentUserId];
        if (user) {
            return user.id + '_';
        }
    }

    return 'unknown_';
}

