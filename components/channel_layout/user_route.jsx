// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {getUser, getUserByUsername, getUserByEmail} from 'mattermost-redux/actions/users';
import {getPosts} from 'mattermost-redux/actions/posts';

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
const POSTS_PER_PAGE = Constants.POST_CHUNK_SIZE / 2;

export default class ChannelRoute extends React.PureComponent {
    static propTypes = {
        byId: PropTypes.bool,
        byIds: PropTypes.bool,
        byEmail: PropTypes.bool,
        byName: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            userInfo: null,
        };
    }

    componentDidMount() {
        this.goToUser({match: this.props.match, history: this.props.history});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.match.params.identifier !== this.props.match.params.identifier) {
            if (nextProps.history.action !== 'REPLACE') {
                this.setState({
                    userInfo: null,
                });
                this.goToUser({match: nextProps.match, history: nextProps.history});
            }
        }
    }

    handleError(match) {
        const {team} = match.params;
        this.props.history.push(team ? `/${team}/channels/${Constants.DEFAULT_CHANNEL}` : '/');
    }

    doUserChange = (user) => {
        getPosts(user.id, 0, POSTS_PER_PAGE)(dispatch, getState);
        GlobalActions.emitChannelClickEvent(user);
        if (this.props.byEmail || this.props.byId || this.props.byIds) {
            this.props.history.replace(`/${this.props.match.params.team}/messages/@${user.display_name}`);
        }
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
                userInfoResponse = await getUser(identifier)(dispatch, getState);
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
            return <LoadingScreen style={{height: '0px'}}/>;
        }
        return <ChannelView/>;
    }
}
