// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RouterProps} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {createChannel} from 'mattermost-redux/actions/channels';
import {getFirstAdminSetupComplete as getFirstAdminSetupCompleteAction} from 'mattermost-redux/actions/general';
import {ActionResult} from 'mattermost-redux/types/actions';
import {Team} from 'mattermost-redux/types/teams';
import {Channel} from 'mattermost-redux/types/channels';
import {sendEmailInvitesToTeamGracefully} from 'mattermost-redux/actions/teams';
import {GlobalState} from 'mattermost-redux/types/store';
import {get, getUseCaseOnboarding} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';
import {getCurrentTeam, getMyTeams} from 'mattermost-redux/selectors/entities/teams';
import {isFirstAdmin} from 'mattermost-redux/selectors/entities/users';
import {getFirstAdminSetupComplete, getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {Client4} from 'mattermost-redux/client';

import Constants, {OnboardingPreferences, Preferences, RecommendedNextSteps} from 'utils/constants';
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
    PLUGIN_NAME_TO_ID_MAP,
} from './steps';

import ChannelComponent from './channel';
import ChannelsPreview from './channels_preview';
import InviteMembers from './invite_members';
import Organization from './organization';
import Plugins from './plugins';
import Progress from './progress';
import Url from './url';
import UseCase from './use_case';

import './preparing_workspace.scss';

const SubmissionStates = {
    Presubmit: 'Presubmit',
    UserRequested: 'UserRequested',
    Submitting: 'Submitting',
    SubmitSuccess: 'SubmitSuccess',
    SubmitFail: 'SubmitFail',
} as const;

type SubmissionState = typeof SubmissionStates[keyof typeof SubmissionStates];

const DISPLAY_SUCCESS_TIME = 3000;
const WAIT_FOR_REDIRECT_TIME = 2000;

export type Actions = {
    createTeam: (team: Team) => ActionResult;
    checkIfTeamExists: (teamName: string) => ActionResult;
}

type Props = RouterProps & {
    handleForm(form: Form): void;
    background?: JSX.Element | string;
    actions: Actions;
}

