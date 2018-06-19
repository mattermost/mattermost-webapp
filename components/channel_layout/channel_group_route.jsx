// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {joinChannel} from 'mattermost-redux/actions/channels';

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

export default class ChannelAndGroupRoute extends React.PureComponent {
    static propTypes = {
        byName: PropTypes.bool,
        byId: PropTypes.bool,
        asGroup: PropTypes.bool,

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            basicViewInfo: null,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.match.params.identifier !== prevState.identifier) {
            return {
                basicViewInfo: null,
                identifier: nextProps.match.params.identifier,
            };
        }
        return null;
    }

    componentDidMount() {
        this.goToChannelOrGroup();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.identifier !== this.props.match.params.identifier) {
            this.goToChannelOrGroup();
        }
    }

    handleError = (match) => {
        const {team} = match.params;
        this.props.history.push(team ? `/${team}/channels/${Constants.DEFAULT_CHANNEL}` : '/');
    }

    simulateChannelClick(channel) {
        GlobalActions.emitChannelClickEvent(channel);
    }

    goToChannelOrGroup = async () => {
        // console.log(match, history);
        let basicViewInfo;
        let basicViewInfoResponse;
        const {team, identifier} = this.props.match.params;
        if (this.props.byName) {
            const channelName = identifier.toLowerCase();
            basicViewInfo = ChannelStore.getByName(channelName);
            if (!basicViewInfo) {
                basicViewInfoResponse = await joinChannel(UserStore.getCurrentId(), TeamStore.getCurrentId(), null, channelName)(dispatch, getState);
            }
        } else if (this.props.byId) {
            const channelId = identifier.toLowerCase();
            basicViewInfo = ChannelStore.get(channelId);
            if (!basicViewInfo) {
                basicViewInfoResponse = await joinChannel(UserStore.getCurrentId(), TeamStore.getCurrentId(), channelId, null)(dispatch, getState);
            }
        } else if (this.props.asGroup) {
            const groupName = identifier.toLowerCase();
            basicViewInfo = ChannelStore.getByName(groupName);
            if (!basicViewInfo) {
                basicViewInfoResponse = await joinChannel(UserStore.getCurrentId(), TeamStore.getCurrentId(), null, groupName)(dispatch, getState);
            }
        }

        basicViewInfo = basicViewInfo || basicViewInfoResponse.data.channel;

        if (basicViewInfoResponse && basicViewInfoResponse.error) {
            this.handleError(this.props.match);
            return;
        }

        if (basicViewInfo.type === Constants.DM_CHANNEL) {
            this.props.history.replace(`/${team}/messages/${Utils.getUserIdFromChannelId(basicViewInfo.name)}`);
        } else if (this.props.byId) {
            this.props.history.replace(`/${team}/channels/${basicViewInfo.name}`);
        }

        this.simulateChannelClick(basicViewInfo);

        this.setState({
            basicViewInfo,
        });
    }

    render() {
        if (!this.state.basicViewInfo) {
            return <LoadingScreen/>;
        }
        return <ChannelView/>;
    }
}
