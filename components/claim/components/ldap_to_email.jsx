// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {checkMfa, switchFromLdapToEmail} from 'actions/user_actions.jsx';
import * as Utils from 'utils/utils.jsx';
import LoginMfa from 'components/login/components/login_mfa.jsx';

export default class LDAPToEmail extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);
        this.preSubmit = this.preSubmit.bind(this);

        this.state = {
            passwordError: '',
            confirmError: '',
            ldapPasswordError: '',
            serverError: ''
        };
    }

    preSubmit(e) {
        e.preventDefault();

        var state = {
            passwordError: '',
            confirmError: '',
            ldapPasswordError: '',
            serverError: ''
        };

        const ldapPassword = this.refs.ldappassword.value;
        if (!ldapPassword) {
            state.ldapPasswordError = Utils.localizeMessage('claim.ldap_to_email.ldapPasswordError', 'Please enter your AD/LDAP password.');
            this.setState(state);
            return;
        }

        const password = this.refs.password.value;
        if (!password) {
            state.passwordError = Utils.localizeMessage('claim.ldap_to_email.pwdError', 'Please enter your password.');
            this.setState(state);
            return;
        }

        const passwordErr = Utils.isValidPassword(password, Utils.getPasswordConfig());
        if (passwordErr !== '') {
            this.setState({
                passwordError: passwordErr
            });
            return;
        }

        const confirmPassword = this.refs.passwordconfirm.value;
        if (!confirmPassword || password !== confirmPassword) {
            state.confirmError = Utils.localizeMessage('claim.ldap_to_email.pwdNotMatch', 'Passwords do not match.');
            this.setState(state);
            return;
        }

        state.password = password;
        state.ldapPassword = ldapPassword;
        this.setState(state);

        checkMfa(
            this.props.email,
            (requiresMfa) => {
                if (requiresMfa) {
                    this.setState({showMfa: true});
                } else {
                    this.submit(this.props.email, password, '', ldapPassword);
                }
            },
            (err) => {
                this.setState({error: err.message});
            }
        );
    }

    submit(loginId, password, token, ldapPassword) {
        switchFromLdapToEmail(
            this.props.email,
            password,
            token,
            ldapPassword || this.state.ldapPassword,
            (data) => {
                if (data.follow_link) {
                    window.location.href = data.follow_link;
                }
            },
            (err) => {
                if (err.id.startsWith('model.user.is_valid.pwd')) {
                    this.setState({passwordError: err.message, showMfa: false});
                } else {
                    switch (err.id) {
                    case 'ent.ldap.do_login.invalid_password.app_error':
                        this.setState({ldapPasswordError: err.message, showMfa: false});
                        break;
                    default:
                        this.setState({serverError: err.message, showMfa: false});
                    }
                }
            }
        );
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

        let passwordPlaceholder;
        if (global.window.mm_config.LdapPasswordFieldName) {
            passwordPlaceholder = global.window.mm_config.LdapPasswordFieldName;
        } else {
            passwordPlaceholder = Utils.localizeMessage('claim.ldap_to_email.ldapPwd', 'AD/LDAP Password');
        }

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
                                email: this.props.email
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='claim.ldap_to_email.enterLdapPwd'
                            defaultMessage='{ldapPassword}:'
                            values={{
                                ldapPassword: passwordPlaceholder
                            }}
                        />
                    </p>
                    <div className={ldapPasswordClass}>
                        <input
                            type='password'
                            className='form-control'
                            name='ldapPassword'
                            ref='ldappassword'
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
                        <input
                            type='password'
                            className='form-control'
                            name='password'
                            ref='password'
                            placeholder={Utils.localizeMessage('claim.ldap_to_email.pwd', 'Password')}
                            spellCheck='false'
                        />
                    </div>
                    {passwordError}
                    <div className={confimClass}>
                        <input
                            type='password'
                            className='form-control'
                            name='passwordconfirm'
                            ref='passwordconfirm'
                            placeholder={Utils.localizeMessage('claim.ldap_to_email.confirm', 'Confirm Password')}
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

LDAPToEmail.defaultProps = {
};
LDAPToEmail.propTypes = {
    email: PropTypes.string
};
