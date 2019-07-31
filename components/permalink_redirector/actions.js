// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getChannel} from 'mattermost-redux/actions/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getTeam as getTeamSelector} from 'mattermost-redux/selectors/entities/teams';
import {getPost} from 'mattermost-redux/actions/posts';
import {getTeam} from 'mattermost-redux/actions/teams';

import {redirectUserToDefaultTeam} from 'actions/global_actions.jsx';

import {Constants, ErrorPageTypes} from 'utils/constants.jsx';
import {browserHistory} from 'utils/browser_history';

import LocalStorageStore from 'stores/local_storage_store';

export const redirect = (postId) => {
    return async (innerDispatch, getState) => {
        const state = getState();
        let team = null;

        const post = await innerDispatch(getPost(postId));
        const channelId = post.data.channel_id;
        const channel = await innerDispatch(getChannel(channelId));

        if (channel.data && channel.data.type === Constants.DM_CHANNEL) {
            const userId = getCurrentUserId(state);
            const teamId = LocalStorageStore.getPreviousTeamId(userId);
            team = getTeamSelector(state, teamId);

            if (!team) {
                // No teams found, redirect to select a team
                innerDispatch(redirectUserToDefaultTeam());
                return;
            }
        } else if (channel.data) {
            const teamResp = await innerDispatch(getTeam(channel.data.team_id));
            team = teamResp.data;
        }

        if (!team) {
            browserHistory.replace(`/error?type=${ErrorPageTypes.TEAM_NOT_FOUND}`);
            return;
        }

        browserHistory.push(`/${team.name}/pl/${postId}`);
    };
};
