// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n.jsx';
import LoginMfa from 'components/login/login_mfa.jsx';
import LocalizedInput from 'components/localized_input/localized_input';

export default class LDAPToEmail extends React.PureComponent {
    static propTypes = {
        email: PropTypes.string,
        passwordConfig: PropTypes.object,
        switchLdapToEmail: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            passwordError: '',
            confirmError: '',
            ldapPasswordError: '',
            serverError: '',
        };

        this.ldapPasswordInput = React.createRef();
        this.passwordInput = React.createRef();
        this.passwordConfirmInput = React.createRef();
    }

    preSubmit = (e) => {
        e.preventDefault();

        var state = {
            passwordError: '',
            confirmError: '',
            ldapPasswordError: '',
            serverError: '',
        };

        const ldapPassword = this.ldapPasswordInput.current.value;
        if (!ldapPassword) {
            state.ldapPasswordError = Utils.localizeMessage('claim.ldap_to_email.ldapPasswordError', 'Please enter your AD/LDAP password.');
            this.setState(state);
            return;
        }

        const password = this.passwordInput.current.value;
        if (!password) {
            state.passwordError = Utils.localizeMessage('claim.ldap_to_email.pwdError', 'Please enter your password.');
            this.setState(state);
            return;
        }

        const {valid, error} = Utils.isValidPassword(password, this.props.passwordConfig);
        if (!valid && error) {
            this.setState({
                passwordError: error,
            });
            return;
        }

        const confirmPassword = this.passwordConfirmInput.current.value;
        if (!confirmPassword || password !== confirmPassword) {
            state.confirmError = Utils.localizeMessage('claim.ldap_to_email.pwdNotMatch', 'Passwords do not match.');
            this.setState(state);
            return;
        }

        state.password = password;
        state.ldapPassword = ldapPassword;
        this.setState(state);

        this.submit(this.props.email, password, '', ldapPassword);
    }

    submit = (loginId, password, token, ldapPassword) => {
        this.props.switchLdapToEmail(ldapPassword || this.state.ldapPassword, this.props.email, password, token).then(({data, error: err}) => {
            if (data && data.follow_link) {
                window.location.href = data.follow_link;
            } else if (err) {
                if (err.server_error_id.startsWith('model.user.is_valid.pwd')) {
                    this.setState({passwordError: err.message, showMfa: false});
                } else if (err.server_error_id === 'ent.ldap.do_login.invalid_password.app_error') {
                    this.setState({ldapPasswordError: err.message, showMfa: false});
                } else if (!this.state.showMfa && err.server_error_id === 'mfa.validate_token.authenticate.app_error') {
                    this.setState({showMfa: true});
                } else {
                    this.setState({serverError: err.message, showMfa: false});
                }
            }
        });
    }

    render() {
        let serverError = null;
        let formClass = 'form-group';
        if (this.state.serverError) {
            serverError = <div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div>;
            formClass += ' has-error';
        }

        let passwordError = null;
        let passwordClass = 'form-group';
        if (this.state.passwordError) {
            passwordError = <div className='form-group has-error'><label className='control-label'>{this.state.passwordError}</label></div>;
            passwordClass += ' has-error';
        }

        let ldapPasswordError = null;
        let ldapPasswordClass = 'form-group';
        if (this.state.ldapPasswordError) {
            ldapPasswordError = <div className='form-group has-error'><label className='control-label'>{this.state.ldapPasswordError}</label></div>;
            ldapPasswordClass += ' has-error';
        }

        let confirmError = null;
        let confimClass = 'form-group';
        if (this.state.confirmError) {
            confirmError = <div className='form-group has-error'><label className='control-label'>{this.state.confirmError}</label></div>;
            confimClass += ' has-error';
        }

        const passwordPlaceholder = Utils.localizeMessage('claim.ldap_to_email.ldapPwd', 'AD/LDAP Password');

        let content;
        if (this.state.showMfa) {
            content = (
                <LoginMfa
                    loginId={this.props.email}
                    password={this.state.password}
                    submit={this.submit}
                />
            );
        } else {
            content = (
                <form
                    onSubmit={this.preSubmit}
                    className={formClass}
                >
                    <p>
                        <FormattedMessage
                            id='claim.ldap_to_email.email'
                            defaultMessage='After switching your authentication method, you will use {email} to login. Your AD/LDAP credentials will no longer allow access to Mattermost.'
                            values={{
                                email: this.props.email,
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
                            ref={this.ldapPasswordInput}
                            placeholder={passwordPlaceholder}
                            spellCheck='false'
                        />
                    </div>
                    {ldapPasswordError}
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
                            ref={this.passwordInput}
                            placeholder={{id: t('claim.ldap_to_email.pwd'), defaultMessage: 'Password'}}
                            spellCheck='false'
                        />
                    </div>
                    {passwordError}
                    <div className={confimClass}>
                        <LocalizedInput
                            type='password'
                            className='form-control'
                            name='passwordconfirm'
                            ref={this.passwordConfirmInput}
                            placeholder={{id: t('claim.ldap_to_email.confirm'), defaultMessage: 'Confirm Password'}}
                            spellCheck='false'
                        />
                    </div>
                    {confirmError}
                    <button
                        type='submit'
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='claim.ldap_to_email.switchTo'
                            defaultMessage='Switch account to email/password'
                        />
                    </button>
                    {serverError}
                </form>
            );
        }

        return (
            <div>
                <h3>
                    <FormattedMessage
                        id='claim.ldap_to_email.title'
                        defaultMessage='Switch AD/LDAP Account to Email/Password'
                    />
                </h3>
                {content}
            </div>
        );
    }
}
