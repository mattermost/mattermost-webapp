// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import AsyncSelect from 'react-select/lib/Async';

import {Constants} from 'utils/constants';

import PublicChannelIcon from 'components/svg/globe_icon.jsx';
import PrivateChannelIcon from 'components/svg/lock_icon.jsx';

import './channels_input.scss';

export default class ChannelsInput extends React.Component {
    static propTypes = {
        placeholder: PropTypes.string,
        channelsLoader: PropTypes.func,
        onChange: PropTypes.func,
        value: PropTypes.arrayOf(PropTypes.object),
    }

    components = {
        IndicatorsContainer: () => null,
    };

    getOptionValue = (channel) => channel.id
    formatOptionLabel = (channel) => {
        let icon = <PublicChannelIcon className='public-channel-icon'/>;
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            icon = <PrivateChannelIcon className='private-channel-icon'/>;
        }
        return (
            <React.Fragment>
                {icon}
                {channel.display_name}
            </React.Fragment>
        );
    }

    onChange = (value) => {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    render() {
        return (
            <AsyncSelect
                styles={this.customStyles}
                onChange={this.onChange}
                loadOptions={this.props.channelsLoader}
                isMulti={true}
                isClearable={false}
                className='ChannelsInput'
                classNamePrefix='channels-input'
                placeholder={this.props.placeholder}
                components={this.components}
                getOptionValue={this.getOptionValue}
                formatOptionLabel={this.formatOptionLabel}
                defaultOptions={true}
                value={this.props.value}
            />
        );
    }
}
