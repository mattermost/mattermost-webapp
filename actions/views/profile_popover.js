// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getTeamMember} from 'mattermost-redux/actions/teams';
import {getChannelMember} from 'mattermost-redux/actions/channels';

export function getMembershipForCurrentEntities(currentTeamId, userId, channelId) {
    return async (dispatch) => {
        if (!channelId) {
            return dispatch(getTeamMember(currentTeamId, userId));
        }
        return Promise.all([
            dispatch(getTeamMember(currentTeamId, userId)),
            dispatch(getChannelMember(channelId, userId)),
        ]);
    };
}
