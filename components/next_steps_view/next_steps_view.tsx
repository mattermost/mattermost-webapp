// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import {PreferenceType} from 'mattermost-redux/types/preferences';
import {UserProfile} from 'mattermost-redux/types/users';

import Accordion from 'components/accordion';
import Card from 'components/card/card';

import loadingIcon from 'images/spinner-48x48-blue.apng';
import {Preferences} from 'utils/constants';

import {StepType} from './steps';
import './next_steps_view.scss';
import NextStepsTips from './next_steps_tips';
import OnboardingBgSvg from './images/onboarding-bg-svg';
import GettingStartedSvg from './images/getting-started-svg';
import CloudLogoSvg from './images/cloud-logo-svg';
import OnboardingSuccessSvg from './images/onboarding-success-svg';

const TRANSITION_SCREEN_TIMEOUT = 3000;

type Props = {
    currentUser: UserProfile;
    preferences: PreferenceType[];
    isAdmin: boolean;
    steps: StepType[];
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        setShowNextStepsView: (show: boolean) => void;
    };
};

type State = {
    showFinalScreen: boolean;
    showTransitionScreen: boolean;
    animating: boolean;
}

export default class NextStepsView extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showFinalScreen: false,
            showTransitionScreen: false,
            animating: false,
        };
    }

    getStartingStep = () => {
        for (let i = 0; i < this.props.steps.length; i++) {
            if (!this.isStepComplete(this.props.steps[i].id)) {
                return this.props.steps[i].id;
            }
        }
        return this.props.steps[0].id;
    }

    getIncompleteStep = () => {
        for (let i = 0; i < this.props.steps.length; i++) {
            if (!this.isStepComplete(this.props.steps[i].id)) {
                return this.props.steps[i].id;
            }
        }
        return null;
    }

    onSkip = (setExpanded: (expandedKey: string) => void) => {
        return (id: string) => {
            this.nextStep(setExpanded, id);
        };
    }

    onFinish = (setExpanded: (expandedKey: string) => void) => {
        return async (id: string) => {
            await this.props.actions.savePreferences(this.props.currentUser.id, [{
                category: Preferences.RECOMMENDED_NEXT_STEPS,
                user_id: this.props.currentUser.id,
                name: id,
                value: 'true',
            }]);

            this.nextStep(setExpanded, id);
        };
    }

    showFinalScreen = () => {
        this.setState({showFinalScreen: true, animating: true});
    }

    transitionToFinalScreen = () => {
        this.setState({showTransitionScreen: true, animating: true});
    }

    setTimerToFinalScreen = () => {
        if (this.state.showTransitionScreen) {
            setTimeout(() => {
                this.setState({showFinalScreen: true});
            }, TRANSITION_SCREEN_TIMEOUT);
        }
    }

    stopAnimating = () => {
        this.setState({animating: false});
    }

    nextStep = (setExpanded: (expandedKey: string) => void, id: string) => {
        const currentIndex = this.props.steps.findIndex((step) => step.id === id);
        if (currentIndex + 1 > this.props.steps.length - 1) {
            // Check if previous steps were skipped before moving on
            const incompleteStep = this.getIncompleteStep();
            if (incompleteStep === null) {
                // Collapse all accordion tiles
                setExpanded('');
                setTimeout(() => {
                    this.transitionToFinalScreen();
                }, 300);
            } else {
                setExpanded(incompleteStep);
            }
        } else if (this.isStepComplete(this.props.steps[currentIndex + 1].id)) {
            this.nextStep(setExpanded, this.props.steps[currentIndex + 1].id);
        } else {
            setExpanded(this.props.steps[currentIndex + 1].id);
        }
    }

    isStepComplete = (id: string) => {
        return this.props.preferences.some((pref) => pref.name === id && pref.value === 'true');
    }

    renderStep = (step: StepType, index: number) => {
        const {id, title} = step;

        let icon = (
            <div className='NextStepsView__cardHeaderBadge'>
                <span>{index + 1}</span>
            </div>
        );
        if (this.isStepComplete(id)) {
            icon = (
                <i className='icon icon-check-circle'/>
            );
        }

        return (setExpanded: (expandedKey: string) => void, expandedKey: string) => (
            <Card
                className={classNames({complete: this.isStepComplete(id)})}
                expanded={expandedKey === id}
            >
                <Card.Header>
                    <button
                        onClick={() => setExpanded(id)}
                        disabled={this.isStepComplete(id)}
                        className='NextStepsView__cardHeader'
                    >
                        {icon}
                        <span>{title}</span>
                    </button>
                </Card.Header>
                <Card.Body>
                    <step.component
                        id={id}
                        currentUser={this.props.currentUser}
                        onFinish={this.onFinish(setExpanded)}
                        onSkip={this.onSkip(setExpanded)}
                    />
                </Card.Body>
            </Card>
        );
    }

    renderTransitionScreen = () => {
        return (
            <div
                className={classNames('NextStepsView__viewWrapper NextStepsView__transitionView', {
                    transitioning: this.state.showTransitionScreen,
                    completed: this.state.showTransitionScreen && this.state.showFinalScreen,
                    animating: this.state.animating,
                })}
                onTransitionEnd={this.setTimerToFinalScreen}
            >
                <div className='NextStepsView__transitionBody'>
                    <OnboardingSuccessSvg/>
                    <h1 className='NextStepsView__transitionTopText'>
                        <FormattedMessage
                            id='next_steps_view.nicelyDone'
                            defaultMessage='Nicely done! You’re all set.'
                        />
                    </h1>
                    <h2 className='NextStepsView__transitionBottomText'>
                        <img src={loadingIcon}/>
                        <FormattedMessage
                            id='next_steps_view.oneMoment'
                            defaultMessage='One moment'
                        />
                    </h2>
                </div>
            </div>
        );
    }

    renderMainBody = () => {
        const renderedSteps = this.props.steps.map(this.renderStep);

        return (
            <div
                className={classNames('NextStepsView__viewWrapper NextStepsView__mainView', {
                    completed: this.state.showFinalScreen || this.state.showTransitionScreen,
                    animating: this.state.animating,
                })}
            >
                <header className='NextStepsView__header'>
                    <div className='NextStepsView__header-headerText'>
                        <h1 className='NextStepsView__header-headerTopText'>
                            <FormattedMessage
                                id='next_steps_view.welcomeToMattermost'
                                defaultMessage='Welcome to Mattermost'
                            />
                        </h1>
                        <h2 className='NextStepsView__header-headerBottomText'>
                            <FormattedMessage
                                id='next_steps_view.hereAreSomeNextSteps'
                                defaultMessage='Here are some recommended next steps to help you get started'
                            />
                        </h2>
                    </div>
                    <div className='NextStepsView__header-logo'>
                        <CloudLogoSvg/>
                    </div>
                </header>
                <div className='NextStepsView__body'>
                    <div className='NextStepsView__body-main'>
                        <Accordion defaultExpandedKey={this.getIncompleteStep() === null ? '' : this.getStartingStep()}>
                            {(setExpanded, expandedKey) => {
                                return (
                                    <>
                                        {renderedSteps.map((step) => step(setExpanded, expandedKey))}
                                    </>
                                );
                            }}
                        </Accordion>
                        <div className='NextStepsView__skipGettingStarted'>
                            <button
                                className='NextStepsView__button tertiary'
                                onClick={this.showFinalScreen}
                            >
                                <FormattedMessage
                                    id='next_steps_view.skipGettingStarted'
                                    defaultMessage='Skip Getting Started'
                                />
                            </button>
                        </div>
                    </div>
                    <div className='NextStepsView__body-graphic'>
                        <GettingStartedSvg/>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <section
                id='app-content'
                className='app__content NextStepsView'
            >
                <OnboardingBgSvg/>
                {this.renderMainBody()}
                {this.renderTransitionScreen()}
                <NextStepsTips
                    showFinalScreen={this.state.showFinalScreen}
                    animating={this.state.animating}
                    stopAnimating={this.stopAnimating}
                    isAdmin={this.props.isAdmin}
                />
            </section>
        );
    }
}
