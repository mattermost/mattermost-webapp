// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback} from 'react';
import {RouteComponentProps} from 'react-router';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage, useIntl} from 'react-intl';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';

import QuickInput from 'components/quick_input';

import './fullscreen_wizard.scss';

import BoardsSVG from './boards.svg';
import PlaybooksSVG from './playbooks.svg';
import ChannelsSVG from './channels.svg';

import GithubSVG from './github.svg';
import GitlabSVG from './gitlab.svg';
import JiraSVG from './jira.svg';
import ZoomSVG from './zoom.svg';
import TodoSVG from './todo.svg';

import ChannelsPreviewSVG from './channels-preview.svg';
import LaptopSVG from './laptop.svg';

import PersonWaveSVG from './person-wave.svg';
import PersonSmileSVG from './person-smile.svg';
import PersonElbowSVG from './person-elbow.svg';

const WizardSteps = {
    UseCase: 'UseCase',
    Plugins: 'Plugins',
    Channel: 'Channel',
    InviteMembers: 'InviteMembers',
    TransitioningOut: 'TransitioningOut',
} as const;

type WizardStep = typeof WizardSteps[keyof typeof WizardSteps];

const Animations = {
    PAGE_SLIDE: 300,
    Reasons: {
        EnterFromBefore: 'EnterFromBefore',
        EnterFromAfter: 'EnterFromAfter',
        ExitToBefore: 'ExitToBefore',
        ExitToAfter: 'ExitToAfter',
    } as const,
};

type AnimationReason = typeof Animations['Reasons'][keyof typeof Animations['Reasons']];

const UseCases = {
    Boards: 'Boards',
    Channels: 'Channels',
    Playbooks: 'Playbooks',
} as const;

// enter from before
// enter from after
// exit to before
// exit to after
//
type UseCase = typeof UseCases [keyof typeof UseCases];

type Form = {
    useCase: {
        boards: boolean;
        playbooks: boolean;
        channels: boolean;
    };
    plugins: {
        github: boolean;
        gitlab: boolean;
        jira: boolean;
        zoom: boolean;
        todo: boolean;

        // set if user clicks skip for now
        skipped: boolean;
    };
    channel: {
        name: string;
        skipped: boolean;
    };
    teamMembers: {
        invites: string[];
        skipped: boolean;
    };
}
const emptyForm = deepFreeze({
    useCase: {
        boards: false,
        playbooks: false,
        channels: false,
    },
    plugins: {
        github: false,
        gitlab: false,
        jira: false,
        zoom: false,
        todo: false,

        // set if user clicks skip for now
        skipped: false,
    },
    channel: {
        name: '',
        skipped: false,
    },
    teamMembers: {
        invites: [],
        skipped: false,
    },
});

type Props = {
    handleForm(form: Form): void;
    background?: JSX.Element | string;

    // can specify number of steps
}

type TransitionProps = {
    direction: AnimationReason;
    next?: () => void;
    skip?: () => void;
    previous?: JSX.Element;
    show: boolean;
}

type UseCaseProps = TransitionProps & {
    options: Form['useCase'];
    setOption: (options: keyof Form['useCase']) => void;
}

