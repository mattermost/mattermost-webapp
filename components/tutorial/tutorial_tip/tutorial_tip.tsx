// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Overlay} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import Constants from 'utils/constants';
import tutorialGif from 'images/tutorialTip.gif';
import tutorialGifWhite from 'images/tutorialTipWhite.gif';

const Preferences = Constants.Preferences;
const TutorialSteps = Constants.TutorialSteps;

type Preference = {
    user_id: string;
    category: string;
    name: string;
    value: string;
}

type Props = {
    currentUserId: string;
    step: number;
    screens: Array<JSX.Element>;
    placement: string;
    overlayClass: string;
    telemetryTag?: string;
    actions: {
        closeRhsMenu: () => void;
        savePreferences: (currentUserId: string, preferences: Array<Preference>) => void;
    };
}

type State = {
    currentScreen: number;
    show: boolean;
}

export default class TutorialTip extends React.PureComponent<Props, State> {
    public targetRef: React.RefObject<HTMLImageElement>;

    public static defaultProps: Partial<Props> = {
        overlayClass: '',
    }

    public constructor(props: Props) {
        super(props);

        this.state = {
            currentScreen: 0,
            show: false,
        };

        this.targetRef = React.createRef();
    }

    private show = (): void => {
        this.setState({show: true});
    }

    private hide = (): void => {
        this.setState({show: false});
    }

    public handleNext = (): void => {
        if (this.state.currentScreen < this.props.screens.length - 1) {
            this.setState({currentScreen: this.state.currentScreen + 1});
            return;
        }

        if (this.props.telemetryTag) {
            let tag = this.props.telemetryTag;

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

    public skipTutorial = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();

        if (this.props.telemetryTag) {
            let tag = this.props.telemetryTag;
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

    private handleCircleClick = (e: React.MouseEvent<HTMLAnchorElement>, screen: number): void => {
        e.preventDefault();
        this.setState({currentScreen: screen});
    }

    private getTarget = (): HTMLImageElement | null => {
        return this.targetRef.current;
    }

    public render(): JSX.Element {
        const buttonText = this.state.currentScreen === this.props.screens.length - 1 ?
            (
                <FormattedMessage
                    id='tutorial_tip.ok'
                    defaultMessage='Okay'
                />
            ) :
            (
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
                    />,
                );
            }
        }

        let tutorialGifImage = tutorialGif;
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
                    ref={this.targetRef}
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
