// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {UserMentionKey} from './users';

import {getCurrentTeamId} from '../../selectors/entities/teams';
import {getCurrentUserMentionKeys} from '../../selectors/entities/users';
import {getMyGroupMentionKeys} from '../../selectors/entities/groups';

import {GlobalState} from '../../types/store';

export const getCurrentSearchForCurrentTeam: (state: GlobalState) => string = createSelector(
    (state: GlobalState) => state.entities.search.current,
    getCurrentTeamId,
    (current, teamId) => {
        return current[teamId];
    },
);

export const getAllUserMentionKeys: (state: GlobalState) => UserMentionKey[] = createSelector(
    getCurrentUserMentionKeys,
    getMyGroupMentionKeys,
    (userMentionKeys, groupMentionKeys) => {
        return userMentionKeys.concat(groupMentionKeys);
    },
);