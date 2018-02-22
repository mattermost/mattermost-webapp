// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import crypto from 'crypto';

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {ErrorPageTypes} from 'utils/constants.jsx';

import ErrorTitle from './error_title.jsx';
import ErrorMessage from './error_message.jsx';

export default class ErrorPage extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object.isRequired,
    };

    componentDidMount() {
        document.body.setAttribute('class', 'sticky error');
    }

    componentWillUnmount() {
        document.body.removeAttribute('class');
    }

    render() {
        const params = new URLSearchParams(this.props.location.search);
        const signature = params.get('s');

        var trustParams = false;
        if (signature) {
            params.delete('s');

            const key = window.mm_config.AsymmetricSigningPublicKey;
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
        } else {
            backButton = (
                <Link to='/'>
                    <FormattedMessage
                        id='error.generic.link'
                        defaultMessage='Back to {siteName}'
                        values={{
                            siteName: global.window.mm_config.SiteName,
                        }}
                    />
                </Link>
            );
        }

        return (
            <div className='container-fluid'>
                <div className='error__container'>
                    <div className='error__icon'>
                        <i className='fa fa-exclamation-triangle'/>
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
