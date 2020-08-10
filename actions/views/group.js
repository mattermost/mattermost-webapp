// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {searchGroupsForReferenceInCurrentChannel} from 'mattermost-redux/selectors/entities/groups';
import {haveICurrentChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';

export function searchAssociatedGroupsForReference(prefix) {
    return async (dispatch, getState) => {
        const state = getState();
        if (!haveICurrentChannelPermission(state, {permission: Permissions.USE_GROUP_MENTIONS})) {
            return {data: []};
        }
        return {data: searchGroupsForReferenceInCurrentChannel(state, prefix)};
    };
}
