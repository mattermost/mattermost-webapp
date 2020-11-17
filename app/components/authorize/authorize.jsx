// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import icon50 from 'images/icon50x50.png';
import FormError from 'components/form_error';
import {browserHistory} from 'utils/browser_history';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class Authorize extends React.PureComponent {
    static get propTypes() {
        return {
            location: PropTypes.object.isRequired,
            actions: PropTypes.shape({
                getOAuthAppInfo: PropTypes.func.isRequired,
                allowOAuth2: PropTypes.func.isRequired,
            }).isRequired,
        };
    }

    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        // if we get to this point remove the antiClickjack blocker
        const blocker = document.getElementById('antiClickjack');
        if (blocker) {
            blocker.parentNode.removeChild(blocker);
        }
        const clientId = (new URLSearchParams(this.props.location.search)).get('client_id');
        if (!((/^[a-z0-9]+$/).test(clientId))) {
            return;
        }

        this.props.actions.getOAuthAppInfo(clientId).then(
            ({data}) => {
                if (data) {
                    this.setState({app: data});
                }
            });
    }

    handleAllow = () => {
        const searchParams = new URLSearchParams(this.props.location.search);
        const params = {
            responseType: searchParams.get('response_type'),
            clientId: searchParams.get('client_id'),
            redirectUri: searchParams.get('redirect_uri'),
            state: searchParams.get('state'),
            scope: searchParams.get('store'),
        };

        this.props.actions.allowOAuth2(params).then(
            ({data, error}) => {
                if (data && data.redirect) {
                    window.location.href = data.redirect;
                } else if (error) {
                    this.setState({error: error.message});
                }
            },
        );
    }

    handleDeny = () => {
        const redirectUri = (new URLSearchParams(this.props.location.search)).get('redirect_uri');
        if (redirectUri.startsWith('https://') || redirectUri.startsWith('http://')) {
            window.location.href = redirectUri + '?error=access_denied';
            return;
        }

        browserHistory.replace('/error');
    }

    render() {
        const app = this.state.app;
        if (!app) {
            return null;
        }

        let icon;
        if (app.icon_url) {
            icon = app.icon_url;
        } else {
            icon = icon50;
        }

        let error;
        if (this.state.error) {
            error = (
                <div className='prompt__error form-group'>
                    <FormError error={this.state.error}/>
                </div>
            );
        }

        return (
            <div className='container-fluid'>
                <div className='prompt'>
                    <div className='prompt__heading'>
                        <div className='prompt__app-icon'>
                            <img
                                alt={'prompt icon'}
                                src={icon}
                                width='50'
                                height='50'
                            />
                        </div>
                        <div className='text'>
                            <FormattedMarkdownMessage
                                id='authorize.title'
                                defaultMessage='Authorize **{appName}** to Connect to Your **Mattermost** User Account'
                                values={{
                                    appName: app.name,
                                }}
                            />
                        </div>
                    </div>
                    <p>
                        <FormattedMarkdownMessage
                            id='authorize.app'
                            defaultMessage='The app **{appName}** would like the ability to access and modify your basic information.'
                            values={{
                                appName: app.name,
                            }}
                        />
                    </p>
                    <h2 className='prompt__allow'>
                        <FormattedMarkdownMessage
                            id='authorize.access'
                            defaultMessage='Allow **{appName}** access?'
                            values={{
                                appName: app.name,
                            }}
                        />
                    </h2>
                    <div className='prompt__buttons'>
                        <button
                            type='submit'
                            className='btn btn-link authorize-btn'
                            onClick={this.handleDeny}
                        >
                            <FormattedMessage
                                id='authorize.deny'
                                defaultMessage='Deny'
                            />
                        </button>
                        <button
                            type='submit'
                            className='btn btn-primary authorize-btn'
                            onClick={this.handleAllow}
                        >
                            <FormattedMessage
                                id='authorize.allow'
                                defaultMessage='Allow'
                            />
                        </button>
                    </div>
                    {error}
                </div>
            </div>
        );
    }
}