const UseCase = (props: UseCaseProps) => {
    const className = (() => {
        switch (props.direction) {
        case Animations.Reasons.ExitToBefore:
            return 'UseCase--exit-to-before';
        case Animations.Reasons.ExitToAfter:
            return 'UseCase--exit-to-after';
        case Animations.Reasons.EnterFromAfter:
            return 'UseCase--enter-from-after';
        case Animations.Reasons.EnterFromBefore:
            return 'UseCase--enter-from-before';
        default:
            return 'UseCase--enter-from-before';
        }
    })();
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={className}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className='UseCase-body'>
                <div className='UseCase-left-col'>
                    <PageLine
                        height={'100px'}
                        noLeft={true}
                    />
                    <LaptopSVG/>
                    <PageLine
                        height={'calc(100vh - 250px)'}
                        noLeft={true}
                    />
                </div>
                <div className='UseCase-form-wrapper'>
                    <FormattedMessage
                        id={'onboarding_wizard.use_case.title'}
                        defaultMessage='How do you plan to use Mattermost?'
                    />
                    <FormattedMessage
                        id={'onboarding_wizard.use_case.description'}
                        defaultMessage="This will help us set up your workspace in a way that's most relevant to you. Select all that apply."
                    />
                    <ul>
                        <WizardRadioButton
                            onClick={() => props.setOption('channels')}
                            icon={<ChannelsSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.use_case.channels'}
                                    defaultMessage='Team communication and collaboration'
                                />
                            }
                            checked={props.options.channels}
                        />
                        <WizardRadioButton
                            onClick={() => props.setOption('boards')}
                            icon={<BoardsSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.use_case.boards'}
                                    defaultMessage='Project planning and management'
                                />
                            }
                            checked={props.options.boards}
                        />
                        <WizardRadioButton
                            onClick={() => props.setOption('playbooks')}
                            icon={<PlaybooksSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.use_case.playbooks'}
                                    defaultMessage='Processes, workflows, and automation'
                                />
                            }
                            checked={props.options.playbooks}
                        />
                    </ul>
                    <button
                        className='btn btn-primary'
                        onClick={props.next}
                    >
                        <FormattedMessage
                            id={'onboarding_wizard.next'}
                            defaultMessage='Continue'
                        />
                    </button>
                </div>
            </div>
        </CSSTransition>
    );
};

type WizardRadioButtonProps = {
    onClick: () => void;
    icon: JSX.Element;
    msg: JSX.Element;
    checked: boolean;
    tooltip?: string;
}
const WizardRadioButton = (props: WizardRadioButtonProps) => {
    const buttonProps: {
        className: string;
        onClick: () => void;
        tooltip?: string;
    } = {
        className: 'wizard-radio-button',
        onClick: props.onClick,
    };
    if (props.tooltip) {
        buttonProps.tooltip = props.tooltip;
    }
    return (
        <li
            {...buttonProps}
        >
            {props.icon}
            {props.msg}
            {props.checked && 'checked'}
        </li>
    );
};

type PageLineProps = {
    height?: string;
    noLeft?: boolean;
}
const PageLine = (props: PageLineProps) => {
    let className = 'PageLine';
    if (props.noLeft) {
        className += ' PageLine--no-left';
    }
    return (
        <div
            className={className}
            style={{height: props.height}}
        />
    );
};

