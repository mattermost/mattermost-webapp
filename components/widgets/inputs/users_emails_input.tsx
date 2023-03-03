// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {RefObject} from 'react';
import {FormattedMessage} from 'react-intl';
import {components, InputActionMeta, FormatOptionLabelMeta, ValueType, OptionsType, Styles} from 'react-select';
import AsyncCreatable from 'react-select/async-creatable';
import classNames from 'classnames';

import GuestTag from 'components/widgets/tag/guest_tag';

import BotTag from 'components/widgets/tag/bot_tag';

import {isEmail} from 'mattermost-redux/utils/helpers';
import {UserProfile} from '@mattermost/types/users';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import MailIcon from 'components/widgets/icons/mail_icon';
import MailPlusIcon from 'components/widgets/icons/mail_plus_icon';
import CloseCircleSolidIcon from 'components/widgets/icons/close_circle_solid_icon';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import Avatar from 'components/widgets/users/avatar';
import {imageURLForUser, getDisplayName, getLongDisplayNameParts} from 'utils/utils';

import {t} from 'utils/i18n';
import {isGuest} from 'mattermost-redux/utils/user_utils';

import './users_emails_input.scss';

type Props = {
    placeholder: string;
    ariaLabel: string;
    usersLoader: (search: string, callback: (users: UserProfile[]) => void) => Promise<UserProfile[]> | undefined;
    onUsersLoad?: (users: UserProfile[]) => void;
    onBlur?: () => void;
    onChange: (change: Array<UserProfile | string>) => void;
    showError?: boolean;
    errorMessageId: string;
    errorMessageDefault: string;
    errorMessageValues?: Record<string, React.ReactNode>;
    value: Array<UserProfile | string>;
    onInputChange: (change: string) => void;
    inputValue: string;
    noMatchMessageId?: string;
    noMatchMessageDefault?: string;
    validAddressMessageId?: string;
    validAddressMessageDefault?: string;
    loadingMessageId?: string;
    loadingMessageDefault?: string;
    emailInvitationsEnabled: boolean;
    extraErrorText?: React.ReactNode;
    autoFocus?: boolean;
    suppressNoOptionsMessage?: boolean;
}

export type EmailInvite = {
    value: string;
    label: string;
}

type State = {
    options: UserProfile[];
}

export default class UsersEmailsInput extends React.PureComponent<Props, State> {
    static defaultProps = {
        noMatchMessageId: t('widgets.users_emails_input.no_user_found_matching'),
        noMatchMessageDefault: 'No one found matching **{text}**. Enter their email to invite them.',
        validAddressMessageId: t('widgets.users_emails_input.valid_email'),
        validAddressMessageDefault: 'Add **{email}**',
        loadingMessageId: t('widgets.users_emails_input.loading'),
        loadingMessageDefault: 'Loading',
        showError: false,
    };
    private selectRef: RefObject<AsyncCreatable<UserProfile | EmailInvite> & {handleInputChange: (newValue: string, actionMeta: InputActionMeta | {action: 'custom'}) => string}>;

    constructor(props: Props) {
        super(props);
        this.selectRef = React.createRef();
        this.state = {
            options: [],
        };
    }

