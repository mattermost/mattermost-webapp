// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {emailToLdap} from 'actions/admin_actions.jsx';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n.jsx';
import LoginMfa from 'components/login/login_mfa.jsx';
import LocalizedInput from 'components/localized_input/localized_input';

export default class EmailToLDAP extends React.PureComponent {
    static propTypes = {
        email: PropTypes.string,
        siteName: PropTypes.string,
        ldapLoginFieldName: PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.state = {
            passwordError: '',
            ldapError: '',
            ldapPasswordError: '',
            serverError: '',
            showMfa: false,
        };

        this.emailPasswordInput = React.createRef();
        this.ldapIdInput = React.createRef();
        this.ldapPasswordInput = React.createRef();
    }

    preSubmit = (e) => {
        e.preventDefault();

        var state = {
            passwordError: '',
            ldapError: '',
            ldapPasswordError: '',
            serverError: '',
        };

        const password = this.emailPasswordInput.current && this.emailPasswordInput.current.value;
        if (!password) {
            state.passwordError = Utils.localizeMessage('claim.email_to_ldap.pwdError', 'Please enter your password.');
            this.setState(state);
            return;
        }

        const ldapId = this.ldapIdInput.current && this.ldapIdInput.current.value.trim();
        if (!ldapId) {
            state.ldapError = Utils.localizeMessage('claim.email_to_ldap.ldapIdError', 'Please enter your AD/LDAP ID.');
            this.setState(state);
            return;
        }

        const ldapPassword = this.ldapPasswordInput.current && this.ldapPasswordInput.current.value;
        if (!ldapPassword) {
            state.ldapPasswordError = Utils.localizeMessage('claim.email_to_ldap.ldapPasswordError', 'Please enter your AD/LDAP password.');
            this.setState(state);
            return;
        }

        state.password = password;
        state.ldapId = ldapId;
        state.ldapPassword = ldapPassword;
        this.setState(state);

        this.submit(this.props.email, password, '', ldapId, ldapPassword);
    }

    submit = (loginId, password, token, ldapId, ldapPassword) => {
        emailToLdap(
            loginId,
            password,
            token,
            ldapId || this.state.ldapId,
            ldapPassword || this.state.ldapPassword,
            (data) => {
                if (data.follow_link) {
                    window.location.href = data.follow_link;
                }
            },
            (err) => {
                if (!this.state.showMfa && err.server_error_id === 'mfa.validate_token.authenticate.app_error') {
                    this.setState({showMfa: true});
                } else {
                    switch (err.id) {
                    case 'ent.ldap.do_login.user_not_registered.app_error':
                    case 'ent.ldap.do_login.user_filtered.app_error':
                    case 'ent.ldap.do_login.matched_to_many_users.app_error':
                        this.setState({ldapError: err.message, showMfa: false});
                        break;
                    case 'ent.ldap.do_login.invalid_password.app_error':
                        this.setState({ldapPasswordError: err.message, showMfa: false});
                        break;
                    case 'api.user.check_user_password.invalid.app_error':
                        this.setState({passwordError: err.message, showMfa: false});
                        break;
                    default:
                        this.setState({serverError: err.message, showMfa: false});
                    }
                }
            },
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

        let ldapError = null;
        let ldapClass = 'form-group';
        if (this.state.ldapError) {
            ldapError = <div className='form-group has-error'><label className='control-label'>{this.state.ldapError}</label></div>;
            ldapClass += ' has-error';
        }

        let ldapPasswordError = null;
        let ldapPasswordClass = 'form-group';
        if (this.state.ldapPasswordError) {
            ldapPasswordError = <div className='form-group has-error'><label className='control-label'>{this.state.ldapPasswordError}</label></div>;
            ldapPasswordClass += ' has-error';
        }

        let loginPlaceholder;
        if (this.props.ldapLoginFieldName) {
            loginPlaceholder = this.props.ldapLoginFieldName;
        } else {
            loginPlaceholder = Utils.localizeMessage('claim.email_to_ldap.ldapId', 'AD/LDAP ID');
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
                                site: this.props.siteName,
                            }}
                        />
                    </p>
                    <input
                        type='text'
                        style={style.usernameInput}
                        name='fakeusernameremembered'
                    />
                    <div className={passwordClass}>
                        <LocalizedInput
                            type='password'
                            className='form-control'
                            name='emailPassword'
                            ref={this.emailPasswordInput}
                            autoComplete='off'
                            placeholder={{id: t('claim.email_to_ldap.pwd'), defaultMessage: 'Password'}}
                            spellCheck='false'
                        />
                    </div>
                    {passwordError}
                    <p>
                        <FormattedMessage
                            id='claim.email_to_ldap.enterLdapPwd'
                            defaultMessage='Enter the ID and password for your AD/LDAP account'
                        />
                    </p>
                    <div className={ldapClass}>
                        <input
                            type='text'
                            className='form-control'
                            name='ldapId'
                            ref={this.ldapIdInput}
                            autoComplete='off'
                            placeholder={loginPlaceholder}
                            spellCheck='false'
                        />
                    </div>
                    {ldapError}
                    <div className={ldapPasswordClass}>
                        <LocalizedInput
                            type='password'
                            className='form-control'
                            name='ldapPassword'
                            ref={this.ldapPasswordInput}
                            autoComplete='off'
                            placeholder={{id: t('claim.email_to_ldap.ldapPwd'), defaultMessage: 'AD/LDAP Password'}}
                            spellCheck='false'
                        />
                    </div>
                    {ldapPasswordError}
                    <button
                        type='submit'
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='claim.email_to_ldap.switchTo'
                            defaultMessage='Switch Account to AD/LDAP'
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
                        id='claim.email_to_ldap.title'
                        defaultMessage='Switch Email/Password Account to AD/LDAP'
                    />
                </h3>
                {content}
            </div>
        );
    }
}

const style = {
    usernameInput: {display: 'none'},
};
