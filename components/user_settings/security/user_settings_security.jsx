// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedDate, FormattedHTMLMessage, FormattedMessage, FormattedTime} from 'react-intl';
import {Link} from 'react-router-dom';
import * as UserUtils from 'mattermost-redux/utils/user_utils';

import {browserHistory} from 'utils/browser_history';
import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {deactivateMfa, deauthorizeOAuthApp, getAuthorizedApps, updatePassword} from 'actions/user_actions.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import Constants from 'utils/constants.jsx';
import {isMobile} from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import icon50 from 'images/icon50x50.png';
import AccessHistoryModal from 'components/access_history_modal';
import ActivityLogModal from 'components/activity_log_modal';
import ConfirmModal from 'components/confirm_modal.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';
import ToggleModalButton from 'components/toggle_modal_button.jsx';

const TOKEN_CREATING = 'creating';
const TOKEN_CREATED = 'created';
const TOKEN_NOT_CREATING = 'not_creating';
const SECTION_MFA = 'mfa';
const SECTION_PASSWORD = 'password';
const SECTION_SIGNIN = 'signin';
const SECTION_APPS = 'apps';
const SECTION_TOKENS = 'tokens';

export default class SecurityTab extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        activeSection: PropTypes.string,
        updateSection: PropTypes.func,
        updateTab: PropTypes.func,
        closeModal: PropTypes.func.isRequired,
        collapseModal: PropTypes.func.isRequired,
        setEnforceFocus: PropTypes.func.isRequired,

        /*
         * The personal access tokens for the user
         */
        userAccessTokens: PropTypes.object,

        /*
         * Set if access tokens are enabled and this user can use them
         */
        canUseAccessTokens: PropTypes.bool,

        // Whether or not this instance of Mattermost is licensed.
        isLicensed: PropTypes.bool,

        // Whether or not this instance of Mattermost is licensed to use multi-factor authentication.
        mfaLicensed: PropTypes.bool,

        // Whether or not OAuth applications are enabled.
        enableOAuthServiceProvider: PropTypes.bool,

        // Whether or not multi-factor authentication is enabled.
        enableMultifactorAuthentication: PropTypes.bool,

        // Whether or not multi-factor authentication is enforced.
        enforceMultifactorAuthentication: PropTypes.bool,

        // Whether or not sign-up with email is enabled.
        enableSignUpWithEmail: PropTypes.bool,

        // Whether or not sign-up with GitLab is enabled.
        enableSignUpWithGitLab: PropTypes.bool,

        // Whether or not sign-up with Google is enabled.
        enableSignUpWithGoogle: PropTypes.bool,

        // Whether or not sign-up with LDAP is enabled.
        enableLdap: PropTypes.bool,

        // Whether or not sign-up with SAML is enabled.
        enableSaml: PropTypes.bool,

        // Whether or not sign-up with Office 365 is enabled.
        enableSignUpWithOffice365: PropTypes.bool,

        // Whether or not the experimental authentication transfer is enabled.
        experimentalEnableAuthenticationTransfer: PropTypes.bool,

        actions: PropTypes.shape({
            getMe: PropTypes.func.isRequired,

            /*
             * Function to get personal access tokens for a user
             */
            getUserAccessTokensForUser: PropTypes.func.isRequired,

            /*
             * Function to create a personal access token
             */
            createUserAccessToken: PropTypes.func.isRequired,

            /*
             * Function to revoke a personal access token
             */
            revokeUserAccessToken: PropTypes.func.isRequired,

            /*
             * Function to activate a personal access token
             */
            enableUserAccessToken: PropTypes.func.isRequired,

            /*
             * Function to deactivate a personal access token
             */
            disableUserAccessToken: PropTypes.func.isRequired,

            /*
             * Function to clear personal access tokens locally
             */
            clearUserAccessTokens: PropTypes.func.isRequired
        }).isRequired
    }

    constructor(props) {
        super(props);

        this.state = this.getDefaultState();
    }

    getDefaultState() {
        return {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            passwordError: '',
            serverError: '',
            tokenError: '',
            showConfirmModal: false,
            authService: this.props.user.auth_service,
            savingPassword: false
        };
    }

    componentDidMount() {
        if (this.props.enableOAuthServiceProvider) {
            getAuthorizedApps(
                (authorizedApps) => {
                    this.setState({authorizedApps, serverError: null}); //eslint-disable-line react/no-did-mount-set-state
                },
                (err) => {
                    this.setState({serverError: err.message}); //eslint-disable-line react/no-did-mount-set-state
                }
            );
        }

        if (this.props.canUseAccessTokens) {
            this.props.actions.clearUserAccessTokens();
            const userId = this.props.user ? this.props.user.id : '';
            this.props.actions.getUserAccessTokensForUser(userId, 0, 200);
        }
    }

    submitPassword = () => {
        const user = this.props.user;
        const currentPassword = this.state.currentPassword;
        const newPassword = this.state.newPassword;
        const confirmPassword = this.state.confirmPassword;

        if (currentPassword === '') {
            this.setState({passwordError: Utils.localizeMessage('user.settings.security.currentPasswordError', 'Please enter your current password.'), serverError: ''});
            return;
        }

        const passwordErr = Utils.isValidPassword(newPassword, Utils.getPasswordConfig());
        if (passwordErr !== '') {
            this.setState({
                passwordError: passwordErr,
                serverError: ''
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            const defaultState = Object.assign(this.getDefaultState(), {passwordError: Utils.localizeMessage('user.settings.security.passwordMatchError', 'The new passwords you entered do not match.'), serverError: ''});
            this.setState(defaultState);
            return;
        }

        this.setState({savingPassword: true});

        updatePassword(
            user.id,
            currentPassword,
            newPassword,
            () => {
                this.props.updateSection('');
                this.props.actions.getMe();
                this.setState(this.getDefaultState());
            },
            (err) => {
                var state = this.getDefaultState();
                if (err.message) {
                    state.serverError = err.message;
                } else {
                    state.serverError = err;
                }
                state.passwordError = '';
                this.setState(state);
            }
        );
    }

    setupMfa = (e) => {
        e.preventDefault();
        browserHistory.push('/mfa/setup');
    }

    removeMfa = () => {
        deactivateMfa(
            () => {
                if (this.props.mfaLicensed &&
                        this.props.enableMultifactorAuthentication &&
                        this.props.enforceMultifactorAuthentication) {
                    window.location.href = '/mfa/setup';
                    return;
                }

                this.props.updateSection('');
                this.setState(this.getDefaultState());
            },
            (err) => {
                const state = this.getDefaultState();
                if (err.message) {
                    state.serverError = err.message;
                } else {
                    state.serverError = err;
                }
                this.setState(state);
            }
        );
    }

    updateCurrentPassword = (e) => {
        this.setState({currentPassword: e.target.value});
    }

    updateNewPassword = (e) => {
        this.setState({newPassword: e.target.value});
    }

    updateConfirmPassword = (e) => {
        this.setState({confirmPassword: e.target.value});
    }

    deauthorizeApp = (e) => {
        e.preventDefault();
        const appId = e.currentTarget.getAttribute('data-app');
        deauthorizeOAuthApp(
            appId,
            () => {
                const authorizedApps = this.state.authorizedApps.filter((app) => {
                    return app.id !== appId;
                });

                this.setState({authorizedApps, serverError: null});
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleUpdateSection = (section) => {
        if (section) {
            this.props.updateSection(section);
        } else {
            switch (this.props.activeSection) {
            case SECTION_MFA:
            case SECTION_SIGNIN:
            case SECTION_APPS:
                this.setState({
                    serverError: null
                });
                break;
            case SECTION_PASSWORD:
                this.setState({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                    serverError: null,
                    passwordError: null
                });
                break;
            case SECTION_TOKENS:
                this.setState({
                    newToken: null,
                    tokenCreationState: TOKEN_NOT_CREATING,
                    serverError: null,
                    tokenError: ''
                });
                break;
            default:
            }

            this.props.updateSection('');
        }
    }

    createMfaSection = () => {
        if (this.props.activeSection === SECTION_MFA) {
            let content;
            let extraInfo;
            if (this.props.user.mfa_active) {
                let mfaRemoveHelp;
                let mfaButtonText;

                if (this.props.enforceMultifactorAuthentication) {
                    mfaRemoveHelp = (
                        <FormattedMessage
                            id='user.settings.mfa.requiredHelp'
                            defaultMessage='Multi-factor authentication is required on this server. Resetting is only recommended when you need to switch code generation to a new mobile device. You will be required to set it up again immediately.'
                        />
                    );

                    mfaButtonText = (
                        <FormattedMessage
                            id='user.settings.mfa.reset'
                            defaultMessage='Reset MFA on your account'
                        />
                    );
                } else {
                    mfaRemoveHelp = (
                        <FormattedMessage
                            id='user.settings.mfa.removeHelp'
                            defaultMessage='Removing multi-factor authentication means you will no longer require a phone-based passcode to sign-in to your account.'
                        />
                    );

                    mfaButtonText = (
                        <FormattedMessage
                            id='user.settings.mfa.remove'
                            defaultMessage='Remove MFA from your account'
                        />
                    );
                }

                content = (
                    <div key='mfaQrCode'>
                        <a
                            className='btn btn-primary'
                            href='#'
                            onClick={this.removeMfa}
                        >
                            {mfaButtonText}
                        </a>
                        <br/>
                    </div>
                );

                extraInfo = (
                    <span>
                        {mfaRemoveHelp}
                    </span>
                );
            } else {
                content = (
                    <div key='mfaQrCode'>
                        <a
                            className='btn btn-primary'
                            href='#'
                            onClick={this.setupMfa}
                        >
                            <FormattedMessage
                                id='user.settings.mfa.add'
                                defaultMessage='Add MFA to your account'
                            />
                        </a>
                        <br/>
                    </div>
                );

                extraInfo = (
                    <span>
                        <FormattedMessage
                            id='user.settings.mfa.addHelp'
                            defaultMessage='Adding multi-factor authentication will make your account more secure by requiring a code from your mobile phone each time you sign in.'
                        />
                    </span>
                );
            }

            const inputs = [];
            inputs.push(
                <div
                    key='mfaSetting'
                    className='padding-top'
                >
                    {content}
                </div>
            );

            return (
                <SettingItemMax
                    title={Utils.localizeMessage('user.settings.mfa.title', 'Multi-factor Authentication')}
                    inputs={inputs}
                    extraInfo={extraInfo}
                    serverError={this.state.serverError}
                    updateSection={this.handleUpdateSection}
                    width='medium'
                />
            );
        }

        let describe;
        if (this.props.user.mfa_active) {
            describe = Utils.localizeMessage('user.settings.security.active', 'Active');
        } else {
            describe = Utils.localizeMessage('user.settings.security.inactive', 'Inactive');
        }

        return (
            <SettingItemMin
                title={Utils.localizeMessage('user.settings.mfa.title', 'Multi-factor Authentication')}
                describe={describe}
                section={SECTION_MFA}
                updateSection={this.handleUpdateSection}
            />
        );
    }

    createPasswordSection = () => {
        if (this.props.activeSection === SECTION_PASSWORD) {
            const inputs = [];
            let submit;

            if (this.props.user.auth_service === '') {
                submit = this.submitPassword;

                inputs.push(
                    <div
                        key='currentPasswordUpdateForm'
                        className='form-group'
                    >
                        <label className='col-sm-5 control-label'>
                            <FormattedMessage
                                id='user.settings.security.currentPassword'
                                defaultMessage='Current Password'
                            />
                        </label>
                        <div className='col-sm-7'>
                            <input
                                id='currentPassword'
                                autoFocus={true}
                                className='form-control'
                                type='password'
                                onChange={this.updateCurrentPassword}
                                value={this.state.currentPassword}
                            />
                        </div>
                    </div>
                );
                inputs.push(
                    <div
                        key='newPasswordUpdateForm'
                        className='form-group'
                    >
                        <label className='col-sm-5 control-label'>
                            <FormattedMessage
                                id='user.settings.security.newPassword'
                                defaultMessage='New Password'
                            />
                        </label>
                        <div className='col-sm-7'>
                            <input
                                id='newPassword'
                                className='form-control'
                                type='password'
                                onChange={this.updateNewPassword}
                                value={this.state.newPassword}
                            />
                        </div>
                    </div>
                );
                inputs.push(
                    <div
                        key='retypeNewPasswordUpdateForm'
                        className='form-group'
                    >
                        <label className='col-sm-5 control-label'>
                            <FormattedMessage
                                id='user.settings.security.retypePassword'
                                defaultMessage='Retype New Password'
                            />
                        </label>
                        <div className='col-sm-7'>
                            <input
                                id='confirmPassword'
                                className='form-control'
                                type='password'
                                onChange={this.updateConfirmPassword}
                                value={this.state.confirmPassword}
                            />
                        </div>
                    </div>
                );
            } else if (this.props.user.auth_service === Constants.GITLAB_SERVICE) {
                inputs.push(
                    <div
                        key='oauthEmailInfo'
                        className='form-group'
                    >
                        <div className='setting-list__hint col-sm-12'>
                            <FormattedMessage
                                id='user.settings.security.passwordGitlabCantUpdate'
                                defaultMessage='Login occurs through GitLab. Password cannot be updated.'
                            />
                        </div>
                    </div>
                );
            } else if (this.props.user.auth_service === Constants.LDAP_SERVICE) {
                inputs.push(
                    <div
                        key='oauthEmailInfo'
                        className='form-group'
                    >
                        <div className='setting-list__hint col-sm-12'>
                            <FormattedMessage
                                id='user.settings.security.passwordLdapCantUpdate'
                                defaultMessage='Login occurs through AD/LDAP. Password cannot be updated.'
                            />
                        </div>
                    </div>
                );
            } else if (this.props.user.auth_service === Constants.SAML_SERVICE) {
                inputs.push(
                    <div
                        key='oauthEmailInfo'
                        className='form-group'
                    >
                        <div className='setting-list__hint col-sm-12'>
                            <FormattedMessage
                                id='user.settings.security.passwordSamlCantUpdate'
                                defaultMessage='This field is handled through your login provider. If you want to change it, you need to do so through your login provider.'
                            />
                        </div>
                    </div>
                );
            } else if (this.props.user.auth_service === Constants.GOOGLE_SERVICE) {
                inputs.push(
                    <div
                        key='oauthEmailInfo'
                        className='form-group'
                    >
                        <div className='setting-list__hint col-sm-12'>
                            <FormattedMessage
                                id='user.settings.security.passwordGoogleCantUpdate'
                                defaultMessage='Login occurs through Google Apps. Password cannot be updated.'
                            />
                        </div>
                    </div>
                );
            } else if (this.props.user.auth_service === Constants.OFFICE365_SERVICE) {
                inputs.push(
                    <div
                        key='oauthEmailInfo'
                        className='form-group'
                    >
                        <div className='setting-list__hint col-sm-12'>
                            <FormattedMessage
                                id='user.settings.security.passwordOffice365CantUpdate'
                                defaultMessage='Login occurs through Office 365. Password cannot be updated.'
                            />
                        </div>
                    </div>
                );
            }

            return (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.security.password'
                            defaultMessage='Password'
                        />
                    }
                    inputs={inputs}
                    submit={submit}
                    saving={this.state.savingPassword}
                    serverError={this.state.serverError}
                    clientError={this.state.passwordError}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        let describe;

        if (this.props.user.auth_service === '') {
            const d = new Date(this.props.user.last_password_update);
            const hours12 = !PreferenceStore.getBool(Constants.Preferences.CATEGORY_DISPLAY_SETTINGS, Constants.Preferences.USE_MILITARY_TIME, false);

            describe = (
                <FormattedMessage
                    id='user.settings.security.lastUpdated'
                    defaultMessage='Last updated {date} at {time}'
                    values={{
                        date: (
                            <FormattedDate
                                value={d}
                                day='2-digit'
                                month='short'
                                year='numeric'
                            />
                        ),
                        time: (
                            <FormattedTime
                                value={d}
                                hour12={hours12}
                                hour='2-digit'
                                minute='2-digit'
                            />
                        )
                    }}
                />
            );
        } else if (this.props.user.auth_service === Constants.GITLAB_SERVICE) {
            describe = (
                <FormattedMessage
                    id='user.settings.security.loginGitlab'
                    defaultMessage='Login done through GitLab'
                />
            );
        } else if (this.props.user.auth_service === Constants.LDAP_SERVICE) {
            describe = (
                <FormattedMessage
                    id='user.settings.security.loginLdap'
                    defaultMessage='Login done through AD/LDAP'
                />
            );
        } else if (this.props.user.auth_service === Constants.SAML_SERVICE) {
            describe = (
                <FormattedMessage
                    id='user.settings.security.loginSaml'
                    defaultMessage='Login done through SAML'
                />
            );
        } else if (this.props.user.auth_service === Constants.GOOGLE_SERVICE) {
            describe = (
                <FormattedMessage
                    id='user.settings.security.loginGoogle'
                    defaultMessage='Login done through Google Apps'
                />
            );
        } else if (this.props.user.auth_service === Constants.OFFICE365_SERVICE) {
            describe = (
                <FormattedMessage
                    id='user.settings.security.loginOffice365'
                    defaultMessage='Login done through Office 365'
                />
            );
        }

        return (
            <SettingItemMin
                title={
                    <FormattedMessage
                        id='user.settings.security.password'
                        defaultMessage='Password'
                    />
                }
                describe={describe}
                section={SECTION_PASSWORD}
                updateSection={this.handleUpdateSection}
            />
        );
    }

    createSignInSection = () => {
        const user = this.props.user;

        if (this.props.activeSection === SECTION_SIGNIN) {
            let emailOption;
            let gitlabOption;
            let googleOption;
            let office365Option;
            let ldapOption;
            let samlOption;

            if (user.auth_service === '') {
                if (this.props.enableSignUpWithGitLab) {
                    gitlabOption = (
                        <div className='padding-bottom x2'>
                            <Link
                                className='btn btn-primary'
                                to={'/claim/email_to_oauth?email=' + encodeURIComponent(user.email) + '&old_type=' + user.auth_service + '&new_type=' + Constants.GITLAB_SERVICE}
                            >
                                <FormattedMessage
                                    id='user.settings.security.switchGitlab'
                                    defaultMessage='Switch to using GitLab SSO'
                                />
                            </Link>
                            <br/>
                        </div>
                    );
                }

                if (this.props.enableSignUpWithGoogle) {
                    googleOption = (
                        <div className='padding-bottom x2'>
                            <Link
                                className='btn btn-primary'
                                to={'/claim/email_to_oauth?email=' + encodeURIComponent(user.email) + '&old_type=' + user.auth_service + '&new_type=' + Constants.GOOGLE_SERVICE}
                            >
                                <FormattedMessage
                                    id='user.settings.security.switchGoogle'
                                    defaultMessage='Switch to using Google SSO'
                                />
                            </Link>
                            <br/>
                        </div>
                    );
                }

                if (this.props.enableSignUpWithOffice365) {
                    office365Option = (
                        <div className='padding-bottom x2'>
                            <Link
                                className='btn btn-primary'
                                to={'/claim/email_to_oauth?email=' + encodeURIComponent(user.email) + '&old_type=' + user.auth_service + '&new_type=' + Constants.OFFICE365_SERVICE}
                            >
                                <FormattedMessage
                                    id='user.settings.security.switchOffice365'
                                    defaultMessage='Switch to using Office 365 SSO'
                                />
                            </Link>
                            <br/>
                        </div>
                    );
                }

                if (this.props.enableLdap) {
                    ldapOption = (
                        <div className='padding-bottom x2'>
                            <Link
                                className='btn btn-primary'
                                to={'/claim/email_to_ldap?email=' + encodeURIComponent(user.email)}
                            >
                                <FormattedMessage
                                    id='user.settings.security.switchLdap'
                                    defaultMessage='Switch to using AD/LDAP'
                                />
                            </Link>
                            <br/>
                        </div>
                    );
                }

                if (this.props.enableSaml) {
                    samlOption = (
                        <div className='padding-bottom x2'>
                            <Link
                                className='btn btn-primary'
                                to={'/claim/email_to_oauth?email=' + encodeURIComponent(user.email) + '&old_type=' + user.auth_service + '&new_type=' + Constants.SAML_SERVICE}
                            >
                                <FormattedMessage
                                    id='user.settings.security.switchSaml'
                                    defaultMessage='Switch to using SAML SSO'
                                />
                            </Link>
                            <br/>
                        </div>
                    );
                }
            } else if (this.props.enableSignUpWithEmail) {
                let link;
                if (user.auth_service === Constants.LDAP_SERVICE) {
                    link = '/claim/ldap_to_email?email=' + encodeURIComponent(user.email);
                } else {
                    link = '/claim/oauth_to_email?email=' + encodeURIComponent(user.email) + '&old_type=' + user.auth_service;
                }

                emailOption = (
                    <div className='padding-bottom x2'>
                        <Link
                            className='btn btn-primary'
                            to={link}
                        >
                            <FormattedMessage
                                id='user.settings.security.switchEmail'
                                defaultMessage='Switch to using email and password'
                            />
                        </Link>
                        <br/>
                    </div>
                );
            }

            const inputs = [];
            inputs.push(
                <div key='userSignInOption'>
                    {emailOption}
                    {gitlabOption}
                    {googleOption}
                    {office365Option}
                    {ldapOption}
                    {samlOption}
                </div>
            );

            const extraInfo = (
                <span>
                    <FormattedMessage
                        id='user.settings.security.oneSignin'
                        defaultMessage='You may only have one sign-in method at a time. Switching sign-in method will send an email notifying you if the change was successful.'
                    />
                </span>
            );

            return (
                <SettingItemMax
                    title={Utils.localizeMessage('user.settings.security.method', 'Sign-in Method')}
                    extraInfo={extraInfo}
                    inputs={inputs}
                    serverError={this.state.serverError}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        let describe = (
            <FormattedMessage
                id='user.settings.security.emailPwd'
                defaultMessage='Email and Password'
            />
        );
        if (this.props.user.auth_service === Constants.GITLAB_SERVICE) {
            describe = (
                <FormattedMessage
                    id='user.settings.security.gitlab'
                    defaultMessage='GitLab'
                />
            );
        } else if (this.props.user.auth_service === Constants.GOOGLE_SERVICE) {
            describe = (
                <FormattedMessage
                    id='user.settings.security.google'
                    defaultMessage='Google'
                />
            );
        } else if (this.props.user.auth_service === Constants.OFFICE365_SERVICE) {
            describe = (
                <FormattedMessage
                    id='user.settings.security.office365'
                    defaultMessage='Office 365'
                />
            );
        } else if (this.props.user.auth_service === Constants.LDAP_SERVICE) {
            describe = (
                <FormattedMessage
                    id='user.settings.security.ldap'
                    defaultMessage='AD/LDAP'
                />
            );
        } else if (this.props.user.auth_service === Constants.SAML_SERVICE) {
            describe = (
                <FormattedMessage
                    id='user.settings.security.saml'
                    defaultMessage='SAML'
                />
            );
        }

        return (
            <SettingItemMin
                title={Utils.localizeMessage('user.settings.security.method', 'Sign-in Method')}
                describe={describe}
                section={SECTION_SIGNIN}
                updateSection={this.handleUpdateSection}
            />
        );
    }

    createOAuthAppsSection = () => {
        if (this.props.activeSection === SECTION_APPS) {
            let apps;
            if (this.state.authorizedApps && this.state.authorizedApps.length > 0) {
                apps = this.state.authorizedApps.map((app) => {
                    const homepage = (
                        <a
                            href={app.homepage}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            {app.homepage}
                        </a>
                    );

                    return (
                        <div
                            key={app.id}
                            className='padding-bottom x2 authorized-app'
                        >
                            <div className='col-sm-10'>
                                <div className='authorized-app__name'>
                                    {app.name}
                                    <span className='authorized-app__url'>
                                        {' -'} {homepage}
                                    </span>
                                </div>
                                <div className='authorized-app__description'>{app.description}</div>
                                <div className='authorized-app__deauthorize'>
                                    <a
                                        href='#'
                                        data-app={app.id}
                                        onClick={this.deauthorizeApp}
                                    >
                                        <FormattedMessage
                                            id='user.settings.security.deauthorize'
                                            defaultMessage='Deauthorize'
                                        />
                                    </a>
                                </div>
                            </div>
                            <div className='col-sm-2 pull-right'>
                                <img
                                    alt={app.name}
                                    src={app.icon_url || icon50}
                                />
                            </div>
                            <br/>
                        </div>
                    );
                });
            } else {
                apps = (
                    <div className='padding-bottom x2 authorized-app'>
                        <div className='setting-list__hint'>
                            <FormattedMessage
                                id='user.settings.security.noApps'
                                defaultMessage='No OAuth 2.0 Applications are authorized.'
                            />
                        </div>
                    </div>
                );
            }

            const inputs = [];
            let wrapperClass;
            let helpText;
            if (Array.isArray(apps)) {
                wrapperClass = 'authorized-apps__wrapper';

                helpText = (
                    <div className='authorized-apps__help'>
                        <FormattedMessage
                            id='user.settings.security.oauthAppsHelp'
                            defaultMessage='Applications act on your behalf to access your data based on the permissions you grant them.'
                        />
                    </div>
                );
            }

            inputs.push(
                <div
                    className={wrapperClass}
                    key='authorizedApps'
                >
                    {apps}
                </div>
            );

            const title = (
                <div>
                    <FormattedMessage
                        id='user.settings.security.oauthApps'
                        defaultMessage='OAuth 2.0 Applications'
                    />
                    {helpText}
                </div>
            );

            return (
                <SettingItemMax
                    title={title}
                    inputs={inputs}
                    serverError={this.state.serverError}
                    updateSection={this.handleUpdateSection}
                    width='full'
                    cancelButtonText={
                        <FormattedMessage
                            id='user.settings.security.close'
                            defaultMessage='Close'
                        />
                    }
                />
            );
        }

        return (
            <SettingItemMin
                title={Utils.localizeMessage('user.settings.security.oauthApps', 'OAuth 2.0 Applications')}
                describe={
                    <FormattedMessage
                        id='user.settings.security.oauthAppsDescription'
                        defaultMessage="Click 'Edit' to manage your OAuth 2.0 Applications"
                    />
                }
                section={SECTION_APPS}
                updateSection={this.handleUpdateSection}
            />
        );
    }

    startCreatingToken = () => {
        this.setState({tokenCreationState: TOKEN_CREATING});
    }

    stopCreatingToken = () => {
        this.setState({tokenCreationState: TOKEN_NOT_CREATING});
    }

    handleCreateToken = async () => {
        this.handleCancelConfirm();

        const description = this.refs.newtokendescription ? this.refs.newtokendescription.value : '';

        if (description === '') {
            this.setState({tokenError: Utils.localizeMessage('user.settings.tokens.nameRequired', 'Please enter a description.')});
            return;
        }

        this.setState({tokenError: ''});

        const userId = this.props.user ? this.props.user.id : '';
        const {data, error} = await this.props.actions.createUserAccessToken(userId, description);

        if (data) {
            this.setState({tokenCreationState: TOKEN_CREATED, newToken: data});
        } else if (error) {
            this.setState({serverError: error.message});
        }
    }

    handleCancelConfirm = () => {
        this.setState({
            showConfirmModal: false,
            confirmTitle: null,
            confirmMessage: null,
            confirmButton: null,
            confirmComplete: null
        });
    }

    confirmCreateToken = () => {
        if (UserUtils.isSystemAdmin(this.props.user.roles)) {
            this.setState({
                showConfirmModal: true,
                confirmTitle: (
                    <FormattedMessage
                        id='user.settings.tokens.confirmCreateTitle'
                        defaultMessage='Create System Admin Personal Access Token'
                    />
                ),
                confirmMessage: (
                    <div className='alert alert-danger'>
                        <FormattedHTMLMessage
                            id='user.settings.tokens.confirmCreateMessage'
                            defaultMessage='You are generating a personal access token with System Admin permissions. Are you sure want to create this token?'
                        />
                    </div>
                ),
                confirmButton: (
                    <FormattedMessage
                        id='user.settings.tokens.confirmCreateButton'
                        defaultMessage='Yes, Create'
                    />
                ),
                confirmComplete: () => {
                    this.handleCreateToken();
                    trackEvent('settings', 'system_admin_create_user_access_token');
                }
            });

            return;
        }

        this.handleCreateToken();
    }

    saveTokenKeyPress = (e) => {
        if (e.which === Constants.KeyCodes.ENTER) {
            this.confirmCreateToken();
        }
    }

    confirmRevokeToken = (tokenId) => {
        const token = this.props.userAccessTokens[tokenId];

        this.setState({
            showConfirmModal: true,
            confirmTitle: (
                <FormattedMessage
                    id='user.settings.tokens.confirmDeleteTitle'
                    defaultMessage='Delete Token?'
                />
            ),
            confirmMessage: (
                <div className='alert alert-danger'>
                    <FormattedHTMLMessage
                        id='user.settings.tokens.confirmDeleteMessage'
                        defaultMessage='Any integrations using this token will no longer be able to access the Mattermost API. You cannot undo this action. <br /><br />Are you sure want to delete the {description} token?'
                        values={{
                            description: token.description
                        }}
                    />
                </div>
            ),
            confirmButton: (
                <FormattedMessage
                    id='user.settings.tokens.confirmDeleteButton'
                    defaultMessage='Yes, Delete'
                />
            ),
            confirmComplete: () => {
                this.revokeToken(tokenId);
                trackEvent('settings', 'revoke_user_access_token');
            }
        });
    }

    revokeToken = async (tokenId) => {
        const {error} = await this.props.actions.revokeUserAccessToken(tokenId);
        if (error) {
            this.setState({serverError: error.message});
        }
        this.handleCancelConfirm();
    }

    activateToken = async (tokenId) => {
        const {error} = await this.props.actions.enableUserAccessToken(tokenId);
        if (error) {
            this.setState({serverError: error.message});
        } else {
            trackEvent('settings', 'activate_user_access_token');
        }
    }

    deactivateToken = async (tokenId) => {
        const {error} = await this.props.actions.disableUserAccessToken(tokenId);
        if (error) {
            this.setState({serverError: error.message});
        } else {
            trackEvent('settings', 'deactivate_user_access_token');
        }
    }

    createTokensSection = () => {
        let tokenListClass = '';

        if (this.props.activeSection === SECTION_TOKENS) {
            const tokenList = [];
            Object.values(this.props.userAccessTokens).forEach((token) => {
                if (this.state.newToken && this.state.newToken.id === token.id) {
                    return;
                }

                let activeLink;
                let activeStatus;

                if (token.is_active) {
                    activeLink = (
                        <a
                            name={token.id + '_deactivate'}
                            href='#'
                            onClick={(e) => {
                                e.preventDefault();
                                this.deactivateToken(token.id);
                            }}
                        >
                            <FormattedMessage
                                id='user.settings.tokens.deactivate'
                                defaultMessage='Deactivate'
                            />
                        </a>);
                } else {
                    activeStatus = (
                        <span className='has-error setting-box__inline-error'>
                            <FormattedMessage
                                id='user.settings.tokens.deactivatedWarning'
                                defaultMessage='(Inactive)'
                            />
                        </span>
                    );
                    activeLink = (
                        <a
                            name={token.id + '_activate'}
                            href='#'
                            onClick={(e) => {
                                e.preventDefault();
                                this.activateToken(token.id);
                            }}
                        >
                            <FormattedMessage
                                id='user.settings.tokens.activate'
                                defaultMessage='Activate'
                            />
                        </a>
                    );
                }

                tokenList.push(
                    <div
                        key={token.id}
                        className='setting-box__item'
                    >
                        <div className='whitespace--nowrap overflow--ellipsis'>
                            <FormattedMessage
                                id='user.settings.tokens.tokenDesc'
                                defaultMessage='Token Description: '
                            />
                            {token.description}
                            {activeStatus}
                        </div>
                        <div className='setting-box__token-id whitespace--nowrap overflow--ellipsis'>
                            <FormattedMessage
                                id='user.settings.tokens.tokenId'
                                defaultMessage='Token ID: '
                            />
                            {token.id}
                        </div>
                        <div>
                            {activeLink}
                            {' - '}
                            <a
                                name={token.id + '_delete'}
                                href='#'
                                onClick={(e) => {
                                    e.preventDefault();
                                    this.confirmRevokeToken(token.id);
                                }}
                            >
                                <FormattedMessage
                                    id='user.settings.tokens.delete'
                                    defaultMessage='Delete'
                                />
                            </a>
                        </div>
                        <hr className='margin-bottom margin-top x2'/>
                    </div>
                );
            });

            let noTokenText;
            if (tokenList.length === 0) {
                noTokenText = (
                    <FormattedMessage
                        key='notokens'
                        id='user.settings.tokens.userAccessTokensNone'
                        defaultMessage='No personal access tokens.'
                    />
                );
            }

            let extraInfo;
            if (isMobile()) {
                extraInfo = (
                    <span>
                        <FormattedHTMLMessage
                            id='user.settings.tokens.description_mobile'
                            defaultMessage='<a href="https://about.mattermost.com/default-user-access-tokens" target="_blank">Personal access tokens</a> function similarly to session tokens and can be used by integrations to <a href="https://about.mattermost.com/default-api-authentication" target="_blank">authenticate against the REST API</a>. Create new tokens on your desktop.'
                        />
                    </span>
                );
            } else {
                extraInfo = (
                    <span>
                        <FormattedHTMLMessage
                            id='user.settings.tokens.description'
                            defaultMessage='<a href="https://about.mattermost.com/default-user-access-tokens" target="_blank">Personal access tokens</a> function similarly to session tokens and can be used by integrations to <a href="https://about.mattermost.com/default-api-authentication" target="_blank">authenticate against the REST API</a>.'
                        />
                    </span>
                );
            }

            let newTokenSection;
            if (this.state.tokenCreationState === TOKEN_CREATING) {
                newTokenSection = (
                    <div className='padding-left x2'>
                        <div className='row'>
                            <label className='col-sm-auto control-label padding-right x2'>
                                <FormattedMessage
                                    id='user.settings.tokens.name'
                                    defaultMessage='Token Description: '
                                />
                            </label>
                            <div className='col-sm-5'>
                                <input
                                    autoFocus={true}
                                    ref='newtokendescription'
                                    className='form-control'
                                    type='text'
                                    maxLength={64}
                                    onKeyPress={this.saveTokenKeyPress}
                                />
                            </div>
                        </div>
                        <div>
                            <div className='padding-top x2'>
                                <FormattedMessage
                                    id='user.settings.tokens.nameHelp'
                                    defaultMessage='Enter a description for your token to remember what it does.'
                                />
                            </div>
                            <div>
                                <label
                                    id='clientError'
                                    className='has-error margin-top margin-bottom'
                                >
                                    {this.state.tokenError}
                                </label>
                            </div>
                            <button
                                className='btn btn-primary'
                                onClick={this.confirmCreateToken}
                            >
                                <FormattedMessage
                                    id='user.settings.tokens.save'
                                    defaultMessage='Save'
                                />
                            </button>
                            <button
                                className='btn btn-default'
                                onClick={this.stopCreatingToken}
                            >
                                <FormattedMessage
                                    id='user.settings.tokens.cancel'
                                    defaultMessage='Cancel'
                                />
                            </button>
                        </div>
                    </div>
                );
            } else if (this.state.tokenCreationState === TOKEN_CREATED) {
                if (tokenList.length === 0) {
                    tokenListClass = ' hidden';
                }

                newTokenSection = (
                    <div
                        className='alert alert-warning'
                    >
                        <i className='fa fa-warning margin-right'/>
                        <FormattedMessage
                            id='user.settings.tokens.copy'
                            defaultMessage="Please copy the access token below. You won't be able to see it again!"
                        />
                        <br/>
                        <br/>
                        <div className='whitespace--nowrap overflow--ellipsis'>
                            <FormattedMessage
                                id='user.settings.tokens.name'
                                defaultMessage='Token Description: '
                            />
                            {this.state.newToken.description}
                        </div>
                        <div className='whitespace--nowrap overflow--ellipsis'>
                            <FormattedMessage
                                id='user.settings.tokens.id'
                                defaultMessage='Token ID: '
                            />
                            {this.state.newToken.id}
                        </div>
                        <strong className='word-break--all'>
                            <FormattedMessage
                                id='user.settings.tokens.token'
                                defaultMessage='Access Token: '
                            />
                            {this.state.newToken.token}
                        </strong>
                    </div>
                );
            } else {
                newTokenSection = (
                    <a
                        className='btn btn-primary'
                        href='#'
                        onClick={this.startCreatingToken}
                    >
                        <FormattedMessage
                            id='user.settings.tokens.create'
                            defaultMessage='Create New Token'
                        />
                    </a>
                );
            }

            const inputs = [];
            inputs.push(
                <div
                    key='tokensSetting'
                    className='padding-top'
                >
                    <div key='tokenList'>
                        <div className={'alert alert-transparent' + tokenListClass}>
                            {tokenList}
                            {noTokenText}
                        </div>
                        {newTokenSection}
                    </div>
                </div>
            );

            return (
                <SettingItemMax
                    title={Utils.localizeMessage('user.settings.tokens.title', 'Personal Access Tokens')}
                    inputs={inputs}
                    extraInfo={extraInfo}
                    infoPosition='top'
                    serverError={this.state.serverError}
                    updateSection={this.handleUpdateSection}
                    width='full'
                    cancelButtonText={
                        <FormattedMessage
                            id='user.settings.security.close'
                            defaultMessage='Close'
                        />
                    }
                />
            );
        }

        const describe = Utils.localizeMessage('user.settings.tokens.clickToEdit', "Click 'Edit' to manage your personal access tokens");

        return (
            <SettingItemMin
                title={Utils.localizeMessage('user.settings.tokens.title', 'Personal Access Tokens')}
                describe={describe}
                section={SECTION_TOKENS}
                updateSection={this.handleUpdateSection}
            />
        );
    }

    render() {
        const user = this.props.user;

        const passwordSection = this.createPasswordSection();

        let numMethods = 0;
        numMethods = this.props.enableSignUpWithGitLab ? numMethods + 1 : numMethods;
        numMethods = this.props.enableSignUpWithGoogle ? numMethods + 1 : numMethods;
        numMethods = this.props.enableSignUpWithOffice365 ? numMethods + 1 : numMethods;
        numMethods = this.props.enableLdap ? numMethods + 1 : numMethods;
        numMethods = this.props.enableSaml ? numMethods + 1 : numMethods;

        // If there are other sign-in methods and either email is enabled or the user's account is email, then allow switching
        let signInSection;
        if ((this.props.enableSignUpWithEmail || user.auth_service === '') &&
            numMethods > 0 && this.props.experimentalEnableAuthenticationTransfer) {
            signInSection = this.createSignInSection();
        }

        let mfaSection;
        if (this.props.enableMultifactorAuthentication &&
                this.props.isLicensed &&
                (user.auth_service === '' || user.auth_service === Constants.LDAP_SERVICE)) {
            mfaSection = this.createMfaSection();
        }

        let oauthSection;
        if (this.props.enableOAuthServiceProvider) {
            oauthSection = this.createOAuthAppsSection();
        }

        let tokensSection;
        if (this.props.canUseAccessTokens) {
            tokensSection = this.createTokensSection();
        }

        return (
            <div>
                <div className='modal-header'>
                    <button
                        type='button'
                        className='close'
                        data-dismiss='modal'
                        aria-label={Utils.localizeMessage('user.settings.security.close', 'Close')}
                        onClick={this.props.closeModal}
                    >
                        <span aria-hidden='true'>{'×'}</span>
                    </button>
                    <h4
                        className='modal-title'
                        ref='title'
                    >
                        <div className='modal-back'>
                            <i
                                className='fa fa-angle-left'
                                onClick={this.props.collapseModal}
                            />
                        </div>
                        <FormattedMessage
                            id='user.settings.security.title'
                            defaultMessage='Security Settings'
                        />
                    </h4>
                </div>
                <div className='user-settings'>
                    <h3 className='tab-header'>
                        <FormattedMessage
                            id='user.settings.security.title'
                            defaultMessage='Security Settings'
                        />
                    </h3>
                    <div className='divider-dark first'/>
                    {passwordSection}
                    <div className='divider-light'/>
                    {mfaSection}
                    <div className='divider-light'/>
                    {oauthSection}
                    <div className='divider-light'/>
                    {tokensSection}
                    <div className='divider-light'/>
                    {signInSection}
                    <div className='divider-dark'/>
                    <br/>
                    <ToggleModalButton
                        className='security-links color--link'
                        dialogType={AccessHistoryModal}
                    >
                        <i className='fa fa-clock-o'/>
                        <FormattedMessage
                            id='user.settings.security.viewHistory'
                            defaultMessage='View Access History'
                        />
                    </ToggleModalButton>
                    <ToggleModalButton
                        className='security-links color--link margin-top'
                        dialogType={ActivityLogModal}
                    >
                        <i className='fa fa-clock-o'/>
                        <FormattedMessage
                            id='user.settings.security.logoutActiveSessions'
                            defaultMessage='View and Logout of Active Sessions'
                        />
                    </ToggleModalButton>
                </div>
                <ConfirmModal
                    title={this.state.confirmTitle}
                    message={this.state.confirmMessage}
                    confirmButtonText={this.state.confirmButton}
                    show={this.state.showConfirmModal}
                    onConfirm={this.state.confirmComplete || (() => {})} //eslint-disable-line no-empty-function
                    onCancel={this.handleCancelConfirm}
                />
            </div>
        );
    }
}

SecurityTab.defaultProps = {
    user: {},
    activeSection: ''
};