type PluginsProps = TransitionProps & {
    options: Form['plugins'];
    setOption: (option: keyof Form['plugins']) => void;
}
const Plugins = (props: PluginsProps) => {
    const className = (() => {
        switch (props.direction) {
        case Animations.Reasons.ExitToBefore:
            return 'Plugins--exit-to-before';
        case Animations.Reasons.ExitToAfter:
            return 'Plugins--exit-to-after';
        case Animations.Reasons.EnterFromAfter:
            return 'Plugins--enter-from-after';
        case Animations.Reasons.EnterFromBefore:
            return 'Plugins--enter-from-before';
        default:
            return 'Plugins--enter-from-before';
        }
    })();
    const {formatMessage} = useIntl();
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={className}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className='Plugins-body'>
                <PageLine height={'100px'}/>
                {props.previous}
                {
                    <ul>
                        <WizardRadioButton
                            onClick={() => props.setOption('github')}
                            icon={<GithubSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.plugins.github'}
                                    defaultMessage='Github'
                                />
                            }
                            checked={props.options.github}
                            tooltip={formatMessage({
                                id: 'onboarding_wizard.plugins.github.tooltip',
                                defaultMessage: 'Subscribe to repositories, stay up to date with reviews, assignments',
                            })}
                        />
                        <WizardRadioButton
                            onClick={() => props.setOption('gitlab')}
                            icon={<GitlabSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.plugins.gitlab'}
                                    defaultMessage='Gitlab'
                                />
                            }
                            checked={props.options.gitlab}
                            tooltip={formatMessage({
                                id: 'onboarding_wizard.plugins.gitlab.tooltip',
                                defaultMessage: 'Gitlab tooltip',
                            })}
                        />
                        <WizardRadioButton
                            onClick={() => props.setOption('jira')}
                            icon={<JiraSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.plugins.jira'}
                                    defaultMessage='Jira'
                                />
                            }
                            checked={props.options.jira}
                            tooltip={formatMessage({
                                id: 'onboarding_wizard.plugins.jira.tooltip',
                                defaultMessage: 'Jira tooltip',
                            })}
                        />
                        <WizardRadioButton
                            onClick={() => props.setOption('zoom')}
                            icon={<ZoomSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.plugins.zoom'}
                                    defaultMessage='Zoom'
                                />
                            }
                            checked={props.options.zoom}
                            tooltip={formatMessage({
                                id: 'onboarding_wizard.plugins.zoom.tooltip',
                                defaultMessage: 'Zoom tooltip',
                            })}
                        />
                        <WizardRadioButton
                            onClick={() => props.setOption('todo')}
                            icon={<TodoSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.plugins.todo'}
                                    defaultMessage='To do'
                                />
                            }
                            checked={props.options.todo}
                            tooltip={formatMessage({
                                id: 'onboarding_wizard.plugins.todo.tooltip',
                                defaultMessage: 'To do tooltip',
                            })}
                        />
                    </ul>
                }
                <button
                    className='btn btn-primary'
                    onClick={props.next}
                >
                    <FormattedMessage
                        id={'onboarding_wizard.next'}
                        defaultMessage='Continue'
                    />
                </button>
                <button
                    className='tertiary-button'
                    onClick={props.skip}
                >
                    <FormattedMessage
                        id={'onboarding_wizard.skip'}
                        defaultMessage='Skip for now'
                    />
                </button>
                <PageLine height={'calc(100vh - 100px - 400px'}/>
            </div>
        </CSSTransition>
    );
};

type ChannelProps = TransitionProps & {
    name: string;
    onChange: (newValue: string) => void;
}
const Channel = (props: ChannelProps) => {
    const className = (() => {
        switch (props.direction) {
        case Animations.Reasons.ExitToBefore:
            return 'Channel--exit-to-before';
        case Animations.Reasons.ExitToAfter:
            return 'Channel--exit-to-after';
        case Animations.Reasons.EnterFromAfter:
            return 'Channel--enter-from-after';
        case Animations.Reasons.EnterFromBefore:
            return 'Channel--enter-from-before';
        default:
            return 'Channel--enter-from-before';
        }
    })();

    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={className}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className='Channel-body'>
                <PageLine height={'100px'}/>
                {props.previous}
                <FormattedMessage
                    id={'onboarding_wizard.channel.title'}
                    defaultMessage="Let's create your first channel"
                />
                <FormattedMessage
                    id={'onboarding_wizard.channel.description'}
                    defaultMessage='Channels are where you can communicate with your team about a topic or project. What are you working on right now?'
                />
                <button
                    className='btn btn-primary'
                    onClick={props.next}
                >
                    <FormattedMessage
                        id={'onboarding_wizard.next'}
                        defaultMessage='Continue'
                    />
                </button>
                <button
                    className='tertiary-button'
                    onClick={props.skip}
                >
                    <FormattedMessage
                        id={'onboarding_wizard.skip'}
                        defaultMessage='Skip for now'
                    />
                </button>
                <QuickInput
                    value={props.name}
                    onChange={(e) => props.onChange(e.target.value)}
                    autoFocus={true}
                />
                <PageLine height={'calc(100vh - 100px - 400px'}/>
            </div>
        </CSSTransition>
    );
};

