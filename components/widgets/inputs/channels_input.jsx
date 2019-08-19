// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import AsyncSelect from 'react-select/lib/Async';
import {intlShape} from 'react-intl';
import {components} from 'react-select';

import {Constants} from 'utils/constants';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import PublicChannelIcon from 'components/svg/globe_icon.jsx';
import PrivateChannelIcon from 'components/svg/lock_icon.jsx';
import CloseCircleSolidIcon from 'components/svg/close_circle_solid_icon';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';

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

    static defaultProps = {
        loadingMessageId: t('widgets.channels_input.loading'),
        loadingMessageDefault: 'Loading',
        noOptionsMessageId: t('widgets.channels_input.empty'),
        noOptionsMessageDefault: 'No channels found',
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    getOptionValue = (channel) => channel.id

    loadingMessage = () => {
        let text = 'Loading';
        if (this.context.intl) {
            text = this.context.intl.formatMessage({
                id: this.props.loadingMessageId,
                defaultMessage: this.props.loadingMessageDefault,
            });
        }

        return (<LoadingSpinner text={text}/>);
    }

    NoOptionsMessage = (props) => {
        const inputValue = props.selectProps.inputValue;
        if (!inputValue) {
            return null;
        }
        return (
            <div className='channels-input__option channels-input__option--no-matches'>
                <FormattedMarkdownMessage
                    id={this.props.noOptionsMessageId}
                    defaultMessage={this.props.noOptionsMessageDefault}
                    values={{text: inputValue}}
                >
                    {(message) => (
                        <components.NoOptionsMessage {...props}>
                            {message}
                        </components.NoOptionsMessage>
                    )}
                </FormattedMarkdownMessage>
            </div>
        );
    };

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

    MultiValueRemove = ({children, innerProps}) => (
        <div {...innerProps}>
            {children || <CloseCircleSolidIcon/>}
        </div>
    );

    components = {
        NoOptionsMessage: this.NoOptionsMessage,
        MultiValueRemove: this.MultiValueRemove,
        IndicatorsContainer: () => null,
    };

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
                defaultOptions={false}
                defaultMenuIsOpen={false}
                openMenuOnClick={false}
                tabSelectsValue={true}
                value={this.props.value}
            />
        );
    }
}
