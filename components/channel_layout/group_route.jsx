// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {joinChannel} from 'mattermost-redux/actions/channels';
import {getPosts} from 'mattermost-redux/actions/posts';

import * as GlobalActions from 'actions/global_actions.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import UserStore from 'stores/user_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import store from 'stores/redux_store.jsx';
import {Constants} from 'utils/constants.jsx';
import ChannelView from 'components/channel_view/index';

const dispatch = store.dispatch;
const getState = store.getState;
const POSTS_PER_PAGE = Constants.POST_CHUNK_SIZE / 2;

export default class ChannelRoute extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            groupInfo: null,
        };
    }

    componentDidMount() {
        this.goToGroup({match: this.props.match, history: this.props.history});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.match.params.identifier !== this.props.match.params.identifier) {
            if (nextProps.history.action !== 'REPLACE') {
                this.setState({
                    groupInfo: null,
                });
                this.goToGroup({match: nextProps.match, history: nextProps.history});
            }
        }
    }

    handleError(match, history) {
        const {team} = match.params;
        history.push(team ? `/${team}/channels/${Constants.DEFAULT_CHANNEL}` : '/');
    }

    doGroupChange = (channel) => {
        getPosts(channel.id, 0, POSTS_PER_PAGE)(dispatch, getState);
        GlobalActions.emitChannelClickEvent(channel);
        this.props.history.replace(this.props.match.url.replace('/channels/', '/messages/'));
    }

    goToGroup = async ({match, history}) => {
        const {identifier} = match.params;
        const channelName = identifier.toLowerCase();
        let channel = ChannelStore.getByName(channelName);
        if (!channel) {
            const {data, error} = await joinChannel(UserStore.getCurrentId(), TeamStore.getCurrentId(), null, channelName)(dispatch, getState);
            if (error) {
                this.handleError(match, history);
                return;
            }
            channel = data.channel;
        }

        this.setState({
            groupInfo: channel,
        });
        this.doGroupChange(channel);
    }

    render() {
        if (!this.state.groupInfo) {
            return <div/>;
        }
        return <ChannelView/>;
    }
}
