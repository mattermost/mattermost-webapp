// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

//todo use classnames and check name conflicts

import React, {useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {ActionResult} from 'mattermost-redux/types/actions';

import * as Utils from 'utils/utils';
import {t} from 'utils/i18n.jsx';
import {getPasswordConfig} from 'utils/utils';

import LoginMfa from 'components/login/login_mfa';
import LocalizedInput from 'components/localized_input/localized_input';

type Props = {
    email: string | null;
    passwordConfig: ReturnType<typeof getPasswordConfig>;
    switchLdapToEmail: (ldapPassword: string, email: string, password: string, token: string) => Promise<ActionResult>;
}

const LDAPToEmail = (props: Props) => {
    const [passwordError, setPasswordError] = useState<string | JSX.Element>('');
    const [confirmError, setConfirmError] = useState('');
    const [ldapPasswordError, setLdapPasswordError] = useState('');
    const [serverError, setServerError] = useState('');
    const [showMfa, setShowMfa] = useState(true);
    const [password, setPassword] = useState('trwo');
    const [ldapPassword, setLdapPassword] = useState('');

    const ldapPasswordInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);
    const passwordConfirmInput = useRef<HTMLInputElement>(null);

    const preSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const ldapPassword = ldapPasswordInput.current?.value;
        if (!ldapPassword) {
            setLdapPasswordError(Utils.localizeMessage('claim.ldap_to_email.ldapPasswordError', 'Please enter your AD/LDAP password.'));
            return;
        }

        const password = passwordInput.current?.value;
        if (!password) {
            setPasswordError(Utils.localizeMessage('claim.ldap_to_email.pwdError', 'Please enter your password.'));
            return;
        }

        const {valid, error} = Utils.isValidPassword(password, props.passwordConfig);
        if (!valid && error) {
            setPasswordError(error);
            return;
        }

        const confirmPassword = passwordConfirmInput.current?.value;
        if (!confirmPassword || password !== confirmPassword) {
            setConfirmError(Utils.localizeMessage('claim.ldap_to_email.pwdNotMatch', 'Passwords do not match.'));
            return;
        }

        setPassword(password);
        setLdapPassword(ldapPassword);

        if (props.email) {
            submit(props.email, password, '', ldapPassword);
        }
    };

    const submit = (loginIdParam: string, passwordParam: string, tokenParam: string, ldapPasswordParam: string) => {
        props.switchLdapToEmail(ldapPasswordParam || ldapPassword, loginIdParam, passwordParam, tokenParam).then(({data, error: err}) => {
            if (data && data.follow_link) {
                window.location.href = data.follow_link;
            } else if (err) {
                if (err.server_error_id.startsWith('model.user.is_valid.pwd')) {
                    setPasswordError(err.message);
                    setShowMfa(false);
                } else if (err.server_error_id === 'ent.ldap.do_login.invalid_password.app_error') {
                    setLdapPasswordError(err.message);
                    setShowMfa(false);
                } else if (!showMfa && err.server_error_id === 'mfa.validate_token.authenticate.app_error') {
                    setShowMfa(true);
                } else {
                    setServerError(err.message);
                    setShowMfa(false);
                }
            }
        });
    };

    const serverErrorDiv = serverError ? <div className='form-group has-error'><label className='control-label'>{serverError}</label></div> : null;
    const formClass = classNames('form-group', {' has-error': serverError});

    let passwordErrorDiv = null;
    let passwordClass = 'form-group';
    if (passwordError) {
        passwordErrorDiv = <div className='form-group has-error'><label className='control-label'>{passwordError}</label></div>;
        passwordClass += ' has-error';
    }

    let ldapPasswordErrorDiv = null;
    let ldapPasswordClass = 'form-group';
    if (ldapPasswordError) {
        ldapPasswordErrorDiv = <div className='form-group has-error'><label className='control-label'>{ldapPasswordError}</label></div>;
        ldapPasswordClass += ' has-error';
    }

    let confirmErrorDiv = null;
    let confimClass = 'form-group';
    if (confirmError) {
        confirmErrorDiv = <div className='form-group has-error'><label className='control-label'>{confirmError}</label></div>;
        confimClass += ' has-error';
    }

    const passwordPlaceholder = Utils.localizeMessage('claim.ldap_to_email.ldapPwd', 'AD/LDAP Password');

    let content;
    if (showMfa) {
        content = (
            <LoginMfa
                loginId={props.email}
                password={password}
                title={{id: t('claim.ldap_to_email.title'), defaultMessage: 'Switch AD/LDAP Account to Email/Password'}}
                onSubmit={submit}
            />
        );
    } else {
        content = (
            <>
                <h3>
                    <FormattedMessage
                        id='claim.ldap_to_email.title'
                        defaultMessage='Switch AD/LDAP Account to Email/Password'
                    />
                </h3>
                <form
                    onSubmit={preSubmit}
                    className={formClass}
                >
                    <p>
                        <FormattedMessage
                            id='claim.ldap_to_email.email'
                            defaultMessage='After switching your authentication method, you will use {email} to login. Your AD/LDAP credentials will no longer allow access to Mattermost.'
                            values={{
                                email: props.email,
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='claim.ldap_to_email.enterLdapPwd'
                            defaultMessage='{ldapPassword}:'
                            values={{
                                ldapPassword: passwordPlaceholder,
                            }}
                        />
                    </p>
                    <div className={ldapPasswordClass}>
                        <input
                            type='password'
                            className='form-control'
                            name='ldapPassword'
                            ref={ldapPasswordInput}
                            placeholder={passwordPlaceholder}
                            spellCheck='false'
                        />
                    </div>
                    {ldapPasswordErrorDiv}
                    <p>
                        <FormattedMessage
                            id='claim.ldap_to_email.enterPwd'
                            defaultMessage='New email login password:'
                        />
                    </p>
                    <div className={passwordClass}>
                        <LocalizedInput
                            type='password'
                            className='form-control'
                            name='password'
                            ref={passwordInput}
                            placeholder={{id: t('claim.ldap_to_email.pwd'), defaultMessage: 'Password'}}
                            spellCheck='false'
                        />
                    </div>
                    {passwordErrorDiv}
                    <div className={confimClass}>
                        <LocalizedInput
                            type='password'
                            className='form-control'
                            name='passwordconfirm'
                            ref={passwordConfirmInput}
                            placeholder={{id: t('claim.ldap_to_email.confirm'), defaultMessage: 'Confirm Password'}}
                            spellCheck='false'
                        />
                    </div>
                    {confirmErrorDiv}
                    <button
                        type='submit'
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='claim.ldap_to_email.switchTo'
                            defaultMessage='Switch account to email/password'
                        />
                    </button>
                    {serverErrorDiv}
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

export default LDAPToEmail;
