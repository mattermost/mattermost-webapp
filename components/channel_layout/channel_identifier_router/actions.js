// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {joinChannel, getChannelByNameAndTeamName, markGroupChannelOpen} from 'mattermost-redux/actions/channels';
import {getUser, getUserByUsername, getUserByEmail} from 'mattermost-redux/actions/users';
import {getTeamByName} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, getUserByUsername as selectUserByUsername, getUser as selectUser, getUserByEmail as selectUserByEmail} from 'mattermost-redux/selectors/entities/users';
import {getChannelByName, getOtherChannels, getChannel, getChannelsNameMapInTeam, getRedirectChannelNameForTeam} from 'mattermost-redux/selectors/entities/channels';

import {Constants} from 'utils/constants.jsx';
import {openDirectChannelToUserId} from 'actions/channel_actions';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as Utils from 'utils/utils.jsx';

const LENGTH_OF_ID = 26;
const LENGTH_OF_GROUP_ID = 40;
const LENGTH_OF_USER_ID_PAIR = 54;

export function onChannelByIdentifierEnter({match, history}) {
    return (dispatch, getState) => {
        const state = getState();
        const {path, identifier, team} = match.params;

        if (!identifier) {
            return;
        }

        const teamObj = getTeamByName(state, team);
        if (!teamObj) {
            return;
        }

        if (path === 'channels') {
            if (identifier.length === LENGTH_OF_ID) {
            // It's hard to tell an ID apart from a channel name of the same length, so check first if
            // the identifier matches a channel that we have
                const channelsByName = getChannelByName(state, identifier);
                const moreChannelsByName = getOtherChannels(state).find((chan) => chan.name === identifier);
                if (channelsByName || moreChannelsByName) {
                    dispatch(goToChannelByChannelName(match, history));
                } else {
                    dispatch(goToChannelByChannelId(match, history));
                }
            } else if (identifier.length === LENGTH_OF_GROUP_ID) {
                dispatch(goToGroupChannelByGroupId(match, history));
            } else if (identifier.length === LENGTH_OF_USER_ID_PAIR) {
                dispatch(goToDirectChannelByUserIds(match, history));
            } else {
                dispatch(goToChannelByChannelName(match, history));
            }
        } else if (path === 'messages') {
            if (identifier.indexOf('@') === 0) {
                dispatch(goToDirectChannelByUsername(match, history));
            } else if (identifier.indexOf('@') > 0) {
                dispatch(goToDirectChannelByEmail(match, history));
            } else if (identifier.length === LENGTH_OF_ID) {
                dispatch(goToDirectChannelByUserId(match, history, identifier));
            } else if (identifier.length === LENGTH_OF_GROUP_ID) {
                dispatch(goToGroupChannelByGroupId(match, history));
            } else {
                handleError(match, history, getRedirectChannelNameForTeam(state, teamObj.id));
            }
        }
    };
}

export function goToChannelByChannelId(match, history) {
    return async (dispatch, getState) => {
        const state = getState();
        const {team, identifier} = match.params;
        const channelId = identifier.toLowerCase();

        let channel = getChannel(state, channelId);
        const member = state.entities.channels.myMembers[channelId];
        const teamObj = getTeamByName(state, team);
        if (!channel || !member) {
            const {data, error} = await dispatch(joinChannel(getCurrentUserId(state), teamObj.id, channelId, null));
            if (error) {
                handleChannelJoinError(match, history, getRedirectChannelNameForTeam(state, teamObj.id));
                return;
            }
            channel = data.channel;
        }

        if (channel.type === Constants.DM_CHANNEL) {
            dispatch(goToDirectChannelByUserId(match, history, Utils.getUserIdFromChannelId(channel.name)));
        } else if (channel.type === Constants.GM_CHANNEL) {
            history.replace(`/${team}/messages/${channel.name}`);
        } else {
            history.replace(`/${team}/channels/${channel.name}`);
        }
    };
}

