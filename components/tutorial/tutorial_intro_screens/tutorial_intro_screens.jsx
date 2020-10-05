// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import {Constants, Preferences, ModalIdentifiers} from 'utils/constants.jsx';
import {useSafeUrl} from 'utils/url';
import AppIcons from 'images/appIcons.png';
import ModalToggleButtonRedux from 'components/toggle_modal_button_redux';
import InvitationModal from 'components/invitation_modal';

const NUM_SCREENS = 3;

export default class TutorialIntroScreens extends React.PureComponent {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        step: PropTypes.number,
        townSquareDisplayName: PropTypes.string.isRequired,
        appDownloadLink: PropTypes.string,
        isLicensed: PropTypes.bool.isRequired,
        restrictTeamInvite: PropTypes.bool.isRequired,
        supportEmail: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            savePreferences: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {currentScreen: 0};
    }

    handleNext = () => {
        switch (this.state.currentScreen) {
        case 0:
            trackEvent('tutorial', 'tutorial_screen_1_welcome_to_mattermost_next');
            break;
        case 1:
            trackEvent('tutorial', 'tutorial_screen_2_how_mattermost_works_next');
            break;
        case 2:
            trackEvent('tutorial', 'tutorial_screen_3_youre_all_set_next');
            break;
        }

        if (this.state.currentScreen < 2) {
            this.setState({currentScreen: this.state.currentScreen + 1});
            return;
        }

        const {currentUserId} = this.props;
        const preferences = [{
            user_id: currentUserId,
            category: Preferences.TUTORIAL_STEP,
            name: currentUserId,
            value: (this.props.step + 1).toString(),
        }];

        this.props.actions.savePreferences(currentUserId, preferences);
    }

    skipTutorial = (e) => {
        e.preventDefault();

        switch (this.state.currentScreen) {
        case 0:
            trackEvent('tutorial', 'tutorial_screen_1_welcome_to_mattermost_skip');
            break;
        case 1:
            trackEvent('tutorial', 'tutorial_screen_2_how_mattermost_works_skip');
            break;
        case 2:
            trackEvent('tutorial', 'tutorial_screen_3_youre_all_set_skip');
            break;
        }

        const {currentUserId} = this.props;
        const preferences = [{
            user_id: currentUserId,
            category: Preferences.TUTORIAL_STEP,
            name: currentUserId,
            value: Constants.TutorialSteps.FINISHED.toString(),
        }];

        this.props.actions.savePreferences(currentUserId, preferences);
    }
    createScreen = () => {
        switch (this.state.currentScreen) {
        case 0:
            return this.createScreenOne();
        case 1:
            return this.createScreenTwo();
        case 2:
            return this.createScreenThree();
        }
        return null;
    }

    createScreenOne() {
        const circles = this.createCircles();

        return (
            <div id='tutorialIntroOne'>
                <h3>
                    <FormattedMessage
                        id='tutorial_intro.screenOne.title1'
                        defaultMessage='Welcome to:'
                    />
                </h3>
                <h1>
                    <FormattedMessage
                        id='tutorial_intro.screenOne.title2'
                        defaultMessage='Mattermost'
                    />
                </h1>
                <p>
                    <FormattedMessage
                        id='tutorial_intro.screenOne.body1'
                        defaultMessage='Your team communication all in one place, instantly searchable and available anywhere.'
                    />
                </p>
                <p>
                    <FormattedMessage
                        id='tutorial_intro.screenOne.body2'
                        defaultMessage='Keep your team connected to help them achieve what matters most.'
                    />
                </p>
                {circles}
            </div>
        );
    }

    createScreenTwo() {
        const circles = this.createCircles();

        let appDownloadLink = null;
        let appDownloadImage = null;
        if (this.props.appDownloadLink) {
            const link = useSafeUrl(this.props.appDownloadLink);

            // not using a FormattedHTMLMessage here since appDownloadLink is configurable and could be used
            // to inject HTML if we're not careful
            appDownloadLink = (
                <FormattedMessage
                    id='tutorial_intro.mobileApps'
                    defaultMessage='Install the apps for {link} for easy access and notifications on the go.'
                    values={{
                        link: (
                            <a
                                id='appDownloadLink'
                                href={link}
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <FormattedMessage
                                    id='tutorial_intro.mobileAppsLinkText'
                                    defaultMessage='PC, Mac, iOS and Android'
                                />
                            </a>
                        ),
                    }}
                />
            );

            appDownloadImage = (
                <a
                    id='appDownloadImage'
                    href={link}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <img
                        alt={'tutorial icons'}
                        className='tutorial__app-icons'
                        src={AppIcons}
                    />
                </a>
            );
        }

        return (
            <div id='tutorialIntroTwo'>
                <h3>
                    <FormattedMessage
                        id='tutorial_intro.screenTwo.title'
                        defaultMessage='How Mattermost Works:'
                    />
                </h3>
                <p>
                    <FormattedMessage
                        id='tutorial_intro.screenTwo.body1'
                        defaultMessage='Communication happens in public discussion channels, private channels and direct messages.'
                    />
                </p>
                <p>
                    <FormattedMessage
                        id='tutorial_intro.screenTwo.body2'
                        defaultMessage='Everything is archived and searchable from any web-enabled desktop, laptop or phone.'
                    />
                </p>
                {appDownloadLink}
                {appDownloadImage}
                {circles}
            </div>
        );
    }

    createScreenThree() {
        let inviteModalLink;
        let inviteText;

        if (!this.props.isLicensed || !this.props.restrictTeamInvite) {
            inviteModalLink = (
                <ModalToggleButtonRedux
                    id='tutorialIntroInvite'
                    className='intro-links color--link style--none'
                    modalId={ModalIdentifiers.INVITATION}
                    dialogType={InvitationModal}
                >
                    <FormattedMessage
                        id='tutorial_intro.invite'
                        defaultMessage='Invite Teammates'
                    />
                </ModalToggleButtonRedux>
            );

            inviteText = (
                <p>
                    {inviteModalLink}
                    <FormattedMessage
                        id='tutorial_intro.whenReady'
                        defaultMessage={' when you\'re ready.'}
                    />
                </p>
            );
        }

        const circles = this.createCircles();

        let supportInfo = null;
        if (this.props.supportEmail) {
            supportInfo = (
                <p id='supportInfo'>
                    <FormattedMessage
                        id='tutorial_intro.support'
                        defaultMessage='Need anything, just email us at '
                    />
                    <a
                        href={'mailto:' + this.props.supportEmail}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        {this.props.supportEmail}
                    </a>
                    {'.'}
                </p>
            );
        }

        return (
            <div id='tutorialIntroThree'>
                <h3>
                    <FormattedMessage
                        id='tutorial_intro.allSet'
                        defaultMessage={'You\'re all set'}
                    />
                </h3>
                {inviteText}
                {supportInfo}
                <FormattedMessage
                    id='tutorial_intro.end'
                    defaultMessage='Click "Next" to enter {channel}. This is the first channel teammates see when they sign up. Use it for posting updates everyone needs to know.'
                    values={{
                        channel: this.props.townSquareDisplayName,
                    }}
                />
                {circles}
            </div>
        );
    }

    handleCircleClick = (e, screen) => {
        e.preventDefault();
        this.setState({currentScreen: screen});
    }

    createCircles = () => {
        const circles = [];
        for (let i = 0; i < NUM_SCREENS; i++) {
            let className = 'circle';
            if (i === this.state.currentScreen) {
                className += ' active';
            }

            circles.push(
                <a
                    id={'tutorialIntroCircle' + i}
                    href='#'
                    key={'circle' + i}
                    className={className}
                    data-screen={i}
                    onClick={(e) => this.handleCircleClick(e, i)}
                />,
            );
        }

        return (
            <div className='tutorial__circles'>
                {circles}
            </div>
        );
    }

    render() {
        const screen = this.createScreen();

        return (
            <div className='tutorial-steps__container'>
                <div
                    id='tutorialIntroContent'
                    className='tutorial__content'
                >
                    <div className='tutorial__steps'>
                        {screen}
                        <div className='tutorial__footer'>
                            <button
                                id='tutorialNextButton'
                                className='btn btn-primary'
                                onClick={this.handleNext}
                            >
                                <FormattedMessage
                                    id='tutorial_intro.next'
                                    defaultMessage='Next'
                                />
                            </button>
                            <a
                                id='tutorialSkipLink'
                                className='tutorial-skip'
                                href='#'
                                onClick={this.skipTutorial}
                            >
                                <FormattedMessage
                                    id='tutorial_intro.skip'
                                    defaultMessage='Skip Tutorial'
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