    renderUserName = (user: UserProfile) => {
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

    loadingMessage = (): string => {
        const text = (
            <FormattedMessage
                id={this.props.loadingMessageId}
                defaultMessage={this.props.loadingMessageDefault}
            />
        );

        // faking types to satisfy the interface for the version of react-select we are on.
        return (<LoadingSpinner text={text}/>) as unknown as string;
    }

    getOptionValue = (user: UserProfile | EmailInvite): string => {
        if (user.hasOwnProperty('id')) {
            return (user as UserProfile).id;
        }
        return (user as EmailInvite).value;
    }

    formatOptionLabel = (user: UserProfile | EmailInvite, options: FormatOptionLabelMeta<UserProfile | EmailInvite>) => {
        const profileImg = imageURLForUser((user as UserProfile).id, (user as UserProfile).last_picture_update);
        let guestBadge = null;
        let botBadge = null;

        if ((user as UserProfile).is_bot) {
            botBadge = <BotTag/>;
        }

        if (!isEmail((user as EmailInvite).value) && isGuest((user as UserProfile).roles)) {
            guestBadge = <GuestTag/>;
        }

        if (options.context === 'menu') {
            if ((user as EmailInvite).value && isEmail((user as EmailInvite).value)) {
                return this.getCreateLabel((user as EmailInvite).value);
            }
            return (
                <React.Fragment>
                    <Avatar
                        size='lg'
                        username={(user as UserProfile).username}
                        url={profileImg}
                    />
                    {this.renderUserName(user as UserProfile)}
                    {botBadge}
                    {guestBadge}
                </React.Fragment>
            );
        }

        if ((user as EmailInvite).value && isEmail((user as EmailInvite).value)) {
            return (
                <React.Fragment>
                    <MailIcon className='mail-icon'/>
                    <span>{(user as EmailInvite).value}</span>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <Avatar
                    size='sm'
                    username={(user as UserProfile).username}
                    url={profileImg}
                />
                {getDisplayName(user as UserProfile)}
                {botBadge}
                {guestBadge}
            </React.Fragment>
        );
    }

    onChange = (value: ValueType<UserProfile | EmailInvite>) => {
        if (this.props.onChange) {
            if (value) {
                this.props.onChange((value as Array<UserProfile | EmailInvite>).map((v) => {
                    if ((v as UserProfile).id) {
                        return v as UserProfile;
                    }
                    return (v as EmailInvite).value;
                }));
            } else {
                this.props.onChange([]);
            }
        }
    }

    getCreateLabel = (value: string) => (
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

    NoOptionsMessage = (props: Record<string, any>) => {
        const inputValue = props.selectProps.inputValue;
        if (!inputValue) {
            return null;
        }

        const Msg: any = components.NoOptionsMessage;
        return (
            <div className='users-emails-input__option users-emails-input__option--no-matches'>
                <Msg {...props}>
                    <FormattedMarkdownMessage
                        id={this.props.noMatchMessageId}
                        defaultMessage={this.props.noMatchMessageDefault}
                        values={{text: inputValue}}
                        disableLinks={true}
                    />
                </Msg>
            </div>
        );
    };

    MultiValueRemove = ({children, innerProps}: {children: React.ReactNode | React.ReactNodeArray; innerProps: Record<string, any>}) => (
        <div {...innerProps}>
            {children || <CloseCircleSolidIcon/>}
        </div>
    );

    components = {
        NoOptionsMessage: this.props.suppressNoOptionsMessage ? () => null : this.NoOptionsMessage,
        MultiValueRemove: this.MultiValueRemove,
        IndicatorsContainer: () => null,
    };

    handleInputChange = (inputValue: string, action: InputActionMeta) => {
        if (action.action === 'input-blur' && inputValue !== '') {
            const values: Array<UserProfile | EmailInvite> = this.props.value.map((v) => {
                if ((v as UserProfile).id) {
                    return v as UserProfile;
                }
                const emailInvite: EmailInvite = {label: v, value: v} as EmailInvite;
                return emailInvite;
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

    optionsLoader = (_input: string, callback: (options: UserProfile[]) => void) => {
        const customCallback = (options: UserProfile[]) => {
            this.setState({options});
            const accessibleProfiles = options.map((user: UserProfile) => ({...user, label: user.username}));
            callback(accessibleProfiles);
            if (this.props.onUsersLoad) {
                this.props.onUsersLoad(options);
            }
        };
        const result = this.props.usersLoader(this.props.inputValue, customCallback);
        if (result && result.then) {
            result.then(customCallback);
        }
    }

    showAddEmail = (inputValue: string, value: ValueType<UserProfile | EmailInvite>, options: OptionsType<UserProfile | EmailInvite>): boolean => {
        return this.props.emailInvitationsEnabled && options.length === 0 && isEmail(inputValue);
    }

    onFocus = () => {
        this.selectRef.current?.handleInputChange(this.props.inputValue, {action: 'custom'});
    }

    onBlur = () => {
        this.selectRef.current?.handleInputChange(this.props.inputValue, {action: 'input-blur'});
        if (this.props.onBlur) {
            this.props.onBlur();
        }
    }

    render() {
        const values: Array<UserProfile | EmailInvite> = this.props.value.map((v) => {
            if ((v as UserProfile).id) {
                return v as UserProfile;
            }
            return {label: v as string, value: v as string};
        });

        const Msg: any = components.NoOptionsMessage;

        const styles: Partial<Styles> = {
            placeholder: (css) => ({
                ...css,

                pointerEvents: 'none',
                userSelect: 'none',
            }),
            input: (css) => ({
                ...css,

                display: 'flex',
                flex: '1 1 auto',

                '> div': {
                    width: '100%',
                },

                input: {
                    width: '100% !important',
                    textAlign: 'left',
                },
            }),
        };

        return (
            <>
                <AsyncCreatable
                    ref={this.selectRef}
                    onChange={this.onChange}
                    loadOptions={this.optionsLoader}
                    isValidNewOption={this.showAddEmail}
                    isMulti={true}
                    isClearable={false}
                    className={classNames(
                        'UsersEmailsInput',
                        this.props.showError ? 'error' : '',
                        {empty: this.props.inputValue === ''},
                        {'no-selections': values.length === 0},
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
                    autoFocus={this.props.autoFocus}
                    styles={styles}
                />
                {this.props.showError && (
                    <div className='InputErrorBox'>
                        <Msg>
                            <FormattedMarkdownMessage
                                id={this.props.errorMessageId}
                                defaultMessage={this.props.errorMessageDefault}
                                values={this.props.errorMessageValues}
                                disableLinks={true}
                            />
                        </Msg>
                        {this.props.extraErrorText || null}
                    </div>
                )}
            </>
        );
    }
}
