// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';
import safeOpenProtocol from 'custom-protocol-detection';

import MattermostLogoSvg from 'images/logo.svg';

export default class GoNativeApp extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            protocolUnsupported: false,
            browserUnsupported: false,
        };
    }

    render() {
        const {protocolUnsupported, browserUnsupported} = this.state;

        let nativeLocation = window.location.href.replace('/vault#', '');
        nativeLocation = nativeLocation.replace(/^(http|https)/, 'mattermost');

        safeOpenProtocol(nativeLocation,
            () => this.setState({protocolUnsupported: true}),
            () => setTimeout(redirectWeb, 3000),
            () => this.setState({browserUnsupported: true})
        );

        let goNativeAppMessage = null;
        if (protocolUnsupported) {
            goNativeAppMessage = (
                <FormattedMessage
                    id='get_app.protocolUnsupported'
                    defaultMessage='Unable to open Mattermost.'
                />
            );
        } else if (browserUnsupported) {
            goNativeAppMessage = (
                <FormattedMessage
                    id='get_app.browserUnsupported'
                    defaultMessage='This browser does not support opening applications.'
                />
            );
        } else {
            goNativeAppMessage = (
                <FormattedMessage
                    id='get_app.systemDialogMessage'
                    defaultMessage='Please click `Open Mattermost` if you see the system dialog.'
                />
            );
        }

        // prompt user to download in case they don't have the mobile app.
        return (
            <div className='get-app get-app--android'>
                <img
                    src={MattermostLogoSvg}
                    className='get-app__logo'
                />
                <div className='get-app__launching'>
                    <FormattedMessage
                        id='get_app.launching'
                        defaultMessage='Launching...'
                    />
                </div>
                <div className='get-app__status'>
                    {goNativeAppMessage}
                </div>
                <div>
                    <div className='get-app__alternative'>
                        <FormattedMessage
                            id='get_app.ifNothingPrompts'
                            defaultMessage='If nothing prompts from browser,'
                        />
                    </div>
                    <a
                        href='/downloads'
                        className='btn btn-primary get-app__download'
                    >
                        <FormattedMessage
                            id='get_app.downloadMattermost'
                            defaultMessage='Download & run Mattermost'
                        />
                    </a>
                </div>
                <a
                    href='/'
                    className='btn btn-secondary get-app__continue'
                >
                    <FormattedMessage
                        id='get_app.continueToBrowser'
                        defaultMessage='Continue to web site'
                    />
                </a>
            </div>
        );
    }
}

function redirectWeb() {
    window.location = window.location.href.replace('/vault#', '');
}
