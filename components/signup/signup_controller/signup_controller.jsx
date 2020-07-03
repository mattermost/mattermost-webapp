// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import {Client4} from 'mattermost-redux/client';

import {browserHistory} from 'utils/browser_history';
import * as GlobalActions from 'actions/global_actions.jsx';
import logoImage from 'images/logo.png';
import AnnouncementBar from 'components/announcement_bar';
import BackButton from 'components/common/back_button';
import FormError from 'components/form_error';
import LocalizedIcon from 'components/localized_icon';

import LoadingScreen from 'components/loading_screen';
import {Constants} from 'utils/constants';
import {t} from 'utils/i18n';

export default class SignupController extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object,
        loggedIn: PropTypes.bool.isRequired,
        isLicensed: PropTypes.bool.isRequired,
        enableOpenServer: PropTypes.bool.isRequired,
        noAccounts: PropTypes.bool.isRequired,
        enableSignUpWithEmail: PropTypes.bool.isRequired,
        enableSignUpWithGitLab: PropTypes.bool.isRequired,
        enableSignUpWithGoogle: PropTypes.bool.isRequired,
        enableSignUpWithOffice365: PropTypes.bool.isRequired,
        enableLDAP: PropTypes.bool.isRequired,
        enableSAML: PropTypes.bool.isRequired,
        samlLoginButtonText: PropTypes.string,
        siteName: PropTypes.string,
        usedBefore: PropTypes.string,
        ldapLoginFieldName: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            removeGlobalItem: PropTypes.func.isRequired,
            getTeamInviteInfo: PropTypes.func.isRequired,
            addUserToTeamFromInvite: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        let loading = false;
        let serverError = '';
        let noOpenServerError = false;
        let usedBefore = false;

        if (this.props.location.search) {
            const params = new URLSearchParams(this.props.location.search);
            let token = params.get('t');
            if (token == null) {
                token = '';
            }
            let inviteId = params.get('id');
            if (inviteId == null) {
                inviteId = '';
            }

            if (inviteId) {
                loading = true;
            } else if (!this.props.loggedIn) {
                usedBefore = props.usedBefore;
            } else if (!inviteId && !this.props.enableOpenServer && !this.props.noAccounts) {
                noOpenServerError = true;
                serverError = (
                    <FormattedMessage
                        id='signup_user_completed.no_open_server'
                        defaultMessage='This server does not allow open signups.  Please speak with your Administrator to receive an invitation.'
                    />
                );
            }
        }

        this.state = {
            loading,
            serverError,
            noOpenServerError,
            usedBefore,
        };
    }

    componentDidMount() {
        this.props.actions.removeGlobalItem('team');
        if (this.props.location.search) {
            const params = new URLSearchParams(this.props.location.search);
            const token = params.get('t') || '';
            const inviteId = params.get('id') || '';

            const userLoggedIn = this.props.loggedIn;

            if ((inviteId || token) && userLoggedIn) {
                this.addUserToTeamFromInvite(token, inviteId);
            } else if (inviteId) {
                this.getInviteInfo(inviteId);
            } else if (userLoggedIn) {
                GlobalActions.redirectUserToDefaultTeam();
            }
        }
    }

    addUserToTeamFromInvite = async (token, inviteId) => {
        const {data: team, error} = await this.props.actions.addUserToTeamFromInvite(token, inviteId);
        if (team) {
            browserHistory.push('/' + team.name + `/channels/${Constants.DEFAULT_CHANNEL}`);
        } else if (error) {
            this.handleInvalidInvite(error);
        }
    }

    getInviteInfo = async (inviteId) => {
        const {data, error} = await this.props.actions.getTeamInviteInfo(inviteId);
        if (data) {
            this.setState({
                serverError: '',
                loading: false,
            });
        } else if (error) {
            this.handleInvalidInvite(error);
        }
    }

    handleInvalidInvite = (err) => {
        let serverError;
        if (err.server_error_id === 'store.sql_user.save.max_accounts.app_error') {
            serverError = err.message;
        } else if (err.server_error_id === 'api.team.add_user_to_team_from_invite.guest.app_error') {
            serverError = err.message;
        } else {
            serverError = (
                <FormattedMessage
                    id='signup_user_completed.invalid_invite'
                    defaultMessage='The invite link was invalid.  Please speak with your Administrator to receive an invitation.'
                />
            );
        }

        this.setState({
            noOpenServerError: true,
            loading: false,
            serverError,
        });
    }

    renderSignupControls = () => {
        let signupControls = [];

        if (this.props.enableSignUpWithEmail) {
            signupControls.push(
                <Link
                    className='btn btn-custom-login btn--full email'
                    key='email'
                    to={'/signup_email' + window.location.search}
                >
                    <span>
                        <LocalizedIcon
                            className='icon fa fa-envelope'
                            component='span'
                            title={{id: t('signup.email.icon'), defaultMessage: 'Email Icon'}}
                        />
                        <FormattedMessage
                            id='signup.email'
                            defaultMessage='Email and Password'
                        />
                    </span>
                </Link>,
            );
        }

        if (this.props.enableSignUpWithGitLab) {
            signupControls.push(
                <a
                    className='btn btn-custom-login btn--full gitlab'
                    key='gitlab'
                    href={Client4.getOAuthRoute() + '/gitlab/signup' + window.location.search}
                >
                    <span>
                        <span className='icon'/>
                        <span>
                            <FormattedMessage
                                id='signup.gitlab'
                                defaultMessage='GitLab Single Sign-On'
                            />
                        </span>
                    </span>
                </a>,
            );
        }

        if (this.props.isLicensed && this.props.enableSignUpWithGoogle) {
            signupControls.push(
                <a
                    className='btn btn-custom-login btn--full google'
                    key='google'
                    href={Client4.getOAuthRoute() + '/google/signup' + window.location.search}
                >
                    <span>
                        <span className='icon'/>
                        <span>
                            <FormattedMessage
                                id='signup.google'
                                defaultMessage='Google Account'
                            />
                        </span>
                    </span>
                </a>,
            );
        }

        if (this.props.isLicensed && this.props.enableSignUpWithOffice365) {
            signupControls.push(
                <a
                    className='btn btn-custom-login btn--full office365'
                    key='office365'
                    href={Client4.getOAuthRoute() + '/office365/signup' + window.location.search}
                >
                    <span>
                        <span className='icon'/>
                        <span>
                            <FormattedMessage
                                id='signup.office365'
                                defaultMessage='Office 365'
                            />
                        </span>
                    </span>
                </a>,
            );
        }

        if (this.props.isLicensed && this.props.enableLDAP) {
            const params = new URLSearchParams(this.props.location.search);
            params.append('extra', 'create_ldap');
            const query = '?' + params.toString();

            let LDAPText = (
                <FormattedMessage
                    id='signup.ldap'
                    defaultMessage='AD/LDAP Credentials'
                />
            );
            if (this.props.ldapLoginFieldName) {
                LDAPText = this.props.ldapLoginFieldName;
            }
            signupControls.push(
                <Link
                    className='btn btn-custom-login btn--full ldap'
                    key='ldap'
                    to={'/login' + query}
                >
                    <span>
                        <LocalizedIcon
                            className='icon fa fa-folder-open fa--margin-top'
                            component='span'
                            title={{id: t('signup.ldap.icon'), defaultMessage: 'AD/LDAP Icon'}}
                        />
                        <span>
                            {LDAPText}
                        </span>
                    </span>
                </Link>,
            );
        }

        if (this.props.isLicensed && this.props.enableSAML) {
            let query = '';
            if (window.location.search) {
                query = '&action=signup';
            } else {
                query = '?action=signup';
            }

            signupControls.push(
                <Link
                    className='btn btn-custom-login btn--full saml'
                    key='saml'
                    to={'/login/sso/saml' + window.location.search + query}
                >
                    <span>
                        <LocalizedIcon
                            className='icon fa fa-lock fa--margin-top'
                            component='span'
                            title={{id: t('signup.saml.icon'), defaultMessage: 'SAML Icon'}}
                        />
                        <span>
                            {this.props.samlLoginButtonText}
                        </span>
                    </span>
                </Link>,
            );
        }

        if (signupControls.length === 0) {
            const signupDisabledError = (
                <FormattedMessage
                    id='signup_user_completed.none'
                    defaultMessage='No user creation method has been enabled. Please contact an administrator for access.'
                />
            );
            signupControls = (
                <FormError
                    error={signupDisabledError}
                    margin={true}
                />
            );
        } else if (signupControls.length === 1) {
            if (this.props.enableSignUpWithEmail) {
                return browserHistory.push('/signup_email' + window.location.search);
            } else if (this.props.isLicensed && this.props.enableLDAP) {
                return browserHistory.push('/login' + window.location.search);
            }
        }

        return signupControls;
    }

    render() {
        if (this.state.loading) {
            return (<LoadingScreen/>);
        }

        if (this.state.usedBefore) {
            return (
                <div>
                    <FormattedMessage
                        id='signup_user_completed.expired'
                        defaultMessage="You've already completed the signup process for this invitation or this invitation has expired."
                    />
                </div>
            );
        }

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className={'form-group has-error'}>
                    <label className='control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        let signupControls;
        if (this.state.noOpenServerError || this.state.usedBefore) {
            signupControls = null;
        } else {
            signupControls = this.renderSignupControls();
        }

        return (
            <div>
                <AnnouncementBar/>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <img
                            alt={'signup team logo'}
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <div className='signup__content'>
                            <h1>{this.props.siteName}</h1>
                            <h4 className='color--light'>
                                <FormattedMessage
                                    id='web.root.signup_info'
                                />
                            </h4>
                            <div className='mt-8'>
                                <h5><strong>
                                    <FormattedMessage
                                        id='signup.title'
                                        defaultMessage='Create an account with:'
                                    />
                                </strong></h5>
                            </div>
                            {signupControls}
                            {serverError}
                        </div>
                        <span className='color--light'>
                            <FormattedMessage
                                id='signup_user_completed.haveAccount'
                                defaultMessage='Already have an account?'
                            />
                            {' '}
                            <Link
                                to={'/login' + this.props.location.search}
                            >
                                <FormattedMessage
                                    id='signup_user_completed.signIn'
                                    defaultMessage='Click here to sign in.'
                                />
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}
