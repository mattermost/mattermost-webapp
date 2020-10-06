// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ServerError} from 'mattermost-redux/types/errors';

import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import {browserHistory} from 'utils/browser_history';
import {AnnouncementBarTypes, AnnouncementBarMessages, VerifyEmailErrors} from 'utils/constants';
import logoImage from 'images/logo.png';
import BackButton from 'components/common/back_button';
import LoadingScreen from 'components/loading_screen';

import * as GlobalActions from 'actions/global_actions.jsx';

type Props = {
    location: {
        search: string;
    };
    siteName?: string;
    actions: {
        verifyUserEmail: (token: string) => ActionFunc | ActionResult;
        getMe: () => ActionFunc | ActionResult;
        logError: (error: ServerError, displayable: boolean) => void;
        clearErrors: () => void;
    };
    isLoggedIn: boolean;

}

type State = {
    verifyStatus: string;
    serverError: JSX.Element | null;
}

export default class DoVerifyEmail extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            verifyStatus: 'pending',
            serverError: null,
        };
    }

    public componentDidMount(): void {
        this.verifyEmail();
    }

    handleRedirect() {
        if (this.props.isLoggedIn) {
            GlobalActions.redirectUserToDefaultTeam();
        } else {
            let link = '/login?extra=verified';
            const email = (new URLSearchParams(this.props.location.search)).get('email');
            if (email) {
                link += '&email=' + encodeURIComponent(email);
            }
            const redirectTo = (new URLSearchParams(this.props.location.search)).get('redirect_to');
            if (redirectTo) {
                link += '&redirect_to=' + redirectTo;
            }
            browserHistory.push(link);
        }
    }

    async handleSuccess() {
        this.setState({verifyStatus: 'success'});
        this.props.actions.clearErrors();
        if (this.props.isLoggedIn) {
            this.props.actions.logError({
                message: AnnouncementBarMessages.EMAIL_VERIFIED,
                type: AnnouncementBarTypes.SUCCESS,
            } as any, true);
            trackEvent('settings', 'verify_email');
            const me = await this.props.actions.getMe();
            if ('data' in me) {
                this.handleRedirect();
            } else if ('error' in me) {
                this.handleError(VerifyEmailErrors.FAILED_USER_STATE_GET);
            }
        } else {
            this.handleRedirect();
        }
    }

    handleError(type: string) {
        let serverError = null;
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
        const verify = await verifyUserEmail((new URLSearchParams(this.props.location.search)).get('token') || '');

        if ('data' in verify) {
            this.handleSuccess();
        } else if ('error' in verify) {
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
