// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import crypto from 'crypto';

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {ErrorPageTypes, Constants} from 'utils/constants.jsx';
import WarningIcon from 'components/widgets/icons/fa_warning_icon';

import ErrorTitle from './error_title.jsx';
import ErrorMessage from './error_message.jsx';

export default class ErrorPage extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object.isRequired,
        asymmetricSigningPublicKey: PropTypes.string,
        siteName: PropTypes.string,
        isGuest: PropTypes.bool,
    };

    componentDidMount() {
        document.body.setAttribute('class', 'sticky error');
    }

    componentWillUnmount() {
        document.body.removeAttribute('class');
    }

    render() {
        const {isGuest} = this.props;
        const params = new URLSearchParams(this.props.location.search);
        const signature = params.get('s');

        var trustParams = false;
        if (signature) {
            params.delete('s');

            const key = this.props.asymmetricSigningPublicKey;
            const keyPEM = '-----BEGIN PUBLIC KEY-----\n' + key + '\n-----END PUBLIC KEY-----';

            const verify = crypto.createVerify('sha256');
            verify.update('/error?' + params.toString());
            trustParams = verify.verify(keyPEM, signature, 'base64');
        }

        const type = params.get('type');
        const title = (trustParams && params.get('title')) || '';
        const message = (trustParams && params.get('message')) || '';
        const service = (trustParams && params.get('service')) || '';
        const returnTo = (trustParams && params.get('returnTo')) || '';

        let backButton;
        if (type === ErrorPageTypes.PERMALINK_NOT_FOUND && returnTo) {
            backButton = (
                <Link to={returnTo}>
                    <FormattedMessage
                        id='error.generic.link'
                        defaultMessage='Back to Mattermost'
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.TEAM_NOT_FOUND) {
            backButton = (
                <Link to='/'>
                    <FormattedMessage
                        id='error.generic.link'
                        defaultMessage='Back to {siteName}'
                        values={{
                            siteName: this.props.siteName,
                        }}
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.CHANNEL_NOT_FOUND && isGuest) {
            backButton = (
                <Link to={params.get('returnTo')}>
                    <FormattedMessage
                        id='error.channelNotFound.guest_link'
                        defaultMessage='Back'
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.CHANNEL_NOT_FOUND) {
            backButton = (
                <Link to={params.get('returnTo')}>
                    <FormattedMessage
                        id='error.channelNotFound.link'
                        defaultMessage='Back to {defaultChannelName}'
                        values={{
                            defaultChannelName: Constants.DEFAULT_CHANNEL_UI_NAME,
                        }}
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.OAUTH_ACCESS_DENIED || type === ErrorPageTypes.OAUTH_MISSING_CODE) {
            backButton = (
                <Link to='/'>
                    <FormattedMessage
                        id='error.generic.link_login'
                        defaultMessage='Back to login page'
                    />
                </Link>
            );
        } else {
            backButton = (
                <Link to='/'>
                    <FormattedMessage
                        id='error.generic.link'
                        defaultMessage='Back to {siteName}'
                        values={{
                            siteName: this.props.siteName,
                        }}
                    />
                </Link>
            );
        }

        return (
            <div className='container-fluid'>
                <div className='error__container'>
                    <div className='error__icon'>
                        <WarningIcon/>
                    </div>
                    <h2>
                        <ErrorTitle
                            type={type}
                            title={title}
                        />
                    </h2>
                    <ErrorMessage
                        type={type}
                        message={message}
                        service={service}
                    />
                    {backButton}
                </div>
            </div>
        );
    }
}
