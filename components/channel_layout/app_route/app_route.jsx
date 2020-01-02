// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import Pluggable from 'plugins/pluggable';
import ChannelHeader from 'components/channel_header';

export default class AppRouter extends React.PureComponent {
    static propTypes = {

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            params: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                team: PropTypes.string.isRequired,
                channel: PropTypes.string,
            }).isRequired,
        }).isRequired,
        channelId: PropTypes.string,
        actions: PropTypes.shape({
            selectChannel: PropTypes.func.isRequired,
        }).isRequired,
    }

    componentDidMount() {
        if (this.props.channelId) {
            this.props.actions.selectChannel(this.props.channelId);
        }
        document.querySelector('body').classList.add('app__body');
    }

    render() {
        return (
            <div className='app__content'>
                {this.props.channelId && <ChannelHeader channelId={this.props.channelId}/>}
                <Pluggable
                    pluggableName={'App.' + this.props.match.params.identifier}
                    teamName={this.props.match.params.team}
                    channelName={this.props.match.params.channel}
                />
            </div>
        );
    }
}

