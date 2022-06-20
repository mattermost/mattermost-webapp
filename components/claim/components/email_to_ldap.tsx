// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {AuthChangeResponse} from '@mattermost/types/users';

import {emailToLdap} from 'actions/admin_actions.jsx';

import {localizeMessage} from 'utils/utils';
import {t} from 'utils/i18n';
import {ClaimErrors} from 'utils/constants';

import LoginMfa from 'components/login/login_mfa';
import LocalizedInput from 'components/localized_input/localized_input';

import ErrorLabel from './error_label';

type Props = {
    email: string | null;
    siteName?: string;
    ldapLoginFieldName?: string;
}

export type SubmitOptions = {
    loginId: string;
    password: string;
    token?: string;
    ldapIdParam?: string;
    ldapPasswordParam?: string;
}

const EmailToLDAP = ({email, siteName, ldapLoginFieldName}: Props) => {
    const emailPasswordInput = useRef<HTMLInputElement>(null);
    const ldapIdInput = useRef<HTMLInputElement>(null);
    const ldapPasswordInput = useRef<HTMLInputElement>(null);

    const [password, setPassword] = React.useState('');
    const [ldapId, setLdapId] = React.useState<string>('');
    const [ldapPassword, setLdapPassword] = React.useState<string>('');
    const [passwordError, setPasswordError] = React.useState('');
    const [ldapError, setLdapError] = React.useState('');
    const [ldapPasswordError, setLdapPasswordError] = React.useState('');
    const [serverError, setServerError] = React.useState('');
    const [showMfa, setShowMfa] = React.useState(false);

    const preSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const password = emailPasswordInput.current?.value;
        if (!password) {
            setPasswordError(localizeMessage('claim.email_to_ldap.pwdError', 'Please enter your password.'));
            setLdapError('');
            setLdapPasswordError('');
            setServerError('');
            return;
        }

        const ldapId = ldapIdInput.current?.value.trim();
        if (!ldapId) {
            setLdapError(localizeMessage('claim.email_to_ldap.ldapIdError', 'Please enter your AD/LDAP ID.'));
            setPasswordError('');
            setLdapPasswordError('');
            setServerError('');
            return;
        }

        const ldapPassword = ldapPasswordInput.current?.value;
        if (!ldapPassword) {
            setLdapPasswordError(localizeMessage('claim.email_to_ldap.ldapPasswordError', 'Please enter your AD/LDAP password.'));
            setLdapError('');
            setPasswordError('');
            setServerError('');
            return;
        }

        setPassword(password);
        setLdapId(ldapId);
        setLdapPassword(ldapPassword);

        if (email) {
            submit({loginId: email, password, ldapIdParam: ldapId, ldapPasswordParam: ldapPassword});
        }
    };

    const submit = ({loginId, password, token = '', ldapIdParam = '', ldapPasswordParam = ''}: SubmitOptions) => {
        emailToLdap(
            loginId,
            password,
            token,
            ldapIdParam || ldapId,
            ldapPasswordParam || ldapPassword,
            (data: AuthChangeResponse) => {
                if (data.follow_link) {
                    window.location.href = data.follow_link;
                }
            },
            (err: {server_error_id: string; id: string; message: string}) => {
                if (!showMfa && err.server_error_id === ClaimErrors.MFA_VALIDATE_TOKEN_AUTHENTICATE) {
                    setShowMfa(true);
                } else {
                    switch (err.id) {
                    case ClaimErrors.ENT_LDAP_LOGIN_USER_NOT_REGISTERED:
                    case ClaimErrors.ENT_LDAP_LOGIN_USER_FILTERED:
                    case ClaimErrors.ENT_LDAP_LOGIN_MATCHED_TOO_MANY_USERS:
                        setLdapError(err.message);
                        setShowMfa(false);
                        break;
                    case ClaimErrors.ENT_LDAP_LOGIN_INVALID_PASSWORD:
                        setLdapPasswordError(err.message);
                        setShowMfa(false);
                        break;
                    case ClaimErrors.API_USER_INVALID_PASSWORD:
                        setPasswordError(err.message);
                        setShowMfa(false);
                        break;
                    default:
                        setServerError(err.message);
                        setShowMfa(false);
                    }
                }
            },
        );
    };

    const loginPlaceholder = ldapLoginFieldName || localizeMessage('claim.email_to_ldap.ldapId', 'AD/LDAP ID');
    const titleMessage = {id: t('claim.email_to_ldap.title'), defaultMessage: 'Switch Email/Password Account to AD/LDAP'};
    const placeholderPasswordMessage = {id: t('claim.email_to_ldap.pwd'), defaultMessage: 'Password'};
    const placeholderLdapMessage = {id: t('claim.email_to_ldap.ldapPwd'), defaultMessage: 'AD/LDAP Password'};

    if (showMfa) {
        return (
            <LoginMfa
                loginId={email}
                password={password}
                title={titleMessage}
                onSubmit={submit}
            />
        );
    }
    return (
        <>
            <h3>
                <FormattedMessage
                    id='claim.email_to_ldap.title'
                    defaultMessage='Switch Email/Password Account to AD/LDAP'
                />
            </h3>
            <form
                onSubmit={preSubmit}
                className={classNames('form-group', {'has-error': serverError})}
            >
                <p>
                    <FormattedMessage
                        id='claim.email_to_ldap.ssoType'
                        defaultMessage='Upon claiming your account, you will only be able to login with AD/LDAP'
                    />
                </p>
                <p>
                    <FormattedMessage
                        id='claim.email_to_ldap.ssoNote'
                        defaultMessage='You must already have a valid AD/LDAP account'
                    />
                </p>
                <p>
                    <FormattedMessage
                        id='claim.email_to_ldap.enterPwd'
                        defaultMessage='Enter the password for your {site} email account'
                        values={{site: siteName}}
                    />
                </p>
                <input
                    type='text'
                    className='hidden'
                    name='fakeusernameremembered'
                />
                <div className={classNames('form-group', {'has-error': passwordError})}>
                    <LocalizedInput
                        type='password'
                        className='form-control'
                        name='emailPassword'
                        ref={emailPasswordInput}
                        autoComplete='off'
                        placeholder={placeholderPasswordMessage}
                        spellCheck='false'
                    />
                </div>
                <ErrorLabel errorText={passwordError}/>
                <p>
                    <FormattedMessage
                        id='claim.email_to_ldap.enterLdapPwd'
                        defaultMessage='Enter the ID and password for your AD/LDAP account'
                    />
                </p>
                <div className={classNames('form-group', {'has-error': ldapError})}>
                    <input
                        type='text'
                        className='form-control'
                        name='ldapId'
                        ref={ldapIdInput}
                        autoComplete='off'
                        placeholder={loginPlaceholder}
                        spellCheck='false'
                    />
                </div>
                <ErrorLabel errorText={ldapError}/>
                <div className={classNames('form-group', {'has-error': ldapPasswordError})}>
                    <LocalizedInput
                        type='password'
                        className='form-control'
                        name='ldapPassword'
                        ref={ldapPasswordInput}
                        autoComplete='off'
                        placeholder={placeholderLdapMessage}
                        spellCheck='false'
                    />
                </div>
                <ErrorLabel errorText={ldapPasswordError}/>
                <button
                    type='submit'
                    className='btn btn-primary'
                >
                    <FormattedMessage
                        id='claim.email_to_ldap.switchTo'
                        defaultMessage='Switch Account to AD/LDAP'
                    />
                </button>
                <ErrorLabel errorText={serverError}/>
            </form>
        </>
    );
};

export default EmailToLDAP;
