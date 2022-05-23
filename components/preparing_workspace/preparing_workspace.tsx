// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RouterProps} from 'react-router-dom';
import {FormattedMessage, useIntl} from 'react-intl';

import {GeneralTypes} from 'mattermost-redux/action_types';
import {General} from 'mattermost-redux/constants';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {createChannel} from 'mattermost-redux/actions/channels';
import {getFirstAdminSetupComplete as getFirstAdminSetupCompleteAction} from 'mattermost-redux/actions/general';
import {ActionResult} from 'mattermost-redux/types/actions';
import {Team} from 'mattermost-redux/types/teams';
import {Channel} from 'mattermost-redux/types/channels';
import {sendEmailInvitesToTeamGracefully} from 'mattermost-redux/actions/teams';
import {getUseCaseOnboarding} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';
import {getCurrentTeam, getMyTeams} from 'mattermost-redux/selectors/entities/teams';
import {isFirstAdmin} from 'mattermost-redux/selectors/entities/users';
import {getFirstAdminSetupComplete, getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {Client4} from 'mattermost-redux/client';

import Constants, {RecommendedNextStepsLegacy, Preferences} from 'utils/constants';
import {makeNewEmptyChannel} from 'utils/channel_utils';
import {teamNameToUrl, getSiteURL} from 'utils/url';
import {makeNewTeam} from 'utils/team_utils';

import {switchToChannel} from 'actions/views/channel';
import {setFirstChannelName} from 'actions/views/channel_sidebar';
import {pageVisited, trackEvent} from 'actions/telemetry_actions';

import LogoSvg from 'components/common/svg_images_components/logo_dark_blue_svg';

import {
    WizardSteps,
    WizardStep,
    Animations,
    AnimationReason,
    Form,
    emptyForm,
    mapStepToNextName,
    mapStepToSkipName,
    mapStepToPageView,
    mapStepToPrevious,
    mapStepToSubmitFail,
    PLUGIN_NAME_TO_ID_MAP,
} from './steps';

import ChannelComponent from './channel';
import ChannelsPreview from './channels_preview';
import InviteMembers from './invite_members';
import Organization from './organization';
import Plugins from './plugins';
import Progress from './progress';
import LaunchingWorkspace, {START_TRANSITIONING_OUT} from './launching_workspace';
import Url from './url';
import UseCase from './use_case';

import './preparing_workspace.scss';

export const OnboardingPreferences = {
    USE_CASE: 'use_case',
};

const SubmissionStates = {
    Presubmit: 'Presubmit',
    UserRequested: 'UserRequested',
    Submitting: 'Submitting',
    SubmitFail: 'SubmitFail',
} as const;

type SubmissionState = typeof SubmissionStates[keyof typeof SubmissionStates];

// We want an apparent total wait of at least two seconds
// START_TRANSITIONING_OUT is how long the other side of the transitioning screen
const WAIT_FOR_REDIRECT_TIME = 2000 - START_TRANSITIONING_OUT;

export type Actions = {
    createTeam: (team: Team) => ActionResult;
    checkIfTeamExists: (teamName: string) => ActionResult;
    getProfiles: (page: number, perPage: number, options: Record<string, any>) => ActionResult;
}

type Props = RouterProps & {
    handleForm(form: Form): void;
    background?: JSX.Element | string;
    actions: Actions;
}

function makeOnPageView(step: WizardStep) {
    return function onPageViewInner() {
        pageVisited('first_admin_setup', mapStepToPageView(step));
    };
}

function makeSubmitFail(step: WizardStep) {
    return function onPageViewInner() {
        trackEvent('first_admin_setup', mapStepToSubmitFail(step));
    };
}

const trackSubmitFail = {
    [WizardSteps.Organization]: makeSubmitFail(WizardSteps.Organization),
    [WizardSteps.Url]: makeSubmitFail(WizardSteps.Url),
    [WizardSteps.UseCase]: makeSubmitFail(WizardSteps.UseCase),
    [WizardSteps.Plugins]: makeSubmitFail(WizardSteps.Plugins),
    [WizardSteps.Channel]: makeSubmitFail(WizardSteps.Channel),
    [WizardSteps.InviteMembers]: makeSubmitFail(WizardSteps.InviteMembers),
    [WizardSteps.LaunchingWorkspace]: makeSubmitFail(WizardSteps.LaunchingWorkspace),
};

const onPageViews = {
    [WizardSteps.Organization]: makeOnPageView(WizardSteps.Organization),
    [WizardSteps.Url]: makeOnPageView(WizardSteps.Url),
    [WizardSteps.UseCase]: makeOnPageView(WizardSteps.UseCase),
    [WizardSteps.Plugins]: makeOnPageView(WizardSteps.Plugins),
    [WizardSteps.Channel]: makeOnPageView(WizardSteps.Channel),
    [WizardSteps.InviteMembers]: makeOnPageView(WizardSteps.InviteMembers),
    [WizardSteps.LaunchingWorkspace]: makeOnPageView(WizardSteps.LaunchingWorkspace),
};

export default function PreparingWorkspace(props: Props) {
    const dispatch = useDispatch();
    const user = useSelector(getCurrentUser);
    const intl = useIntl();
    const genericSubmitError = intl.formatMessage({
        id: 'onboarding_wizard.submit_error.generic',
        defaultMessage: 'Something went wrong. Please try again.',
    });
    const isUserFirstAdmin = useSelector(isFirstAdmin);
    const useCaseOnboarding = useSelector(getUseCaseOnboarding);

    const isSelfHosted = useSelector(getLicense).Cloud !== 'true';
    const currentTeam = useSelector(getCurrentTeam);
    const myTeams = useSelector(getMyTeams);

    // In cloud instances created from portal,
    // new admin user has a team in myTeams but not in currentTeam.
    const inferredTeam = currentTeam || myTeams?.[0];
    const config = useSelector(getConfig);
    const configSiteUrl = config.SiteURL;
    const pluginsEnabled = config.PluginsEnabled === 'true';
    const isConfigSiteUrlDefault = config.SiteURL === '' || Boolean(config.SiteURL && config.SiteURL === Constants.DEFAULT_SITE_URL);
    const lastIsConfigSiteUrlDefaultRef = useRef(isConfigSiteUrlDefault);
    const showOnMountTimeout = useRef<NodeJS.Timeout>();

    const stepOrder = [
        isSelfHosted && WizardSteps.Organization,
        isSelfHosted && isConfigSiteUrlDefault && WizardSteps.Url,
        WizardSteps.UseCase,
        pluginsEnabled && WizardSteps.Plugins,
        WizardSteps.Channel,
        WizardSteps.InviteMembers,
        WizardSteps.LaunchingWorkspace,
    ].filter((x) => Boolean(x)) as WizardStep[];

    const firstAdminSetupComplete = useSelector(getFirstAdminSetupComplete);

    const [[mostRecentStep, currentStep], setStepHistory] = useState<[WizardStep, WizardStep]>([stepOrder[0], stepOrder[0]]);
    const [submissionState, setSubmissionState] = useState<SubmissionState>(SubmissionStates.Presubmit);
    const browserSiteUrl = useMemo(getSiteURL, []);
    const [form, setForm] = useState({
        ...emptyForm,
        url: configSiteUrl || browserSiteUrl,
    });

    useEffect(() => {
        if (!pluginsEnabled) {
            if (!form.plugins.skipped) {
                setForm({
                    ...form,
                    plugins: {
                        skipped: false,
                    },
                });
            }
            if (currentStep === WizardSteps.Plugins) {
                const mostRecentStepIndex = stepOrder.indexOf(mostRecentStep);
                setStepHistory([mostRecentStep, stepOrder[Math.max(mostRecentStepIndex - 1, 0)]]);
            }
        }
    }, [pluginsEnabled, currentStep, mostRecentStep]);

    const [showFirstPage, setShowFirstPage] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    useEffect(() => {
        showOnMountTimeout.current = setTimeout(() => setShowFirstPage(true), 40);
        props.actions.getProfiles(0, General.PROFILE_CHUNK_SIZE, {roles: General.SYSTEM_ADMIN_ROLE});
        dispatch(getFirstAdminSetupCompleteAction());
        document.body.classList.add('admin-onboarding');
        return () => {
            document.body.classList.remove('admin-onboarding');
            if (showOnMountTimeout.current) {
                clearTimeout(showOnMountTimeout.current);
            }
        };
    }, []);
    useEffect(() => {
        const urlStepPlacement = stepOrder.indexOf(WizardSteps.Url);

        // If admin changes config during onboarding, we want to back them up to this step
        if (isConfigSiteUrlDefault && !lastIsConfigSiteUrlDefaultRef.current && urlStepPlacement > -1 && stepOrder.indexOf(currentStep) > urlStepPlacement) {
            lastIsConfigSiteUrlDefaultRef.current = isConfigSiteUrlDefault;
            const newMostRecentStep = stepOrder[Math.min(urlStepPlacement + 1, stepOrder.length - 1)];
            setStepHistory([newMostRecentStep, WizardSteps.Url]);
        } else if (isConfigSiteUrlDefault && !lastIsConfigSiteUrlDefaultRef.current) {
            lastIsConfigSiteUrlDefaultRef.current = isConfigSiteUrlDefault;
        }
    }, [stepOrder.indexOf(WizardSteps.Url), currentStep, isConfigSiteUrlDefault]);
    const shouldShowPage = (step: WizardStep) => {
        if (currentStep !== step) {
            return false;
        }
        const isFirstPage = stepOrder.indexOf(step) === 0;
        if (isFirstPage) {
            return showFirstPage;
        }
        return true;
    };
    const makeNext = useCallback((currentStep: WizardStep, skip?: boolean) => {
        return function innerMakeNext(trackingProps?: Record<string, any>) {
            const stepIndex = stepOrder.indexOf(currentStep);
            if (stepIndex === -1 || stepIndex >= stepOrder.length) {
                return;
            }
            setStepHistory([currentStep, stepOrder[stepIndex + 1]]);
            setSubmitError(null);

            const progressName = (skip ? mapStepToSkipName : mapStepToNextName)(currentStep);
            trackEvent('first_admin_setup', progressName, trackingProps);
        };
    }, [stepOrder]);

    const redirectWithError = useCallback((redirectTo: WizardStep, error: string) => {
        setStepHistory([WizardSteps.LaunchingWorkspace, redirectTo]);
        setSubmissionState(SubmissionStates.SubmitFail);
        setSubmitError(error);
        trackSubmitFail[redirectTo]();
    }, []);

    const sendForm = async () => {
        const sendFormStart = Date.now();
        setSubmissionState(SubmissionStates.Submitting);
        try {
            dispatch(savePreferences(user.id, [
                {
                    category: Constants.Preferences.ONBOARDING,
                    name: OnboardingPreferences.USE_CASE,
                    user_id: user.id,
                    value: JSON.stringify(form.useCase),
                },
            ]));
        } catch (e) {
            redirectWithError(WizardSteps.UseCase, genericSubmitError);
            return;
        }

        let team = inferredTeam;

        if (form.organization) {
            try {
                // eslint-disable-next-line
                const data = await props.actions.createTeam(makeNewTeam(form.organization, teamNameToUrl(form.organization || '').url));
                if (data.error) {
                    redirectWithError(WizardSteps.Organization, genericSubmitError);
                    return;
                }
                team = data.data;
            } catch (e) {
                redirectWithError(WizardSteps.Organization, genericSubmitError);
                return;
            }
        }

        let redirectChannel: Channel | null = null;
        if (!form.channel.skipped) {
            try {
                const {data: channel, error} = await dispatch(createChannel(makeNewEmptyChannel(form.channel.name, team.id), user.id)) as ActionResult;

                if (error) {
                    redirectWithError(WizardSteps.Channel, genericSubmitError);
                    return;
                }
                redirectChannel = channel;
            } catch (e) {
                redirectWithError(WizardSteps.Channel, genericSubmitError);
                return;
            }
            if (redirectChannel) {
                const category = Preferences.AB_TEST_PREFERENCE_VALUE;
                const name = RecommendedNextStepsLegacy.CREATE_FIRST_CHANNEL;
                const firstChannelNamePref = {category, name, user_id: user.id, value: redirectChannel.name};
                const defaultStepPref = {user_id: user.id, category: Preferences.TUTORIAL_STEP, name: user.id, value: '-1'};

                // store the firstChannelName value to redux and in preferences, also set the defaultStep to firstChannelName (-1)
                dispatch(setFirstChannelName(redirectChannel.name));
                dispatch(savePreferences(user.id, [firstChannelNamePref, defaultStepPref]));
            }
        }

        if (isConfigSiteUrlDefault && isSelfHosted && form.url && form.url !== configSiteUrl) {
            try {
                let withProtocol = form.url;
                if (form.inferredProtocol) {
                    withProtocol = form.inferredProtocol + '://' + withProtocol;
                }
                await Client4.patchConfig({
                    ServiceSettings: {
                        SiteURL: withProtocol,
                    },
                });

                // save config here
            } catch (e) {
                redirectWithError(WizardSteps.Url, genericSubmitError);
            }
        }

        if (!form.teamMembers.skipped && !isConfigSiteUrlDefault) {
            try {
                const inviteResult = await dispatch(sendEmailInvitesToTeamGracefully(team.id, form.teamMembers.invites));
                if ((inviteResult as ActionResult).error) {
                    redirectWithError(WizardSteps.InviteMembers, genericSubmitError);
                    return;
                }
            } catch (e) {
                redirectWithError(WizardSteps.InviteMembers, genericSubmitError);
                return;
            }
        }

        // send plugins
        const {skipped: skippedPlugins, ...pluginChoices} = form.plugins;
        let pluginsToSetup: string[] = [];
        if (!skippedPlugins) {
            pluginsToSetup = Object.entries(pluginChoices).reduce(
                (acc: string[], [k, v]): string[] => (v ? [...acc, PLUGIN_NAME_TO_ID_MAP[k as keyof Omit<Form['plugins'], 'skipped'>]] : acc), [],
            );
        }

        // This endpoint sets setup complete state, so we need to make this request
        // even if admin skipped submitting plugins.
        const completeSetupRequest = {
            install_plugins: pluginsToSetup,
        };
        try {
            await Client4.completeSetup(completeSetupRequest);
            dispatch({type: GeneralTypes.FIRST_ADMIN_COMPLETE_SETUP_RECEIVED, data: true});
        } catch (e) {
            redirectWithError(WizardSteps.Plugins, genericSubmitError);
            return;
        }

        const goToChannels = () => {
            dispatch({type: GeneralTypes.SHOW_LAUNCHING_WORKSPACE, open: true});
            if (redirectChannel) {
                dispatch(switchToChannel(redirectChannel));
            } else {
                props.history.push(`/${team.name}/channels${Constants.DEFAULT_CHANNEL}`);
            }
        };

        const sendFormEnd = Date.now();
        const timeToWait = WAIT_FOR_REDIRECT_TIME - (sendFormEnd - sendFormStart);
        if (timeToWait > 0) {
            setTimeout(goToChannels, timeToWait);
        } else {
            goToChannels();
        }
    };

    useEffect(() => {
        if (submissionState !== SubmissionStates.UserRequested) {
            return;
        }
        sendForm();
    }, [submissionState]);

    const adminRevisitedPage = firstAdminSetupComplete && submissionState === SubmissionStates.Presubmit;
    const shouldRedirect = !isUserFirstAdmin || adminRevisitedPage || !useCaseOnboarding;
    useEffect(() => {
        if (shouldRedirect) {
            props.history.push('/');
        }
    }, [shouldRedirect]);

    const getTransitionDirection = (step: WizardStep): AnimationReason => {
        const stepIndex = stepOrder.indexOf(step);
        const currentStepIndex = stepOrder.indexOf(currentStep);
        const mostRecentStepIndex = stepOrder.indexOf(mostRecentStep);
        if (stepIndex === -1 || currentStepIndex === -1 || mostRecentStepIndex === -1) {
            return Animations.Reasons.EnterFromBefore;
        }
        if (currentStep === step) {
            return currentStepIndex >= mostRecentStepIndex ? Animations.Reasons.EnterFromBefore : Animations.Reasons.EnterFromAfter;
        }
        return stepIndex > currentStepIndex ? Animations.Reasons.ExitToBefore : Animations.Reasons.ExitToAfter;
    };

    const getTransitionDirectionMultiStep = (steps: WizardStep[]): AnimationReason => {
        if (steps.length === 0) {
            return Animations.Reasons.EnterFromBefore;
        }
        const stepIndexes = steps.map((step) => stepOrder.indexOf(step));
        stepIndexes.sort();
        const [stepIndexesMin, stepIndexesMax] = [stepIndexes[0], stepIndexes[stepIndexes.length - 1]];
        const currentStepIndex = stepOrder.indexOf(currentStep);
        const mostRecentStepIndex = stepOrder.indexOf(mostRecentStep);
        if (stepIndexes.some((step) => step === -1) || currentStepIndex === -1 || mostRecentStepIndex === -1) {
            return Animations.Reasons.EnterFromBefore;
        }
        if (currentStepIndex >= stepIndexesMin && currentStepIndex <= stepIndexesMax) {
            return currentStepIndex >= mostRecentStepIndex ? Animations.Reasons.EnterFromBefore : Animations.Reasons.EnterFromAfter;
        }
        return stepIndexesMax > currentStepIndex ? Animations.Reasons.ExitToBefore : Animations.Reasons.ExitToAfter;
    };
    const goPrevious = useCallback((e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && (e as React.KeyboardEvent).key) {
            const key = (e as React.KeyboardEvent).key;
            if (key !== Constants.KeyCodes.ENTER[0] && key !== Constants.KeyCodes.SPACE[0]) {
                return;
            }
        }
        if (submissionState !== SubmissionStates.Presubmit && submissionState !== SubmissionStates.SubmitFail) {
            return;
        }
        const stepIndex = stepOrder.indexOf(currentStep);
        if (stepIndex <= 0) {
            return;
        }
        trackEvent('first_admin_setup', mapStepToPrevious(currentStep));
        setStepHistory([currentStep, stepOrder[stepIndex - 1]]);
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

    const previous = (
        <div
            onClick={goPrevious}
            onKeyUp={goPrevious}
            tabIndex={0}
            className='PreparingWorkspace__previous'
        >
            <i className='icon-chevron-up'/>
            <FormattedMessage
                id={'onboarding_wizard.previous'}
                defaultMessage='Previous'
            />
        </div>
    );

    return (
        <div className='PreparingWorkspace PreparingWorkspaceContainer'>
            {submissionState === SubmissionStates.SubmitFail && submitError && (
                <div className='PreparingWorkspace__submit-error'>
                    <i className='icon icon-alert-outline'/>
                    <span className='PreparingWorkspace__submit-error-message'>{submitError}</span>
                    <i
                        className='icon icon-close'
                        onClick={() => setSubmitError(null)}
                    />
                </div>
            )}
            {props.background}
            <div className='PreparingWorkspace__logo'>
                <LogoSvg/>
            </div>
            <Progress
                step={currentStep}
                stepOrder={stepOrder}
                transitionSpeed={Animations.PAGE_SLIDE}
            />
            <div className='PreparingWorkspacePageContainer'>
                {isSelfHosted && (
                    <Organization
                        onPageView={onPageViews[WizardSteps.Organization]}
                        show={shouldShowPage(WizardSteps.Organization)}
                        next={makeNext(WizardSteps.Organization)}
                        transitionDirection={getTransitionDirection(WizardSteps.Organization)}
                        organization={form.organization || ''}
                        setOrganization={(organization: Form['organization']) => {
                            setForm({
                                ...form,
                                organization,
                            });
                        }}
                        className='child-page'
                    />
                )}
                {isSelfHosted && (
                    <Url
                        onPageView={onPageViews[WizardSteps.Url]}
                        previous={previous}
                        show={shouldShowPage(WizardSteps.Url)}
                        next={(inferredProtocol: 'http' | 'https' | null) => {
                            makeNext(WizardSteps.Url)();
                            setForm({
                                ...form,
                                inferredProtocol,
                                urlSkipped: false,
                            });
                        }}
                        skip={() => {
                            makeNext(WizardSteps.Url, true)();
                            const withSkippedUrl = {
                                ...form,
                                urlSkipped: false,
                                inferredProtocol: null,
                            };
                            delete withSkippedUrl.url;
                            setForm(withSkippedUrl);
                        }}
                        transitionDirection={getTransitionDirection(WizardSteps.Url)}
                        url={form.url || ''}
                        setUrl={(url: string) => {
                            setForm({
                                ...form,
                                url,
                            });
                        }}
                        className='child-page'
                    />
                )}
                <UseCase
                    onPageView={onPageViews[WizardSteps.UseCase]}
                    previous={isSelfHosted ? previous : undefined}
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
                    show={shouldShowPage(WizardSteps.UseCase)}
                    next={() => makeNext(WizardSteps.UseCase)(form.useCase)}
                    transitionDirection={getTransitionDirection(WizardSteps.UseCase)}
                    className='child-page'
                />
                <Plugins
                    onPageView={onPageViews[WizardSteps.Plugins]}
                    next={() => {
                        const pluginChoices = {...form.plugins};
                        delete pluginChoices.skipped;
                        makeNext(WizardSteps.Plugins)(pluginChoices);
                        skipPlugins(false);
                    }}
                    skip={() => {
                        makeNext(WizardSteps.Plugins, true)();
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
                    show={shouldShowPage(WizardSteps.Plugins)}
                    transitionDirection={getTransitionDirection(WizardSteps.Plugins)}
                    className='child-page'
                />
                <ChannelComponent
                    onPageView={onPageViews[WizardSteps.Channel]}
                    next={() => {
                        makeNext(WizardSteps.Channel)();
                        skipChannel(false);
                    }}
                    skip={() => {
                        makeNext(WizardSteps.Channel, true)();
                        skipChannel(true);
                    }}
                    previous={previous}
                    show={shouldShowPage(WizardSteps.Channel)}
                    transitionDirection={getTransitionDirection(WizardSteps.Channel)}
                    name={form.channel.name}
                    onChange={(newValue: string) => setForm({
                        ...form,
                        channel: {
                            ...form.channel,
                            name: newValue,
                        },
                    })}
                    className='child-page'
                />
                <InviteMembers
                    onPageView={onPageViews[WizardSteps.InviteMembers]}
                    next={() => {
                        skipTeamMembers(false);
                        const inviteMembersTracking = {
                            inviteCount: form.teamMembers.invites.length,
                        };
                        setSubmissionState(SubmissionStates.UserRequested);
                        makeNext(WizardSteps.InviteMembers)(inviteMembersTracking);
                    }}
                    skip={() => {
                        skipTeamMembers(true);
                        setSubmissionState(SubmissionStates.UserRequested);
                        makeNext(WizardSteps.InviteMembers, true)();
                    }}
                    previous={previous}
                    show={shouldShowPage(WizardSteps.InviteMembers)}
                    transitionDirection={getTransitionDirection(WizardSteps.InviteMembers)}
                    disableEdits={submissionState !== SubmissionStates.Presubmit && submissionState !== SubmissionStates.SubmitFail}
                    className='child-page'
                    emails={form.teamMembers.invites}
                    setEmails={(emails: string[]) => {
                        setForm({
                            ...form,
                            teamMembers: {
                                ...form.teamMembers,
                                invites: emails,
                            },
                        });
                    }}
                    teamInviteId={inferredTeam?.invite_id || ''}
                    configSiteUrl={configSiteUrl}
                    formUrl={form.url}
                    browserSiteUrl={browserSiteUrl}
                    inferredProtocol={form.inferredProtocol}
                    showInviteLink={isConfigSiteUrlDefault}
                />
                <ChannelsPreview
                    show={currentStep === WizardSteps.Channel || currentStep === WizardSteps.InviteMembers}
                    step={currentStep}
                    transitionDirection={getTransitionDirectionMultiStep([WizardSteps.Channel, WizardSteps.InviteMembers])}
                    channelName={form.channel.name || 'Channel name'}
                    teamName={isSelfHosted ? form.organization || 'Team name' : inferredTeam?.display_name || 'Team name'}
                />
                <LaunchingWorkspace
                    onPageView={onPageViews[WizardSteps.LaunchingWorkspace]}
                    show={currentStep === WizardSteps.LaunchingWorkspace}
                    transitionDirection={getTransitionDirection(WizardSteps.LaunchingWorkspace)}
                />
            </div>
        </div>
    );
}
