// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {getUser, getUserByUsername, getUserByEmail} from 'mattermost-redux/actions/users';

import * as GlobalActions from 'actions/global_actions.jsx';
import {openDirectChannelToUser} from 'actions/channel_actions.jsx';
import UserStore from 'stores/user_store.jsx';
import store from 'stores/redux_store.jsx';
import {Constants} from 'utils/constants.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
import ChannelView from 'components/channel_view/index';
import * as Utils from 'utils/utils.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export default class ChannelRoute extends React.PureComponent {
    static propTypes = {
        byId: PropTypes.bool,
        byIds: PropTypes.bool,
        byEmail: PropTypes.bool,
        byName: PropTypes.bool,

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                team: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            userInfo: null,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.match.params.identifier !== prevState.identifier) {
            return {
                userInfo: null,
                identifier: nextProps.match.params.identifier,
            };
        }
        return null;
    }

    componentDidMount() {
        this.goToUser({match: this.props.match, history: this.props.history});
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.identifier !== this.props.match.params.identifier) {
            this.goToUser({match: this.props.match, history: this.props.history});
        }
    }

    handleError(match) {
        const {team} = match.params;
        this.props.history.push(team ? `/${team}/channels/${Constants.DEFAULT_CHANNEL}` : '/');
    }

    doUserChange = (user) => {
        if (this.props.byEmail || this.props.byId || this.props.byIds) {
            this.props.history.replace(`/${this.props.match.params.team}/messages/@${user.display_name}`);
        }
        GlobalActions.emitChannelClickEvent(user);
    }

    goToUser = async ({match}) => {
        let user;
        let userInfoResponse;
        const {identifier} = match.params;
        const username = identifier.slice(1, identifier.length).toLowerCase();

        if (this.props.byName) {
            user = UserStore.getProfileByUsername(username);
            if (!user) {
                userInfoResponse = await getUserByUsername(username)(dispatch, getState);
            }
        } else if (this.props.byEmail) {
            const email = identifier.toLowerCase();
            user = UserStore.getProfileByEmail(email);
            if (!user) {
                userInfoResponse = await getUserByEmail(email)(dispatch, getState);
            }
        } else if (this.props.byId) {
            user = UserStore.getProfile(identifier);
            if (!user) {
                userInfoResponse = await getUser(identifier)(dispatch, getState);
            }
        } else if (this.props.byIds) {
            const userId = Utils.getUserIdFromChannelId(identifier.toLowerCase());
            user = UserStore.getProfile(userId);
            if (!user) {
                userInfoResponse = await getUser(userId)(dispatch, getState);
            }
        }

        user = user || userInfoResponse.data;

        if (userInfoResponse && userInfoResponse.error) {
            this.handleError(match);
            return;
        }

        this.setState({
            userInfo: user,
        });

        openDirectChannelToUser(
            user.id,
            (userInfo) => {
                this.doUserChange(userInfo);
            },
            () => this.handleError(match)
        );
    }

    render() {
        if (!this.state.userInfo) {
            return <LoadingScreen/>;
        }
        return <ChannelView/>;
    }
}
