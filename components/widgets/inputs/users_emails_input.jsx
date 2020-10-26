// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import AsyncSelect from 'react-select/lib/AsyncCreatable';
import {components} from 'react-select';
import classNames from 'classnames';

import {isEmail} from 'mattermost-redux/utils/helpers';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import MailIcon from 'components/widgets/icons/mail_icon';
import MailPlusIcon from 'components/widgets/icons/mail_plus_icon';
import CloseCircleSolidIcon from 'components/widgets/icons/close_circle_solid_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';
import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import Avatar from 'components/widgets/users/avatar';
import {imageURLForUser, getDisplayName, getLongDisplayNameParts} from 'utils/utils.jsx';

import {t} from 'utils/i18n.jsx';
import {isGuest} from 'utils/utils';

import './users_emails_input.scss';

export default class UsersEmailsInput extends React.PureComponent {
    static propTypes = {
        placeholder: PropTypes.string,
        ariaLabel: PropTypes.string.isRequired,
        usersLoader: PropTypes.func,
        onChange: PropTypes.func,
        showError: PropTypes.bool,
        errorMessageId: PropTypes.string,
        errorMessageDefault: PropTypes.string,
        errorMessageValues: PropTypes.object,
        value: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string])),
        onInputChange: PropTypes.func,
        inputValue: PropTypes.string,
        noMatchMessageId: PropTypes.string,
        noMatchMessageDefault: PropTypes.string,
        validAddressMessageId: PropTypes.string,
        validAddressMessageDefault: PropTypes.string,
        loadingMessageId: PropTypes.string,
        loadingMessageDefault: PropTypes.string,
        emailInvitationsEnabled: PropTypes.bool,
    }

    static defaultProps = {
        noMatchMessageId: t('widgets.users_emails_input.no_user_found_matching'),
        noMatchMessageDefault: 'No one found matching **{text}**, type email address',
        validAddressMessageId: t('widgets.users_emails_input.valid_email'),
        validAddressMessageDefault: 'Add **{email}**',
        loadingMessageId: t('widgets.users_emails_input.loading'),
        loadingMessageDefault: 'Loading',
        showError: false,
    };

    constructor(props) {
        super(props);
        this.selectRef = React.createRef();
        this.state = {
            options: [],
        };
    }

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
        const text = (
            <FormattedMessage
                id={this.props.loadingMessageId}
                defaultMessage={this.props.loadingMessageDefault}
            />
        );

        return (<LoadingSpinner text={text}/>);
    }

    getOptionValue = (user) => {
        return user.id || user.value;
    }

    formatOptionLabel = (user, options) => {
        const profileImg = imageURLForUser(user.id, user.last_picture_update);
        let guestBadge = null;
        let botBadge = null;

        if (user.is_bot) {
            botBadge = <BotBadge/>;
        }

        if (!isEmail(user.value) && isGuest(user)) {
            guestBadge = <GuestBadge/>;
        }

        if (options.context === 'menu') {
            if (user.value && isEmail(user.value)) {
                return this.getCreateLabel(user.value);
            }
            return (
                <React.Fragment>
                    <Avatar
                        size='lg'
                        username={user.username}
                        url={profileImg}
                    />
                    {this.renderUserName(user)}
                    {botBadge}
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
                <Avatar
                    size='sm'
                    username={user.username}
                    url={profileImg}
                />
                {getDisplayName(user)}
                {botBadge}
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
                disableLinks={true}
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
                    disableLinks={true}
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

    handleInputChange = (inputValue, action) => {
        if (action.action === 'input-blur' && inputValue !== '') {
            const values = this.props.value.map((v) => {
                if (v.id) {
                    return v;
                }
                return {label: v, value: v};
            });

            for (const option of this.state.options) {
                if (this.props.inputValue === option.username || this.props.inputValue === ('@' + option.username)) {
                    this.onChange([...values, option]);
                    this.props.onInputChange('');
                    return;
                } else if (this.props.inputValue === option.email) {
                    this.onChange([...values, option]);
                    this.props.onInputChange('');
                    return;
                }
            }

            if (this.props.emailInvitationsEnabled && isEmail(this.props.inputValue)) {
                const email = this.props.inputValue;
                this.onChange([...values, {value: email, label: email}]);
                this.props.onInputChange('');
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
        const result = this.props.usersLoader(this.props.inputValue, customCallback);
        if (result && result.then) {
            result.then(customCallback);
        }
    }

    showAddEmail = (input, values, options) => {
        return this.props.emailInvitationsEnabled && options.length === 0 && isEmail(input);
    }

    onFocus = () => {
        this.selectRef.current.handleInputChange(this.props.inputValue, {action: 'custom'});
    }

    onBlur = () => {
        this.selectRef.current.handleInputChange(this.props.inputValue, {action: 'input-blur'});
    }

    render() {
        const values = this.props.value.map((v) => {
            if (v.id) {
                return v;
            }
            return {label: v, value: v};
        });
        return (
            <>
                <AsyncSelect
                    ref={this.selectRef}
                    styles={this.customStyles}
                    onChange={this.onChange}
                    loadOptions={this.optionsLoader}
                    isValidNewOption={this.showAddEmail}
                    isMulti={true}
                    isClearable={false}
                    className={classNames(
                        'UsersEmailsInput',
                        this.props.showError ? 'error' : '',
                        {empty: this.props.inputValue === ''},
                    )}
                    classNamePrefix='users-emails-input'
                    placeholder={this.props.placeholder}
                    components={this.components}
                    getOptionValue={this.getOptionValue}
                    formatOptionLabel={this.formatOptionLabel}
                    defaultOptions={false}
                    defaultMenuIsOpen={false}
                    openMenuOnClick={false}
                    loadingMessage={this.loadingMessage}
                    onInputChange={this.handleInputChange}
                    inputValue={this.props.inputValue}
                    openMenuOnFocus={true}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    tabSelectsValue={true}
                    value={values}
                    aria-label={this.props.ariaLabel}
                />
                {this.props.showError && (
                    <div className='InputErrorBox'>
                        <FormattedMarkdownMessage
                            id={this.props.errorMessageId}
                            defaultMessage={this.props.errorMessageDefault}
                            values={this.props.errorMessageValues || null}
                            disableLinks={true}
                        >
                            {(message) => (
                                <components.NoOptionsMessage>
                                    {message}
                                </components.NoOptionsMessage>
                            )}
                        </FormattedMarkdownMessage>
                    </div>
                )}
            </>
        );
    }
}
