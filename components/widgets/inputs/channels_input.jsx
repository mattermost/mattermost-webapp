// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import AsyncSelect from 'react-select/lib/Async';
import {intlShape} from 'react-intl';

import {Constants} from 'utils/constants';

import PublicChannelIcon from 'components/svg/globe_icon.jsx';
import PrivateChannelIcon from 'components/svg/lock_icon.jsx';

import {t} from 'utils/i18n.jsx';

import './channels_input.scss';

export default class ChannelsInput extends React.Component {
    static propTypes = {
        placeholder: PropTypes.string,
        channelsLoader: PropTypes.func,
        onChange: PropTypes.func,
        value: PropTypes.arrayOf(PropTypes.object),
        loadingMessageId: PropTypes.string,
        loadingMessageDefault: PropTypes.string,
        noOptionsMessageId: PropTypes.string,
        noOptionsMessageDefault: PropTypes.string,
    }

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    components = {
        IndicatorsContainer: () => null,
    };

    getOptionValue = (channel) => channel.id

    loadingMessage = () => {
        if (!this.context.intl) {
            return 'Loading';
        }

        return this.context.intl.formatMessage({
            id: this.props.loadingMessageId || t('widgets.channels_input.loading'),
            defaultMessage: this.props.loadingMessageDefault || 'Loading',
        });
    }

    noOptionsMessage = () => {
        if (!this.context.intl) {
            return 'No channels found';
        }

        return this.context.intl.formatMessage({
            id: this.props.noOptionsMessageId || t('widgets.channels_input.empty'),
            defaultMessage: this.props.noOptionsMessageDefault || 'No channels found',
        });
    }

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
                noOptionsMessage={this.noOptionsMessage}
                loadingMessage={this.loadingMessage}
                defaultOptions={true}
                value={this.props.value}
            />
        );
    }
}
