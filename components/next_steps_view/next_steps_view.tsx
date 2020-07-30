// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import {PreferenceType} from 'mattermost-redux/types/preferences';
import {UserProfile} from 'mattermost-redux/types/users';

import Accordion from 'components/accordion';
import Card from 'components/card/card';
import professionalLogo from 'images/cloud-logos/professional.svg';
import {Preferences} from 'utils/constants';

import {Steps, StepType} from './steps';
import './next_steps_view.scss';

type Props = {
    currentUser: UserProfile;
    preferences: PreferenceType[];
    skuName: string;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        setShowNextStepsView: (show: boolean) => void;
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
                defaultMessage='Here are some recommended next steps to help you get started'
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
            this.props.actions.savePreferences(this.props.currentUser.id, [{
                category: Preferences.RECOMMENDED_NEXT_STEPS,
                user_id: this.props.currentUser.id,
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
        const currentIndex = Steps.findIndex((step) => step.id === id);
        if ((currentIndex + 1) > (Steps.length - 1)) {
            this.setState({showFinalScreen: true});
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

    renderFinalScreen = () => {
        // TODO
        return (
            <div>
                {'Placeholder for Final Screen'}
            </div>
        );
    }

    renderMainBody = () => {
        const renderedSteps = Steps.map(this.renderStep);

        return (
            <>
                <header className='NextStepsView__header'>
                    <div className='NextStepsView__header-headerText'>
                        <h1 className='NextStepsView__header-headerTopText'>
                            <FormattedMessage
                                id='next_steps_view.welcomeToMattermost'
                                defaultMessage='Welcome to Mattermost'
                            />
                        </h1>
                        <h2 className='NextStepsView__header-headerBottomText'>
                            {this.getBottomText()}
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
                                onClick={this.skipAll}
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
            </>
        );
    }

    render() {
        let mainBody = this.renderMainBody();
        if (this.state.showFinalScreen) {
            mainBody = this.renderFinalScreen();
        }

        return (
            <section
                id='app-content'
                className='app__content NextStepsView'
            >
                {mainBody}
            </section>
        );
    }
}
