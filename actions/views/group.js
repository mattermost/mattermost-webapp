// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {searchAssociatedGroupsForReferenceLocal} from 'mattermost-redux/selectors/entities/groups';

export function searchAssociatedGroupsForReference(prefix, teamId, channelId) {
    return async (dispatch, getState) => {
        const state = getState();
        const groups = searchAssociatedGroupsForReferenceLocal(state, prefix, teamId, channelId);
        return {data: groups};
    };
}
