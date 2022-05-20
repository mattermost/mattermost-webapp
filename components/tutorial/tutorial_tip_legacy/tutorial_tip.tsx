// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Overlay} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {trackEvent} from 'actions/telemetry_actions.jsx';

import Constants, {RecommendedNextStepsLegacy} from 'utils/constants';
import PulsatingDot from 'components/widgets/pulsating_dot';

import * as Utils from 'utils/utils';

import TutorialTipBackdrop, {Coords, TutorialTipPunchout} from './tutorial_tip_backdrop';

const Preferences = Constants.Preferences;
const OnBoardingTutorialStep = Constants.TutorialSteps;
const AdminOnBoardingTutorialStep = Constants.AdminTutorialSteps;
const TutorialSteps = {
    [Preferences.TUTORIAL_STEP]: Constants.TutorialSteps,
    [Preferences.CRT_TUTORIAL_STEP]: Constants.CrtTutorialSteps,
    [Preferences.CRT_THREAD_PANE_STEP]: Constants.CrtThreadPaneSteps,
};
const TutorialAutoTourStatus = {
    [Preferences.TUTORIAL_STEP]: Preferences.TUTORIAL_STEP_AUTO_TOUR_STATUS,
    [Preferences.CRT_TUTORIAL_STEP]: Preferences.CRT_TUTORIAL_AUTO_TOUR_STATUS,
};

type Preference = {
    user_id: string;
    category: string;
    name: string;
    value: string;
}

type ValueOf<T> = T[keyof T];
type Props = {
    currentUserId: string;

    // the current tour tip state in redux state
    currentStep: number;

    // the step that an instance of TutorialTip is tied to, e.g.
    step: ValueOf<typeof OnBoardingTutorialStep>;
    singleTip?: boolean;
    showOptOut?: boolean;
    screen: JSX.Element;
    title: JSX.Element;
    placement: string;
    overlayClass: string;
    telemetryTag?: string;
    stopPropagation?: boolean;
    preventDefault?: boolean;
    isAdmin: boolean;

    /*
    extraFunc is a function to run at the end of a tip or on handleSavePreferences
    **/
    extraFunc?: () => void;

    // the text to show on the button of last step of the tutorial
    customLastStepButtonText?: {
        id: string;
        defaultMessage: string;
    };
    tutorialCategory?: string;
    onNextNavigateTo?: () => void;
    onPrevNavigateTo?: () => void;
    actions: {
        closeRhsMenu: () => void;
        savePreferences: (currentUserId: string, preferences: Preference[]) => void;
        setFirstChannelName: (channelName: string) => (dispatch: DispatchFunc) => void;
        setProductMenuSwitcherOpen: (open: boolean) => void;
    };
    autoTour: boolean;
    firstChannelName: string | undefined;
    punchOut?: TutorialTipPunchout | null;
    pulsatingDotPosition?: Coords | undefined;
}

type State = {
    currentScreen: number;
    show: boolean;

    // give auto tour a chance to engage
    hasShown: boolean;
}

const COMPROMISE_WAIT_FOR_TIPS_AND_NEXT_STEPS_TIME = 150;

export default class TutorialTip extends React.PureComponent<Props, State> {
    public targetRef: React.RefObject<HTMLImageElement>;
    private showPendingTimeout?: NodeJS.Timeout;

    public static defaultProps: Partial<Props> = {
        overlayClass: '',
    }

    public constructor(props: Props) {
        super(props);
        this.state = {
            currentScreen: 0,
            show: false,
            hasShown: false,
        };

        this.targetRef = React.createRef();
    }

    private show = (e?: React.MouseEvent): void => {
        this.setState({show: true, hasShown: true});
        if (this.props.preventDefault && e) {
            e.preventDefault();
        }
        if (this.props.stopPropagation && e) {
            e.stopPropagation();
        }
    }

    private hide = (): void => {
        this.setState({show: false});
    }

