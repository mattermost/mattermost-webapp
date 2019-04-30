// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import AsyncSelect from 'react-select/lib/AsyncCreatable';
import {components} from 'react-select';
import {intlShape} from 'react-intl';

import {isEmail} from 'mattermost-redux/utils/helpers';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import MailIcon from 'components/svg/mail_icon';
import MailPlusIcon from 'components/svg/mail_plus_icon';
import {imageURLForUser} from 'utils/utils.jsx';

import {t} from 'utils/i18n.jsx';

import './users_emails_input.scss';

export default class UsersEmailsInput extends React.Component {
    static propTypes = {
        placeholder: PropTypes.string,
        usersLoader: PropTypes.func,
        onChange: PropTypes.func,
        value: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string])),
        noOptionsMessageId: PropTypes.string,
        noOptionsMessageDefault: PropTypes.string,
        noMatchMessageId: PropTypes.string,
        noMatchMessageDefault: PropTypes.string,
        validAddressMessageId: PropTypes.string,
        validAddressMessageDefault: PropTypes.string,
        loadingMessageId: PropTypes.string,
        loadingMessageDefault: PropTypes.string,
    }

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    loadingMessage = () => {
        if (!this.context.intl) {
            return 'Loading';
        }

        return this.context.intl.formatMessage({
            id: this.props.loadingMessageId || t('widgets.users_emails_input.loading'),
            defaultMessage: this.props.loadingMessageDefault || 'Loading',
        });
    }

    getOptionValue = (user) => {
        return user.id || user.value;
    }

    formatUserName = (user) => {
        let displayName = '@' + user.username + ' - ' + user.first_name + ' ' + user.last_name;
        if (user.nickname) {
            displayName = displayName + ' (' + user.nickname + ')';
        }
        return displayName;
    }

    formatShortUserName = (user) => {
        if (user.first_name || user.last_name) {
            return user.first_name + ' ' + user.last_name;
        }
        return user.username;
    }

    formatOptionLabel = (user, options) => {
        const profileImg = imageURLForUser(user);
        const avatar = (
            <img
                className='avatar'
                alt={`${user.username || 'user'} profile image`}
                src={profileImg}
            />
        );

        if (options.context === 'menu') {
            if (user.value && isEmail(user.value)) {
                return this.getCreateLabel(user.value);
            }
            return (
                <React.Fragment>
                    {avatar}
                    {this.formatUserName(user)}
                </React.Fragment>
            );
        }

        if (user.value && isEmail(user.value)) {
            return (
                <React.Fragment>
                    <MailIcon className='mail-icon'/>
                    <span>{user.value}</span>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                {avatar}
                {this.formatShortUserName(user)}
            </React.Fragment>
        );
    }

    onChange = (value) => {
        if (this.props.onChange) {
            this.props.onChange(value.map((v) => {
                if (v.id) {
                    return v;
                }
                return v.value;
            }));
        }
    }

    getCreateLabel = (value) => (
        <React.Fragment>
            <MailPlusIcon className='mail-plus-icon'/>
            <FormattedMarkdownMessage
                key='widgets.users_emails_input.valid_email'
                id={this.props.validAddressMessageId || t('widgets.users_emails_input.valid_email')}
                defaultMessage={this.props.validAddressMessageDefault || 'Add **{email}** email address'}
                values={{email: value}}
            />
        </React.Fragment>
    );

    NoOptionsMessage = (props) => {
        const inputValue = props.selectProps.inputValue;
        if (inputValue) {
            return (
                <div className='users-emails-input__option'>
                    <FormattedMarkdownMessage
                        id={this.props.noMatchMessageId || t('widgets.users_emails_input.no_user_found_matching')}
                        defaultMessage={this.props.noMatchMessageDefault || 'No one found matching **{text}**, type another string or an email address'}
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
        }
        return (
            <div className='users-emails-input__option'>
                <FormattedMarkdownMessage
                    id={this.props.noOptionsMessageId || t('widgets.users_emails_input.empty')}
                    defaultMessage={this.props.noOptionsMessageDefault || 'Type a text to find a user or type an email'}
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

    components = {
        NoOptionsMessage: this.NoOptionsMessage,
        IndicatorsContainer: () => null,
    };

    render() {
        const values = this.props.value.map((v) => {
            if (v.id) {
                return v;
            }
            return {label: v, value: v};
        });
        return (
            <AsyncSelect
                styles={this.customStyles}
                onChange={this.onChange}
                loadOptions={this.props.usersLoader}
                isValidNewOption={isEmail}
                isMulti={true}
                isClearable={false}
                className='UsersEmailsInput'
                classNamePrefix='users-emails-input'
                placeholder={this.props.placeholder}
                components={this.components}
                getOptionValue={this.getOptionValue}
                formatOptionLabel={this.formatOptionLabel}
                defaultOptions={true}
                loadingMessage={this.loadingMessage}
                value={values}
            />
        );
    }
}
