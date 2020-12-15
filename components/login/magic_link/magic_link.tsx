// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Location} from 'history';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ActionResult} from 'mattermost-redux/types/actions';

import * as GlobalActions from 'actions/global_actions';

import AnnouncementBar from 'components/announcement_bar';
import BackButton from 'components/common/back_button';
import SiteNameAndDescription from 'components/common/site_name_and_description';

import LocalStorageStore from 'stores/local_storage_store';

import * as Utils from 'utils/utils';

import logoImage from 'images/logo.png';

interface Props {
    enableSignInWithMagicLink: boolean;
    customDescriptionText: string;
    location: Location;
    loginByMagicLink: (token: string) => Promise<ActionResult>;
    sendMagicLinkEmail: (loginId: string) => Promise<ActionResult>;
    siteName: string;
}

interface State {
    emailSent: boolean;
    loginError?: any;
    loginId: string;
    token: string;
}

export default class SendMagicLink extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const params = new URLSearchParams(this.props.location.search);

        this.state = {
            emailSent: false,
            loginId: params.get('login_id') || '',
            token: params.get('token') || '',
        };
    }

    componentDidMount() {
        if (this.state.token) {
            this.props.loginByMagicLink(this.state.token).then((response) => {
                if ('error' in response) {
                    // TODO handle error
                    console.error(response.error); // eslint-disable-line no-console
                    this.setState({loginError: response.error});
                    return;
                }

                this.finishSignin();
            });
        }
    }

    finishSignin = () => {
        // TODO copied from LoginController but worse

        Utils.setCSRFFromCookie();

        // Record a successful login to local storage. If an unintentional logout occurs, e.g.
        // via session expiration, this bit won't get reset and we can notify the user as such.
        LocalStorageStore.setWasLoggedIn(true);

        GlobalActions.redirectUserToDefaultTeam();
    }

    handleLoginIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            loginId: e.target.value,
        });
    }

    handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // TODO use refs to sync state with password manager result?

        this.props.sendMagicLinkEmail(this.state.loginId).then((response) => {
            if ('error' in response) {
                // TODO handle error
                console.error(response.error); // eslint-disable-line no-console
                this.setState({})
                return;
            }

            this.setState({emailSent: true});
        });
    }

    render() {
        let content;
        if (this.state.emailSent) {
            content = (
                <>
                    <FormattedMessage
                        id='login.magicLink.sent1'
                        defaultMessage='Sign-in link sent. Please check your inbox.'
                    />
                    <br/>
                    <FormattedMessage
                        id='login.magicLink.sent2'
                        defaultMessage='The sign-in link will expire in 5 minutes.'
                    />
                </>
            );
        } else if (this.state.token) {
            if (this.state.loginError) {
                content = (
                    <FormattedMessage
                        id='login.magicLink.loginError'
                        defaultMessage='This sign-in link is invalid or expired. Please try again or contact your adminitstrator if you continue to see this error.'
                    />
                );
            } else {
                content = (
                    <FormattedMessage
                        id='login.magicLink.loggingIn'
                        defaultMessage='Logging in...'
                    />
                );
            }
        } else if (this.props.enableSignInWithMagicLink) {
            content = (
                <form onSubmit={this.handleSubmit}>
                    <div className='form-group'>
                        <input
                            className='form-control'
                            name='loginId'
                            value={this.state.loginId}
                            onChange={this.handleLoginIdChange}
                            placeholder='Email or Username'
                            spellCheck='false'
                            autoCapitalize='off'
                            autoFocus={true}
                        />
                    </div>
                    <div className='form-group'>
                        <button
                            id='loginButton'
                            type='submit'
                            className='btn btn-primary'
                        >
                            <FormattedMessage
                                id='login.magicLink.sendSigninLink'
                                defaultMessage='Send sign-in link'
                            />
                        </button>
                    </div>
                </form>
            );
        } else {
            content = (
                <FormattedMessage
                    id='login.magicLink.disabled'
                    defaultMessage='This is disabled'
                />
            );
        }

        // TODO add loading indicator
        // TODO dynamically generate login ID placeholder like login page

        return (
            <div>
                <AnnouncementBar/>
                <BackButton url={`/login${this.props.location.search}`}/>
                <div className='col-sm-12'>
                    <div className={'signup-team__container'}>
                        <img
                            alt={'signup team logo'}
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <div className='signup__content'>
                            <SiteNameAndDescription
                                customDescriptionText={this.props.customDescriptionText}
                                siteName={this.props.siteName}
                            />
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
