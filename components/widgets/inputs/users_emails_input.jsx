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
import CloseCircleSolidIcon from 'components/svg/close_circle_solid_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import {imageURLForUser, getDisplayName, getLongDisplayNameParts} from 'utils/utils.jsx';

import {t} from 'utils/i18n.jsx';
import {isGuest} from 'utils/utils';

import './users_emails_input.scss';

export default class UsersEmailsInput extends React.Component {
    static propTypes = {
        placeholder: PropTypes.string,
        usersLoader: PropTypes.func,
        onChange: PropTypes.func,
        value: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string])),
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

    static defaultProps = {
        noMatchMessageId: t('widgets.users_emails_input.no_user_found_matching'),
        noMatchMessageDefault: 'No one found matching **{text}**, type email address',
        validAddressMessageId: t('widgets.users_emails_input.valid_email'),
        validAddressMessageDefault: 'Add **{email}**',
        loadingMessageId: t('widgets.users_emails_input.loading'),
        loadingMessageDefault: 'Loading',
    };

    renderUserName = (user) => {
        const parts = getLongDisplayNameParts(user);
        let fullName = null;
        if (parts.fullName) {
            fullName = (<span className='fullname'>{parts.fullName}</span>);
        }
        let nickname = null;
        if (parts.nickname) {
            nickname = (<span className='nickname'>{parts.nickname}</span>);
        }

        return (
            <>
                {parts.displayName}
                {fullName}
                {nickname}
            </>
        );
    }

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

    getOptionValue = (user) => {
        return user.id || user.value;
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

        let guestBadge = null;
        if (!isEmail(user.value) && isGuest(user)) {
            guestBadge = <GuestBadge/>;
        }

        if (options.context === 'menu') {
            if (user.value && isEmail(user.value)) {
                return this.getCreateLabel(user.value);
            }
            return (
                <React.Fragment>
                    {avatar}
                    {this.renderUserName(user)}
                    {guestBadge}
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
                {getDisplayName(user)}
                {guestBadge}
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
                id={this.props.validAddressMessageId}
                defaultMessage={this.props.validAddressMessageDefault}
                values={{email: value}}
            />
        </React.Fragment>
    );

    NoOptionsMessage = (props) => {
        const inputValue = props.selectProps.inputValue;
        if (!inputValue) {
            return null;
        }
        return (
            <div className='users-emails-input__option users-emails-input__option--no-matches'>
                <FormattedMarkdownMessage
                    id={this.props.noMatchMessageId}
                    defaultMessage={this.props.noMatchMessageDefault}
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
                defaultOptions={false}
                defaultMenuIsOpen={false}
                openMenuOnClick={false}
                loadingMessage={this.loadingMessage}
                tabSelectsValue={true}
                value={values}
            />
        );
    }
}
