// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {FormattedMessage} from 'react-intl';
import safeOpenProtocol from 'custom-protocol-detection';

import desktopImg from 'images/deep-linking/deeplinking-desktop-img.png';
import mobileImg from 'images/deep-linking/deeplinking-mobile-img.png';
import MattermostLogoSvg from 'images/logo.svg';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import CheckboxCheckedIcon from 'components/widgets/icons/checkbox_checked_icon';
import BrowserStore from 'stores/browser_store';
import {LandingPreferenceTypes} from 'utils/constants';
import * as Utils from 'utils/utils';

import * as UserAgent from 'utils/user_agent';
import { Redirect } from 'react-router-dom';

type Props = {
    defaultTheme: any;
    desktopAppLink?: string;
    iosAppLink?: string;
    androidAppLink?: string;
    siteUrl?: string;
}

type State = {
    protocolUnsupported: boolean;
    browserUnsupported: boolean;
    rememberChecked: boolean;
    redirectPage: boolean;
    location: string;
    nativeLocation: string;
}

export default class LinkingLandingPage extends PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const location = window.location.href.replace('/landing#', '');

        this.state = {
            protocolUnsupported: false,
            browserUnsupported: false,
            rememberChecked: false,
            redirectPage: false,
            location,
            nativeLocation: location.replace(/^(https|http)/, 'mattermost'),
        };
    }

    componentDidMount() {
        Utils.applyTheme(this.props.defaultTheme);
        if (this.checkLandingPreferenceApp()) {
            this.openMattermostApp();
        }
    }

    checkLandingPreferenceBrowser = () => {
        const landingPreference = BrowserStore.getLandingPreference(this.props.siteUrl);
        return landingPreference && landingPreference == LandingPreferenceTypes.BROWSER;
    }

    checkLandingPreferenceApp = () => {
        const landingPreference = BrowserStore.getLandingPreference(this.props.siteUrl);
        return landingPreference && landingPreference == LandingPreferenceTypes.MATTERMOSTAPP;
    }

    handleChecked = () => {
        this.setState({rememberChecked: !this.state.rememberChecked});
    }

    setPreference = (pref: string) => {
        if (!this.state.rememberChecked) {
            return;
        }

        switch (pref) {
        case LandingPreferenceTypes.MATTERMOSTAPP:
            BrowserStore.setLandingPreferenceToMattermostApp(this.props.siteUrl);
            break;
        case LandingPreferenceTypes.BROWSER:
            BrowserStore.setLandingPreferenceToBrowser(this.props.siteUrl);
            break;
        default:
            break;
        }
    }

    openMattermostApp = () => {
        this.setPreference(LandingPreferenceTypes.MATTERMOSTAPP);
        this.setState({redirectPage: true});
        window.location.href = this.state.nativeLocation;
    }

    openInBrowser = () => {
        this.setPreference(LandingPreferenceTypes.BROWSER);
        window.location.href = this.state.location;
    }

    tryOpen = () => {
        safeOpenProtocol(this.state.nativeLocation,
            () => this.setState({protocolUnsupported: true}),
            () => null,
            () => this.setState({browserUnsupported: true})
        );
    }

    renderSystemDialogMessage = () => {
        const isMobile = UserAgent.isMobile();

        if (isMobile) {
            return (
                <FormattedMessage
                    id='get_app.systemDialogMessageMobile'
                    defaultMessage='View in App'
                />
            );
        }

        return (
            <FormattedMessage
                id='get_app.systemDialogMessage'
                defaultMessage='View in Desktop App'
            />
        );
    }

    renderGoNativeAppMessage = () => {
        const {browserUnsupported, protocolUnsupported} = this.state;
        const downloadLink = this.getDownloadLink();
        const isMobile = UserAgent.isMobile();

        if (protocolUnsupported && downloadLink) {
            return (
                <a
                    href={downloadLink}
                    className='btn btn-primary btn-lg get-app__download'
                >
                    <FormattedMessage
                        id='get_app.downloadMattermost'
                        defaultMessage='Download App'
                    />
                </a>
            );
        } else if (browserUnsupported) {
            return (
                <a className='btn btn-primary btn-lg get-app__download disabled'>
                    <FormattedMessage
                        id='get_app.browserUnsupported'
                        defaultMessage='Browser not supported.'
                    />
                </a>
            );
        }

        return (
            <a
                href='#'
                onClick={this.openMattermostApp}
                className='btn btn-primary btn-lg get-app__download'
            >
                {this.renderSystemDialogMessage()}
            </a>
        );
    }

    getDownloadLink = () => {
        if (UserAgent.isIosWeb()) {
            return this.props.iosAppLink;
        } else if (UserAgent.isAndroidWeb()) {
            return this.props.androidAppLink;
        }

        return this.props.desktopAppLink;
    }

    renderCheckboxIcon = () => {
        if (this.state.rememberChecked) {
            return (
                <CheckboxCheckedIcon/>
            );
        }

        return null;
    }

    renderGraphic = () => {
        const isMobile = UserAgent.isMobile();

        if (isMobile) {
            return (
                <img src={mobileImg}/>
            );
        }

        return (
            <img src={desktopImg}/>
        );
    }

    renderDownloadLinkText = () => {
        const isMobile = UserAgent.isMobile();

        if (isMobile) {
            return (
                <FormattedMessage
                    id='get_app.dontHaveTheMobileApp'
                    defaultMessage={'Don\'t have the Mobile App?'}
                />
            );
        }

        return (
            <FormattedMessage
                id='get_app.dontHaveTheDesktopApp'
                defaultMessage={'Don\'t have the Desktop App?'}
            />
        );
    }

    renderDownloadLinkSection = () => {
        const {protocolUnsupported} = this.state;
        const downloadLink = this.getDownloadLink();

        if (this.state.redirectPage) {
            return (
                <div className='get-app__download-link'>
                    <FormattedMarkdownMessage
                        id='get_app.openLinkInBrowser'
                        defaultMessage='Or, [open this link in your browser.](!{link})'
                        values={{
                            link: this.state.location,
                        }}
                    />
                </div>
            );
        } else if (!protocolUnsupported && downloadLink) {
            return (
                <div className='get-app__download-link'>
                    {this.renderDownloadLinkText()}
                    {'\u00A0'}
                    <br/>
                    <a href={downloadLink}>
                        <FormattedMessage
                            id='get_app.downloadTheAppNow'
                            defaultMessage='Download the app now.'
                        />
                    </a>
                </div>
            );
        }

        return null;
    }

    renderDialogHeader = () => {
        const downloadLink = this.getDownloadLink();
        const isMobile = UserAgent.isMobile();

        if (this.state.redirectPage) {
            return (
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
                        {this.renderDownloadLinkText()}
                        {'\u00A0'}
                        <br className='mobile-only'/>
                        <a href={downloadLink}>
                            <FormattedMessage
                                id='get_app.downloadTheAppNow'
                                defaultMessage='Download the app now.'
                            />
                        </a>
                    </div>
                </div>
            );
        }

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

        return (
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

    renderDialogBody = () => {
        if (this.state.redirectPage) {
            return (
                <div className='get-app__dialog-body'>
                    {this.renderDialogHeader()}
                    {this.renderDownloadLinkSection()}
                </div>
            );
        }

        return (
            <div className='get-app__dialog-body'>
                {this.renderDialogHeader()}
                <div className='get-app__buttons'>
                    <div className='get-app__status'>
                        {this.renderGoNativeAppMessage()}
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
                        {this.renderCheckboxIcon()}
                    </button>
                    <FormattedMessage
                        id='get_app.rememberMyPreference'
                        defaultMessage='Remember my preference'
                    />
                </div>
                {this.renderDownloadLinkSection()}
            </div>
        );
    }

    render() {
        const isMobile = UserAgent.isMobile();

        if (this.checkLandingPreferenceBrowser()) {
            this.openInBrowser();
            return null;
        }

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
                    >
                        {this.renderGraphic()}
                    </div>
                    {this.renderDialogBody()}
                </div>
            </div>
        );
    }
}
