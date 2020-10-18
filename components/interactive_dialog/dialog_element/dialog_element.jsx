// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage} from 'react-intl';

import MenuActionProvider from 'components/suggestion/menu_action_provider';
import GenericUserProvider from 'components/suggestion/generic_user_provider.jsx';
import GenericChannelProvider from 'components/suggestion/generic_channel_provider.jsx';

import TextSetting from 'components/widgets/settings/text_setting';
import AutocompleteSelector from 'components/autocomplete_selector';
import ModalSuggestionList from 'components/suggestion/modal_suggestion_list.jsx';
import BoolSetting from 'components/widgets/settings/bool_setting';
import RadioSetting from 'components/widgets/settings/radio_setting';

const TEXT_DEFAULT_MAX_LENGTH = 150;
const TEXTAREA_DEFAULT_MAX_LENGTH = 3000;

export default class DialogElement extends React.PureComponent {
    static propTypes = {
        displayName: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        subtype: PropTypes.string,
        placeholder: PropTypes.string,
        helpText: PropTypes.string,
        errorText: PropTypes.node,
        maxLength: PropTypes.number,
        dataSource: PropTypes.string,
        optional: PropTypes.bool,
        options: PropTypes.arrayOf(PropTypes.object),
        value: PropTypes.any,
        onChange: PropTypes.func,
        autoFocus: PropTypes.bool,
        actions: PropTypes.shape({
            autocompleteChannels: PropTypes.func.isRequired,
            autocompleteUsers: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        let defaultText = '';
        this.providers = [];
        if (props.type === 'select') {
            if (props.dataSource === 'users') {
                this.providers = [new GenericUserProvider(props.actions.autocompleteUsers)];
            } else if (props.dataSource === 'channels') {
                this.providers = [new GenericChannelProvider(props.actions.autocompleteChannels)];
            } else if (props.options) {
                this.providers = [new MenuActionProvider(props.options)];
            }

            if (props.value && props.options) {
                const defaultOption = props.options.find(
                    (option) => option.value === props.value,
                );
                defaultText = defaultOption ? defaultOption.text : '';
            }
        }

        this.state = {
            value: defaultText,
        };
    }

    handleSelected = (selected) => {
        const {name, dataSource, onChange} = this.props;

        if (dataSource === 'users') {
            onChange(name, selected.id);
            this.setState({value: selected.username});
        } else if (dataSource === 'channels') {
            onChange(name, selected.id);
            this.setState({value: selected.display_name});
        } else {
            onChange(name, selected.value);
            this.setState({value: selected.text});
        }
    }

    render() {
        const {
            name,
            subtype,
            displayName,
            value,
            placeholder,
            onChange,
            helpText,
            errorText,
            optional,
            options,
        } = this.props;

        let {type, maxLength} = this.props;

        let displayNameContent = displayName;
        if (optional) {
            displayNameContent = (
                <React.Fragment>
                    {displayName + ' '}
                    <span className='font-weight--normal light'>
                        <FormattedMessage
                            id='interactive_dialog.element.optional'
                            defaultMessage='(optional)'
                        />
                    </span>
                </React.Fragment>
            );
        } else {
            displayNameContent = (
                <React.Fragment>
                    {displayName}
                    <span className='error-text'>{' *'}</span>
                </React.Fragment>
            );
        }

        let helpTextContent = helpText;
        if (errorText) {
            helpTextContent = (
                <React.Fragment>
                    {helpText}
                    <div className='error-text mt-3'>
                        {errorText}
                    </div>
                </React.Fragment>
            );
        }

        if (type === 'text' || type === 'textarea') {
            if (type === 'text') {
                maxLength = maxLength || TEXT_DEFAULT_MAX_LENGTH;

                if (subtype && TextSetting.validTypes.includes(subtype)) {
                    type = subtype;
                } else {
                    type = 'input';
                }
            } else {
                maxLength = maxLength || TEXTAREA_DEFAULT_MAX_LENGTH;
            }

            return (
                <TextSetting
                    autoFocus={this.props.autoFocus}
                    id={name}
                    type={type}
                    label={displayNameContent}
                    maxLength={maxLength}
                    value={value || ''}
                    placeholder={placeholder}
                    helpText={helpTextContent}
                    onChange={onChange}
                    resizable={false}
                />
            );
        } else if (type === 'select') {
            return (
                <AutocompleteSelector
                    id={name}
                    providers={this.providers}
                    onSelected={this.handleSelected}
                    label={displayNameContent}
                    helpText={helpTextContent}
                    placeholder={placeholder}
                    value={this.state.value}
                    listComponent={ModalSuggestionList}
                    listStyle='bottom'
                />
            );
        } else if (type === 'bool') {
            return (
                <BoolSetting
                    autoFocus={this.props.autoFocus}
                    id={name}
                    label={displayNameContent}
                    value={value || false}
                    helpText={helpTextContent}
                    placeholder={placeholder}
                    onChange={onChange}
                />
            );
        } else if (type === 'radio') {
            return (
                <RadioSetting
                    id={name}
                    label={displayNameContent}
                    helpText={helpTextContent}
                    options={options}
                    value={value}
                    onChange={onChange}
                />
            );
        }

        return null;
    }
}
