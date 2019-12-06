// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';
import safeOpenProtocol from 'custom-protocol-detection';

import desktopImg from 'images/deep-linking/deeplinking-desktop-img.png';
import mobileImg from 'images/deep-linking/deeplinking-mobile-img.png';
import MattermostLogoSvg from 'images/logo.svg';
import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon';
import BrowserStore from 'stores/browser_store';
import {VaultPreferenceTypes} from 'utils/constants';

import * as UserAgent from 'utils/user_agent';

type Props = {
    backgroundColor: string;
    location: string;
    nativeLocation: string;
    desktopAppLink?: string;
    iosAppLink?: string;
    androidAppLink?: string;
}

type State = {
    protocolUnsupported: boolean;
    browserUnsupported: boolean;
    rememberChecked: boolean;
    redirectPage: boolean;
}

export default class LinkingLandingPage extends PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            protocolUnsupported: false,
            browserUnsupported: false,
            rememberChecked: false,
            redirectPage: false,
        };

        this.checkVaultPreference();
    }

    checkVaultPreference = () => {
        const vaultPreference = BrowserStore.getVaultPreference();
        if (vaultPreference) {
            switch (vaultPreference) {
            case VaultPreferenceTypes.MATTERMOSTAPP:
                this.openMattermostApp();
                break;
            case VaultPreferenceTypes.BROWSER:
                this.openInBrowser();
                break;
            default:
                break;
            }
        }
    }

    handleChecked = () => {
        this.setState({rememberChecked: !this.state.rememberChecked});
    }

    setPreference = (pref: string) => {
        if (this.state.rememberChecked) {
            switch (pref) {
            case VaultPreferenceTypes.MATTERMOSTAPP:
                BrowserStore.setVaultPreferenceToMattermostApp();
                break;
            case VaultPreferenceTypes.BROWSER:
                BrowserStore.setVaultPreferenceToBrowser();
                break;
            default:
                break;
            }
        }
    }

    openMattermostApp = () => {
        this.setPreference(VaultPreferenceTypes.MATTERMOSTAPP);
        this.setState({redirectPage: true});
        window.location.href = this.props.nativeLocation;
    }

    openInBrowser = () => {
        this.setPreference(VaultPreferenceTypes.BROWSER);
        window.location.href = this.props.location;
    }

    tryOpen = () => {
        safeOpenProtocol(this.props.nativeLocation,
            () => this.setState({protocolUnsupported: true}),
            () => protocolDetected(),
            () => this.setState({browserUnsupported: true})
        );
    }

    render() {
        const {protocolUnsupported, browserUnsupported} = this.state;
        const isMobile = UserAgent.isMobile();

        let systemDialogMessage;
        if (isMobile) {
            systemDialogMessage = (
                <FormattedMessage
                    id='get_app.systemDialogMessageMobile'
                    defaultMessage='View in App'
                />
            );
        } else {
            systemDialogMessage = (
                <FormattedMessage
                    id='get_app.systemDialogMessage'
                    defaultMessage='View in Desktop App'
                />
            );
        }

        let goNativeAppMessage = (
            <a
                href='#'
                onClick={this.openMattermostApp}
                className='btn btn-primary btn-lg get-app__download'
            >
                {systemDialogMessage}
            </a>
        );

        let downloadLinkLink = this.props.desktopAppLink;
        if (UserAgent.isIosWeb()) {
            downloadLinkLink = this.props.iosAppLink;
        } else if (UserAgent.isAndroidWeb()) {
            downloadLinkLink = this.props.androidAppLink;
        }

        if (protocolUnsupported && downloadLinkLink) {
            goNativeAppMessage = (
                <a
                    href={downloadLinkLink}
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
                <a className='btn btn-primary btn-lg get-app__download disabled'>
                    <FormattedMessage
                        id='get_app.browserUnsupported'
                        defaultMessage='Browser not supported.'
                    />
                </a>
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

        let downloadLinkText;
        if (isMobile) {
            downloadLinkText = (
                <FormattedMessage
                    id='get_app.dontHaveTheMobileApp'
                    defaultMessage={'Don\'t have the Mobile App?'}
                />
            );
        } else {
            downloadLinkText = (
                <FormattedMessage
                    id='get_app.dontHaveTheDesktopApp'
                    defaultMessage={'Don\'t have the Desktop App?'}
                />
            );
        }

        let downloadLink;
        if (this.state.redirectPage) {
            downloadLink = (
                <div className='get-app__download-link'>
                    <FormattedMessage
                        id='get_app.or'
                        defaultMessage={'Or,'}
                    />
                    {'\u00A0'}
                    <a href={this.props.location}>
                        <FormattedMessage
                            id='get_app.openLinkInBrowser'
                            defaultMessage='open this link in your browser.'
                        />
                    </a>
                </div>
            );
        } else if (!protocolUnsupported && downloadLinkLink) {
            downloadLink = (
                <div className='get-app__download-link'>
                    {downloadLinkText}
                    {'\u00A0'}
                    <br/>
                    <a href={downloadLinkLink}>
                        <FormattedMessage
                            id='get_app.downloadTheAppNow'
                            defaultMessage='Download the app now.'
                        />
                    </a>
                </div>
            );
        }

        let dialogHeader;
        if (this.state.redirectPage) {
            dialogHeader = (
                <div className='get-app__launching'>
                    <FormattedMessage
                        id='get_app.openingLink'
                        defaultMessage='Opening link in Mattermost...'
                    />
                    <div className={`get-app__alternative${this.state.redirectPage ? ' redirect-page' : ''}`}>
                        <FormattedMessage
                            id='get_app.redirectedInMoments'
                            defaultMessage='You will be redirected in a few moments.'
                        />
                        <br/>
                        {downloadLinkText}
                        {'\u00A0'}
                        <br className='mobile-only'/>
                        <a href={downloadLinkLink}>
                            <FormattedMessage
                                id='get_app.downloadTheAppNow'
                                defaultMessage='Download the app now.'
                            />
                        </a>
                    </div>
                </div>
            );
        } else {
            let viewApp = (
                <FormattedMessage
                    id='get_app.ifNothingPrompts'
                    defaultMessage='You can view it in Mattermost desktop app or continue in the web browser.'
                />
            );
            if (isMobile) {
                viewApp = (
                    <FormattedMessage
                        id='get_app.ifNothingPromptsMobile'
                        defaultMessage='You can view it in Mattermost mobile app or continue in the web browser.'
                    />
                );
            }

            dialogHeader = (
                <div className='get-app__launching'>
                    <FormattedMessage
                        id='get_app.launching'
                        defaultMessage='Where would you like to view this?'
                    />
                    <div className='get-app__alternative'>
                        {viewApp}
                    </div>
                </div>
            );
        }

        let dialogBody;
        if (this.state.redirectPage) {
            dialogBody = (
                <div className='get-app__dialog-body'>
                    {dialogHeader}
                    {downloadLink}
                </div>
            );
        } else {
            dialogBody = (
                <div className='get-app__dialog-body'>
                    {dialogHeader}
                    <div className='get-app__buttons'>
                        <div className='get-app__status'>
                            {goNativeAppMessage}
                        </div>
                        <div className='get-app__status'>
                            <a
                                href='#'
                                onClick={this.openInBrowser}
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
                    {downloadLink}
                </div>
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
                    {dialogBody}
                </div>
            </div>
        );
    }
}

function protocolDetected() {
    // Code in case everything worked
}
