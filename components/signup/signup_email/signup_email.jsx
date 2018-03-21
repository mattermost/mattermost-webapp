// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import {getInviteInfo} from 'actions/team_actions.jsx';
import {createUserWithInvite, loadMe, loginById} from 'actions/user_actions.jsx';
import BrowserStore from 'stores/browser_store.jsx';

import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import logoImage from 'images/logo.png';

import BackButton from 'components/common/back_button.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
import SiteNameAndDescription from 'components/common/site_name_and_description';

export default class SignupEmail extends React.Component {
    static get propTypes() {
        return {
            location: PropTypes.object,
            isLicensed: PropTypes.bool.isRequired,
            enableSignUpWithEmail: PropTypes.bool.isRequired,
            siteName: PropTypes.string,
            termsOfServiceLink: PropTypes.string,
            privacyPolicyLink: PropTypes.string,
            customBrand: PropTypes.bool.isRequired,
            enableCustomBrand: PropTypes.bool.isRequired,
            customDescriptionText: PropTypes.string,
            passwordConfig: PropTypes.object,
        };
    }

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);

        this.getInviteInfo = this.getInviteInfo.bind(this);
        this.renderEmailSignup = this.renderEmailSignup.bind(this);
        this.isUserValid = this.isUserValid.bind(this);

        this.state = this.getInviteInfo();
    }

    componentDidMount() {
        trackEvent('signup', 'signup_user_01_welcome');
    }

    getInviteInfo() {
        let data = (new URLSearchParams(this.props.location.search)).get('d');
        let hash = (new URLSearchParams(this.props.location.search)).get('h');
        const inviteId = (new URLSearchParams(this.props.location.search)).get('id');
        let email = '';
        let teamDisplayName = '';
        let teamName = '';
        let teamId = '';
        let loading = false;
        const serverError = '';
        const noOpenServerError = false;

        if (hash && hash.length > 0) {
            const parsedData = JSON.parse(data);
            email = parsedData.email;
            teamDisplayName = parsedData.display_name;
            teamName = parsedData.name;
            teamId = parsedData.id;
        } else if (inviteId && inviteId.length > 0) {
            loading = true;
            getInviteInfo(
                inviteId,
                (inviteData) => {
                    if (!inviteData) {
                        this.setState({loading: false});
                        return;
                    }

                    this.setState({
                        loading: false,
                        serverError: '',
                        teamDisplayName: inviteData.display_name,
                        teamName: inviteData.name,
                        teamId: inviteData.id,
                    });
                },
                () => {
                    this.setState({
                        loading: false,
                        noOpenServerError: true,
                        serverError: (
                            <FormattedMessage
                                id='signup_user_completed.invalid_invite'
                                defaultMessage='The invite link was invalid.  Please speak with your Administrator to receive an invitation.'
                            />
                        ),
                    });
                }
            );

            data = null;
            hash = null;
        }

        return {
            data,
            hash,
            email,
            teamDisplayName,
            teamName,
            teamId,
            inviteId,
            loading,
            serverError,
            noOpenServerError,
        };
    }

    handleSignupSuccess(user, data) {
        trackEvent('signup', 'signup_user_02_complete');
        loginById(
            data.id,
            user.password,
            '',
            () => {
                if (this.state.hash > 0) {
                    BrowserStore.setGlobalItem(this.state.hash, JSON.stringify({usedBefore: true}));
                }

                loadMe().then(
                    () => {
                        const redirectTo = (new URLSearchParams(this.props.location.search)).get('redirect_to');
                        if (redirectTo) {
                            browserHistory.push(redirectTo);
                        } else {
                            GlobalActions.redirectUserToDefaultTeam();
                        }
                    }
                );
            },
            (err) => {
                if (err.id === 'api.user.login.not_verified.app_error') {
                    browserHistory.push('/should_verify_email?email=' + encodeURIComponent(user.email) + '&teamname=' + encodeURIComponent(this.state.teamName));
                } else {
                    this.setState({
                        serverError: err.message,
                        isSubmitting: false,
                    });
                }
            }
        );
    }

    isUserValid() {
        const providedEmail = this.refs.email.value.trim();
        if (!providedEmail) {
            this.setState({
                nameError: '',
                emailError: (<FormattedMessage id='signup_user_completed.required'/>),
                passwordError: '',
                serverError: '',
            });
            return false;
        }

        if (!Utils.isEmail(providedEmail)) {
            this.setState({
                nameError: '',
                emailError: (<FormattedMessage id='signup_user_completed.validEmail'/>),
                passwordError: '',
                serverError: '',
            });
            return false;
        }

        const providedUsername = this.refs.name.value.trim().toLowerCase();
        if (!providedUsername) {
            this.setState({
                nameError: (<FormattedMessage id='signup_user_completed.required'/>),
                emailError: '',
                passwordError: '',
                serverError: '',
            });
            return false;
        }

        const usernameError = Utils.isValidUsername(providedUsername);
        if (usernameError === 'Cannot use a reserved word as a username.') {
            this.setState({
                nameError: (<FormattedMessage id='signup_user_completed.reserved'/>),
                emailError: '',
                passwordError: '',
                serverError: '',
            });
            return false;
        } else if (usernameError) {
            this.setState({
                nameError: (
                    <FormattedMessage
                        id='signup_user_completed.usernameLength'
                        values={{
                            min: Constants.MIN_USERNAME_LENGTH,
                            max: Constants.MAX_USERNAME_LENGTH,
                        }}
                    />
                ),
                emailError: '',
                passwordError: '',
                serverError: '',
            });
            return false;
        }

        const providedPassword = this.refs.password.value;
        const pwdError = Utils.isValidPassword(providedPassword, this.props.passwordConfig);
        if (pwdError) {
            this.setState({
                nameError: '',
                emailError: '',
                passwordError: pwdError,
                serverError: '',
            });
            return false;
        }

        return true;
    }

    handleSubmit(e) {
        e.preventDefault();

        // bail out if a submission is already in progress
        if (this.state.isSubmitting) {
            return;
        }

        if (this.isUserValid()) {
            this.setState({
                nameError: '',
                emailError: '',
                passwordError: '',
                serverError: '',
                isSubmitting: true,
            });

            const user = {
                email: this.refs.email.value.trim(),
                username: this.refs.name.value.trim().toLowerCase(),
                password: this.refs.password.value,
                allow_marketing: true,
            };

            createUserWithInvite(user,
                this.state.data,
                this.state.hash,
                this.state.inviteId,
                this.handleSignupSuccess.bind(this, user),
                (err) => {
                    this.setState({
                        serverError: err.message,
                        isSubmitting: false,
                    });
                }
            );
        }
    }

    renderEmailSignup() {
        let emailError = null;
        let emailHelpText = (
            <span className='help-block'>
                <FormattedMessage
                    id='signup_user_completed.emailHelp'
                    defaultMessage='Valid email required for sign-up'
                />
            </span>
        );
        let emailDivStyle = 'form-group';
        if (this.state.emailError) {
            emailError = (<label className='control-label'>{this.state.emailError}</label>);
            emailHelpText = '';
            emailDivStyle += ' has-error';
        }

        let nameError = null;
        let nameHelpText = (
            <span className='help-block'>
                <FormattedMessage
                    id='signup_user_completed.userHelp'
                    defaultMessage="Username must begin with a letter, and contain between {min} to {max} lowercase characters made up of numbers, letters, and the symbols '.', '-' and '_'"
                    values={{
                        min: Constants.MIN_USERNAME_LENGTH,
                        max: Constants.MAX_USERNAME_LENGTH,
                    }}
                />
            </span>
        );
        let nameDivStyle = 'form-group';
        if (this.state.nameError) {
            nameError = <label className='control-label'>{this.state.nameError}</label>;
            nameHelpText = '';
            nameDivStyle += ' has-error';
        }

        let passwordError = null;
        let passwordDivStyle = 'form-group';
        if (this.state.passwordError) {
            passwordError = <label className='control-label'>{this.state.passwordError}</label>;
            passwordDivStyle += ' has-error';
        }

        let yourEmailIs = null;
        if (this.state.email) {
            yourEmailIs = (
                <FormattedHTMLMessage
                    id='signup_user_completed.emailIs'
                    defaultMessage="Your email address is <strong>{email}</strong>. You'll use this address to sign in to {siteName}."
                    values={{
                        email: this.state.email,
                        siteName: this.props.siteName,
                    }}
                />
            );
        }

        let emailContainerStyle = 'margin--extra';
        if (this.state.email) {
            emailContainerStyle = 'hidden';
        }

        return (
            <form>
                <div className='inner__content'>
                    <div className={emailContainerStyle}>
                        <h5><strong>
                            <FormattedMessage
                                id='signup_user_completed.whatis'
                                defaultMessage="What's your email address?"
                            />
                        </strong></h5>
                        <div className={emailDivStyle}>
                            <input
                                id='email'
                                type='email'
                                ref='email'
                                className='form-control'
                                defaultValue={this.state.email}
                                placeholder=''
                                maxLength='128'
                                autoFocus={true}
                                spellCheck='false'
                                autoCapitalize='off'
                            />
                            {emailError}
                            {emailHelpText}
                        </div>
                    </div>
                    {yourEmailIs}
                    <div className='margin--extra'>
                        <h5><strong>
                            <FormattedMessage
                                id='signup_user_completed.chooseUser'
                                defaultMessage='Choose your username'
                            />
                        </strong></h5>
                        <div className={nameDivStyle}>
                            <input
                                id='name'
                                type='text'
                                ref='name'
                                className='form-control'
                                placeholder=''
                                maxLength={Constants.MAX_USERNAME_LENGTH}
                                spellCheck='false'
                                autoCapitalize='off'
                            />
                            {nameError}
                            {nameHelpText}
                        </div>
                    </div>
                    <div className='margin--extra'>
                        <h5><strong>
                            <FormattedMessage
                                id='signup_user_completed.choosePwd'
                                defaultMessage='Choose your password'
                            />
                        </strong></h5>
                        <div className={passwordDivStyle}>
                            <input
                                id='password'
                                type='password'
                                ref='password'
                                className='form-control'
                                placeholder=''
                                maxLength='128'
                                spellCheck='false'
                            />
                            {passwordError}
                        </div>
                    </div>
                    <p className='margin--extra'>
                        <button
                            id='createAccountButton'
                            type='submit'
                            onClick={this.handleSubmit}
                            className='btn-primary btn'
                            disabled={this.state.isSubmitting}
                        >
                            <FormattedMessage
                                id='signup_user_completed.create'
                                defaultMessage='Create Account'
                            />
                        </button>
                    </p>
                </div>
            </form>
        );
    }

    render() {
        const {
            customDescriptionText,
            enableSignUpWithEmail,
            isLicensed,
            location,
            privacyPolicyLink,
            siteName,
            termsOfServiceLink,
        } = this.props;

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className={'form-group has-error'}>
                    <label className='control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        if (this.state.loading) {
            return (<LoadingScreen/>);
        }

        let emailSignup;
        if (enableSignUpWithEmail) {
            emailSignup = this.renderEmailSignup();
        } else {
            return null;
        }

        let terms = null;
        if (!this.state.noOpenServerError && emailSignup) {
            terms = (
                <p>
                    <FormattedHTMLMessage
                        id='create_team.agreement'
                        defaultMessage="By proceeding to create your account and use {siteName}, you agree to our <a href='{TermsOfServiceLink}'>Terms of Service</a> and <a href='{PrivacyPolicyLink}'>Privacy Policy</a>. If you do not agree, you cannot use {siteName}."
                        values={{
                            siteName,
                            TermsOfServiceLink: termsOfServiceLink,
                            PrivacyPolicyLink: privacyPolicyLink,
                        }}
                    />
                </p>
            );
        }

        if (this.state.noOpenServerError) {
            emailSignup = null;
        }

        return (
            <div>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container padding--less'>
                        <img
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <SiteNameAndDescription
                            customDescriptionText={customDescriptionText}
                            isLicensed={isLicensed}
                            siteName={siteName}
                        />
                        <h4 className='color--light'>
                            <FormattedMessage
                                id='signup_user_completed.lets'
                                defaultMessage="Let's create your account"
                            />
                        </h4>
                        <span className='color--light'>
                            <FormattedMessage
                                id='signup_user_completed.haveAccount'
                                defaultMessage='Already have an account?'
                            />
                            {' '}
                            <Link
                                to={'/login' + location.search}
                            >
                                <FormattedMessage
                                    id='signup_user_completed.signIn'
                                    defaultMessage='Click here to sign in.'
                                />
                            </Link>
                        </span>
                        {emailSignup}
                        {serverError}
                        {terms}
                    </div>
                </div>
            </div>
        );
    }
}
