// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {joinChannel} from 'mattermost-redux/actions/channels';
import {getUser, getUserByUsername, getUserByEmail} from 'mattermost-redux/actions/users';

import ChannelView from 'components/channel_view/index';
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

const directChannelToUser = (profile, team) => {
    openDirectChannelToUser(
        profile.id,
        (channel) => {
            GlobalActions.emitChannelClickEvent(channel);
        },
        () => {
            handleError(history, team);
        }
    );
};
const redirectBasedOnUserId = (userId, team) => {
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
};
const handleGmGeneratedIdentifier = (identifier, team) => {
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
};
const handleReceivedProfile = (profile, team) => {
    AppDispatcher.handleServerAction({
        type: ActionTypes.RECEIVED_PROFILE,
        profile
    });
    directChannelToUser(profile, team);
};

const onChannelByIdentifierEnter = (props) => {
    const identifier = props.match.params.identifier;
    const history = props.history;
    const team = props.match.params.team;

    const error = () => {
        handleError(history, team);
    };

    /**
     * identifier may either be:
     * - A DM user_id length 26 chars
     * - A DM channel_id (id1_id2) length 54 chars
     * - A GM generated_id length 40 chars
     * - A username that starts with an @ sign
     * - An email containing an @ sign
     **/
    const identifierIsUsername = identifier.indexOf('@') === 0;
    const identifierIsEmailAddress = identifier.indexOf('@') > 0;
    const identifierIsUserId = identifier.length === 26;
    const identifierIsChannelId = identifier.length === 54;
    const identifierIsGMGeneratedId = identifier.length === 40;

    if (identifierIsUsername) {
        const username = identifier.slice(1, identifier.length);
        const teammate = UserStore.getProfileByUsername(username);
        if (teammate) {
            directChannelToUser(teammate, team);
        } else {
            getUserByUsername(username)(dispatch, getState).then(
                ({data, error: err}) => {
                    if (data) {
                        handleReceivedProfile(data, team);
                    } else if (err) {
                        error();
                    }
                }
            );
        }
    } else if (identifierIsEmailAddress) {
        const email = identifier;
        const teammate = UserStore.getProfileByEmail(email);
        if (teammate) {
            directChannelToUser(teammate, team);
        } else {
            getUserByEmail(email)(dispatch, getState).then(
                ({data, error: err}) => {
                    if (data) {
                        handleReceivedProfile(data, team);
                    } else if (err) {
                        error();
                    }
                }
            );
        }
    } else if (identifierIsUserId) {
        redirectBasedOnUserId(identifier, team);
    } else if (identifierIsChannelId) {
        redirectBasedOnUserId(Utils.getUserIdFromChannelId(identifier), team);
    } else if (identifierIsGMGeneratedId) {
        handleGmGeneratedIdentifier(identifier, team);
    } else {
        error();
    }
};

const handleError = (history, team) => {
    if (team) {
        history.push(`/${team}/channels/${Constants.DEFAULT_CHANNEL}`);
    } else {
        history.push('/');
    }
};

export default class MessageIdentifierRouter extends React.Component {
    constructor(props) {
        super(props);
        onChannelByIdentifierEnter(props);
    }
    shouldComponentUpdate(nextProps) {
        return this.props.match.params.identifier !== nextProps.match.params.identifier ||
            this.props.match.params.team !== nextProps.match.params.team;
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
