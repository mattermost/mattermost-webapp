// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import {PreferenceType} from 'mattermost-redux/types/preferences';
import {UserProfile} from 'mattermost-redux/types/users';

import {pageVisited, trackEvent} from 'actions/diagnostics_actions';
import Accordion from 'components/accordion';
import Card from 'components/card/card';
import {getAnalyticsCategory} from 'components/cloud_onboarding/step_helpers';
import {Preferences} from 'utils/constants';

import {StepType} from '../steps';

import OnboardingBgSvg from '../images/onboarding-bg-svg';
import GettingStartedSvg from '../images/getting-started-svg';
import CloudLogoSvg from '../images/cloud-logo-svg';

type Props = {
    currentUser: UserProfile;
    preferences: PreferenceType[];
    isFirstAdmin: boolean;
    steps: StepType[];
    show: boolean;
    animating: boolean;
    getStartingStep: () => string;
    onFinish: () => void;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        setShowNextStepsView: (show: boolean) => void;
        getProfiles: () => void;
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

    async componentDidMount() {
        pageVisited(getAnalyticsCategory(this.props.isFirstAdmin), 'pageview_welcome');
    }

    getIncompleteStep = () => {
        for (let i = 0; i < this.props.steps.length; i++) {
            if (!this.isStepComplete(this.props.steps[i].id)) {
                return this.props.steps[i].id;
            }
        }
        return null;
    }

    onClickHeader = (setExpanded: (expandedKey: string) => void, id: string) => {
        const stepIndex = this.getStepNumberFromId(id);
        trackEvent(getAnalyticsCategory(this.props.isFirstAdmin), `click_onboarding_step${stepIndex}`);
        setExpanded(id);
    }

    getStepNumberFromId = (id: string) => {
        return this.props.steps.findIndex((step) => step.id === id) + 1;
    }

    onSkip = (setExpanded: (expandedKey: string) => void) => {
        return (id: string) => {
            this.nextStep(setExpanded, id);
        };
    }

    onSkipAll = async () => {
        const finishedSteps = this.props.steps.map((step) => {
            return {
                user_id: this.props.currentUser.id,
                category: Preferences.RECOMMENDED_NEXT_STEPS,
                name: step.id,
                value: 'true',
            };
        });

        // await this.props.actions.savePreferences, this.props.currentUser.id;
        this.props.actions.savePreferences(this.props.currentUser.id, finishedSteps);
        this.props.onFinish();
    }

    onFinished = () => {
        this.props.onFinish();
    }

    onFinish = (setExpanded: (expandedKey: string) => void) => {
        return async (id: string) => {
            const stepIndex = this.getStepNumberFromId(id);
            trackEvent(getAnalyticsCategory(this.props.isFirstAdmin), `complete_onboarding_step${stepIndex}`);

            await this.props.actions.savePreferences(this.props.currentUser.id, [{
                category: Preferences.RECOMMENDED_NEXT_STEPS,
                user_id: this.props.currentUser.id,
                name: id,
                value: 'true',
            }]);

            this.nextStep(setExpanded, id);
        };
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
                    this.onFinished();
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
                        onClick={() => this.onClickHeader(setExpanded, id)}
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
                        expanded={expandedKey === id}
                        isAdmin={this.props.isFirstAdmin}
                        currentUser={this.props.currentUser}
                        onFinish={this.onFinish(setExpanded)}
                        onSkip={this.onSkip(setExpanded)}
                    />
                </Card.Body>
            </Card>
        );
    }

    renderMainBody = () => {
        const renderedSteps = this.props.steps.map(this.renderStep);

        return (
            <div
                className={classNames('NextStepsView__viewWrapper NextStepsView__mainView', {
                    completed: this.props.show,
                    animating: this.props.animating,
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
                        <Accordion defaultExpandedKey={this.getIncompleteStep() === null ? '' : this.props.getStartingStep()}>
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
                                onClick={this.onSkipAll}
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
            <>
                <OnboardingBgSvg/>
                {this.renderMainBody()}
            </>
        );
    }
}
