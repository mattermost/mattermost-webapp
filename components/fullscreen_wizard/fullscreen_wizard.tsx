// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback} from 'react';
import {RouteComponentProps} from 'react-router';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage, useIntl} from 'react-intl';

import './fullscreen_wizard.scss';
import deepFreeze from 'mattermost-redux/utils/deep_freeze';

import BoardsSVG from './boards.svg';
import PlaybooksSVG from './playbooks.svg';
import ChannelsSVG from './channels.svg';

import GithubSVG from './github.svg';
import GitlabSVG from './gitlab.svg';
import JiraSVG from './jira.svg';
import ZoomSVG from './zoom.svg';
import TodoSVG from './todo.svg';

import LaptopSVG from './laptop.svg';

const WizardSteps = {
    UseCase: 'UseCase',
    Plugins: 'Plugins',
    Channel: 'Channel',
    InviteMembers: 'InviteMembers',
    TransitioningOut: 'TransitioningOut',
} as const;

type WizardStep = typeof WizardSteps[keyof typeof WizardSteps];

const Animations = {
    PAGE_SLIDE: 4000,
};

const UseCases = {
    Boards: 'Boards',
    Channels: 'Channels',
    Playbooks: 'Playbooks',
} as const;
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
    channel: string;
    teamMembers: string[];
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
    channel: '',
    teamMembers: [],
});

type Props = {
    handleForm(form: Form): void;
    background?: JSX.Element | string;

    // can specify number of steps
}

type TransitionProps = {
    direction: 'backward' | 'current' | 'forward' ;
    show: boolean;
}

type UseCaseProps = TransitionProps & {
    options: Form['useCase'];
    setOption: (options: keyof Form['useCase']) => void;
    next: () => void;
}

const UseCase = (props: UseCaseProps) => {
    const className = (() => {
        if (props.direction === 'backward') {
            return 'UseCase--backward';
        } else if (props.direction === 'forward') {
            return 'UseCase--forward';
        }
        return 'UseCase';
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
    previous: JSX.Element;
    options: Form['plugins'];
    setOption: (option: keyof Form['plugins']) => void;
    next: () => void;
    skip: () => void;
}
const Plugins = (props: PluginsProps) => {
    const className = (() => {
        if (props.direction === 'backward') {
            return 'Plugins--backward';
        } else if (props.direction === 'forward') {
            return 'Plugins--forward';
        }
        return 'Plugins';
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
                <button className='btn btn-primary'>
                    <FormattedMessage
                        id={'onboarding_wizard.next'}
                        defaultMessage='Continue'
                    />
                </button>
                <button className='tertiary-button'>
                    <FormattedMessage
                        id={'onboarding_wizard.skip'}
                        defaultMessage='Skip for now'
                    />
                </button>
                {'line'}
            </div>
        </CSSTransition>
    );
};

const Channel = () => {
    return (<div>
        {'channel'}
    </div>);
};

const TeamMember = () => {
    return (<div>
        {'team member'}
    </div>);
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
    const [wizardStep, setWizardStep] = useState<WizardStep>(WizardSteps.UseCase);

    // const [_priorWizardStep, setPriorWizardStep] = useState<WizardStep>(WizardSteps.UseCase);
    const [form, setForm] = useState(emptyForm);
    const makeNext = useCallback((currentStep: WizardStep) => {
        return function innerMakeNext() {
            const stepIndex = stepOrder.indexOf(currentStep);
            if (stepIndex === -1 || stepIndex >= stepOrder.length) {
                return;
            }
            setWizardStep(stepOrder[stepIndex + 1]);

            // setPriorWizardStep(currentStep);
        };
    }, []);

    const getTransitionDirection = (step: WizardStep): 'backward' | 'current' | 'forward' => {
        if (step === wizardStep) {
            return 'current';
        }
        const stepIndex = stepOrder.indexOf(step);
        const currentStepIndex = stepOrder.indexOf(wizardStep);
        if (stepIndex === -1 || currentStepIndex === -1) {
            return 'current';
        }
        return currentStepIndex < stepIndex ? 'backward' : 'forward';
    };
    const goPrevious = useCallback(() => {
        const stepIndex = stepOrder.indexOf(wizardStep);
        if (stepIndex <= 0) {
            return;
        }
        setWizardStep(stepOrder[stepIndex - 1]);
    }, [wizardStep]);
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
                <Progress step={wizardStep}/>
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
                            show={wizardStep === WizardSteps.UseCase}
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
                            show={wizardStep === WizardSteps.Plugins}
                            direction={getTransitionDirection(WizardSteps.Plugins)}
                        />
                    }
                    {
                        false && <Channel/>
                    }
                    {
                        false && <TeamMember/>
                    }
                </div>
            </div>
        </CSSTransition>
    );
}
