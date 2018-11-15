// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {TeamTypes} from 'mattermost-redux/action_types';
import {viewChannel, getChannelStats} from 'mattermost-redux/actions/channels';
import * as TeamActions from 'mattermost-redux/actions/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getUser} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';

import {browserHistory} from 'utils/browser_history';
import store from 'stores/redux_store.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export async function removeUserFromTeam(teamId, userId, success, error) {
    const {data, error: err} = await dispatch(TeamActions.removeUserFromTeam(teamId, userId));
    dispatch(getUser(userId));
    dispatch(TeamActions.getTeamStats(teamId));
    dispatch(getChannelStats(getCurrentChannelId(getState())));

    if (data && success) {
        success();
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function addUserToTeamFromInvite(token, inviteId, success, error) {
    Client4.addToTeamFromInvite(token, inviteId).then(
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

export function addUsersToTeam(teamId, userIds) {
    return async (doDispatch, doGetState) => {
        const {data, error} = await doDispatch(TeamActions.addUsersToTeam(teamId, userIds));

        if (error) {
            return {error};
        }

        doDispatch(getChannelStats(doGetState().entities.channels.currentChannelId));

        return {data};
    };
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
    const {data: result, error: err} = await dispatch(TeamActions.sendEmailInvitesToTeam(getCurrentTeamId(getState()), emails));
    if (result && success) {
        success();
    } else if (result == null && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function switchTeams(url) {
    dispatch(viewChannel(getCurrentChannelId(getState())));
    browserHistory.push(url);
}
