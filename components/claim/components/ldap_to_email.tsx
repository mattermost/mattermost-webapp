// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {ActionResult} from 'mattermost-redux/types/actions';

import * as Utils from 'utils/utils';
import {t} from 'utils/i18n';

import LoginMfa from 'components/login/login_mfa';
import LocalizedInput from 'components/localized_input/localized_input';

import {PasswordConfig} from '../claim_controller';

import {SubmitOptions} from './email_to_ldap';

type Props = {
    email: string | null;
    switchLdapToEmail: (ldapPassword: string, email: string, password: string, token: string) => Promise<ActionResult>;
    passwordConfig?: PasswordConfig;
}

const LDAPToEmail = (props: Props) => {
    const [passwordError, setPasswordError] = useState<string | JSX.Element>('');
    const [confirmError, setConfirmError] = useState('');
    const [ldapPasswordError, setLdapPasswordError] = useState('');
    const [serverError, setServerError] = useState('');
    const [showMfa, setShowMfa] = useState(true);
    const [password, setPassword] = useState('');
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

        if (props.passwordConfig) {
            const {valid, error} = Utils.isValidPassword(password, props.passwordConfig);
            if (!valid && error) {
                setPasswordError(error);
                return;
            }
        }

        const confirmPassword = passwordConfirmInput.current?.value;
        if (!confirmPassword || password !== confirmPassword) {
            setConfirmError(Utils.localizeMessage('claim.ldap_to_email.pwdNotMatch', 'Passwords do not match.'));
            return;
        }

        setPassword(password);
        setLdapPassword(ldapPassword);

        if (props.email) {
            submit({loginId: props.email, password, ldapPasswordParam: ldapPassword});
        }
    };

    const submit = ({loginId, password, token = '', ldapPasswordParam}: SubmitOptions) => {
        props.switchLdapToEmail(ldapPasswordParam || ldapPassword, loginId, password, token).then(({data, error: err}) => {
            if (data.follow_link) {
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

    const serverErrorElement = serverError ? <div className='form-group has-error'><label className='control-label'>{serverError}</label></div> : null;
    const passwordErrorElement = passwordError ? <div className='form-group has-error'><label className='control-label'>{passwordError}</label></div> : null;
    const ldapPasswordErrorElement = ldapPasswordError ? <div className='form-group has-error'><label className='control-label'>{ldapPasswordError}</label></div> : null;
    const confirmErrorElement = confirmError ? <div className='form-group has-error'><label className='control-label'>{confirmError}</label></div> : null;
    const formClass = classNames('form-group', {'has-error': serverError || passwordError || ldapPasswordError || confirmError});

    const passwordPlaceholder = Utils.localizeMessage('claim.ldap_to_email.ldapPwd', 'AD/LDAP Password');

    if (showMfa) {
        return (
            <LoginMfa
                loginId={props.email}
                password={password}
                title={{id: t('claim.ldap_to_email.title'), defaultMessage: 'Switch AD/LDAP Account to Email/Password'}}
                onSubmit={submit}
            />
        );
    }
    return (
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
                <div className={formClass}>
                    <input
                        type='password'
                        className='form-control'
                        name='ldapPassword'
                        ref={ldapPasswordInput}
                        placeholder={passwordPlaceholder}
                        spellCheck='false'
                    />
                </div>
                {ldapPasswordErrorElement}
                <p>
                    <FormattedMessage
                        id='claim.ldap_to_email.enterPwd'
                        defaultMessage='New email login password:'
                    />
                </p>
                <div className={formClass}>
                    <LocalizedInput
                        type='password'
                        className='form-control'
                        name='password'
                        ref={passwordInput}
                        placeholder={{id: t('claim.ldap_to_email.pwd'), defaultMessage: 'Password'}}
                        spellCheck='false'
                    />
                </div>
                {passwordErrorElement}
                <div className={formClass}>
                    <LocalizedInput
                        type='password'
                        className='form-control'
                        name='passwordconfirm'
                        ref={passwordConfirmInput}
                        placeholder={{id: t('claim.ldap_to_email.confirm'), defaultMessage: 'Confirm Password'}}
                        spellCheck='false'
                    />
                </div>
                {confirmErrorElement}
                <button
                    type='submit'
                    className='btn btn-primary'
                >
                    <FormattedMessage
                        id='claim.ldap_to_email.switchTo'
                        defaultMessage='Switch account to email/password'
                    />
                </button>
                {serverErrorElement}
            </form>
        </>
    );
};

export default LDAPToEmail;