type ChannelsPreviewProps = {
    channelName: string;
    teamName: string;
    show: boolean;
    step: WizardStep;
    direction: AnimationReason;
}
const ChannelsPreview = (props: ChannelsPreviewProps) => {
    // TODO: Need to edit The SVG some so that the text appears in the SVG
    const className = (() => {
        switch (props.direction) {
        case Animations.Reasons.ExitToBefore:
            return 'ChannelsPreview--exit-to-before';
        case Animations.Reasons.ExitToAfter:
            return 'ChannelsPreview--exit-to-after';
        case Animations.Reasons.EnterFromAfter:
            return 'ChannelsPreview--enter-from-after';
        case Animations.Reasons.EnterFromBefore:
            return 'ChannelsPreview--enter-from-before';
        default:
            return 'ChannelsPreview--enter-from-before';
        }
    })();

    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={className}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className='ChannelsPreview-body'>
                {props.channelName}
                {props.teamName}
                <ChannelsPreviewSVG/>
                <TeamMembers
                    show={props.step === WizardSteps.InviteMembers}
                    direction={(() => {
                        if (props.step === WizardSteps.Channel) {
                            return Animations.Reasons.ExitToBefore;
                        } else if (props.step === WizardSteps.InviteMembers) {
                            return Animations.Reasons.EnterFromBefore;
                        }
                        return Animations.Reasons.EnterFromBefore;
                    })()}
                />
            </div>
        </CSSTransition>
    );
};

type InviteMembersProps = TransitionProps & {
}
const InviteMembers = (props: InviteMembersProps) => {
    const className = (() => {
        switch (props.direction) {
        case Animations.Reasons.ExitToBefore:
            return 'InviteMembers--exit-to-before';
        case Animations.Reasons.ExitToAfter:
            return 'InviteMembers--exit-to-after';
        case Animations.Reasons.EnterFromAfter:
            return 'InviteMembers--enter-from-after';
        case Animations.Reasons.EnterFromBefore:
            return 'InviteMembers--enter-from-before';
        default:
            return 'InviteMembers--enter-from-before';
        }
    })();

    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={className}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className='InviteMembers-body'>
                <PageLine height={'100px'}/>
                {props.previous}

                <FormattedMessage
                    id={'onboarding_wizard.invite_members.title'}
                    defaultMessage='Invite your team members'
                />
                <FormattedMessage
                    id={'onboarding_wizard.invite_members.description'}
                    defaultMessage='Collaboration is tough by yourself. Invite a few team members. Separate each email address with a space or comma.'
                />
                <button
                    className='btn btn-primary'
                    onClick={props.next}
                >
                    <FormattedMessage
                        id={'onboarding_wizard.invite_members.next'}
                        defaultMessage='Send invites'
                    />
                </button>
                <button
                    className='tertiary-button'
                    onClick={props.skip}
                >
                    <FormattedMessage
                        id={'onboarding_wizard.invite_members.skip'}
                        defaultMessage="I'll do this later"
                    />
                </button>
                {/*TODO: <UsersEmailsInput> or something like it here*/}
                <PageLine height={'calc(100vh - 100px - 400px'}/>
            </div>
        </CSSTransition>
    );
};

type TeamMembersProps = {
    direction: AnimationReason;
    show: boolean;
}

const TeamMembers = (props: TeamMembersProps) => {
    const className = (() => {
        switch (props.direction) {
        case Animations.Reasons.ExitToBefore:
            return 'TeamMembers--exit-to-before';
        case Animations.Reasons.ExitToAfter:
            return 'TeamMembers--exit-to-after';
        case Animations.Reasons.EnterFromAfter:
            return 'TeamMembers--enter-from-after';
        case Animations.Reasons.EnterFromBefore:
            return 'TeamMembers--enter-from-before';
        default:
            return 'TeamMembers--enter-from-before';
        }
    })();

    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={className}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className='TeamMembers-body'>
                <PersonWaveSVG className={'wave'}/>
                <PersonSmileSVG className={'smile'}/>
                <PersonElbowSVG className={'elbow'}/>
            </div>
        </CSSTransition>
    );
};

const stepOrder = [
    WizardSteps.UseCase,
    WizardSteps.Plugins,
    WizardSteps.Channel,
    WizardSteps.InviteMembers,
    WizardSteps.TransitioningOut,
];

