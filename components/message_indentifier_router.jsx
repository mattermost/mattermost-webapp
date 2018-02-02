// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {joinChannel} from 'mattermost-redux/actions/channels';
import {getUser, getUserByUsername, getUserByEmail} from 'mattermost-redux/actions/users';

import ChannelView from 'components/channel_view';
import {loadNewGMIfNeeded} from 'actions/user_actions.jsx';
import UserStore from 'stores/user_store.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {Constants, ActionTypes} from 'utils/constants.jsx';
import {openDirectChannelToUser} from 'actions/channel_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import * as Utils from 'utils/utils.jsx';
import store from 'stores/redux_store.jsx';
const dispatch = store.dispatch;
const getState = store.getState;

/**
* identifier may either be:
* - A DM user_id length 26 chars
* - A DM channel_id (id1_id2) length 54 chars
* - A GM generated_id length 40 chars
* - A username that starts with an @ sign
* - An email containing an @ sign
**/
function onChannelByIdentifierEnter(props) {
    const identifier = props.match.params.identifier;
    const history = props.history;
    const team = props.match.params.team;
    if (identifier.indexOf('@') === -1) {
        // DM user_id or id1_id2 identifier
        if (identifier.length === 26 || identifier.length === 54) {
            const userId = (identifier.length === 26) ? identifier : Utils.getUserIdFromChannelId(identifier);
            const teammate = UserStore.getProfile(userId);
            if (teammate) {
                history.push(`/${team}/messages/@${teammate.username}`);
            } else {
                getUser(userId)(dispatch, getState).then(
                    ({data: profile}) => {
                        if (profile) {
                            history.push(`/${team}/messages/@${profile.username}`);
                        } else if (profile == null) {
                            handleError(history, team);
                        }
                    }
                );
            }

        // GM generated_id identifier
        } else if (identifier.length === 40) {
            const channel = ChannelStore.getByName(identifier);
            if (channel) {
                loadNewGMIfNeeded(channel.id);
                GlobalActions.emitChannelClickEvent(channel);
            } else {
                joinChannel(UserStore.getCurrentId(), TeamStore.getCurrentId(), null, identifier)(dispatch, getState).then(
                    (result) => {
                        if (result.data) {
                            GlobalActions.emitChannelClickEvent(result.data.channel);
                        } else if (result.error) {
                            handleError(history, team);
                        }
                    }
                );
            }
        } else {
            handleError(history, team);
        }
    } else {
        function success(profile) {
            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_PROFILE,
                profile
            });
            directChannelToUser(profile, team);
        }

        function error() {
            handleError(history, team);
        }

        if (identifier.indexOf('@') === 0) { // @username identifier
            const username = identifier.slice(1, identifier.length);
            const teammate = UserStore.getProfileByUsername(username);
            if (teammate) {
                directChannelToUser(teammate, team);
            } else {
                getUserByUsername(username)(dispatch, getState).then(
                    ({data, error: err}) => {
                        if (data && success) {
                            success(data);
                        } else if (err && error) {
                            error({id: err.server_error_id, ...err});
                        }
                    }
                );
            }
        } else if (identifier.indexOf('@') > 0) { // email identifier
            const email = identifier;
            const teammate = UserStore.getProfileByEmail(email);
            if (teammate) {
                directChannelToUser(teammate, team);
            } else {
                getUserByEmail(email)(dispatch, getState).then(
                    ({data, error: err}) => {
                        if (data && success) {
                            success(data);
                        } else if (err && error) {
                            error({id: err.server_error_id, ...err});
                        }
                    }
                );
            }
        }
    }
}

function directChannelToUser(profile, team) {
    openDirectChannelToUser(
        profile.id,
        (channel) => {
            GlobalActions.emitChannelClickEvent(channel);
        },
        () => {
            handleError(history, team);
        }
    );
}

function handleError(history, team) {
    if (team) {
        history.push(`/${team}/channels/${Constants.DEFAULT_CHANNEL}`);
    } else {
        history.push('/');
    }
}

export default class NeedsTeam extends React.Component {
    constructor(props) {
        super(props);

        onChannelByIdentifierEnter(props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.match.params.identifier !== nextProps.match.params.identifier) {
            onChannelByIdentifierEnter(nextProps);
        }
    }

    render() {
        return <ChannelView/>;
    }
}
