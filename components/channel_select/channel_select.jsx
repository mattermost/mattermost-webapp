// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

export default class ChannelSelect extends React.PureComponent {
    static get propTypes() {
        return {
            channels: PropTypes.array.isRequired,
            onChange: PropTypes.func,
            value: PropTypes.string,
            selectOpen: PropTypes.bool.isRequired,
            selectPrivate: PropTypes.bool.isRequired,
            selectDm: PropTypes.bool.isRequired,
        };
    }

    static get defaultProps() {
        return {
            selectOpen: false,
            selectPrivate: false,
            selectDm: false,
        };
    }

    render() {
        const options = [
            <option
                key=''
                value=''
            >
                {Utils.localizeMessage('channel_select.placeholder', '--- Select a channel ---')}
            </option>,
        ];

        this.props.channels.forEach((channel) => {
            const channelName = channel.display_name || channel.name;
            if (channel.type === Constants.OPEN_CHANNEL && this.props.selectOpen) {
                options.push(
                    <option
                        key={channel.id}
                        value={channel.id}
                    >
                        {channelName}
                    </option>,
                );
            } else if (channel.type === Constants.PRIVATE_CHANNEL && this.props.selectPrivate) {
                options.push(
                    <option
                        key={channel.id}
                        value={channel.id}
                    >
                        {channelName}
                    </option>,
                );
            } else if (channel.type === Constants.DM_CHANNEL && this.props.selectDm) {
                options.push(
                    <option
                        key={channel.id}
                        value={channel.id}
                    >
                        {channelName}
                    </option>,
                );
            }
        });

        return (
            <select
                className='form-control'
                value={this.props.value}
                onChange={this.props.onChange}
                id='channelSelect'
            >
                {options}
            </select>
        );
    }
}
