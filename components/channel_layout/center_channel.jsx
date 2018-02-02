// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';

import ChannelView from 'components/channel_view';
import PermalinkView from 'components/permalink_view';
import ChannelStore from 'stores/channel_store';
import TeamStore from 'stores/team_store';
import BrowserStore from 'stores/browser_store';
import Constants from 'utils/constants';
import Navbar from 'components/navbar';
import ChannelIdentifierRouter from 'components/channel_layout/channel_identifier_router';

export default class CenterChannel extends React.PureComponent {
    static propTypes = {
        params: PropTypes.object
    };

    toLastChannel = () => {
        let channelName = Constants.DEFAULT_CHANNEL;
        const team = TeamStore.getByName(this.props.params.match.params.team);
        if (team) {
            const channelId = BrowserStore.getGlobalItem(team.id);
            const channel = ChannelStore.getChannelById(channelId);
            if (channel) {
                channelName = channel.name;
            }
        }
        return `${this.props.params.match.url}/channels/${channelName}`;
    }

    render() {
        const url = this.props.params.match.url;
        return (
            <div
                id='inner-wrap-webrtc'
                key='inner-wrap'
                className='inner-wrap channel__wrap'
            >
                <div className='row header'>
                    <div id='navbar'>
                        <Navbar/>
                    </div>
                </div>
                <div className='row main'>
                    <Switch>
                        <Route
                            path={`${url}/channels/:channel`}
                            component={ChannelView}
                        />
                        <Route
                            path={`${url}/pl/:postid`}
                            component={PermalinkView}
                        />
                        <Route
                            path={'/:team/messages/:identifier'}
                            component={ChannelIdentifierRouter}
                        />
                        <Redirect to={this.toLastChannel()}/>
                    </Switch>
                </div>
            </div>
        );
    }
}
