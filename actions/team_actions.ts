// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {TeamTypes} from 'mattermost-redux/action_types';
import {viewChannel, getChannelStats} from 'mattermost-redux/actions/channels';
import * as TeamActions from 'mattermost-redux/actions/teams';
import {getCurrentChannelId, isManuallyUnread} from 'mattermost-redux/selectors/entities/channels';
import {getUser} from 'mattermost-redux/actions/users';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {ActionFunc, DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {browserHistory} from 'utils/browser_history';
import {Preferences} from 'utils/constants';
import {selectTeam} from 'mattermost-redux/actions/teams';
import {Team} from 'mattermost-redux/types/teams';

export function removeUserFromTeamAndGetStats(teamId: string, userId: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const response = await dispatch(TeamActions.removeUserFromTeam(teamId, userId));
        dispatch(getUser(userId));
        dispatch(TeamActions.getTeamStats(teamId));
        dispatch(getChannelStats(getCurrentChannelId(getState())));
        return response;
    };
}

export function addUserToTeamFromInvite(token: string, inviteId: string) {
    return async (dispatch: DispatchFunc) => {
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

export function addUserToTeam(teamId: string, userId: string) {
    return async (dispatch: DispatchFunc) => {
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

export function addUsersToTeam(teamId: string, userIds: string[]) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const {data, error} = await dispatch(TeamActions.addUsersToTeamGracefully(teamId, userIds));

        if (error) {
            return {error};
        }

        dispatch(getChannelStats(getCurrentChannelId(getState())));

        return {data};
    };
}

export function switchTeam(url: string, setTeam: string | Team | undefined = undefined): ActionFunc {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const currentChannelId = getCurrentChannelId(state);
        if (!isManuallyUnread(state, currentChannelId)) {
            dispatch(viewChannel(currentChannelId));
        }

        if (setTeam) {
            dispatch(selectTeam(setTeam));
        } else {
            browserHistory.push(url);
        }
        return {data: true};
    };
}

export function updateTeamsOrderForUser(teamIds: string[]): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const teamOrderPreferences = [{
            user_id: currentUserId,
            name: '',
            category: Preferences.TEAMS_ORDER,
            value: teamIds.join(','),
        }];
        dispatch(savePreferences(currentUserId, teamOrderPreferences));
        return {data: true};
    };
}
