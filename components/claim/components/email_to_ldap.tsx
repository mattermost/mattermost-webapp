// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

//todo check name conflicts

import React, {useRef} from 'react';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {AuthChangeResponse} from '@mattermost/types/users';

import {emailToLdap} from 'actions/admin_actions.jsx';

import * as Utils from 'utils/utils';
import {t} from 'utils/i18n.jsx';

import LoginMfa from 'components/login/login_mfa';
import LocalizedInput from 'components/localized_input/localized_input';

type Props = {
    email: string | null;
    siteName?: string;
    ldapLoginFieldName?: string;
}

const EmailToLDAP = ({email, siteName, ldapLoginFieldName}: Props) => {
    const emailPasswordInput = useRef<HTMLInputElement>(null);
    const ldapIdInput = useRef<HTMLInputElement>(null);
    const ldapPasswordInput = useRef<HTMLInputElement>(null);

    const [password, setPassword] = React.useState('');
    const [ldapId, setLdapId] = React.useState<string | null>(null);
    const [ldapPassword, setLdapPassword] = React.useState<string | null>(null);
    const [passwordError, setPasswordError] = React.useState('');
    const [ldapError, setLdapError] = React.useState('');
    const [ldapPasswordError, setLdapPasswordError] = React.useState('');
    const [serverError, setServerError] = React.useState('');
    const [showMfa, setShowMfa] = React.useState(false);

    const preSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const password = emailPasswordInput.current && emailPasswordInput.current.value;
        if (!password) {
            setPasswordError(Utils.localizeMessage('claim.email_to_ldap.pwdError', 'Please enter your password.'));
            return;
        }

        const ldapId = ldapIdInput.current && ldapIdInput.current.value.trim();
        if (!ldapId) {
            setLdapError(Utils.localizeMessage('claim.email_to_ldap.ldapIdError', 'Please enter your AD/LDAP ID.'));
            return;
        }

        const ldapPassword = ldapPasswordInput.current && ldapPasswordInput.current.value;
        if (!ldapPassword) {
            setLdapPasswordError(Utils.localizeMessage('claim.email_to_ldap.ldapPasswordError', 'Please enter your AD/LDAP password.'));
            return;
        }

        setPassword(password);
        setLdapId(ldapId);
        setLdapPassword(ldapPassword);

        if (email) {
            submit(email, password, '', ldapId, ldapPassword);
        }
    };

    const submit = (loginIdParam: string, passwordParam: string, token: string, ldapIdParam?: string, ldapPasswordParam?: string) => {
        emailToLdap(
            loginIdParam,
            passwordParam,
            token,
            ldapIdParam || ldapId,
            ldapPasswordParam || ldapPassword,
            (data: AuthChangeResponse) => {
                if (data.follow_link) {
                    window.location.href = data.follow_link;
                }
            },
            (err: {server_error_id: string; id: string; message: string}) => {
                if (!showMfa && err.server_error_id === 'mfa.validate_token.authenticate.app_error') {
                    setShowMfa(true);
                } else {
                    switch (err.id) {
                    case 'ent.ldap.do_login.user_not_registered.app_error':
                    case 'ent.ldap.do_login.user_filtered.app_error':
                    case 'ent.ldap.do_login.matched_to_many_users.app_error':
                        setLdapError(err.message);
                        setShowMfa(false);
                        break;
                    case 'ent.ldap.do_login.invalid_password.app_error':
                        setLdapPasswordError(err.message);
                        setShowMfa(false);
                        break;
                    case 'api.user.check_user_password.invalid.app_error':
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
    const serverErrorElement = serverError ? <div className='form-group has-error'><label className='control-label'>{serverError}</label></div> : null;
    const passwordErrorElement = passwordError ? <div className='form-group has-error'><label className='control-label'>{passwordError}</label></div> : null;
    const ldapErrorElement = ldapError ? <div className='form-group has-error'><label className='control-label'>{ldapError}</label></div> : null;
    const ldapPasswordErrorElement = ldapPasswordError ? <div className='form-group has-error'><label className='control-label'>{ldapPasswordError}</label></div> : null;
    const formClass = classNames('form-group', {' has-error': serverError || passwordError || ldapError || ldapPasswordError});

    const loginPlaceholder = ldapLoginFieldName || Utils.localizeMessage('claim.email_to_ldap.ldapId', 'AD/LDAP ID');

    let content;
    if (showMfa) {
        content = (
            <LoginMfa
                loginId={email}
                password={password}
                title={{id: t('claim.email_to_ldap.title'), defaultMessage: 'Switch Email/Password Account to AD/LDAP'}}
                onSubmit={submit}
            />
        );
    } else {
        content = (
            <>
                <h3>
                    <FormattedMessage
                        id='claim.email_to_ldap.title'
                        defaultMessage='Switch Email/Password Account to AD/LDAP'
                    />
                </h3>
                <form
                    onSubmit={preSubmit}
                    className={formClass}
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
                            values={{
                                site: siteName,
                            }}
                        />
                    </p>
                    <input
                        type='text'
                        style={style.usernameInput}
                        name='fakeusernameremembered'
                    />
                    <div className={formClass}>
                        <LocalizedInput
                            type='password'
                            className='form-control'
                            name='emailPassword'
                            ref={emailPasswordInput}
                            autoComplete='off'
                            placeholder={{id: t('claim.email_to_ldap.pwd'), defaultMessage: 'Password'}}
                            spellCheck='false'
                        />
                    </div>
                    {passwordErrorElement}
                    <p>
                        <FormattedMessage
                            id='claim.email_to_ldap.enterLdapPwd'
                            defaultMessage='Enter the ID and password for your AD/LDAP account'
                        />
                    </p>
                    <div className={formClass}>
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
                    {ldapErrorElement}
                    <div className={formClass}>
                        <LocalizedInput
                            type='password'
                            className='form-control'
                            name='ldapPassword'
                            ref={ldapPasswordInput}
                            autoComplete='off'
                            placeholder={{id: t('claim.email_to_ldap.ldapPwd'), defaultMessage: 'AD/LDAP Password'}}
                            spellCheck='false'
                        />
                    </div>
                    {ldapPasswordErrorElement}
                    <button
                        type='submit'
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='claim.email_to_ldap.switchTo'
                            defaultMessage='Switch Account to AD/LDAP'
                        />
                    </button>
                    {serverErrorElement}
                </form>
            </>
        );
    }

    return (
        <div>
            {content}
        </div>
    );
};

const style = {
    usernameInput: {display: 'none'},
};

export default EmailToLDAP;
