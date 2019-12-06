// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';
import safeOpenProtocol from 'custom-protocol-detection';

import desktopImg from 'images/deep-linking/deeplinking-desktop-img.png';
import mobileImg from 'images/deep-linking/deeplinking-mobile-img.png';
import MattermostLogoSvg from 'images/logo.svg';
import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon';

import * as UserAgent from 'utils/user_agent';

type Props = {
    backgroundColor: string;
}

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

    handleChecked = () => {
        this.setState({rememberChecked: !this.state.rememberChecked});
    }

    tryOpen = () => {
        const location = window.location.href.replace('/vault#', '');
        const nativeLocation = location.replace(/^(https|http)/, 'mattermost');

        safeOpenProtocol(nativeLocation,
            () => this.setState({protocolUnsupported: true}),
            () => protocolDetected(),
            () => this.setState({browserUnsupported: true})
        );
    }

    render() {
        const {protocolUnsupported, browserUnsupported} = this.state;
        const isMobile = UserAgent.isMobile();

        const location = window.location.href.replace('/vault#', '');
        const nativeLocation = location.replace(/^(https|http)/, 'mattermost');

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

        let checkboxIcon;
        if (this.state.rememberChecked) {
            checkboxIcon = (
                <CheckboxCheckedIcon/>
            );
        }

        let graphic;
        if (isMobile) {
            graphic = (
                <img src={mobileImg}/>
            );
        } else {
            graphic = (
                <img src={desktopImg}/>
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
                    <div
                        className={`get-app__graphic ${isMobile ? 'mobile' : ''}`}
                        style={{backgroundColor: this.props.backgroundColor}}
                    >
                        {graphic}
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
                        <div className='get-app__preference'>
                            <button
                                className={`get-app__checkbox ${this.state.rememberChecked ? 'checked' : ''}`}
                                onClick={this.handleChecked}
                            >
                                {checkboxIcon}
                            </button>
                            <FormattedMessage
                                id='get_app.rememberMyPreference'
                                defaultMessage='Remember my preference'
                            />
                        </div>
                        <div className='get-app__download-link'>
                            <FormattedMessage
                                id='get_app.dontHaveTheDesktopApp'
                                defaultMessage={`Don't have the Desktop App?`}
                            />
                            &nbsp;
                            <a href={location}>
                                <FormattedMessage
                                    id='get_app.downloadTheAppNow'
                                    defaultMessage='Download the app now.'
                                />
                            </a>
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
