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
import LoadingScreen from 'components/loading_screen.jsx';
import * as Utils from 'utils/utils.jsx';

const dispatch = store.dispatch;
const getState = store.getState;
const POSTS_PER_PAGE = Constants.POST_CHUNK_SIZE / 2;

export default class ChannelRoute extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            channelInfo: null,
        };
    }

    componentDidMount() {
        this.goToChannel({match: this.props.match, history: this.props.history});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.match.params.identifier !== this.props.match.params.identifier) {
            this.setState({
                channelInfo: null,
            });
            this.goToChannel({match: nextProps.match, history: nextProps.history});
        }
    }

    handleError = (match) => {
        const {team} = match.params;
        this.props.history.push(team ? `/${team}/channels/${Constants.DEFAULT_CHANNEL}` : '/');
    }

    doChannelChange(channel) {
        getPosts(channel.id, 0, POSTS_PER_PAGE)(dispatch, getState);
        GlobalActions.emitChannelClickEvent(channel);
    }

    goToChannel = async ({match}) => {
        // console.log(match, history);
        let channel;
        const {team, identifier} = match.params;
        if (this.props.byName) {
            const channelName = identifier.toLowerCase();
            channel = ChannelStore.getByName(channelName);
            if (!channel) {
                const {data, error} = await joinChannel(UserStore.getCurrentId(), TeamStore.getCurrentId(), null, channelName)(dispatch, getState);
                if (error) {
                    this.handleError(match);
                    return;
                }
                channel = data.channel;
            }
        } else if (this.props.byId) {
            const channelId = identifier.toLowerCase();
            channel = ChannelStore.get(channelId);
            if (!channel) {
                const {data, error} = await joinChannel(UserStore.getCurrentId(), TeamStore.getCurrentId(), channelId, null)(dispatch, getState);
                if (error) {
                    this.handleError(match);
                    return;
                }
                channel = data.channel;
            }
        }

        if (channel.type === Constants.DM_CHANNEL) {
            this.props.history.replace(`/${team}/messages/${Utils.getUserIdFromChannelId(channel.name)}`);
        } else if (channel.type === Constants.GM_CHANNEL) {
            getPosts(channel.id, 0, POSTS_PER_PAGE)(dispatch, getState);
            this.props.history.replace(`/${team}/messages/${channel.name}`);
        } else {
            this.doChannelChange(channel);
        }

        this.setState({
            channelInfo: channel,
        });
    }

    render() {
        if (!this.state.channelInfo) {
            // TODO: show soem loading state
            return <LoadingScreen style={{height: '0px'}}/>;
        }
        return <ChannelView/>;
    }
}
