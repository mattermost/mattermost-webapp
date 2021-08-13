// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {ReactElement} from 'react';

import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';
import {components, OptionsType, OptionTypeBase, Styles, ValueType} from 'react-select';
import {Props as AsyncSelectProps} from 'react-select/async';

import {AppSelectOption} from 'mattermost-redux/types/apps';

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

import AsyncSelect from 'react-select/lib/AsyncCreatable';

type Option = {
    id?: string;
    email?: string;
    username?: string;
    value: string;
    label?: string;
}

interface IOptionType extends OptionTypeBase {
    id?: string;
    email?: string;
    username?: string;
    value: string;
    label?: string;
}
type UserEmailInputState = {
    options: Option[];
}


type Props = {
    placeholder: string;
    ariaLabel: string;
    usersLoader: (input: string, customCallback: (options: OptionsType<AppSelectOption>) => void) => Promise<void>;
    onChange: (input: Array<(Option| string)>) => string;
    showError: boolean;
    errorMessageId: string;
    errorMessageDefault: string;
    errorMessageValues: Record<string, string>;
    value: Array<(Option)>;
    onInputChange: (input: string) => void;
    inputValue: string;
    noMatchMessageId: string;
    noMatchMessageDefault: string;
    validAddressMessageId: string;
    validAddressMessageDefault: string;
    loadingMessageId: string;
    loadingMessageDefault: string;
    emailInvitationsEnabled: boolean;
    extraErrorText: string;
}

export default class UsersEmailsInput extends React.PureComponent<Props> {
    selectRef: React.RefObject<UsersEmailsInput>
    state: UserEmailInputState;
    customStyles?: Partial<Styles>

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
        extraErrorText: PropTypes.any,
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

    constructor(props: Props) {
        super(props);
        this.selectRef = React.createRef();
        this.state = {
            options: [],
        };
    }

    renderUserName = (user: IOptionType): React.ReactFragment => {
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

    loadingMessage = (): JSX.Element => {
        const text = (
            <FormattedMessage
                id={this.props.loadingMessageId}
                defaultMessage={this.props.loadingMessageDefault}
            />
        );

        return (<LoadingSpinner text={text}/>);
    }

    getOptionValue = (user: IOptionType) => {
        return user.id || user.value;
    }

    formatOptionLabel = (user: IOptionType, options: {context: string}): React.ReactFragment => {
        const profileImg = imageURLForUser(user.id, user.last_picture_update);
        let guestBadge = null;
        let botBadge = null;

        if (user.is_bot) {
            botBadge = <BotBadge/>;
        }

        if (!isEmail(user?.value || '') && isGuest(user)) {
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

    onChange = (value: Array<Option|string>): void => {
        if (this.props.onChange) {
            this.props.onChange(value.map((v): string => {
                if (typeof v === 'string') {
                    return v;
                }
                if (v instanceof Option) {
                    return v.text;
                }
                return v.value;
            }));
        }
    }

    getCreateLabel = (value: string): React.ReactFragment => (
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

    NoOptionsMessage = ({selectProps, props}: {
        selectProps: {inputValue?: string};
        props?: any;
    }): ReactElement|null => {
        const inputValue = selectProps.inputValue;
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
                    {(message: string) => (
                        <components.NoOptionsMessage {...props}>
                            {message}
                        </components.NoOptionsMessage>
                    )}
                </FormattedMarkdownMessage>
            </div>
        );
    };

    MultiValueRemove = ({children, innerProps}: {children: React.ReactElement; innerProps: unknown}): ReactElement => (
        <div {...innerProps}>
            {children || <CloseCircleSolidIcon/>}
        </div>
    );

    components = {
        NoOptionsMessage: this.NoOptionsMessage,
        MultiValueRemove: this.MultiValueRemove,
        IndicatorsContainer: () => null,
    };

    handleInputChange = (inputValue: IOptionType, action: {action: string}): void => {
        if (action.action === 'input-blur') {
            const values = this.props.value;

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
            this.props.onInputChange(inputValue.value);
        }
    }

    optionsLoader = (_: string, callback: (options: OptionsType<AppSelectOption>) => void ) => {
        const customCallback = (options: OptionsType<AppSelectOption>) => {
            this.setState({options});
            callback(options);
        };
        return this.props.usersLoader(this.props.inputValue, customCallback);
    }

    showAddEmail = (input: string, _:any, options: any[]): boolean => {
        return this.props.emailInvitationsEnabled && options.length === 0 && isEmail(input);
    }

    onFocus = () => {
        this.selectRef.current?.handleInputChange({value: this.props.inputValue}, {action: 'custom'});
    }

    onBlur = () => {
        this.selectRef.current?.handleInputChange({value: this.props.inputValue}, {action: 'input-blur'});

    }

    public render(): JSX.Element {
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
                    onChange={(value: ValueType<IOptionType>) => this.onChange([value?.values])}

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
                    loadingMessage={
                        this.loadingMessage
                    }
                    onInputChange={
                        this.handleInputChange
                    }
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
                            {(message: string) => (
                                <components.NoOptionsMessage >
                                    {message}
                                </components.NoOptionsMessage>
                            )}
                        </FormattedMarkdownMessage>
                        {this.props.extraErrorText || null}
                    </div>
                )}
            </>
        );
    }
}