    private dismiss = (e: React.MouseEvent | React.KeyboardEvent): void => {
        this.hide();
        if (this.props.tutorialCategory) {
            this.handleNext(false);
        }
        const wasEscapeDismissal = e.type === 'keyup';
        const tag = this.props.telemetryTag + '_dismiss';
        if (wasEscapeDismissal) {
            trackEvent('tutorial', tag);
            return;
        }
        const target = e.target as HTMLElement;

        // We defer checking this until here because `.closest` is mildly expensive.
        const wasOutsideClick = (

            // If a user click on an element inside triggers a click outside,
            // then react-bootstrap's onHide fires onHide for both elements.
            // Even if the inside click is for opt out, that is already covered in the _skip event
            !target.closest('.tip-overlay') &&

            // Clicking the post textbox means a prefilled message was chosen, so it is not a dismissal.
            target.id !== 'post_textbox'
        );
        if (wasOutsideClick) {
            trackEvent('tutorial', tag);
        }
    }

    private autoShow(couldAutoShow: boolean) {
        const {autoTour, currentStep, step, firstChannelName} = this.props;
        if (!couldAutoShow) {
            return;
        }
        const isShowable = firstChannelName || (autoTour && !this.state.hasShown && currentStep === step);
        if (isShowable) {
            // POST_POPOVER is the only tip that is not automatically rendered if it is the currentStep.
            // This is because tips and next steps may display.
            // It can further happen that the post popover gets the first chance to display,
            // and then tips and next steps determines it should display.
            // So this is tutorial_tip_legacy's way of being polite to the user and not flashing its tip
            // in the user's face right before showing tips and next steps.
            if (this.props.step === OnBoardingTutorialStep.POST_POPOVER) {
                this.showPendingTimeout = setTimeout(() => {
                    this.show();
                }, COMPROMISE_WAIT_FOR_TIPS_AND_NEXT_STEPS_TIME);
            } else {
                this.show();
            }
        }
    }

    getKeyByValue = (obj: Record<string, number>, value: number) => {
        return Object.keys(obj).find((key) => obj[key] === value);
    }

    handleSavePreferences = (autoTour: boolean, nextStep: boolean | number): void => {
        const {isAdmin, currentUserId, tutorialCategory, actions, singleTip, onNextNavigateTo, onPrevNavigateTo} = this.props;
        const {closeRhsMenu, savePreferences, setFirstChannelName} = actions;

        let stepValue = this.props.currentStep;
        if (nextStep === true) {
            stepValue += 1;

            // if the next tip step/steps are for only admins, skip them for non admins
            for (const tipName of AdminOnBoardingTutorialStep) {
                const keyForNextStepValue = this.getKeyByValue(OnBoardingTutorialStep, stepValue);
                if (!isAdmin && keyForNextStepValue && keyForNextStepValue === tipName) {
                    stepValue += 1;
                } else {
                    break;
                }
            }
        } else if (nextStep === false) {
            stepValue -= 1;

            // if the previous tip step/steps are for only admins, skip them for non admins
            for (const tipName of [...AdminOnBoardingTutorialStep].reverse()) {
                const keyForPrevStepValue = this.getKeyByValue(OnBoardingTutorialStep, stepValue);
                if (!isAdmin && keyForPrevStepValue && keyForPrevStepValue === tipName) {
                    stepValue -= 1;
                } else {
                    break;
                }
            }
        } else {
            stepValue = nextStep;
        }
        const preferences = [
            {
                user_id: currentUserId,
                category: tutorialCategory || Preferences.TUTORIAL_STEP,
                name: currentUserId,
                value: stepValue.toString(),
            },
        ];
        if (!singleTip) {
            preferences.push({
                user_id: currentUserId,
                category: tutorialCategory ? TutorialAutoTourStatus[tutorialCategory] : TutorialAutoTourStatus[Preferences.TUTORIAL_STEP],
                name: currentUserId,
                value: autoTour ? Constants.AutoTourStatus.ENABLED.toString() : Constants.AutoTourStatus.DISABLED.toString(),
            });
        }

        if (!tutorialCategory) {
            closeRhsMenu();
        }
        this.hide();

        savePreferences(currentUserId, preferences);

        // remove the value for the a/b test first_channel_creation so the a/b auto tour can execute correctly
        if (!tutorialCategory && this.props.currentStep === OnBoardingTutorialStep.ADD_FIRST_CHANNEL) {
            const abPreferences = [{
                user_id: currentUserId,
                category: Preferences.AB_TEST_PREFERENCE_VALUE,
                name: RecommendedNextStepsLegacy.CREATE_FIRST_CHANNEL,
                value: '',
            }];

            savePreferences(currentUserId, abPreferences);
            setFirstChannelName('');
        }

        // if the next tip is start trial tip, open the product switcher to show tip
        if (((this.props.currentStep + 1) === OnBoardingTutorialStep.START_TRIAL) && this.props.isAdmin) {
            this.props.actions.setProductMenuSwitcherOpen(true);
        }

        if (this.props.extraFunc) {
            this.props.extraFunc();
        }

        if (onNextNavigateTo && nextStep === true && autoTour) {
            onNextNavigateTo();
        } else if (onPrevNavigateTo && nextStep === false && autoTour) {
            onPrevNavigateTo();
        }
    }

