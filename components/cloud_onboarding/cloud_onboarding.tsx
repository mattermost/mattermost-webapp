// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import {UserProfile} from 'mattermost-redux/types/users';

import {getAnalyticsCategory} from 'components/cloud_onboarding/step_helpers';
import {pageVisited, trackEvent} from 'actions/diagnostics_actions';

import loadingIcon from 'images/spinner-48x48-blue.apng';

import OnboardingSuccessSvg from './images/onboarding-success-svg';

import NextStepsTips from './next_steps_tips/next_steps_tips';

import NextStepsView from './next_steps_view/next_steps_view';

import {StepType} from './steps';

import './next_steps_view.scss';

const TRANSITION_SCREEN_TIMEOUT = 3000;

type Props = {
    currentUser: UserProfile;
    preferences: PreferenceType[];
    isFirstAdmin: boolean;
    steps: StepType[];
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        setShowNextStepsView: (show: boolean) => void;
        getProfiles: () => void;
    };
};

type State = {
    showNothing: boolean,
    showFinalScreen: boolean;
    showTransitionScreen: boolean;
    animating: boolean;
}

export default class CloudOnboarding extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showNothing: true,
            showFinalScreen: false,
            showTransitionScreen: false,
            animating: false,
        };
    }

    async componentDidMount() {
        console.log(this.props);
        console.log(this.getIncompleteStep());
        if (this.getIncompleteStep() === null) {
            this.setState({showNothing: false, nextTips: true});
        } else {
            this.setState({showNothing: false, nextTips: false});
        }
    }

    getIncompleteStep = () => {
        for (let i = 0; i < this.props.steps.length; i++) {
            if (!this.isStepComplete(this.props.steps[i].id)) {
                return this.props.steps[i].id;
            }
        }
        return null;
    };

    onFinishNextSteps = () => {
        // this.setState({nextTips: true, showNothing: false});
        this.showFinalScreen();
    };

    isStepComplete = (id: string) => {
        return this.props.preferences.some(
            (pref) => pref.name === id && pref.value === 'true',
        );
    };

    getStartingStep = () => {
        for (let i = 0; i < this.props.steps.length; i++) {
            if (!this.isStepComplete(this.props.steps[i].id)) {
                return this.props.steps[i].id;
            }
        }
        return this.props.steps[0].id;
    };

    stopAnimating = () => {
        this.setState({animating: false});
    };

    showFinalScreen = () => {
        trackEvent(
            getAnalyticsCategory(this.props.isFirstAdmin),
            'click_skip_getting_started',
            {channel_sidebar: false},
        );
        pageVisited(
            getAnalyticsCategory(this.props.isFirstAdmin),
            'pageview_tips_next_steps',
        );
        this.setState({
            showFinalScreen: true,
            animating: true,
            nextTips: true,
            showNothing: false,
        });
    };

    transitionToFinalScreen = () => {
        this.setState({
            showTransitionScreen: true,
            animating: true,
        });
    };

    setTimerToFinalScreen = () => {
        console.log('Transition end');
        if (this.state.showTransitionScreen) {
            setTimeout(() => {
                pageVisited(
                    getAnalyticsCategory(this.props.isFirstAdmin),
                    'pageview_tips_next_steps',
                );
                this.setState({showFinalScreen: true});
            }, TRANSITION_SCREEN_TIMEOUT);
        }
    };

    renderTransitionScreen = () => {
        return (
            <div
                className={classNames(
                    'NextStepsView__viewWrapper NextStepsView__transitionView',
                    {
                        transitioning: this.state.showTransitionScreen,
                        completed:
                             this.state.showTransitionScreen &&
                             this.state.showFinalScreen,
                        animating: this.state.animating,
                    },
                )}
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
    };

    render() {
        console.log(this.state);
        return (
            <section
                id='app-content'
                className='app__content NextStepsView'
            >
                {!this.state.showNothing && (
                    <>
                        <NextStepsView
                            {...this.props}
                            animating={this.state.animating}
                            show={this.state.showFinalScreen || this.state.showTransitionScreen}
                            getStartingStep={this.getStartingStep}
                            onFinish={this.onFinishNextSteps}
                        />
                        {this.renderTransitionScreen()}
                        <NextStepsTips
                            {...this.props}
                            animating={this.state.animating}
                            showFinalScreen={this.state.showFinalScreen}
                            stopAnimating={this.stopAnimating}
                        />
                    </>
                )}
            </section>
        );
    }
}
