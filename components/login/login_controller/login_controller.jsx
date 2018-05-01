// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {Client4} from 'mattermost-redux/client';

import * as GlobalActions from 'actions/global_actions.jsx';
import {addUserToTeamFromInvite} from 'actions/team_actions.jsx';
import {checkMfa, webLogin} from 'actions/user_actions.jsx';
import BrowserStore from 'stores/browser_store.jsx';
import UserStore from 'stores/user_store.jsx';
import TeamStore from 'stores/team_store.jsx';

import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';
import * as Utils from 'utils/utils.jsx';
import {messageHtmlToComponent} from 'utils/post_utils.jsx';

import logoImage from 'images/logo.png';

import SiteNameAndDescription from 'components/common/site_name_and_description';
import AnnouncementBar from 'components/announcement_bar';
import FormError from 'components/form_error.jsx';

import LoginMfa from '../login_mfa.jsx';
export default class LoginController extends React.Component {
    static get propTypes() {
        return {
            location: PropTypes.object.isRequired,

            customBrand: PropTypes.bool.isRequired,
            isLicensed: PropTypes.bool.isRequired,

            customBrandText: PropTypes.string,
            customDescriptionText: PropTypes.string,
            enableCustomBrand: PropTypes.bool.isRequired,
            enableLdap: PropTypes.bool.isRequired,
            enableOpenServer: PropTypes.bool.isRequired,
            enableSaml: PropTypes.bool.isRequired,
            enableSignInWithEmail: PropTypes.bool.isRequired,
            enableSignInWithUsername: PropTypes.bool.isRequired,
            enableSignUpWithEmail: PropTypes.bool.isRequired,
            enableSignUpWithGitLab: PropTypes.bool.isRequired,
            enableSignUpWithGoogle: PropTypes.bool.isRequired,
            enableSignUpWithOffice365: PropTypes.bool.isRequired,
            experimentalPrimaryTeam: PropTypes.string,
            ldapLoginFieldName: PropTypes.string,
            samlLoginButtonText: PropTypes.string,
            siteName: PropTypes.string,
        };
    }

    constructor(props) {
        super(props);

        this.preSubmit = this.preSubmit.bind(this);
        this.submit = this.submit.bind(this);
        this.finishSignin = this.finishSignin.bind(this);

        this.handleLoginIdChange = this.handleLoginIdChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);

        let loginId = '';
        if ((new URLSearchParams(this.props.location.search)).get('extra') === Constants.SIGNIN_VERIFIED && (new URLSearchParams(this.props.location.search)).get('email')) {
            loginId = (new URLSearchParams(this.props.location.search)).get('email');
        }

