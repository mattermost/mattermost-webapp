// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Overlay} from 'react-bootstrap';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {savePreference} from 'actions/user_actions.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import UserStore from 'stores/user_store.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import tutorialGif from 'images/tutorialTip.gif';
import tutorialGifWhite from 'images/tutorialTipWhite.gif';

const Preferences = Constants.Preferences;
const TutorialSteps = Constants.TutorialSteps;

export default class TutorialTip extends React.Component {
    constructor(props) {
        super(props);

        this.state = {currentScreen: 0, show: false};
    }

    show = () => {
        this.setState({show: true});
    }

    hide = () => {
        this.setState({show: false});
    }

    handleNext = () => {
        if (this.state.currentScreen < this.props.screens.length - 1) {
            this.setState({currentScreen: this.state.currentScreen + 1});
            return;
        }

        if (this.props.diagnosticsTag) {
            let tag = this.props.diagnosticsTag;

            if (this.props.screens.length > 1) {
                tag += '_' + (this.state.currentScreen + 1).toString();
            }

            if (this.state.currentScreen === this.props.screens.length - 1) {
                tag += '_okay';
            } else {
                tag += '_next';
            }

            trackEvent('tutorial', tag);
        }

        this.closeRightSidebar();
        this.hide();

        const step = PreferenceStore.getInt(Preferences.TUTORIAL_STEP, UserStore.getCurrentId(), 0);
        savePreference(
            Preferences.TUTORIAL_STEP,
            UserStore.getCurrentId(),
            (step + 1).toString()
        );
    }

    closeRightSidebar() {
        if (Utils.isMobile()) {
            setTimeout(() => {
                document.querySelector('.app__body .inner-wrap').classList.remove('move--left-small');
                document.querySelector('.app__body .sidebar--menu').classList.remove('move--left');
            });
        }
    }

    skipTutorial = (e) => {
        e.preventDefault();

        if (this.props.diagnosticsTag) {
            let tag = this.props.diagnosticsTag;
            if (this.props.screens.length > 1) {
                tag += '_' + this.state.currentScreen;
            }
            tag += '_skip';
            trackEvent('tutorial', tag);
        }

        savePreference(
            Preferences.TUTORIAL_STEP,
            UserStore.getCurrentId(),
            TutorialSteps.FINISHED.toString()
        );
    }

    handleCircleClick = (e, screen) => {
        e.preventDefault();
        this.setState({currentScreen: screen});
    }

    getTarget = () => {
        return this.refs.target;
    }

    render() {
        const buttonText = this.state.currentScreen === this.props.screens.length - 1 ? (
            <FormattedMessage
                id='tutorial_tip.ok'
                defaultMessage='Okay'
            />
        ) : (
            <FormattedMessage
                id='tutorial_tip.next'
                defaultMessage='Next'
            />
        );

        const dots = [];
        if (this.props.screens.length > 1) {
            for (let i = 0; i < this.props.screens.length; i++) {
                let className = 'circle';
                if (i === this.state.currentScreen) {
                    className += ' active';
                }

                dots.push(
                    <a
                        href='#'
                        key={'dotactive' + i}
                        className={className}
                        data-screen={i}
                        onClick={(e) => this.handleCircleClick(e, i)}
                    />
                );
            }
        }

        var tutorialGifImage = tutorialGif;
        if (this.props.overlayClass === 'tip-overlay--header' || this.props.overlayClass === 'tip-overlay--sidebar' || this.props.overlayClass === 'tip-overlay--header--up') {
            tutorialGifImage = tutorialGifWhite;
        }

        return (
            <div
                id='tipButton'
                className={'tip-div ' + this.props.overlayClass}
                onClick={this.show}
            >
                <img
                    className='tip-button'
                    src={tutorialGifImage}
                    width='35'
                    onClick={this.show}
                    ref='target'
                />

                <Overlay
                    show={this.state.show}
                >
                    <div className='tip-backdrop'/>
                </Overlay>

                <Overlay
                    placement={this.props.placement}
                    show={this.state.show}
                    rootClose={true}
                    onHide={this.hide}
                    target={this.getTarget}
                >
                    <div className={'tip-overlay ' + this.props.overlayClass}>
                        <div className='arrow'/>
                        {this.props.screens[this.state.currentScreen]}
                        <div className='tutorial__footer'>
                            <div className='tutorial__circles'>{dots}</div>
                            <div className='text-right'>
                                <button
                                    id='tipNextButton'
                                    className='btn btn-primary'
                                    onClick={this.handleNext}
                                >
                                    {buttonText}
                                </button>
                                <div className='tip-opt'>
                                    <FormattedMessage
                                        id='tutorial_tip.seen'
                                        defaultMessage='Seen this before? '
                                    />
                                    <a
                                        href='#'
                                        onClick={this.skipTutorial}
                                    >
                                        <FormattedMessage
                                            id='tutorial_tip.out'
                                            defaultMessage='Opt out of these tips.'
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </Overlay>
            </div>
        );
    }
}

TutorialTip.defaultProps = {
    overlayClass: ''
};

TutorialTip.propTypes = {
    screens: PropTypes.array.isRequired,
    placement: PropTypes.string.isRequired,
    overlayClass: PropTypes.string,
    diagnosticsTag: PropTypes.string
};

export function createMenuTip(toggleFunc, onBottom) {
    const screens = [];

    screens.push(
        <div>
            <FormattedHTMLMessage
                id='sidebar_header.tutorial'
                defaultMessage='<h4>Main Menu</h4>
                <p>The <strong>Main Menu</strong> is where you can <strong>Invite New Members</strong>, access your <strong>Account Settings</strong> and set your <strong>Theme Color</strong>.</p>
                <p>Team administrators can also access their <strong>Team Settings</strong> from this menu.</p><p>System administrators will find a <strong>System Console</strong> option to administrate the entire system.</p>'
            />
        </div>
    );

    let placement = 'right';
    let arrow = 'left';
    if (onBottom) {
        placement = 'bottom';
        arrow = 'up';
    }

    return (
        <div
            onClick={toggleFunc}
        >
            <TutorialTip
                ref='tip'
                placement={placement}
                screens={screens}
                overlayClass={'tip-overlay--header--' + arrow}
                diagnosticsTag='tutorial_tip_3_main_menu'
            />
        </div>
    );
}
