// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getChannel, getChannelMember, selectChannel, joinChannel, getChannelStats} from 'mattermost-redux/actions/channels';
import {getPostThread} from 'mattermost-redux/actions/posts';
import {getCurrentTeam, getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, getUser} from 'mattermost-redux/selectors/entities/users';

import {loadChannelsForCurrentUser} from 'actions/channel_actions.jsx';
import {loadNewDMIfNeeded, loadNewGMIfNeeded} from 'actions/user_actions.jsx';
import {browserHistory} from 'utils/browser_history';
import {joinPrivateChannelPrompt} from 'utils/channel_utils';
import {ActionTypes, Constants, ErrorPageTypes} from 'utils/constants';
import {getUserIdFromChannelId, isSystemAdmin} from 'utils/utils';

let privateChannelJoinPromptVisible = false;

export function focusPost(postId, returnTo = '', currentUserId) {
    return async (dispatch, getState) => {
        // Ignore if prompt is still visible
        if (privateChannelJoinPromptVisible) {
            return;
        }
        const {data} = await dispatch(getPostThread(postId));

        if (!data) {
            browserHistory.replace(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
            return;
        }

        const state = getState();
        const channelId = data.posts[data.order[0]].channel_id;
        let channel = state.entities.channels.channels[channelId];
        const currentTeam = getCurrentTeam(state);
        const teamId = currentTeam.id;

        if (!channel) {
            const {data: channelData} = await dispatch(getChannel(channelId));

            if (!channelData) {
                browserHistory.replace(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
                return;
            }

            channel = channelData;
        }

        let myMember = state.entities.channels.myMembers[channelId];

        if (!myMember) {
            // If it's a DM or GM channel and we don't have a channel member for it already, user is not a member
            if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
                browserHistory.replace(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
                return;
            }

            const membership = await dispatch(getChannelMember(channel.id, currentUserId));
            if ('data' in membership) {
                myMember = membership.data;
            }

            if (!myMember) {
                // Prompt system admin before joining the private channel
                const user = getCurrentUser(state);
                if (channel.type === Constants.PRIVATE_CHANNEL && isSystemAdmin(user.roles)) {
                    privateChannelJoinPromptVisible = true;
                    const joinPromptResult = await dispatch(joinPrivateChannelPrompt(currentTeam, channel));
                    privateChannelJoinPromptVisible = false;
                    if ('data' in joinPromptResult && !joinPromptResult.data.join) {
                        return;
                    }
                }
                await dispatch(joinChannel(currentUserId, null, channelId));
            }
        }

        if (channel.team_id && channel.team_id !== teamId) {
            browserHistory.replace(`/error?type=${ErrorPageTypes.PERMALINK_NOT_FOUND}&returnTo=${returnTo}`);
            return;
        }

        if (channel && channel.type === Constants.DM_CHANNEL) {
            dispatch(loadNewDMIfNeeded(channel.id));
        } else if (channel && channel.type === Constants.GM_CHANNEL) {
            dispatch(loadNewGMIfNeeded(channel.id));
        }

        dispatch(selectChannel(channelId));
        dispatch({
            type: ActionTypes.RECEIVED_FOCUSED_POST,
            data: postId,
            channelId,
        });

        const team = getTeam(state, channel.team_id || teamId);

        if (channel.type === Constants.DM_CHANNEL) {
            const userId = getUserIdFromChannelId(channel.name);
            const user = getUser(state, userId);
            browserHistory.replace(`/${team.name}/messages/@${user.username}/${postId}`);
        } else if (channel.type === Constants.GM_CHANNEL) {
            browserHistory.replace(`/${team.name}/messages/${channel.name}/${postId}`);
        } else {
            browserHistory.replace(`/${team.name}/channels/${channel.name}/${postId}`);
        }

        dispatch(loadChannelsForCurrentUser());
        dispatch(getChannelStats(channelId));
    };
}
