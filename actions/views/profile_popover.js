// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getTeamMember} from 'mattermost-redux/actions/teams';
import {getChannelMember} from 'mattermost-redux/actions/channels';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {getSelectedPost} from 'selectors/rhs';

export function getMembershipForCurrentEntities(userId, channelId) {
    return async (dispatch, getState) => {
        const state = getState();
        const currentTeamId = getCurrentTeamId(state);

        const selectedPost = getSelectedPost(state);
        const currentChannel = getCurrentChannel(state) || {};

        let defaultChannelId;
        if (selectedPost.exists === false) {
            defaultChannelId = currentChannel.id;
        } else {
            defaultChannelId = selectedPost.channel_id;
        }

        return Promise.all([dispatch(getTeamMember(currentTeamId, userId)), dispatch(getChannelMember(channelId ?? defaultChannelId, userId))]);
    };
}
