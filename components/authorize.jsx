// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import {allowOAuth2, getOAuthAppInfo} from 'actions/admin_actions.jsx';
import icon50 from 'images/icon50x50.png';
import FormError from 'components/form_error.jsx';
import {browserHistory} from 'utils/browser_history';

export default class Authorize extends React.Component {
    static get propTypes() {
        return {
            location: PropTypes.object.isRequired,
            params: PropTypes.object.isRequired,
        };
    }

    constructor(props) {
        super(props);

        this.handleAllow = this.handleAllow.bind(this);
        this.handleDeny = this.handleDeny.bind(this);

        this.state = {};
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        const clientId = (new URLSearchParams(this.props.location.search)).get('client_id');
        if (!((/^[a-z0-9]+$/).test(clientId))) {
            return;
        }

        getOAuthAppInfo(
            clientId,
            (app) => {
                this.setState({app});
            }
        );
    }

    componentDidMount() {
        // if we get to this point remove the antiClickjack blocker
        const blocker = document.getElementById('antiClickjack');
        if (blocker) {
            blocker.parentNode.removeChild(blocker);
        }
    }

    handleAllow() {
        const params = new URLSearchParams(this.props.location.search);

        allowOAuth2(params,
            (data) => {
                if (data.redirect) {
                    browserHistory.push(data.redirect);
                }
            },
            (err) => {
                this.setState({error: err.message});
            }
        );
    }

    handleDeny() {
        const redirectUri = (new URLSearchParams(this.props.location.search)).get('redirect_uri');
        if (redirectUri.startsWith('https://') || redirectUri.startsWith('http://')) {
            browserHistory.replace(redirectUri + '?error=access_denied');
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
                                src={icon}
                                width='50'
                                height='50'
                                alt=''
                            />
                        </div>
                        <div className='text'>
                            <FormattedHTMLMessage
                                id='authorize.title'
                                defaultMessage='<strong>{appName}</strong> would like to connect to your <strong>Mattermost</strong> user account'
                                values={{
                                    appName: app.name,
                                }}
                            />
                        </div>
                    </div>
                    <p>
                        <FormattedHTMLMessage
                            id='authorize.app'
                            defaultMessage='The app <strong>{appName}</strong> would like the ability to access and modify your basic information.'
                            values={{
                                appName: app.name,
                            }}
                        />
                    </p>
                    <h2 className='prompt__allow'>
                        <FormattedHTMLMessage
                            id='authorize.access'
                            defaultMessage='Allow <strong>{appName}</strong> access?'
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