export default function PreparingWorkspace(props: Props) {
    const dispatch = useDispatch();
    const user = useSelector(getCurrentUser);
    const isUserFirstAdmin = useSelector(isFirstAdmin);
    const useCaseOnboarding = useSelector(getUseCaseOnboarding);

    const isSelfHosted = useSelector(getLicense).Cloud !== 'true';
    const currentTeam = useSelector(getCurrentTeam);
    const myTeams = useSelector(getMyTeams);
    const config = useSelector(getConfig);
    const configSiteUrl = config.SiteURL;
    const isConfigSiteUrlDefault = Boolean(config.SiteURL && config.SiteURL === Constants.DEFAULT_SITE_URL);
    const lastIsConfigSiteUrlDefaultRef = useRef(isConfigSiteUrlDefault);

    const stepOrder = [
        isSelfHosted && WizardSteps.Organization,
        isSelfHosted && isConfigSiteUrlDefault && WizardSteps.Url,
        WizardSteps.UseCase,
        WizardSteps.Plugins,
        WizardSteps.Channel,
        WizardSteps.InviteMembers,
        WizardSteps.TransitioningOut,
    ].filter((x) => Boolean(x)) as WizardStep[];

    const existingUseCasePreference = useSelector((state: GlobalState) => get(state, Constants.Preferences.ONBOARDING, OnboardingPreferences.USE_CASE, false));
    const firstAdminSetupComplete = useSelector(getFirstAdminSetupComplete);

    const [[mostRecentStep, currentStep], setStepHistory] = useState<[WizardStep, WizardStep]>([stepOrder[0], stepOrder[0]]);
    const [submissionState, setSubmissionState] = useState<SubmissionState>(SubmissionStates.Presubmit);
    const browserSiteUrl = useMemo(getSiteURL, []);
    const [form, setForm] = useState({
        ...emptyForm,
        url: configSiteUrl || browserSiteUrl,
    });
    const [showFirstPage, setShowFirstPage] = useState(false);
    useEffect(() => {
        setTimeout(() => setShowFirstPage(true), 40);
        dispatch(getFirstAdminSetupCompleteAction());
        document.body.classList.add('admin-onboarding');
        return () => {
            document.body.classList.remove('admin-onboarding');
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

            const progressName = (skip ? mapStepToSkipName : mapStepToNextName)(currentStep);
            trackEvent('first_admin_setup', progressName, trackingProps);
        };
    }, [stepOrder]);

    const sendForm = async () => {
        setSubmissionState(SubmissionStates.Submitting);
        dispatch(savePreferences(user.id, [
            {
                category: Constants.Preferences.ONBOARDING,
                name: OnboardingPreferences.USE_CASE,
                user_id: user.id,
                value: JSON.stringify(form.useCase),
            },
        ]));

        let team = currentTeam;

        if (form.organization) {
            // TODO: fix types here, destructuring as necessary et cetera
            // eslint-disable-next-line
            const data = await props.actions.createTeam(makeNewTeam(form.organization, teamNameToUrl(form.organization || '').url));
            team = data.data;
        }

        let redirectChannel: Channel | null = null;
        if (!form.channel.skipped) {
            const {data: channel, error} = await dispatch(createChannel(makeNewEmptyChannel(form.channel.name, team.id), user.id)) as ActionResult;
            redirectChannel = channel;
            if (error) {
                // TODO: Ruh Roah. Show some error?
            } else if (redirectChannel) {
                const category = Preferences.AB_TEST_PREFERENCE_VALUE;
                const name = RecommendedNextSteps.CREATE_FIRST_CHANNEL;
                const firstChannelNamePref = {category, name, user_id: user.id, value: redirectChannel.name};
                const defaultStepPref = {user_id: user.id, category: Preferences.TUTORIAL_STEP, name: user.id, value: '-1'};

                // store the firstChannelName value to redux and in preferences, also set the defaultStep to firstChannelName (-1)
                dispatch(setFirstChannelName(redirectChannel.name));
                dispatch(savePreferences(user.id, [firstChannelNamePref, defaultStepPref]));
            }
        }

        if (!form.teamMembers.skipped && !isConfigSiteUrlDefault) {
            const inviteResult = await dispatch(sendEmailInvitesToTeamGracefully(team.id, form.teamMembers.invites));
            console.log('inviteResult'); // eslint-disable-line no-console
            console.log(inviteResult); // eslint-disable-line no-console
        }

        // send plugins
        const {skipped: skippedPlugins, ...pluginChoices} = form.plugins;
        if (!skippedPlugins) {
            const pluginsToSetup = Object.entries(pluginChoices).reduce(
                (acc: string[], [k, v]): string[] => (v ? [...acc, PLUGIN_NAME_TO_ID_MAP[k as keyof Omit<Form['plugins'], 'skipped'>]] : acc), [],
            );
            const completeSetupRequest = {
                install_plugins: pluginsToSetup,
            };
            try {
                await Client4.completeSetup(completeSetupRequest);
            } catch (e) {
                // TODO: show error to user?
                // maybe a toast on the main screen?
                console.error(`error setting up plugins ${e}`); // eslint-disable-line no-console
            }
        }

        setSubmissionState(SubmissionStates.SubmitSuccess);

        setTimeout(() => {
            // i.e. TransitioningOut
            let inviteMembersTracking;
            if (!form.teamMembers.skipped) {
                inviteMembersTracking = {
                    inviteCount: form.teamMembers.invites.length,
                };
            }
            makeNext(WizardSteps.InviteMembers, form.teamMembers.skipped)(inviteMembersTracking);

            setTimeout(() => {
                if (redirectChannel) {
                    dispatch(switchToChannel(redirectChannel));
                }
            }, WAIT_FOR_REDIRECT_TIME);
        }, DISPLAY_SUCCESS_TIME);
    };

    useEffect(() => {
        if (submissionState !== SubmissionStates.UserRequested) {
            return;
        }
        sendForm();
    }, [submissionState]);

    const adminRevisitedPage = (firstAdminSetupComplete || Boolean(existingUseCasePreference)) && submissionState === SubmissionStates.Presubmit;
    if (!isUserFirstAdmin || adminRevisitedPage || !useCaseOnboarding) {
        props.history.push('/');
    }

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
        const [stepIndexesMin, stepIndexesMax] = [stepIndexes[0], stepIndexes[stepIndexes.length - 1]];
        const currentStepIndex = stepOrder.indexOf(currentStep);
        const mostRecentStepIndex = stepOrder.indexOf(mostRecentStep);
        if (stepIndexes.some((step) => step === -1) || currentStepIndex === -1 || mostRecentStepIndex === -1) {
            return Animations.Reasons.EnterFromBefore;
        }
        if (currentStepIndex >= stepIndexesMin && currentStepIndex <= stepIndexesMax) {
            return currentStepIndex > mostRecentStepIndex ? Animations.Reasons.EnterFromBefore : Animations.Reasons.EnterFromAfter;
        }
        return stepIndexesMax > mostRecentStepIndex ? Animations.Reasons.ExitToBefore : Animations.Reasons.ExitToAfter;
    };
    const goPrevious = useCallback((e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && (e as React.KeyboardEvent).key) {
            const key = (e as React.KeyboardEvent).key;
            if (key !== Constants.KeyCodes.ENTER[0] && key !== Constants.KeyCodes.SPACE[0]) {
                return;
            }
        }
        if (submissionState !== SubmissionStates.Presubmit) {
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
                        onPageView={() => {
                            pageVisited('first_admin_setup', mapStepToPageView(WizardSteps.Organization));
                        }}
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
                        onPageView={() => {
                            pageVisited('first_admin_setup', mapStepToPageView(WizardSteps.Url));
                        }}
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
                    onPageView={() => {
                        pageVisited('first_admin_setup', mapStepToPageView(WizardSteps.UseCase));
                    }}
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
                    onPageView={() => {
                        pageVisited('first_admin_setup', mapStepToPageView(WizardSteps.Plugins));
                    }}
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
                    onPageView={() => {
                        pageVisited('first_admin_setup', mapStepToPageView(WizardSteps.Channel));
                    }}
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
                    onPageView={() => {
                        pageVisited('first_admin_setup', mapStepToPageView(WizardSteps.InviteMembers));
                    }}
                    next={() => {
                        skipTeamMembers(false);
                        setSubmissionState(SubmissionStates.UserRequested);
                    }}
                    skip={() => {
                        skipTeamMembers(true);
                        setSubmissionState(SubmissionStates.UserRequested);
                    }}
                    previous={previous}
                    show={shouldShowPage(WizardSteps.InviteMembers)}
                    transitionDirection={getTransitionDirection(WizardSteps.InviteMembers)}
                    disableEdits={submissionState !== SubmissionStates.Presubmit}
                    showInviteSuccess={submissionState === SubmissionStates.SubmitSuccess}
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
                    teamInviteId={(currentTeam || myTeams?.[0]).invite_id || ''}
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
                    teamName={isSelfHosted ? form.organization || '' : (currentTeam || myTeams?.[0]).display_name || ''}
                />
            </div>
        </div>
    );
}
