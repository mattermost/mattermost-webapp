// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import ChannelStore from 'stores/channel_store.jsx';
import {sortChannelsByDisplayName} from 'utils/channel_utils.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

export default class ChannelSelect extends React.Component {
    static get propTypes() {
        return {
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

    constructor(props) {
        super(props);

        this.handleChannelChange = this.handleChannelChange.bind(this);
        this.filterChannels = this.filterChannels.bind(this);

        this.state = {
            channels: ChannelStore.getAll().filter(this.filterChannels).sort(sortChannelsByDisplayName),
        };
    }

    componentDidMount() {
        ChannelStore.addChangeListener(this.handleChannelChange);
    }

    componentWillUnmount() {
        ChannelStore.removeChangeListener(this.handleChannelChange);
    }

    handleChannelChange() {
        this.setState({
            channels: ChannelStore.getAll().
                filter(this.filterChannels).sort(sortChannelsByDisplayName),
        });
    }

    filterChannels(channel) {
        if (channel.display_name) {
            return true;
        }

        return false;
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

        this.state.channels.forEach((channel) => {
            if (channel.type === Constants.OPEN_CHANNEL && this.props.selectOpen) {
                options.push(
                    <option
                        key={channel.id}
                        value={channel.id}
                    >
                        {channel.display_name}
                    </option>
                );
            } else if (channel.type === Constants.PRIVATE_CHANNEL && this.props.selectPrivate) {
                options.push(
                    <option
                        key={channel.id}
                        value={channel.id}
                    >
                        {channel.display_name}
                    </option>
                );
            } else if (channel.type === Constants.DM_CHANNEL && this.props.selectDm) {
                options.push(
                    <option
                        key={channel.id}
                        value={channel.id}
                    >
                        {channel.display_name}
                    </option>
                );
            }
        });

        return (
            <select
                className='form-control'
                value={this.props.value}
                onChange={this.props.onChange}
            >
                {options}
            </select>
        );
    }
}
