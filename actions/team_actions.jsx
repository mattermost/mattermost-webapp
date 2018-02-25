// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {TeamTypes} from 'mattermost-redux/action_types';
import {viewChannel, getChannelStats} from 'mattermost-redux/actions/channels';
import * as TeamActions from 'mattermost-redux/actions/teams';
import {getUser} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';

import {browserHistory} from 'utils/browser_history';
import ChannelStore from 'stores/channel_store.jsx';
import store from 'stores/redux_store.jsx';
import TeamStore from 'stores/team_store.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export async function checkIfTeamExists(teamName, onSuccess, onError) {
    const {data: exists, error: err} = await TeamActions.checkIfTeamExists(teamName)(dispatch, getState);
    if (exists != null && onSuccess) {
        onSuccess(exists);
    } else if (err && onError) {
        onError({id: err.server_error_id, ...err});
    }
}

export async function createTeam(team, onSuccess, onError) {
    const {data: rteam, error: err} = await TeamActions.createTeam(team)(dispatch, getState);
    if (rteam && onSuccess) {
        onSuccess(rteam);
    } else if (err && onError) {
        onError({id: err.server_error_id, ...err});
    }
}

export async function updateTeam(team, onSuccess, onError) {
    const {data: rteam, error: err} = await TeamActions.updateTeam(team)(dispatch, getState);
    if (rteam && onSuccess) {
        onSuccess(rteam);
    } else if (err && onError) {
        onError({id: err.server_error_id, ...err});
    }
}

export async function removeUserFromTeam(teamId, userId, success, error) {
    const {data, error: err} = await TeamActions.removeUserFromTeam(teamId, userId)(dispatch, getState);
    getUser(userId)(dispatch, getState);
    TeamActions.getTeamStats(teamId)(dispatch, getState);
    getChannelStats(ChannelStore.getCurrentId())(dispatch, getState);

    if (data && success) {
        success();
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function updateTeamMemberRoles(teamId, userId, newRoles, success, error) {
    const {data, error: err} = await TeamActions.updateTeamMemberRoles(teamId, userId, newRoles)(dispatch, getState);
    if (data && success) {
        success();
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function addUserToTeamFromInvite(data, hash, inviteId, success, error) {
    Client4.addToTeamFromInvite(hash, data, inviteId).then(
        async (member) => {
            const {data: team} = await TeamActions.getTeam(member.team_id)(dispatch, getState);
            dispatch({
                type: TeamTypes.RECEIVED_MY_TEAM_MEMBER,
                data: {
                    ...member,
                    delete_at: 0,
                    msg_count: 0,
                    mention_count: 0,
                },
            });

            if (success) {
                success(team);
            }
        }
    ).catch(
        (err) => {
            if (error) {
                error(err);
            }
        }
    );
}

export async function addUsersToTeam(teamId, userIds, success, error) {
    const {data: teamMembers, error: err} = await TeamActions.addUsersToTeam(teamId, userIds)(dispatch, getState);
    getChannelStats(ChannelStore.getCurrentId())(dispatch, getState);
    if (teamMembers && success) {
        success(teamMembers);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function getInviteInfo(inviteId, success, error) {
    Client4.getTeamInviteInfo(inviteId).then(
        (inviteData) => {
            if (success) {
                success(inviteData);
            }
        }
    ).catch(
        (err) => {
            if (error) {
                error(err);
            }
        }
    );
}

export async function inviteMembers(data, success, error) {
    if (!data.invites) {
        success();
    }
    const emails = [];
    data.invites.forEach((i) => {
        emails.push(i.email);
    });
    const {data: result, error: err} = await TeamActions.sendEmailInvitesToTeam(TeamStore.getCurrentId(), emails)(dispatch, getState);
    if (result && success) {
        success();
    } else if (result == null && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function switchTeams(url) {
    viewChannel(ChannelStore.getCurrentId())(dispatch, getState);
    browserHistory.push(url);
}

export async function getTeamsForUser(userId, success, error) {
    const {data, error: err} = await TeamActions.getTeamsForUser(userId)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function getTeamMembersForUser(userId, success, error) {
    const {data, error: err} = await TeamActions.getTeamMembersForUser(userId)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}
