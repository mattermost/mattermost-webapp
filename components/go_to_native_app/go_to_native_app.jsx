// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';
import safeOpenProtocol from 'custom-protocol-detection';

import MattermostLogo from 'images/logo.png';

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
            <div
                className='get-app get-android-app'
                style={{textAlign: 'center', marginTop: '50px'}}
            >
                <img
                    src={MattermostLogo}
                    className='get-app__logo'
                />
                <div style={{fontSize: '30px', margin: '0 auto 65px'}}>
                    <FormattedMessage
                        id='get_app.launching'
                        defaultMessage='Launching...'
                    />
                </div>
                <div style={{fontSize: '20px', margin: '0 auto 20px'}}>
                    {goNativeAppMessage}
                </div>
                <div>
                    <div style={{fontSize: '15px', width: '80%', margin: '0 auto'}}>
                        <FormattedMessage
                            id='get_app.ifNothingPrompts'
                            defaultMessage='If nothing prompts from browser,'
                        />
                    </div>
                    <a
                        href='/downloads'
                        className='btn btn-primary get-android-app__open-mattermost'
                    >
                        <FormattedMessage
                            id='get_app.downloadMattermost'
                            defaultMessage='Download & run Mattermost'
                        />
                    </a>
                </div>
                <a
                    href='/'
                    className='btn btn-secondary get-android-app__continue-with-browser'
                    style={{marginTop: '30px'}}
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
