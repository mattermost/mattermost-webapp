// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentChannelId, getUsers} from '../../selectors/entities/common';
import {getTeammateNameDisplaySetting} from '../../selectors/entities/preferences';

import {GlobalState} from '../../types/store';
import {Typing} from '../../types/typing';
import {UserProfile} from '../../types/users';
import {IDMappedObjects} from '../../types/utilities';

import {displayUsername} from '../../utils/user_utils';

const getUsersTypingImpl = (profiles: IDMappedObjects<UserProfile>, teammateNameDisplay: string, channelId: string, parentPostId: string, typing: Typing): Array<string> => {
    const id = channelId + parentPostId;

    if (typing[id]) {
        const users = Object.keys(typing[id]);

        if (users.length) {
            return users.map((userId) => {
                return displayUsername(profiles[userId], teammateNameDisplay);
            });
        }
    }

    return [];
};

export function makeGetUsersTypingByChannelAndPost(): (state: GlobalState, props: {channelId: string; postId: string}) => Array<string> {
    return createSelector(
        getUsers,
        getTeammateNameDisplaySetting,
        (state: GlobalState, options: {channelId: string; postId: string}) => options.channelId,
        (state: GlobalState, options: {channelId: string; postId: string}) => options.postId,
        (state: GlobalState) => state.entities.typing,
        getUsersTypingImpl,
    );
}

export const getUsersTyping: (state: GlobalState) => Array<string> = createSelector(
    getUsers,
    getTeammateNameDisplaySetting,
    getCurrentChannelId,
    (state) => state.entities.posts.selectedPostId,
    (state) => state.entities.typing,
    getUsersTypingImpl,
);
