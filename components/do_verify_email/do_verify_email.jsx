// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {browserHistory} from 'utils/browser_history';
import {AnnouncementBarTypes, AnnouncementBarMessages, VerifyEmailErrors} from 'utils/constants.jsx';
import logoImage from 'images/logo.png';
import BackButton from 'components/common/back_button.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

import * as GlobalActions from 'actions/global_actions.jsx';

export default class DoVerifyEmail extends React.PureComponent {
    static propTypes = {

        /**
         * Object with validation parameters given in link
         */
        location: PropTypes.object.isRequired,

        /**
         * Title of the app or site.
         */
        siteName: PropTypes.string,

        /*
         * Object with redux action creators
         */
        actions: PropTypes.shape({

            /*
             * Action creator to verify the user's email
             */
            verifyUserEmail: PropTypes.func.isRequired,

            /*
             * Action creator to update the user in the redux store
             */
            getMe: PropTypes.func.isRequired,
            logError: PropTypes.func.isRequired,
            clearErrors: PropTypes.func.isRequired,
        }).isRequired,

        /**
         * Object reprenseting the current user
         */
        user: PropTypes.shape({
            email_verified: PropTypes.bool,
        }),

        isLoggedIn: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            verifyStatus: 'pending',
            serverError: '',
        };
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        this.verifyEmail();
    }

    handleRedirect() {
        if (this.props.isLoggedIn) {
            GlobalActions.redirectUserToDefaultTeam();
        } else {
            browserHistory.push('/login?extra=verified&email=' + encodeURIComponent((new URLSearchParams(this.props.location.search)).get('email')));
        }
    }

    handleSuccess() {
        this.setState({verifyStatus: 'success'});
        this.props.actions.clearErrors();
        if (this.props.isLoggedIn) {
            this.props.actions.logError({
                message: AnnouncementBarMessages.EMAIL_VERIFIED,
                type: AnnouncementBarTypes.SUCCESS,
            }, true);
            trackEvent('settings', 'verify_email');
            this.props.actions.getMe().then(({data, error: err}) => {
                if (data) {
                    this.handleRedirect();
                } else if (err) {
                    this.handleError(VerifyEmailErrors.FAILED_USER_STATE_GET);
                }
            });
        } else {
            this.handleRedirect();
        }
    }

    handleError(type) {
        let serverError = '';
        if (type === VerifyEmailErrors.FAILED_EMAIL_VERIFICATION) {
            serverError = (
                <FormattedMessage
                    id='signup_user_completed.invalid_invite'
                    defaultMessage='The invite link was invalid. Please speak with your Administrator to receive an invitation.'
                />
            );
        } else if (type === VerifyEmailErrors.FAILED_USER_STATE_GET) {
            serverError = (
                <FormattedMessage
                    id='signup_user_completed.failed_update_user_state'
                    defaultMessage='Please clear your cache and try to log in.'
                />
            );
        }
        this.setState({
            verifyStatus: 'failure',
            serverError,
        });
    }

    verifyEmail = async () => {
        const {actions: {verifyUserEmail}} = this.props;
        const verify = await verifyUserEmail((new URLSearchParams(this.props.location.search)).get('token'));

        if (verify && verify.data) {
            this.handleSuccess();
        } else if (verify && verify.error) {
            this.handleError(VerifyEmailErrors.FAILED_EMAIL_VERIFICATION);
        }
    }

    render() {
        if (this.state.verifyStatus !== 'failure') {
            return (<LoadingScreen/>);
        }

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className={'form-group has-error'}>
                    <label className='control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        return (
            <div>
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
                                    defaultMessage='All team communication in one place, searchable and accessible anywhere'
                                />
                            </h4>
                            {serverError}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

DoVerifyEmail.defaultProps = {
    location: {},
};
