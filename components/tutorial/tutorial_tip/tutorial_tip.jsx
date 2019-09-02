// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Overlay} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import Constants from 'utils/constants.jsx';
import tutorialGif from 'images/tutorialTip.gif';
import tutorialGifWhite from 'images/tutorialTipWhite.gif';

const Preferences = Constants.Preferences;
const TutorialSteps = Constants.TutorialSteps;

export default class TutorialTip extends React.Component {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        step: PropTypes.number.isRequired,
        screens: PropTypes.array.isRequired,
        placement: PropTypes.string.isRequired,
        overlayClass: PropTypes.string,
        diagnosticsTag: PropTypes.string,
        actions: PropTypes.shape({
            closeRhsMenu: PropTypes.func.isRequired,
            savePreferences: PropTypes.func.isRequired,
        }),
    }

    static defaultProps = {
        overlayClass: '',
    }

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

        const {currentUserId, actions} = this.props;
        const {closeRhsMenu, savePreferences} = actions;

        const preferences = [{
            user_id: currentUserId,
            category: Preferences.TUTORIAL_STEP,
            name: currentUserId,
            value: (this.props.step + 1).toString(),
        }];

        closeRhsMenu();
        this.hide();

        savePreferences(currentUserId, preferences);
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

        const {currentUserId, actions} = this.props;
        const preferences = [{
            user_id: currentUserId,
            category: Preferences.TUTORIAL_STEP,
            name: currentUserId,
            value: TutorialSteps.FINISHED.toString(),
        }];

        actions.savePreferences(currentUserId, preferences);
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
                    alt={'tutorial tip'}
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
