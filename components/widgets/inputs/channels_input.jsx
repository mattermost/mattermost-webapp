// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import AsyncSelect from 'react-select/lib/Async';
import {components} from 'react-select';
import classNames from 'classnames';

import {Constants} from 'utils/constants';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import PublicChannelIcon from 'components/widgets/icons/globe_icon.jsx';
import PrivateChannelIcon from 'components/widgets/icons/lock_icon.jsx';
import CloseCircleSolidIcon from 'components/widgets/icons/close_circle_solid_icon';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';

import {t} from 'utils/i18n.jsx';

import './channels_input.scss';

export default class ChannelsInput extends React.PureComponent {
    static propTypes = {
        placeholder: PropTypes.string,
        ariaLabel: PropTypes.string.isRequired,
        channelsLoader: PropTypes.func,
        onChange: PropTypes.func,
        value: PropTypes.arrayOf(PropTypes.object),
        onInputChange: PropTypes.func,
        inputValue: PropTypes.string,
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

    constructor(props) {
        super(props);
        this.selectRef = React.createRef();
        this.state = {
            options: [],
        };
    }

    getOptionValue = (channel) => channel.id

    handleInputChange = (inputValue, action) => {
        if (action.action === 'input-blur' && inputValue !== '') {
            for (const option of this.state.options) {
                if (this.props.inputValue === option.name) {
                    this.onChange([...this.props.value, option]);
                    this.props.onInputChange('');
                    return;
                }
            }
        }
        if (action.action !== 'input-blur' && action.action !== 'menu-close') {
            this.props.onInputChange(inputValue);
        }
    }

    optionsLoader = (input, callback) => {
        const customCallback = (options) => {
            this.setState({options});
            callback(options);
        };
        const result = this.props.channelsLoader(this.props.inputValue, customCallback);
        if (result && result.then) {
            result.then(customCallback);
        }
    }

    loadingMessage = () => {
        const text = (
            <FormattedMessage
                id={this.props.loadingMessageId}
                defaultMessage={this.props.loadingMessageDefault}
            />
        );

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
                <span className='channel-name'>{channel.name}</span>
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

    onFocus = () => {
        this.selectRef.current.handleInputChange(this.props.inputValue, {action: 'custom'});
    }

    render() {
        return (
            <AsyncSelect
                ref={this.selectRef}
                styles={this.customStyles}
                onChange={this.onChange}
                loadOptions={this.optionsLoader}
                isMulti={true}
                isClearable={false}
                className={classNames('ChannelsInput', {empty: this.props.inputValue === ''})}
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
                onInputChange={this.handleInputChange}
                inputValue={this.props.inputValue}
                openMenuOnFocus={true}
                onFocus={this.onFocus}
                tabSelectsValue={true}
                value={this.props.value}
                aria-label={this.props.ariaLabel}
            />
        );
    }
}