    public handlePrev = (e: React.MouseEvent): void => {
        e.preventDefault();
        this.handleSavePreferences(true, false);
    }

    public handleNext = (auto = true, e?: React.MouseEvent): void => {
        const {tutorialCategory} = this.props;
        e?.preventDefault();
        if (this.props.telemetryTag) {
            const tag = this.props.telemetryTag + '_next';
            trackEvent('tutorial', tag);
        }

        const category = tutorialCategory || Preferences.TUTORIAL_STEP;

        if (tutorialCategory && this.getLastStep(TutorialSteps[category], category) === this.props.currentStep) {
            this.handleSavePreferences(auto, TutorialSteps[tutorialCategory || Preferences.TUTORIAL_STEP].FINISHED);
        } else {
            this.handleSavePreferences(auto, true);
        }
    }

    public skipTutorial = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();

        if (this.props.telemetryTag) {
            const tag = this.props.telemetryTag + '_skip';
            trackEvent('tutorial', tag);
        }

        const {currentUserId, tutorialCategory, actions} = this.props;
        const preferences = [{
            user_id: currentUserId,
            category: tutorialCategory || Preferences.TUTORIAL_STEP,
            name: currentUserId,
            value: OnBoardingTutorialStep.FINISHED.toString(),
        }];

        actions.savePreferences(currentUserId, preferences);
    }

    private getTarget = (): HTMLImageElement | null => {
        return this.targetRef.current;
    }

    private getLastStep(tutorialSteps: Record<string, number>, category: string) {
        const tmpSteps = {...tutorialSteps};

        // temporary fix for filtering tutorial_step category based on role. In this case, START_TRIAL point is
        // only accessible by admins
        if (!this.props.isAdmin && category === Preferences.TUTORIAL_STEP) {
            delete tmpSteps.START_TRIAL;
        }

        return Object.values(tmpSteps).reduce((maxStep, candidateMaxStep) => {
            // ignore the "opt out" FINISHED step as the max step.
            if (candidateMaxStep > maxStep && candidateMaxStep !== tmpSteps.FINISHED) {
                return candidateMaxStep;
            }
            return maxStep;
        }, Number.MIN_SAFE_INTEGER);
    }

    private getButtonText(category: string): JSX.Element {
        let buttonText = (
            <>
                <FormattedMessage
                    id={'tutorial_tip.ok'}
                    defaultMessage={'Next'}
                />
                <i className='icon icon-chevron-right'/>
            </>
        );
        if (this.props.singleTip) {
            buttonText = (
                <FormattedMessage
                    id={'tutorial_tip.got_it'}
                    defaultMessage={'Got it'}
                />
            );
            return buttonText;
        }

        const lastStep = this.getLastStep(TutorialSteps[category], category);
        if (this.props.step === lastStep) {
            if (this.props.customLastStepButtonText) {
                buttonText = (
                    <FormattedMessage
                        id={this.props.customLastStepButtonText.id}
                        defaultMessage={this.props.customLastStepButtonText.defaultMessage}
                    />
                );
            } else {
                buttonText = (
                    <FormattedMessage
                        id={'tutorial_tip.finish_tour'}
                        defaultMessage={'Finish tour'}
                    />
                );
            }
        }

        return buttonText;
    }

    public componentDidMount() {
        this.autoShow(true);
        document.addEventListener('keydown', this.handleKeyDown);
    }

    public componentDidUpdate(prevProps: Props) {
        const currentStepChanged = prevProps.currentStep !== this.props.currentStep;
        const autoTourChanged = prevProps.autoTour !== this.props.autoTour;
        this.autoShow(currentStepChanged || autoTourChanged);
    }

    public componentWillUnmount() {
        if (this.showPendingTimeout) {
            clearTimeout(this.showPendingTimeout);
        }
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (e: KeyboardEvent): void => {
        if (Utils.isKeyPressed(e, Constants.KeyCodes.ENTER) && this.state.show) {
            this.handleNext();
        }
    }

    public render(): JSX.Element {
        const dots = [];
        const tourSteps = this.props.tutorialCategory ? TutorialSteps[this.props.tutorialCategory] : null;
        if (!this.props.singleTip && tourSteps) {
            for (let i = 0; i < (Object.values(tourSteps).length - 1); i++) {
                let className = 'tutorial-tip__circle';
                let circularRing = 'tutorial-tip__circular-ring';

                if (i === this.props.currentStep) {
                    className += ' active';
                    circularRing += ' tutorial-tip__circular-ring-active';
                }

                dots.push(
                    <div className={circularRing}>
                        <a
                            href='#'
                            key={'dotactive' + i}
                            className={className}
                            data-screen={i}
                            onClick={() => this.handleSavePreferences(true, i)}
                        />
                    </div>,
                );
            }
        }

        return (
            <div
                id='tipButton'
                className={'tip-div ' + this.props.overlayClass}
                onClick={this.show}
            >
                <PulsatingDot
                    onClick={this.show}
                    targetRef={this.targetRef}
                    coords={this.props.pulsatingDotPosition}
                />

                <Overlay
                    show={this.state.show}
                >
                    <TutorialTipBackdrop
                        x={this.props.punchOut?.x}
                        y={this.props.punchOut?.y}
                        width={this.props.punchOut?.width}
                        height={this.props.punchOut?.height}
                    />
                </Overlay>

                <Overlay
                    placement={this.props.placement}
                    show={this.state.show}
                    rootClose={true}
                    onHide={this.dismiss}
                    target={this.getTarget}
                >
                    <div
                        className={'tip-overlay ' + this.props.overlayClass}
                        data-testid={'current_tutorial_tip'}
                    >
                        <div className='arrow'/>
                        <div className='tutorial-tip__header'>
                            <h4 className='tutorial-tip__header__title'>
                                {this.props.title}
                            </h4>
                            <button
                                className='tutorial-tip__header__close'
                                onClick={this.dismiss}
                                data-testid={'close_tutorial_tip'}
                            >
                                <i className='icon icon-close'/>
                            </button>
                        </div>
                        <div className='tutorial-tip__body'>
                            {this.props.screen}
                        </div>
                        <div className='tutorial-tip__footer'>
                            <div className='tutorial-tip__footer-buttons'>
                                <div className='tutorial-tip__circles-ctr'>{dots}</div>
                                <div className={'tutorial-tip__btn-ctr'}>
                                    {this.props.tutorialCategory && (this.props.currentStep !== 0) &&
                                    <button
                                        id='tipPreviousButton'
                                        className='tutorial-tip__btn tutorial-tip__cancel-btn'
                                        onClick={(e) => this.handlePrev(e)}
                                    >
                                        <i className='icon icon-chevron-left'/>
                                        <FormattedMessage
                                            id='generic.previous'
                                            defaultMessage='Previous'
                                        />
                                    </button>}
                                    <button
                                        id='tipNextButton'
                                        className='tutorial-tip__btn tutorial-tip__confirm-btn'
                                        onClick={(e) => this.handleNext(true, e)}
                                    >
                                        {this.getButtonText(this.props.tutorialCategory || Preferences.TUTORIAL_STEP)}
                                    </button>
                                </div>
                            </div>
                            {this.props.showOptOut && <div className='tutorial-tip__opt'>
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
                            </div>}
                        </div>
                    </div>
                </Overlay>
            </div>
        );
    }
}
