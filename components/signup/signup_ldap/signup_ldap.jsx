// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import * as GlobalActions from 'actions/global_actions.jsx';
import {addUserToTeamFromInvite} from 'actions/team_actions.jsx';
import {loadMe, webLoginByLdap} from 'actions/user_actions.jsx';

import * as Utils from 'utils/utils.jsx';
import {browserHistory} from 'utils/browser_history';

import logoImage from 'images/logo.png';

import BackButton from 'components/common/back_button.jsx';
import FormError from 'components/form_error.jsx';
import SiteNameAndDescription from 'components/common/site_name_and_description';

export default class SignupLdap extends React.Component {
    static get propTypes() {
        return {
            location: PropTypes.object,
            isLicensed: PropTypes.bool.isRequired,
            ldapLoginFieldName: PropTypes.string,
            enableLdap: PropTypes.bool.isRequired,
            ldap: PropTypes.bool.isRequired,
            siteName: PropTypes.string,
            termsOfServiceLink: PropTypes.string,
            privacyPolicyLink: PropTypes.string,
            customDescriptionText: PropTypes.string.isRequired,
        };
    }

    constructor(props) {
        super(props);

        this.handleLdapSignup = this.handleLdapSignup.bind(this);
        this.handleLdapSignupSuccess = this.handleLdapSignupSuccess.bind(this);

        this.handleLdapIdChange = this.handleLdapIdChange.bind(this);
        this.handleLdapPasswordChange = this.handleLdapPasswordChange.bind(this);

        this.state = ({
            ldapError: '',
            ldapId: '',
            ldapPassword: '',
        });
    }

    componentDidMount() {
        trackEvent('signup', 'signup_user_01_welcome');
    }

    handleLdapIdChange(e) {
        this.setState({
            ldapId: e.target.value,
        });
    }

    handleLdapPasswordChange(e) {
        this.setState({
            ldapPassword: e.target.value,
        });
    }

    handleLdapSignup(e) {
        e.preventDefault();

        this.setState({ldapError: ''});

        webLoginByLdap(
            this.state.ldapId,
            this.state.ldapPassword,
            null,
            this.handleLdapSignupSuccess,
            (err) => {
                this.setState({
                    ldapError: err.message,
                });
            }
        );
    }

    handleLdapSignupSuccess() {
        const params = new URLSearchParams(this.props.location.search);
        const token = params.get('t') || '';
        const inviteId = params.get('id') || '';

        if (inviteId || token) {
            addUserToTeamFromInvite(
                token,
                inviteId,
                () => {
                    this.finishSignup();
                },
                () => {
                    // there's not really a good way to deal with this, so just let the user log in like normal
                    this.finishSignup();
                }
            );
        } else {
            this.finishSignup();
        }
    }

    finishSignup() {
        loadMe().then(
            () => {
                const redirectTo = (new URLSearchParams(this.props.location.search)).get('redirect_to');
                GlobalActions.loadDefaultLocale();
                if (redirectTo) {
                    browserHistory.push(redirectTo);
                } else {
                    GlobalActions.redirectUserToDefaultTeam();
                }
            }
        );
    }

    render() {
        const {
            customDescriptionText,
            isLicensed,
            siteName,
        } = this.props;

        let ldapIdPlaceholder;
        if (this.props.ldapLoginFieldName) {
            ldapIdPlaceholder = this.props.ldapLoginFieldName;
        } else {
            ldapIdPlaceholder = Utils.localizeMessage('login.ldapUsername', 'AD/LDAP Username');
        }

        let errorClass = '';
        if (this.state.ldapError) {
            errorClass += ' has-error';
        }

        let ldapSignup;
        if (this.props.enableLdap && this.props.isLicensed && this.props.ldap) {
            ldapSignup = (
                <div className='inner__content'>
                    <h5>
                        <strong>
                            <FormattedMessage
                                id='signup.ldap'
                                defaultMessage='AD/LDAP Credentials'
                            />
                        </strong>
                    </h5>
                    <form
                        onSubmit={this.handleLdapSignup}
                    >
                        <div className='signup__email-container'>
                            <FormError
                                error={this.state.ldapError}
                                margin={true}
                            />
                            <div className={'form-group' + errorClass}>
                                <input
                                    className='form-control'
                                    name='ldapId'
                                    value={this.state.ldapId}
                                    placeholder={ldapIdPlaceholder}
                                    onChange={this.handleLdapIdChange}
                                    spellCheck='false'
                                    autoCapitalize='off'
                                />
                            </div>
                            <div className={'form-group' + errorClass}>
                                <input
                                    type='password'
                                    className='form-control'
                                    name='password'
                                    value={this.state.ldapPassword}
                                    placeholder={Utils.localizeMessage('login.password', 'Password')}
                                    onChange={this.handleLdapPasswordChange}
                                    spellCheck='false'
                                />
                            </div>
                            <div className='form-group'>
                                <button
                                    type='submit'
                                    className='btn btn-primary'
                                    disabled={!this.state.ldapId || !this.state.ldapPassword}
                                >
                                    <FormattedMessage
                                        id='login.signIn'
                                        defaultMessage='Sign in'
                                    />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            );
        } else {
            return null;
        }

        let terms = null;
        if (ldapSignup) {
            terms = (
                <p>
                    <FormattedHTMLMessage
                        id='create_team.agreement'
                        defaultMessage="By proceeding to create your account and use {siteName}, you agree to our <a href='{TermsOfServiceLink}'>Terms of Service</a> and <a href='{PrivacyPolicyLink}'>Privacy Policy</a>. If you do not agree, you cannot use {siteName}."
                        values={{
                            siteName: this.props.siteName,
                            TermsOfServiceLink: this.props.termsOfServiceLink,
                            PrivacyPolicyLink: this.props.privacyPolicyLink,
                        }}
                    />
                </p>
            );
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
                                to={{
                                    pathname: '/login',
                                    search: this.props.location.search,
                                }}
                            >
                                <FormattedMessage
                                    id='signup_user_completed.signIn'
                                    defaultMessage='Click here to sign in.'
                                />
                            </Link>
                        </span>
                        {ldapSignup}
                        {terms}
                    </div>
                </div>
            </div>
        );
    }
}
