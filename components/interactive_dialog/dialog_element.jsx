// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage} from 'react-intl';

import MenuActionProvider from 'components/suggestion/menu_action_provider';
import GenericUserProvider from 'components/suggestion/generic_user_provider.jsx';
import GenericChannelProvider from 'components/suggestion/generic_channel_provider.jsx';

import TextSetting from 'components/widgets/settings/text_setting';
import AutocompleteSelector from 'components/widgets/settings/autocomplete_selector';

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
    }

    constructor(props) {
        super(props);

        this.providers = [];
        if (props.type === 'select') {
            if (props.dataSource === 'users') {
                this.providers = [new GenericUserProvider()];
            } else if (props.dataSource === 'channels') {
                this.providers = [new GenericChannelProvider()];
            } else if (props.options) {
                this.providers = [new MenuActionProvider(props.options)];
            }
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
        } = this.props;

        let {type, maxLength} = this.props;

        let displayNameContent = displayName;
        if (optional) {
            displayNameContent = (
                <React.Fragment>
                    {displayName + ' '}
                    <FormattedMessage
                        id='interactive_dialog.element.optional'
                        defaultMessage='(optional)'
                    />
                </React.Fragment>
            );
        } else {
            displayNameContent = (
                <React.Fragment>
                    {displayName}
                    <span style={{color: 'red'}}>{' *'}</span>
                </React.Fragment>
            );
        }

        let helpTextContent = helpText;
        if (errorText) {
            helpTextContent = (
                <React.Fragment>
                    {helpText}
                    <div style={{color: 'red'}}>
                        {errorText}
                    </div>
                </React.Fragment>
            );
        }

        if (type === 'text' || type === 'textarea') {
            if (type === 'text') {
                maxLength = maxLength || TEXT_DEFAULT_MAX_LENGTH;

                if (subtype) {
                    type = subtype;
                } else {
                    type = 'input';
                }
            } else {
                maxLength = maxLength || TEXTAREA_DEFAULT_MAX_LENGTH;
            }

            return (
                <TextSetting
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
                    onChange={onChange}
                    value={value}
                />
            );
        }

        return null;
    }
}
