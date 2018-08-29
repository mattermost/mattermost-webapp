// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {joinChannel, getChannelByNameAndTeamName, markGroupChannelOpen} from 'mattermost-redux/actions/channels';
import {getUser, getUserByUsername, getUserByEmail} from 'mattermost-redux/actions/users';

import ChannelView from 'components/channel_view/index';
import UserStore from 'stores/user_store.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import {Constants} from 'utils/constants.jsx';
import {openDirectChannelToUser} from 'actions/channel_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as Utils from 'utils/utils.jsx';
import store from 'stores/redux_store.jsx';
const dispatch = store.dispatch;
const getState = store.getState;

const LENGTH_OF_ID = 26;
const LENGTH_OF_GROUP_ID = 40;
const LENGTH_OF_USER_ID_PAIR = 54;

function onChannelByIdentifierEnter({match, history}) {
    const {path, identifier, team} = match.params;

    if (!TeamStore.getByName(team)) {
        return;
    }

    if (path === 'channels') {
        if (identifier.length === LENGTH_OF_ID) {
            // It's hard to tell an ID apart from a channel name of the same length, so check first if
            // the identifier matches a channel that we have
            const channelsByName = ChannelStore.getByName(identifier);
            const moreChannelsByName = ChannelStore.getMoreChannelsList().find((chan) => chan.name === identifier);
            if (channelsByName || moreChannelsByName) {
                goToChannelByChannelName(match, history);
            } else {
                goToChannelByChannelId(match, history);
            }
        } else if (identifier.length === LENGTH_OF_GROUP_ID) {
            goToGroupChannelByGroupId(match, history);
        } else if (identifier.length === LENGTH_OF_USER_ID_PAIR) {
            goToDirectChannelByUserIds(match, history);
        } else {
            goToChannelByChannelName(match, history);
        }
    } else if (path === 'messages') {
        if (identifier.indexOf('@') === 0) {
            goToDirectChannelByUsername(match, history);
        } else if (identifier.indexOf('@') > 0) {
            goToDirectChannelByEmail(match, history);
        } else if (identifier.length === LENGTH_OF_ID) {
            goToDirectChannelByUserId(match, history, identifier);
        } else if (identifier.length === LENGTH_OF_GROUP_ID) {
            goToGroupChannelByGroupId(match, history);
        } else {
            handleError(match, history);
        }
    }
}

async function goToChannelByChannelId(match, history) {
    const {team, identifier} = match.params;
    const channelId = identifier.toLowerCase();

    let channel = ChannelStore.get(channelId);
    const teamObj = TeamStore.getByName(team);
    if (!channel) {
        const {data, error} = await joinChannel(UserStore.getCurrentId(), teamObj.id, channelId, null)(dispatch, getState);
        if (error) {
            handleChannelJoinError(match, history);
            return;
        }
        channel = data.channel;
    }

    if (channel.type === Constants.DM_CHANNEL) {
        goToDirectChannelByUserId(match, history, Utils.getUserIdFromChannelId(channel.name));
    } else if (channel.type === Constants.GM_CHANNEL) {
        history.replace(`/${team}/messages/${channel.name}`);
    } else {
        history.replace(`/${team}/channels/${channel.name}`);
    }
}

async function goToChannelByChannelName(match, history) {
    const {team, identifier} = match.params;
    const channelName = identifier.toLowerCase();

    let channel = ChannelStore.getByName(channelName);
    const teamObj = TeamStore.getByName(team);
    if (!channel) {
        const {data, error: joinError} = await joinChannel(UserStore.getCurrentId(), teamObj.id, null, channelName)(dispatch, getState);
        if (joinError) {
            const {data: data2, error: getChannelError} = await dispatch(getChannelByNameAndTeamName(team, channelName, true));
            if (getChannelError || data2.delete_at === 0) {
                handleChannelJoinError(match, history);
                return;
            }
            channel = data2;
        } else {
            channel = data.channel;
        }
    }

    if (channel.type === Constants.DM_CHANNEL) {
        goToDirectChannelByUserIds(match, history);
    } else if (channel.type === Constants.GM_CHANNEL) {
        history.replace(`/${team}/messages/${channel.name}`);
    } else {
        doChannelChange(channel);
    }
}

async function goToDirectChannelByUsername(match, history) {
    const {identifier} = match.params;
    const username = identifier.slice(1, identifier.length).toLowerCase();

    let user = UserStore.getProfileByUsername(username);
    if (!user) {
        const {data, error} = await getUserByUsername(username)(dispatch, getState);
        if (error) {
            handleError(match, history);
            return;
        }
        user = data;
    }

    openDirectChannelToUser(
        user.id,
        (channel) => {
            doChannelChange(channel);
        },
        () => handleError(match, history)
    );
}

async function goToDirectChannelByUserId(match, history, userId) {
    const {team} = match.params;

    let user = UserStore.getProfile(userId);
    if (!user) {
        const {data, error} = await getUser(userId)(dispatch, getState);
        if (error) {
            handleError(match, history);
            return;
        }
        user = data;
    }

    history.replace(`/${team}/messages/@${user.username}`);
}

async function goToDirectChannelByUserIds(match, history) {
    const {team, identifier} = match.params;
    const userId = Utils.getUserIdFromChannelId(identifier.toLowerCase());

    let user = UserStore.getProfile(userId);
    if (!user) {
        const {data, error} = await getUser(userId)(dispatch, getState);
        if (error) {
            handleError(match, history);
            return;
        }
        user = data;
    }

    history.replace(`/${team}/messages/@${user.username}`);
}

async function goToDirectChannelByEmail(match, history) {
    const {team, identifier} = match.params;
    const email = identifier.toLowerCase();

    let user = UserStore.getProfileByEmail(email);
    if (!user) {
        const {data, error} = await getUserByEmail(email)(dispatch, getState);
        if (error) {
            handleError(match, history);
            return;
        }
        user = data;
    }

    history.replace(`/${team}/messages/@${user.username}`);
}

async function goToGroupChannelByGroupId(match, history) {
    const {identifier, team} = match.params;
    const groupId = identifier.toLowerCase();

    history.replace(match.url.replace('/channels/', '/messages/'));

    let channel = ChannelStore.getByName(groupId);
    const teamObj = TeamStore.getByName(team);
    if (!channel) {
        const {data, error} = await joinChannel(UserStore.getCurrentId(), teamObj.id, null, groupId)(dispatch, getState);
        if (error) {
            handleError(match, history);
            return;
        }
        channel = data.channel;
    }

    dispatch(markGroupChannelOpen(channel.id));

    doChannelChange(channel);
}

function doChannelChange(channel) {
    GlobalActions.emitChannelClickEvent(channel);
}

function handleError(match, history) {
    const {team} = match.params;
    history.push(team ? `/${team}/channels/${Constants.DEFAULT_CHANNEL}` : '/');
}

function handleChannelJoinError(match, history) {
    const {team} = match.params;
    history.push(team ? `/error?type=channel_not_found&returnTo=/${team}/channels/${Constants.DEFAULT_CHANNEL}` : '/');
}

export default class ChannelIdentifierRouter extends React.PureComponent {
    static propTypes = {

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                team: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        onChannelByIdentifierEnter(props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.match.params.team !== nextProps.match.params.team ||
            this.props.match.params.identifier !== nextProps.match.params.identifier) {
            onChannelByIdentifierEnter(nextProps);
        }
    }

    render() {
        return <ChannelView/>;
    }
}
