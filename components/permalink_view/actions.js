// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getChannel, selectChannel, joinChannel, getChannelStats} from 'mattermost-redux/actions/channels';
import {getPostThread} from 'mattermost-redux/actions/posts';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {loadChannelsForCurrentUser} from 'actions/channel_actions.jsx';
import {loadNewDMIfNeeded, loadNewGMIfNeeded} from 'actions/user_actions.jsx';
import {browserHistory} from 'utils/browser_history';
import {ActionTypes, Constants, ErrorPageTypes} from 'utils/constants.jsx';

export function focusPost(postId, returnTo = '') {
    return async (dispatch, getState) => {
        const {data} = await dispatch(getPostThread(postId));

        if (!data) {
            browserHistory.replace(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
            return;
        }

        const state = getState();
        const channelId = data.posts[data.order[0]].channel_id;
        let channel = state.entities.channels.channels[channelId];
        const teamId = getCurrentTeamId(state);

        if (!channel) {
            const {data: channelData} = await dispatch(getChannel(channelId));

            if (!channelData) {
                browserHistory.replace(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
                return;
            }

            channel = channelData;
        }

        const myMember = state.entities.channels.myMembers[channelId];

        if (!myMember) {
            // If it's a DM or GM channel and we don't have a channel member for it already, user is not a member
            if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
                browserHistory.replace(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
                return;
            }

            await dispatch(joinChannel(getCurrentUserId(getState()), null, channelId));
        }

        if (channel.team_id && channel.team_id !== teamId) {
            browserHistory.replace(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
            return;
        }

        if (channel && channel.type === Constants.DM_CHANNEL) {
            loadNewDMIfNeeded(channel.id);
        } else if (channel && channel.type === Constants.GM_CHANNEL) {
            loadNewGMIfNeeded(channel.id);
        }

        dispatch(selectChannel(channelId));
        dispatch({
            type: ActionTypes.RECEIVED_FOCUSED_POST,
            data: postId,
            channelId,
        });

        dispatch(loadChannelsForCurrentUser());
        dispatch(getChannelStats(channelId));
    };
}