export function goToChannelByChannelName(match, history) {
    return async (dispatch, getState) => {
        const state = getState();
        const {team, identifier} = match.params;
        const channelName = identifier.toLowerCase();

        const teamObj = getTeamByName(state, team);
        if (!teamObj) {
            return;
        }

        let channel = getChannelsNameMapInTeam(state, teamObj.id)[channelName];
        let member;
        if (channel) {
            member = state.entities.channels.myMembers[channel.id];
        }

        if (!channel || !member) {
            const {data, error: joinError} = await dispatch(joinChannel(getCurrentUserId(state), teamObj.id, null, channelName));
            if (joinError) {
                const {data: data2, error: getChannelError} = await dispatch(getChannelByNameAndTeamName(team, channelName, true));
                if (getChannelError || data2.delete_at === 0) {
                    handleChannelJoinError(match, history, getRedirectChannelNameForTeam(state, teamObj.id));
                    return;
                }
                channel = data2;
            } else {
                channel = data.channel;
            }
        }

        if (channel.type === Constants.DM_CHANNEL) {
            dispatch(goToDirectChannelByUserIds(match, history));
        } else if (channel.type === Constants.GM_CHANNEL) {
            history.replace(`/${team}/messages/${channel.name}`);
        } else {
            doChannelChange(channel);
        }
    };
}

function goToDirectChannelByUsername(match, history) {
    return async (dispatch, getState) => {
        const state = getState();
        const {team, identifier} = match.params;
        const username = identifier.slice(1, identifier.length).toLowerCase();
        const teamObj = getTeamByName(state, team);

        let user = selectUserByUsername(state, username);
        if (!user) {
            const {data, error} = await dispatch(getUserByUsername(username));
            if (error) {
                handleError(match, history, getRedirectChannelNameForTeam(state, teamObj.id));
                return;
            }
            user = data;
        }

        const {error, data} = await dispatch(openDirectChannelToUserId(user.id));
        if (error) {
            handleError(match, history, getRedirectChannelNameForTeam(state, teamObj.id));
            return;
        }

        doChannelChange(data);
    };
}

export function goToDirectChannelByUserId(match, history, userId) {
    return async (dispatch, getState) => {
        const state = getState();
        const {team} = match.params;
        const teamObj = getTeamByName(state, team);

        let user = selectUser(state, userId);
        if (!user) {
            const {data, error} = await dispatch(getUser(userId));
            if (error) {
                handleError(match, history, getRedirectChannelNameForTeam(state, teamObj.id));
                return;
            }
            user = data;
        }

        history.replace(`/${team}/messages/@${user.username}`);
    };
}

export function goToDirectChannelByUserIds(match, history) {
    return async (dispatch, getState) => {
        const state = getState();
        const {team, identifier} = match.params;
        const userId = Utils.getUserIdFromChannelId(identifier.toLowerCase(), getCurrentUserId(getState()));
        const teamObj = getTeamByName(state, team);

        let user = selectUser(state, userId);
        if (!user) {
            const {data, error} = await dispatch(getUser(userId));
            if (error) {
                handleError(match, history, getRedirectChannelNameForTeam(state, teamObj.id));
                return;
            }
            user = data;
        }

        history.replace(`/${team}/messages/@${user.username}`);
    };
}

export function goToDirectChannelByEmail(match, history) {
    return async (dispatch, getState) => {
        const state = getState();
        const {team, identifier} = match.params;
        const email = identifier.toLowerCase();
        const teamObj = getTeamByName(state, team);

        let user = selectUserByEmail(state, email);
        if (!user) {
            const {data, error} = await dispatch(getUserByEmail(email));
            if (error) {
                handleError(match, history, getRedirectChannelNameForTeam(state, teamObj.id));
                return;
            }
            user = data;
        }

        history.replace(`/${team}/messages/@${user.username}`);
    };
}

function goToGroupChannelByGroupId(match, history) {
    return async (dispatch, getState) => {
        const state = getState();
        const {identifier, team} = match.params;
        const groupId = identifier.toLowerCase();

        history.replace(match.url.replace('/channels/', '/messages/'));

        let channel = getChannelByName(state, groupId);
        const teamObj = getTeamByName(state, team);
        if (!channel) {
            const {data, error} = await dispatch(joinChannel(getCurrentUserId(state), teamObj.id, null, groupId));
            if (error) {
                handleError(match, history, getRedirectChannelNameForTeam(state, teamObj.id));
                return;
            }
            channel = data.channel;
        }

        dispatch(markGroupChannelOpen(channel.id));

        doChannelChange(channel);
    };
}

function doChannelChange(channel) {
    GlobalActions.emitChannelClickEvent(channel);
}

function handleError(match, history, defaultChannel) {
    const {team} = match.params;
    history.push(team ? `/${team}/channels/${defaultChannel}` : '/');
}

function handleChannelJoinError(match, history, defaultChannel) {
    const {team} = match.params;
    history.push(team ? `/error?type=channel_not_found&returnTo=/${team}/channels/${defaultChannel}` : '/');
}
