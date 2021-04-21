// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {TeamTypes} from 'mattermost-redux/action_types';
import {viewChannel, getChannelStats} from 'mattermost-redux/actions/channels';
import * as TeamActions from 'mattermost-redux/actions/teams';
import {getCurrentChannelId, isManuallyUnread} from 'mattermost-redux/selectors/entities/channels';
import {getUser} from 'mattermost-redux/actions/users';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {browserHistory} from 'utils/browser_history';
import {Preferences} from 'utils/constants';

export function removeUserFromTeamAndGetStats(teamId, userId) {
    return async (dispatch, getState) => {
        const response = await dispatch(TeamActions.removeUserFromTeam(teamId, userId));
        dispatch(getUser(userId));
        dispatch(TeamActions.getTeamStats(teamId));
        dispatch(getChannelStats(getCurrentChannelId(getState())));
        return response;
    };
}

export function addUserToTeamFromInvite(token, inviteId) {
    return async (dispatch) => {
        const {data: member, error} = await dispatch(TeamActions.addUserToTeamFromInvite(token, inviteId));
        if (member) {
            const {data} = await dispatch(TeamActions.getTeam(member.team_id));

            dispatch({
                type: TeamTypes.RECEIVED_MY_TEAM_MEMBER,
                data: {
                    ...member,
                    delete_at: 0,
                    msg_count: 0,
                    mention_count: 0,
                },
            });

            return {data};
        }
        return {error};
    };
}

export function addUserToTeam(teamId, userId) {
    return async (dispatch) => {
        const {data: member, error} = await dispatch(TeamActions.addUserToTeam(teamId, userId));
        if (member) {
            const {data} = await dispatch(TeamActions.getTeam(member.team_id));

            dispatch({
                type: TeamTypes.RECEIVED_MY_TEAM_MEMBER,
                data: {
                    ...member,
                    delete_at: 0,
                    msg_count: 0,
                    mention_count: 0,
                },
            });

            return {data};
        }
        return {error};
    };
}

export function addUsersToTeam(teamId, userIds) {
    return async (dispatch, getState) => {
        const {data, error} = await dispatch(TeamActions.addUsersToTeamGracefully(teamId, userIds));

        if (error) {
            return {error};
        }

        dispatch(getChannelStats(getCurrentChannelId(getState())));

        return {data};
    };
}

export function switchTeam(url) {
    return (dispatch, getState) => {
        const state = getState();
        const currentChannelId = getCurrentChannelId(state);
        if (!isManuallyUnread(state, currentChannelId)) {
            dispatch(viewChannel(currentChannelId));
        }

        browserHistory.push(url);
    };
}

export function updateTeamsOrderForUser(teamIds) {
    return async (dispatch, getState) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const teamOrderPreferences = [{
            user_id: currentUserId,
            name: '',
            category: Preferences.TEAMS_ORDER,
            value: teamIds.join(','),
        }];
        dispatch(savePreferences(currentUserId, teamOrderPreferences));
    };
}