        this.state = {
            ldapEnabled: this.props.isLicensed && this.props.enableLdap,
            usernameSigninEnabled: this.props.enableSignInWithUsername,
            emailSigninEnabled: this.props.enableSignInWithEmail,
            samlEnabled: this.props.isLicensed && this.props.enableSaml,
            loginId,
            password: '',
            showMfa: false,
            loading: false,
        };
    }

    componentDidMount() {
        document.title = this.props.siteName;
        BrowserStore.removeGlobalItem('team');
        if (UserStore.getCurrentUser()) {
            GlobalActions.redirectUserToDefaultTeam();
        }

        if ((new URLSearchParams(this.props.location.search)).get('extra') === Constants.SIGNIN_VERIFIED && (new URLSearchParams(this.props.location.search)).get('email')) {
            this.refs.password.focus();
        }
    }

    preSubmit(e) {
        e.preventDefault();

        const {location} = this.props;
        const newQuery = location.search.replace(/(extra=password_change)&?/i, '');
        if (newQuery !== location.search) {
            browserHistory.replace(`${location.pathname}${newQuery}${location.hash}`);
        }

        // password managers don't always call onInput handlers for form fields so it's possible
        // for the state to get out of sync with what the user sees in the browser
        let loginId = this.refs.loginId.value;
        if (loginId !== this.state.loginId) {
            this.setState({loginId});
        }

        const password = this.refs.password.value;
        if (password !== this.state.password) {
            this.setState({password});
        }

        // don't trim the password since we support spaces in passwords
        loginId = loginId.trim().toLowerCase();

        if (!loginId) {
            // it's slightly weird to be constructing the message ID, but it's a bit nicer than triply nested if statements
            let msgId = 'login.no';
            if (this.state.emailSigninEnabled) {
                msgId += 'Email';
            }
            if (this.state.usernameSigninEnabled) {
                msgId += 'Username';
            }
            if (this.state.ldapEnabled) {
                msgId += 'LdapUsername';
            }

            this.setState({
                serverError: (
                    <FormattedMessage
                        id={msgId}
                        values={{
                            ldapUsername: this.props.ldapLoginFieldName || Utils.localizeMessage('login.ldapUsernameLower', 'AD/LDAP username'),
                        }}
                    />
                ),
            });
            return;
        }

        if (!password) {
            this.setState({
                serverError: (
                    <FormattedMessage
                        id='login.noPassword'
                        defaultMessage='Please enter your password'
                    />
                ),
            });
            return;
        }

        checkMfa(
            loginId,
            (requiresMfa) => {
                if (requiresMfa) {
                    this.setState({showMfa: true});
                } else {
                    this.submit(loginId, password, '');
                }
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    submit(loginId, password, token) {
        this.setState({serverError: null, loading: true});

        webLogin(
            loginId,
            password,
            token,
            () => {
                // check for query params brought over from signup_user_complete
                const params = new URLSearchParams(this.props.location.search);
                const inviteToken = params.get('t') || '';
                const inviteId = params.get('id') || '';

                if (inviteId || inviteToken) {
                    addUserToTeamFromInvite(
                        inviteToken,
                        inviteId,
                        (team) => {
                            this.finishSignin(team);
                        },
                        () => {
                            // there's not really a good way to deal with this, so just let the user log in like normal
                            this.finishSignin();
                        }
                    );

                    return;
                }

                this.finishSignin();
            },
            (err) => {
                if (err.id === 'api.user.login.not_verified.app_error') {
                    browserHistory.push('/should_verify_email?&email=' + encodeURIComponent(loginId));
                } else if (err.id === 'store.sql_user.get_for_login.app_error' ||
                    err.id === 'ent.ldap.do_login.user_not_registered.app_error') {
                    this.setState({
                        showMfa: false,
                        loading: false,
                        serverError: (
                            <FormattedMessage
                                id='login.userNotFound'
                                defaultMessage="We couldn't find an account matching your login credentials."
                            />
                        ),
                    });
                } else if (err.id === 'api.user.check_user_password.invalid.app_error' || err.id === 'ent.ldap.do_login.invalid_password.app_error') {
                    this.setState({
                        showMfa: false,
                        loading: false,
                        serverError: (
                            <FormattedMessage
                                id='login.invalidPassword'
                                defaultMessage='Your password is incorrect.'
                            />
                        ),
                    });
                } else {
                    this.setState({showMfa: false, serverError: err.message, loading: false});
                }
            }
        );
    }

    finishSignin(team) {
        const experimentalPrimaryTeam = this.props.experimentalPrimaryTeam;
        const primaryTeam = TeamStore.getByName(experimentalPrimaryTeam);
        const query = new URLSearchParams(this.props.location.search);
        const redirectTo = query.get('redirect_to');

        GlobalActions.loadCurrentLocale();
        if (redirectTo && redirectTo.match(/^\/([^/]|$)/)) {
            browserHistory.push(redirectTo);
        } else if (team) {
            browserHistory.push(`/${team.name}`);
        } else if (primaryTeam) {
            browserHistory.push(`/${primaryTeam.name}/channels/${Constants.DEFAULT_CHANNEL}`);
        } else {
            GlobalActions.redirectUserToDefaultTeam();
        }
    }

    handleLoginIdChange(e) {
        this.setState({
            loginId: e.target.value,
        });
    }

    handlePasswordChange(e) {
        this.setState({
            password: e.target.value,
        });
    }

    createCustomLogin() {
        if (this.props.isLicensed &&
                this.props.customBrand &&
                this.props.enableCustomBrand) {
            const text = this.props.customBrandText || '';
            const formattedText = TextFormatting.formatText(text);

            return (
                <div>
                    <img
                        src={Client4.getBrandImageUrl(0)}
                    />
                    <div>
                        {messageHtmlToComponent(formattedText, false, {mentions: false})}
                    </div>
                </div>
            );
        }

        return null;
    }

    createLoginPlaceholder() {
        const ldapEnabled = this.state.ldapEnabled;
        const usernameSigninEnabled = this.state.usernameSigninEnabled;
        const emailSigninEnabled = this.state.emailSigninEnabled;

        const loginPlaceholders = [];
        if (emailSigninEnabled) {
            loginPlaceholders.push(Utils.localizeMessage('login.email', 'Email'));
        }

        if (usernameSigninEnabled) {
            loginPlaceholders.push(Utils.localizeMessage('login.username', 'Username'));
        }

        if (ldapEnabled) {
            if (this.props.ldapLoginFieldName) {
                loginPlaceholders.push(this.props.ldapLoginFieldName);
            } else {
                loginPlaceholders.push(Utils.localizeMessage('login.ldapUsername', 'AD/LDAP Username'));
            }
        }

        if (loginPlaceholders.length >= 2) {
            return loginPlaceholders.slice(0, loginPlaceholders.length - 1).join(', ') +
                Utils.localizeMessage('login.placeholderOr', ' or ') +
                loginPlaceholders[loginPlaceholders.length - 1];
        } else if (loginPlaceholders.length === 1) {
            return loginPlaceholders[0];
        }

        return '';
    }

    checkSignUpEnabled() {
        return this.props.enableSignUpWithEmail ||
            this.props.enableSignUpWithGitLab ||
            this.props.enableSignUpWithOffice365 ||
            this.props.enableSignUpWithGoogle ||
            this.props.enableLdap ||
            this.props.enableSaml;
    }

    createLoginOptions() {
        const extraParam = (new URLSearchParams(this.props.location.search)).get('extra');
        let extraBox = '';
        if (extraParam) {
            if (extraParam === Constants.SIGNIN_CHANGE) {
                extraBox = (
                    <div className='alert alert-success'>
                        <i className='fa fa-check'/>
                        <FormattedMessage
                            id='login.changed'
                            defaultMessage=' Sign-in method changed successfully'
                        />
                    </div>
                );
            } else if (extraParam === Constants.SIGNIN_VERIFIED) {
                extraBox = (
                    <div className='alert alert-success'>
                        <i className='fa fa-check'/>
                        <FormattedMessage
                            id='login.verified'
                            defaultMessage=' Email Verified'
                        />
                    </div>
                );
            } else if (extraParam === Constants.SESSION_EXPIRED) {
                extraBox = (
                    <div className='alert alert-warning'>
                        <i className='fa fa-exclamation-triangle'/>
                        <FormattedMessage
                            id='login.session_expired'
                            defaultMessage=' Your session has expired. Please login again.'
                        />
                    </div>
                );
            } else if (extraParam === Constants.PASSWORD_CHANGE) {
                extraBox = (
                    <div className='alert alert-success'>
                        <i className='fa fa-check'/>
                        <FormattedMessage
                            id='login.passwordChanged'
                            defaultMessage=' Password updated successfully'
                        />
                    </div>
                );
            }
        }

        const loginControls = [];

        const ldapEnabled = this.state.ldapEnabled;
        const gitlabSigninEnabled = this.props.enableSignUpWithGitLab;
        const googleSigninEnabled = this.props.enableSignUpWithGoogle;
        const office365SigninEnabled = this.props.enableSignUpWithOffice365;
        const samlSigninEnabled = this.state.samlEnabled;
        const usernameSigninEnabled = this.state.usernameSigninEnabled;
        const emailSigninEnabled = this.state.emailSigninEnabled;

        if (emailSigninEnabled || usernameSigninEnabled || ldapEnabled) {
            let errorClass = '';
            if (this.state.serverError) {
                errorClass = ' has-error';
            }

            let loginButton = (
                <FormattedMessage
                    id='login.signIn'
                    defaultMessage='Sign in'
                />
            );

            if (this.state.loading) {
                loginButton =
                (<span>
                    <span className='fa fa-refresh icon--rotate'/>
                    <FormattedMessage
                        id='login.signInLoading'
                        defaultMessage='Signing in...'
                    />
                </span>);
            }

            loginControls.push(
                <form
                    key='loginBoxes'
                    onSubmit={this.preSubmit}
                >
                    <div className='signup__email-container'>
                        <FormError
                            error={this.state.serverError}
                            margin={true}
                        />
                        <div className={'form-group' + errorClass}>
                            <input
                                id='loginId'
                                className='form-control'
                                ref='loginId'
                                name='loginId'
                                value={this.state.loginId}
                                onChange={this.handleLoginIdChange}
                                placeholder={this.createLoginPlaceholder()}
                                spellCheck='false'
                                autoCapitalize='off'
                                autoFocus='true'
                            />
                        </div>
                        <div className={'form-group' + errorClass}>
                            <input
                                id='loginPassword'
                                type='password'
                                className='form-control'
                                ref='password'
                                name='password'
                                value={this.state.password}
                                onChange={this.handlePasswordChange}
                                placeholder={Utils.localizeMessage('login.password', 'Password')}
                                spellCheck='false'
                            />
                        </div>
                        <div className='form-group'>
                            <button
                                id='loginButton'
                                type='submit'
                                className='btn btn-primary'
                            >
                                { loginButton }
                            </button>
                        </div>
                    </div>
                </form>
            );
        }

        if (this.props.enableOpenServer && this.checkSignUpEnabled()) {
            loginControls.push(
                <div
                    className='form-group'
                    key='signup'
                >
                    <span>
                        <FormattedMessage
                            id='login.noAccount'
                            defaultMessage="Don't have an account? "
                        />
                        <Link
                            id='signup'
                            to={'/signup_user_complete' + this.props.location.search}
                            className='signup-team-login'
                        >
                            <FormattedMessage
                                id='login.create'
                                defaultMessage='Create one now'
                            />
                        </Link>
                    </span>
                </div>
            );
        }

        if (usernameSigninEnabled || emailSigninEnabled) {
            loginControls.push(
                <div
                    key='forgotPassword'
                    className='form-group'
                >
                    <Link to={'/reset_password'}>
                        <FormattedMessage
                            id='login.forgot'
                            defaultMessage='I forgot my password'
                        />
                    </Link>
                </div>
            );
        }

        if ((emailSigninEnabled || usernameSigninEnabled || ldapEnabled) && (gitlabSigninEnabled || googleSigninEnabled || samlSigninEnabled || office365SigninEnabled)) {
            loginControls.push(
                <div
                    key='divider'
                    className='or__container'
                >
                    <FormattedMessage
                        id='login.or'
                        defaultMessage='or'
                    />
                </div>
            );

            loginControls.push(
                <h5 key='oauthHeader'>
                    <FormattedMessage
                        id='login.signInWith'
                        defaultMessage='Sign in with:'
                    />
                </h5>
            );
        }

        if (gitlabSigninEnabled) {
            loginControls.push(
                <a
                    className='btn btn-custom-login gitlab'
                    key='gitlab'
                    href={Client4.getOAuthRoute() + '/gitlab/login' + this.props.location.search}
                >
                    <span>
                        <span className='icon'/>
                        <span>
                            <FormattedMessage
                                id='login.gitlab'
                                defaultMessage='GitLab'
                            />
                        </span>
                    </span>
                </a>
            );
        }

        if (googleSigninEnabled) {
            loginControls.push(
                <a
                    className='btn btn-custom-login google'
                    key='google'
                    href={Client4.getOAuthRoute() + '/google/login' + this.props.location.search}
                >
                    <span>
                        <span className='icon'/>
                        <span>
                            <FormattedMessage
                                id='login.google'
                                defaultMessage='Google Apps'
                            />
                        </span>
                    </span>
                </a>
            );
        }

        if (office365SigninEnabled) {
            loginControls.push(
                <a
                    className='btn btn-custom-login office365'
                    key='office365'
                    href={Client4.getOAuthRoute() + '/office365/login' + this.props.location.search}
                >
                    <span>
                        <span className='icon'/>
                        <span>
                            <FormattedMessage
                                id='login.office365'
                                defaultMessage='Office 365'
                            />
                        </span>
                    </span>
                </a>
            );
        }

        if (samlSigninEnabled) {
            loginControls.push(
                <a
                    className='btn btn-custom-login saml'
                    key='saml'
                    href={'/login/sso/saml' + this.props.location.search}
                >
                    <span>
                        <span className='icon fa fa-lock fa--margin-top'/>
                        <span>
                            {this.props.samlLoginButtonText}
                        </span>
                    </span>
                </a>
            );
        }

        if (loginControls.length === 0) {
            loginControls.push(
                <FormError
                    error={
                        <FormattedMessage
                            id='login.noMethods'
                            defaultMessage='No sign-in methods are enabled. Please contact your System Administrator.'
                        />
                    }
                    margin={true}
                />
            );
        }

        return (
            <div>
                {extraBox}
                {loginControls}
            </div>
        );
    }

    render() {
        const {
            customDescriptionText,
            isLicensed,
            siteName,
        } = this.props;

        let content;
        let customContent;
        let customClass;
        if (this.state.showMfa) {
            content = (
                <LoginMfa
                    loginId={this.state.loginId}
                    password={this.state.password}
                    submit={this.submit}
                />
            );
        } else {
            content = this.createLoginOptions();
            customContent = this.createCustomLogin();
            if (customContent) {
                customClass = 'branded';
            }
        }

        return (
            <div>
                <AnnouncementBar/>
                <div className='col-sm-12'>
                    <div className={'signup-team__container ' + customClass}>
                        <div className='signup__markdown'>
                            {customContent}
                        </div>
                        <img
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <div className='signup__content'>
                            <SiteNameAndDescription
                                customDescriptionText={customDescriptionText}
                                isLicensed={isLicensed}
                                siteName={siteName}
                            />
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
