// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import {PreferenceType} from 'mattermost-redux/types/preferences';

import Accordion from 'components/accordion';
import Card from 'components/card/card';
import professionalLogo from 'images/cloud-logos/professional.svg';
import {RecommendedNextSteps, Preferences} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import CompleteProfileStep from './steps/complete_profile_step';
import './next_steps_view.scss';

export type StepComponentProps = {
    id: string;
    onSkip: (id: string) => void;
    onFinish: (id: string) => void;
}

type StepType = {
    id: string;
    title: string;
    component: React.ComponentType<StepComponentProps>;
}

const steps: StepType[] = [
    {
        id: RecommendedNextSteps.COMPLETE_PROFILE,
        title: localizeMessage('next_steps_view.titles.completeProfile', 'Complete your profile'),
        component: CompleteProfileStep,
    },
    {
        id: RecommendedNextSteps.TEAM_SETUP,
        title: localizeMessage('next_steps_view.titles.teamSetup', 'Name your team'),
        component: CompleteProfileStep,
    },
    {
        id: RecommendedNextSteps.INVITE_MEMBERS,
        title: localizeMessage('next_steps_view.titles.inviteMembers', 'Invite members to the team'),
        component: CompleteProfileStep,
    },
];

type Props = {
    currentUserId: string;
    preferences: PreferenceType[];
    skuName: string;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<{data: boolean}>;
    };
};

type State = {
    showFinalScreen: boolean;
}

export default class NextStepsView extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showFinalScreen: false,
        };
    }

    getBottomText = () => {
        // TODO: will be stored in user prefs at a later date
        const {isFinished} = {isFinished: false};

        if (isFinished) {
            return (
                <FormattedMessage
                    id='next_steps_view.allSetToGo'
                    defaultMessage={'You\'re all set to go!'}
                />
            );
        }

        return (
            <FormattedMessage
                id='next_steps_view.hereAreSomeNextSteps'
                defaultMessage='Here are some recommended next steps to help you collaborate'
            />
        );
    }

    getLogo = () => {
        // TODO: Switch logos based on edition once we have the other logos

        switch (this.props.skuName) {
        default:
            return professionalLogo;
        }
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

    skipAll = () => {
        this.setState({showFinalScreen: true});
    }

    nextStep = (setExpanded: (expandedKey: string) => void, id: string) => {
        const currentIndex = steps.findIndex((step) => step.id === id);
        if ((currentIndex + 1) > (steps.length - 1)) {
            this.setState({showFinalScreen: true});
        } else {
            setExpanded(steps[currentIndex + 1].id);
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
        // TODO
        return (
            <div/>
        );
    }

    renderMainBody = () => {
        const renderedSteps = steps.map(this.renderStep);

        return (
            <>
                <Accordion defaultExpandedKey={steps[0].id}>
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
                        onClick={this.skipAll}
                    >
                        <FormattedMessage
                            id='next_steps_view.skipGettingStarted'
                            defaultMessage='Skip Getting Started'
                        />
                    </button>
                </div>
            </>
        );
    }

    render() {
        let mainBody = this.renderMainBody();
        if (this.state.showFinalScreen) {
            mainBody = this.renderFinalScreen();
        }

        return (
            <div
                id='app-content'
                className='app__content NextStepsView'
            >
                <div className='NextStepsView__header'>
                    <div className='NextStepsView__header-headerText'>
                        <div className='NextStepsView__header-headerTopText'>
                            <FormattedMessage
                                id='next_steps_view.welcomeToMattermost'
                                defaultMessage='Welcome to Mattermost'
                            />
                        </div>
                        <div className='NextStepsView__header-headerBottomText'>
                            {this.getBottomText()}
                        </div>
                    </div>
                    <div className='NextStepsView__header-logo'>
                        <img src={this.getLogo()}/>
                    </div>
                </div>
                <div className='NextStepsView__body'>
                    <div className='NextStepsView__body-main'>
                        {mainBody}
                    </div>
                    <div className='NextStepsView__body-graphic'/>
                </div>
            </div>
        );
    }
}
