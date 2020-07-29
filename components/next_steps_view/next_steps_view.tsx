// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import {PreferenceType} from 'mattermost-redux/types/preferences';

import Accordion from 'components/accordion';
import Card from 'components/card/card';

import downloadApps from 'images/download-app.svg';
import onboardingSuccess from 'images/onboarding-success.svg';
import loadingIcon from 'images/spinner-48x48-blue.apng';
import professionalLogo from 'images/cloud-logos/professional.svg';

import {Preferences} from 'utils/constants';
import * as Utils from 'utils/utils';

import {Steps, StepType} from './steps';
import './next_steps_view.scss';

const TRANSITION_SCREEN_TIMEOUT = 1000;

type Props = {
    currentUserId: string;
    preferences: PreferenceType[];
    skuName: string;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        setShowNextStepsView: (show: boolean) => void;
    };
};

type State = {
    showFinalScreen: boolean;
    showTransitionScreen: boolean;
}

export default class NextStepsView extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showFinalScreen: false,
            showTransitionScreen: false,
        };
    }

    getLogo = () => {
        // TODO: Switch logos based on edition once we have the other logos

        switch (this.props.skuName) {
        default:
            return professionalLogo;
        }
    }

    getStartingStep = () => {
        for (let i = 0; i < Steps.length; i++) {
            if (!this.isStepComplete(Steps[i].id)) {
                return Steps[i].id;
            }
        }

        return Steps[0].id;
    }

    onSkip = (setExpanded: (expandedKey: string) => void) => {
        return (id: string) => {
            this.nextStep(setExpanded, id);
        };
    }

    onFinish = (setExpanded: (expandedKey: string) => void) => {
        return (id: string) => {
            this.props.actions.savePreferences(this.props.currentUserId, [{
                category: Preferences.RECOMMENDED_NEXT_STEPS,
                user_id: this.props.currentUserId,
                name: id,
                value: 'true',
            }]);

            this.nextStep(setExpanded, id);
        };
    }

    showFinalScreen = () => {
        this.setState({showFinalScreen: true});
    }

    transitionToFinalScreen = () => {
        this.setState({showTransitionScreen: true});
    }

    setTimerToFinalScreen = () => {
        setTimeout(() => {
            this.setState({showFinalScreen: true});
        }, TRANSITION_SCREEN_TIMEOUT);
    }

    nextStep = (setExpanded: (expandedKey: string) => void, id: string) => {
        const currentIndex = Steps.findIndex((step) => step.id === id);
        if ((currentIndex + 1) > (Steps.length - 1)) {
            this.transitionToFinalScreen();
        } else if (this.isStepComplete(Steps[currentIndex + 1].id)) {
            this.nextStep(setExpanded, Steps[currentIndex + 1].id);
        } else {
            setExpanded(Steps[currentIndex + 1].id);
        }
    }

    isStepComplete = (id: string) => {
        return this.props.preferences.some((pref) => pref.name === id && Boolean(pref.value));
    }

    renderStep = (step: StepType, index: number) => {
        let icon = (
            <div className='NextStepsView__cardHeaderBadge'>
                <span>{index + 1}</span>
            </div>
        );
        if (this.isStepComplete(step.id)) {
            icon = (
                <i className='icon icon-check-circle'/>
            );
        }

        return (setExpanded: (expandedKey: string) => void, expandedKey: string) => (
            <Card
                className={classNames({complete: this.isStepComplete(step.id)})}
                expanded={expandedKey === step.id}
            >
                <Card.Header>
                    <button
                        onClick={() => setExpanded(step.id)}
                        disabled={this.isStepComplete(step.id)}
                        className='NextStepsView__cardHeader'
                    >
                        {icon}
                        <span>{step.title}</span>
                    </button>
                </Card.Header>
                <Card.Body>
                    <step.component
                        id={step.id}
                        onFinish={this.onFinish(setExpanded)}
                        onSkip={this.onSkip(setExpanded)}
                    />
                </Card.Body>
            </Card>
        );
    }

    renderFinalScreen = () => {
        let nonMobileTips;
        if (!Utils.isMobile()) {
            nonMobileTips = (
                <>
                    <Card expanded={true}>
                        <Card.Body>
                            <h3>
                                <FormattedMessage
                                    id='next_steps_view.tips.configureLogin'
                                    defaultMessage='Configure your login method'
                                />
                            </h3>
                            <FormattedMessage
                                id='next_steps_view.tips.configureLogin.text'
                                defaultMessage='Set up OAuth, SAML or AD/LDAP authentication.'
                            />
                            <button
                                className='NextStepsView__button confirm'
                                onClick={() => {}}
                            >
                                <FormattedMessage
                                    id='next_steps_view.tips.configureLogin.button'
                                    defaultMessage='Configure'
                                />
                                <i className='icon icon-chevron-down'/>
                            </button>
                        </Card.Body>
                    </Card>
                    <Card expanded={true}>
                        <Card.Body>
                            <h3>
                                <FormattedMessage
                                    id='next_steps_view.tips.addPlugins'
                                    defaultMessage='Add plugins to Mattermost'
                                />
                            </h3>
                            <FormattedMessage
                                id='next_steps_view.tips.addPlugins.text'
                                defaultMessage='Visit the Plugins Marketplace to install and configure plugins.'
                            />
                            <button
                                className='NextStepsView__button confirm'
                                onClick={() => {}}
                            >
                                <FormattedMessage
                                    id='next_steps_view.tips.addPlugins.button'
                                    defaultMessage='Add plugins'
                                />
                            </button>
                        </Card.Body>
                    </Card>
                </>
            );
        }

        let downloadSection;
        if (Utils.isMobile()) {
            downloadSection = (
                <div className='NextStepsView__tipsMobileMessage'>
                    <Card expanded={true}>
                        <Card.Body>
                            <i className='icon icon-laptop'/>
                            <FormattedMessage
                                id='next_steps_view.mobile_tips_message'
                                defaultMessage='To configure your workspace, continue on a desktop computer.'
                            />
                        </Card.Body>
                    </Card>
                </div>
            );
        } else {
            downloadSection = (
                <div className='NextStepsView__download'>
                    <img src={downloadApps}/>
                    <div className='NextStepsView__downloadText'>
                        <h3>
                            <FormattedMessage
                                id='next_steps_view.downloadDesktopAndMobile'
                                defaultMessage='Download the Desktop and Mobile apps'
                            />
                        </h3>
                        <div className='NextStepsView__downloadButtons'>
                            <button
                                className='NextStepsView__downloadForPlatformButton'
                                onClick={() => {}}
                            >
                                {'TODO Mattermost for Mac'}
                            </button>
                            <button
                                className='NextStepsView__downloadAnyButton'
                                onClick={() => {}}
                            >
                                <FormattedMessage
                                    id='next_steps_view.seeAllTheApps'
                                    defaultMessage='See all the apps'
                                />
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        // TODO
        return (
            <div className={classNames('NextStepsView__viewWrapper NextStepsView__completedView', {completed: this.state.showFinalScreen})}>
                <header className='NextStepsView__header'>
                    <div className='NextStepsView__header-headerText'>
                        <h1 className='NextStepsView__header-headerTopText'>
                            <FormattedMessage
                                id='next_steps_view.tipsAndNextSteps'
                                defaultMessage='Tips & Next Steps'
                            />
                        </h1>
                        <h2 className='NextStepsView__header-headerBottomText'>
                            <FormattedMessage
                                id='next_steps_view.otherAreasToExplore'
                                defaultMessage='A few other areas to explore'
                            />
                        </h2>
                    </div>
                </header>
                <div className='NextStepsView__body'>
                    <div className='NextStepsView__nextStepsCards'>
                        <Card expanded={true}>
                            <Card.Body>
                                <h3>
                                    <FormattedMessage
                                        id='next_steps_view.tips.takeATour'
                                        defaultMessage='Take a tour'
                                    />
                                </h3>
                                <FormattedMessage
                                    id='next_steps_view.tips.takeATour.text'
                                    defaultMessage='Let us show you around with a guided tour of the interface.'
                                />
                                <button
                                    className='NextStepsView__button confirm'
                                    onClick={() => {}}
                                >
                                    <FormattedMessage
                                        id='next_steps_view.tips.takeATour.button'
                                        defaultMessage='Take the tour'
                                    />
                                </button>
                            </Card.Body>
                        </Card>
                        {nonMobileTips}
                    </div>
                    {downloadSection}
                </div>
            </div>
        );
    }

    renderTransitionScreen = () => {
        return (
            <div
                className={classNames('NextStepsView__viewWrapper NextStepsView__transitionView', {
                    transitioning: this.state.showTransitionScreen,
                    completed: this.state.showTransitionScreen && this.state.showFinalScreen,
                })}
                onTransitionEnd={this.setTimerToFinalScreen}
            >
                <div className='NextStepsView__transitionBody'>
                    <img src={onboardingSuccess}/>
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
        const renderedSteps = Steps.map(this.renderStep);

        return (
            <div className={classNames('NextStepsView__viewWrapper NextStepsView__mainView', {completed: this.state.showFinalScreen || this.state.showTransitionScreen})}>
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
                        <img src={this.getLogo()}/>
                    </div>
                </header>
                <div className='NextStepsView__body'>
                    <div className='NextStepsView__body-main'>
                        <Accordion defaultExpandedKey={this.getStartingStep()}>
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
                                onClick={this.showFinalScreen}
                            >
                                <FormattedMessage
                                    id='next_steps_view.skipGettingStarted'
                                    defaultMessage='Skip Getting Started'
                                />
                            </button>
                        </div>
                    </div>
                    <div className='NextStepsView__body-graphic'/>
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
                {this.renderMainBody()}
                {this.renderTransitionScreen()}
                {this.renderFinalScreen()}
            </section>
        );
    }
}