type StepDotsProps = {
    step: WizardStep;
}

const Progress = (props: StepDotsProps) => {
    // exclude transitioning out as a progress step
    const numSteps = stepOrder.length - 1;
    if (numSteps < 2) {
        return null;
    }

    const dots = stepOrder.filter((step) => step !== WizardSteps.TransitioningOut).map((step) => {
        let className = 'circle';
        if (props.step === step) {
            className += ' active';
        }

        return (
            <div
                key={step}
                className={className}
            />
        );
    });

    return (<div className='FullscreenWizard__progress'>
        <div className='tutorial__circles'>{dots}</div>
    </div>);
};
export default function FullscreenWizard(props: Props & RouteComponentProps) {
    // TODO: figure out why CSSTransition isn't working for this top level route.
    const shouldShowSetup = props.location.pathname.includes('/setup');
    const [currentStep, setCurrentStep] = useState<WizardStep>(WizardSteps.UseCase);

    const [mostRecentStep, setMostRecentStep] = useState<WizardStep>(WizardSteps.UseCase);
    const [form, setForm] = useState(emptyForm);
    const makeNext = useCallback((currentStep: WizardStep) => {
        return function innerMakeNext() {
            const stepIndex = stepOrder.indexOf(currentStep);
            if (stepIndex === -1 || stepIndex >= stepOrder.length) {
                return;
            }
            setCurrentStep(stepOrder[stepIndex + 1]);

            setMostRecentStep(currentStep);
        };
    }, []);

    const getTransitionDirection = (step: WizardStep): AnimationReason => {
        const stepIndex = stepOrder.indexOf(step);
        const currentStepIndex = stepOrder.indexOf(currentStep);
        const mostRecentStepIndex = stepOrder.indexOf(mostRecentStep);
        if (stepIndex === -1 || currentStepIndex === -1 || mostRecentStepIndex === -1) {
            return Animations.Reasons.EnterFromBefore;
        }
        if (currentStep === step) {
            return currentStepIndex > mostRecentStepIndex ? Animations.Reasons.EnterFromBefore : Animations.Reasons.EnterFromAfter;
        }
        return stepIndex > mostRecentStepIndex ? Animations.Reasons.ExitToBefore : Animations.Reasons.ExitToAfter;
    };

    const getTransitionDirectionMultiStep = (steps: WizardStep[]): AnimationReason => {
        if (steps.length === 0) {
            return Animations.Reasons.EnterFromBefore;
        }
        const stepIndexes = steps.map((step) => stepOrder.indexOf(step));
        stepIndexes.sort();
        const [stepIndexesMin, stepIndexesMax] = [stepIndexes[0], stepIndexes.length - 1];
        const currentStepIndex = stepOrder.indexOf(currentStep);
        const mostRecentStepIndex = stepOrder.indexOf(mostRecentStep);
        if (steps.length === 0 || stepIndexes.some((step) => step === -1) || currentStepIndex === -1 || mostRecentStepIndex === -1) {
            return Animations.Reasons.EnterFromBefore;
        }
        if (currentStepIndex >= stepIndexesMin && currentStepIndex <= stepIndexesMax) {
            return currentStepIndex > mostRecentStepIndex ? Animations.Reasons.EnterFromBefore : Animations.Reasons.EnterFromAfter;
        }
        return stepIndexesMax > mostRecentStepIndex ? Animations.Reasons.ExitToBefore : Animations.Reasons.ExitToAfter;
    };
    const goPrevious = useCallback(() => {
        const stepIndex = stepOrder.indexOf(currentStep);
        if (stepIndex <= 0) {
            return;
        }
        setCurrentStep(stepOrder[stepIndex - 1]);
    }, [currentStep]);
    const skipPlugins = useCallback((skipped: boolean) => {
        if (skipped === form.plugins.skipped) {
            return;
        }
        setForm({
            ...form,
            plugins: {
                ...form.plugins,
                skipped,
            },
        });
    }, [form]);
    const skipChannel = useCallback((skipped: boolean) => {
        if (skipped === form.channel.skipped) {
            return;
        }
        setForm({
            ...form,
            channel: {
                ...form.channel,
                skipped,
            },
        });
    }, [form]);
    const skipTeamMembers = useCallback((skipped: boolean) => {
        if (skipped === form.teamMembers.skipped) {
            return;
        }
        setForm({
            ...form,
            teamMembers: {
                ...form.teamMembers,
                skipped,
            },
        });
    }, [form]);

    const previous = (<div onClick={goPrevious}>
        {'^ '}
        <FormattedMessage
            id={'onboarding_wizard.previous'}
            defaultMessage='Previous'
        />
    </div>);
    return (
        <CSSTransition
            classNames='FullscreenWizard'
            in={shouldShowSetup}
            enter={true}
            exit={true}
            mountOnEnter={true}
            unmountOnExit={true}
            timeout={{
                appear: 200,
                enter: 200,
                exit: 5000,
            }}
        >
            <div className='fullscreen-wizard-container'>
                {props.background}
                <div className='FullscreenWizard__logo'>
                    {'mattermost logo'}
                </div>
                <Progress step={currentStep}/>
                <div className='fullscreen-page-container'>
                    {
                        <UseCase
                            options={form.useCase}
                            setOption={(option: keyof Form['useCase']) => {
                                setForm({
                                    ...form,
                                    useCase: {
                                        ...form.useCase,
                                        [option]: !form.useCase[option],
                                    },
                                });
                            }}
                            show={currentStep === WizardSteps.UseCase}
                            next={makeNext(WizardSteps.UseCase)}
                            direction={getTransitionDirection(WizardSteps.UseCase)}
                        />
                    }
                    {
                        <Plugins
                            next={() => {
                                makeNext(WizardSteps.Plugins)();
                                skipPlugins(false);
                            }}
                            skip={() => {
                                makeNext(WizardSteps.Plugins)();
                                skipPlugins(true);
                            }}
                            options={form.plugins}
                            setOption={(option: keyof Form['plugins']) => {
                                setForm({
                                    ...form,
                                    plugins: {
                                        ...form.plugins,
                                        [option]: !form.plugins[option],
                                    },
                                });
                            }}
                            previous={previous}
                            show={currentStep === WizardSteps.Plugins}
                            direction={getTransitionDirection(WizardSteps.Plugins)}
                        />
                    }
                    {
                        <Channel
                            next={() => {
                                makeNext(WizardSteps.Channel)();
                                skipChannel(false);
                            }}
                            skip={() => {
                                makeNext(WizardSteps.Channel)();
                                skipChannel(true);
                            }}
                            previous={previous}
                            show={currentStep === WizardSteps.Channel}
                            direction={getTransitionDirection(WizardSteps.Channel)}
                            name={form.channel.name}
                            onChange={(newValue: string) => setForm({
                                ...form,
                                channel: {
                                    ...form.channel,
                                    name: newValue,
                                },
                            })}
                        />
                    }
                    {
                        <InviteMembers
                            next={() => {
                                // sendEmails and await response, then show the success button, then do the next transition
                                makeNext(WizardSteps.InviteMembers)();
                                skipTeamMembers(false);
                            }}
                            skip={() => {
                                makeNext(WizardSteps.InviteMembers)();
                                skipTeamMembers(true);
                            }}
                            previous={previous}
                            show={currentStep === WizardSteps.InviteMembers}
                            direction={getTransitionDirection(WizardSteps.InviteMembers)}
                        />
                    }
                    {
                        <ChannelsPreview
                            show={currentStep === WizardSteps.Channel || currentStep === WizardSteps.InviteMembers}
                            step={currentStep}
                            direction={getTransitionDirectionMultiStep([WizardSteps.Channel, WizardSteps.InviteMembers])}
                            channelName={form.channel.name}
                            teamName={'form.teamName'}
                        />
                    }
                </div>
            </div>
        </CSSTransition>
    );
}
