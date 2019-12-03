// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';
import safeOpenProtocol from 'custom-protocol-detection';

import MattermostLogoSvg from 'images/logo.svg';

type Props = {}
type State = {
    protocolUnsupported: boolean;
    browserUnsupported: boolean;
    rememberChecked: boolean;
}

export default class LinkingLandingPage extends PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            protocolUnsupported: false,
            browserUnsupported: false,
            rememberChecked: false,
        };
    }

    componentDidMount() {
        this.tryOpen();
    }

    handleChecked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        this.setState({rememberChecked: e.target.checked});
    }

    tryOpen = () => {
        let location = window.location.href.replace('/vault#', '');
        let nativeLocation = location.replace(/^(https|http)/, 'mattermost');

        // safeOpenProtocol(nativeLocation,
        //     () => this.setState({protocolUnsupported: true}),
        //     () => protocolDetected(),
        //     () => this.setState({browserUnsupported: true})
        // );
    }

    render() {
        const {protocolUnsupported, browserUnsupported} = this.state;

        let location = window.location.href.replace('/vault#', '');
        let nativeLocation = location.replace(/^(https|http)/, 'mattermost');

        let goNativeAppMessage = (
            <a
                href={nativeLocation}
                className='btn btn-primary btn-lg get-app__download'
            >
                <FormattedMessage
                    id='get_app.systemDialogMessage'
                    defaultMessage='View in Desktop App'
                />
            </a>
        );

        if (protocolUnsupported) {
            goNativeAppMessage = (
                <a
                    href='/downloads'
                    className='btn btn-primary btn-lg get-app__download'
                >
                    <FormattedMessage
                        id='get_app.downloadMattermost'
                        defaultMessage='Download App'
                    />
                </a>
            );
        } else if (browserUnsupported) {
            goNativeAppMessage = (
                <FormattedMessage
                    id='get_app.browserUnsupported'
                    defaultMessage='This browser does not support opening applications.'
                />
            );
        }

        // prompt user to download in case they don't have the native app.
        return (
            <div className='get-app'>
                <div className='get-app__header'>
                    <img
                        src={MattermostLogoSvg}
                        className='get-app__logo'
                    />
                </div>
                <div className='get-app__dialog'>
                    <div className='get-app__graphic'>

                    </div>
                    <div className='get-app__dialog-body'>
                        <div className='get-app__launching'>
                            <FormattedMessage
                                id='get_app.launching'
                                defaultMessage='Where would you like to view this?'
                            />
                            <div className='get-app__alternative'>
                                <FormattedMessage
                                    id='get_app.ifNothingPrompts'
                                    defaultMessage='You can view it in Mattermost desktop app or continue in the web browser.'
                                />
                            </div>
                        </div>
                        <div className='get-app__buttons'>
                            <div className='get-app__status'>
                                {goNativeAppMessage}
                            </div>
                            <div className='get-app__status'>
                                <a
                                    href={location}
                                    className='btn btn-default btn-lg get-app__continue'
                                >
                                    <FormattedMessage
                                        id='get_app.continueToBrowser'
                                        defaultMessage='View In Browser'
                                    />
                                </a>
                            </div>
                        </div>
                        <div className='get-app__preference checkbox'>
                            <label>
                                <input
                                    type='checkbox'
                                    checked={this.state.rememberChecked}
                                    onChange={this.handleChecked}
                                />
                                <FormattedMessage
                                    id='get_app.rememberMyPreference'
                                    defaultMessage='Remember my preference'
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function protocolDetected() {
    // Code in case everything worked
}
