// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {isEmail} from 'mattermost-redux/utils/helpers';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import {browserHistory} from 'utils/browser_history';
import Constants, {ValidationErrors} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import logoImage from 'images/logo.png';

import BackButton from 'components/common/back_button';
import LoadingScreen from 'components/loading_screen';
import SiteNameAndDescription from 'components/common/site_name_and_description';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class SignupEmail extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object,
        enableSignUpWithEmail: PropTypes.bool.isRequired,
        siteName: PropTypes.string,
        termsOfServiceLink: PropTypes.string,
        privacyPolicyLink: PropTypes.string,
        customDescriptionText: PropTypes.string,
        passwordConfig: PropTypes.object,
        hasAccounts: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            createUser: PropTypes.func.isRequired,
            loginById: PropTypes.func.isRequired,
            setGlobalItem: PropTypes.func.isRequired,
            getTeamInviteInfo: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        const data = (new URLSearchParams(this.props.location.search)).get('d');
        const token = (new URLSearchParams(this.props.location.search)).get('t');
        const inviteId = (new URLSearchParams(this.props.location.search)).get('id');

        this.state = {};
        if (token && token.length > 0) {
            this.state = this.getTokenData(token, data);
        } else if (inviteId && inviteId.length > 0) {
            this.state = {
                loading: true,
                inviteId,
            };
        }

        this.emailRef = React.createRef();
        this.nameRef = React.createRef();
        this.passwordRef = React.createRef();
    }

    componentDidMount() {
        trackEvent('signup', 'signup_user_01_welcome');

        this.setDocumentTitle(this.props.siteName);

        const {inviteId} = this.state;
        if (inviteId && inviteId.length > 0) {
            this.getInviteInfo(inviteId);
        }

        if (!this.props.hasAccounts) {
            document.body.classList.remove('sticky');
        }
    }

    componentDidUpdate() {
        this.setDocumentTitle(this.props.siteName);
    }

    setDocumentTitle = (siteName) => {
        if (siteName) {
            document.title = siteName;
        }
    }

    getTokenData = (token, data) => {
        const parsedData = JSON.parse(data);

        return {
            loading: false,
            token,
            email: parsedData.email,
            teamName: parsedData.name,
        };
    }

    getInviteInfo = async (inviteId) => {
        const {data, error} = await this.props.actions.getTeamInviteInfo(inviteId);
        if (data) {
            this.setState({
                loading: false,
                noOpenServerError: false,
                serverError: '',
                teamName: data.name,
            });
        } else if (error) {
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
    }

    handleSignupSuccess = (user, data) => {
        trackEvent('signup', 'signup_user_02_complete');
        const redirectTo = (new URLSearchParams(this.props.location.search)).get('redirect_to');

        this.props.actions.loginById(data.id, user.password, '').then(({error}) => {
            if (error) {
                if (error.server_error_id === 'api.user.login.not_verified.app_error') {
                    let verifyUrl = '/should_verify_email?email=' + encodeURIComponent(user.email);
                    if (this.state.teamName) {
                        verifyUrl += '&teamname=' + encodeURIComponent(this.state.teamName);
                    }
                    if (redirectTo) {
                        verifyUrl += '&redirect_to=' + redirectTo;
                    }
                    browserHistory.push(verifyUrl);
                } else {
                    this.setState({
                        serverError: error.message,
                        isSubmitting: false,
                    });
                }

                return;
            }

            if (this.state.token > 0) {
                this.props.actions.setGlobalItem(this.state.token, JSON.stringify({usedBefore: true}));
            }

            if (redirectTo) {
                browserHistory.push(redirectTo);
            } else {
                GlobalActions.redirectUserToDefaultTeam();
            }
        });
    }

    isUserValid = () => {
        const providedEmail = this.emailRef.current.value.trim();
        if (!providedEmail) {
            this.setState({
                nameError: '',
                emailError: (<FormattedMessage id='signup_user_completed.required'/>),
                passwordError: '',
                serverError: '',
            });
            return false;
        }

        if (!isEmail(providedEmail)) {
            this.setState({
                nameError: '',
                emailError: (<FormattedMessage id='signup_user_completed.validEmail'/>),
                passwordError: '',
                serverError: '',
            });
            return false;
        }

        const providedUsername = this.nameRef.current.value.trim().toLowerCase();
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
        if (usernameError) {
            let errObj;
            if (usernameError.id === ValidationErrors.RESERVED_NAME) {
                errObj = {
                    nameError: (<FormattedMessage id='signup_user_completed.reserved'/>),
                    emailError: '',
                    passwordError: '',
                    serverError: '',
                };
            } else {
                errObj = {
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
                };
            }
            this.setState(errObj);
            return false;
        }

        const providedPassword = this.passwordRef.current.value;
        const {valid, error} = Utils.isValidPassword(providedPassword, this.props.passwordConfig);
        if (!valid && error) {
            this.setState({
                nameError: '',
                emailError: '',
                passwordError: error,
                serverError: '',
            });
            return false;
        }

        return true;
    }

    handleSubmit = (e) => {
        e.preventDefault();
        trackEvent('signup_email', 'click_create_account');

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
                email: this.emailRef.current.value.trim(),
                username: this.nameRef.current.value.trim().toLowerCase(),
                password: this.passwordRef.current.value,
                allow_marketing: true,
            };

            const redirectTo = (new URLSearchParams(this.props.location.search)).get('redirect_to');

            this.props.actions.createUser(user, this.state.token, this.state.inviteId, redirectTo).then((result) => {
                if (result.error) {
                    this.setState({
                        serverError: result.error.message,
                        isSubmitting: false,
                    });
                    return;
                }

                this.handleSignupSuccess(user, result.data);
            });
        }
    }

    renderEmailSignup = () => {
        let emailError = null;
        let emailHelpText = (
            <span
                id='valid_email'
                className='help-block'
            >
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
            <span
                id='valid_name'
                className='help-block'
            >
                <FormattedMessage
                    id='signup_user_completed.userHelp'
                    defaultMessage='You can use lowercase letters, numbers, periods, dashes, and underscores.'
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
                <FormattedMarkdownMessage
                    id='signup_user_completed.emailIs'
                    defaultMessage="Your email address is **{email}**. You'll use this address to sign in to {siteName}."
                    values={{
                        email: this.state.email,
                        siteName: this.props.siteName,
                    }}
                />
            );
        }

        let emailContainerStyle = 'mt-8';
        if (this.state.email) {
            emailContainerStyle = 'hidden';
        }

        return (
            <form>
                <div className='inner__content'>
                    <div className={emailContainerStyle}>
                        <h5 id='email_label'>
                            <strong>
                                <FormattedMessage
                                    id='signup_user_completed.whatis'
                                    defaultMessage="What's your email address?"
                                />
                            </strong>
                        </h5>
                        <div className={emailDivStyle}>
                            <input
                                id='email'
                                type='email'
                                ref={this.emailRef}
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
                    <div className='mt-8'>
                        <h5 id='name_label'>
                            <strong>
                                <FormattedMessage
                                    id='signup_user_completed.chooseUser'
                                    defaultMessage='Choose your username'
                                />
                            </strong>
                        </h5>
                        <div className={nameDivStyle}>
                            <input
                                id='name'
                                type='text'
                                ref={this.nameRef}
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
                    <div className='mt-8'>
                        <h5 id='password_label'>
                            <strong>
                                <FormattedMessage
                                    id='signup_user_completed.choosePwd'
                                    defaultMessage='Choose your password'
                                />
                            </strong>
                        </h5>
                        <div className={passwordDivStyle}>
                            <input
                                id='password'
                                type='password'
                                ref={this.passwordRef}
                                className='form-control'
                                placeholder=''
                                maxLength='128'
                                spellCheck='false'
                            />
                            {passwordError}
                        </div>
                    </div>
                    <p className='mt-5'>
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
            location,
            privacyPolicyLink,
            siteName,
            termsOfServiceLink,
            hasAccounts,
        } = this.props;

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div
                    id='existingEmailErrorContainer'
                    className={'form-group has-error'}
                >
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
                <p id='signup_agreement'>
                    <FormattedMarkdownMessage
                        id='create_team.agreement'
                        defaultMessage='By proceeding to create your account and use {siteName}, you agree to our [Terms of Service]({TermsOfServiceLink}) and [Privacy Policy]({PrivacyPolicyLink}). If you do not agree, you cannot use {siteName}.'
                        values={{
                            siteName,
                            TermsOfServiceLink: `!${termsOfServiceLink}`,
                            PrivacyPolicyLink: `!${privacyPolicyLink}`,
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
                {hasAccounts && <BackButton onClick={() => trackEvent('signup_email', 'click_back')}/>}
                <div
                    id='signup_email_section'
                    className='col-sm-12'
                >
                    <div className='signup-team__container padding--less'>
                        <img
                            alt={'signup team logo'}
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <SiteNameAndDescription
                            customDescriptionText={customDescriptionText}
                            siteName={siteName}
                        />
                        <h4
                            id='create_account'
                            className='color--light'
                        >
                            <FormattedMessage
                                id='signup_user_completed.lets'
                                defaultMessage="Let's create your account"
                            />
                        </h4>
                        <span
                            id='signin_account'
                            className='color--light'
                        >
                            <FormattedMessage
                                id='signup_user_completed.haveAccount'
                                defaultMessage='Already have an account?'
                            />
                            {' '}
                            <Link
                                id='signin_account_link'
                                to={'/login' + location.search}
                                onClick={() => trackEvent('signup_email', 'click_signin_account')}
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
/* eslint-enable react/no-string-refs */
