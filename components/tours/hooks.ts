// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {without} from 'lodash';

import {getCurrentUserId, isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getWorkTemplatesLinkedProducts} from 'mattermost-redux/selectors/entities/general';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {close as closeLhs, open as openLhs} from 'actions/views/lhs';
import {setAddChannelDropdown} from 'actions/views/add_channel_dropdown';
import {switchToChannels} from 'actions/views/onboarding_tasks';
import {showRHSPlugin} from 'actions/views/rhs';
import {setProductMenuSwitcherOpen} from 'actions/views/product_menu';

import {useGetRHSPluggablesIds} from 'components/work_templates/hooks';

import {getHistory} from 'utils/browser_history';
import {suitePluginIds} from 'utils/constants';
import {GlobalState} from 'types/store';
import {useGetPluginsActivationState} from 'plugins/useGetPluginsActivationState';

import {OnboardingTaskCategory, OnboardingTaskList, OnboardingTasksName} from '../onboarding_tasks';

import {
    CrtTutorialSteps,
    ExploreOtherToolsTourSteps,
    FINISHED,
    OnboardingTourSteps,
    TTNameMapToTourSteps,
    TutorialTourName,
    WorkTemplateTourSteps,
} from './constant';

export const useGetTourSteps = (tourCategory: string) => {
    const isGuestUser = useSelector((state: GlobalState) => isCurrentUserGuestUser(state));

    const workTemplatesLinkedItems = useSelector(getWorkTemplatesLinkedProducts);
    let tourSteps: Record<string, number> = TTNameMapToTourSteps[tourCategory];

    const {playbooksPlugin, playbooksProductEnabled, boardsPlugin, boardsProductEnabled} = useGetPluginsActivationState();

    if (tourCategory === TutorialTourName.EXPLORE_OTHER_TOOLS) {
        const steps: Record<string, number> = tourSteps as typeof ExploreOtherToolsTourSteps;
        if (!playbooksPlugin && !playbooksProductEnabled) {
            delete steps.PLAYBOOKS_TOUR;
        }

        if (!boardsPlugin && !boardsProductEnabled) {
            delete steps.BOARDS_TOUR;
        }
        tourSteps = steps;
    } else if (tourCategory === TutorialTourName.WORK_TEMPLATE_TUTORIAL) {
        const steps: Record<string, number> = tourSteps as typeof WorkTemplateTourSteps;

        if (workTemplatesLinkedItems.playbooks && workTemplatesLinkedItems.playbooks === 0) {
            delete steps.PLAYBOOKS_TOUR;
        }

        if (workTemplatesLinkedItems.boards && workTemplatesLinkedItems.boards === 0) {
            delete steps.BOARDS_TOUR;
        }
        tourSteps = steps;
    } else if (tourCategory === TutorialTourName.ONBOARDING_TUTORIAL_STEP && isGuestUser) {
        // restrict the 'learn more about messaging' tour when user is guest (townSquare, channel creation and user invite are restricted to guests)
        tourSteps = TTNameMapToTourSteps[TutorialTourName.ONBOARDING_TUTORIAL_STEP_FOR_GUESTS];
    }
    return tourSteps;
};
export const useHandleNavigationAndExtraActions = (tourCategory: string) => {
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const teamUrl = useSelector((state: GlobalState) => getCurrentRelativeTeamUrl(state));
    const {pluggableId, rhsPluggableIds} = useGetRHSPluggablesIds();
    const pluggableIds = [rhsPluggableIds.get(suitePluginIds.boards), rhsPluggableIds.get(suitePluginIds.playbooks)];

    const channelLinkedItems = useSelector(getWorkTemplatesLinkedProducts);
    const boardsCount = channelLinkedItems?.boards || 0;
    const playbooksCount = channelLinkedItems?.playbooks || 0;

    const nextStepActions = useCallback((step: number) => {
        if (tourCategory === TutorialTourName.ONBOARDING_TUTORIAL_STEP) {
            switch (step) {
            case OnboardingTourSteps.CHANNELS_AND_DIRECT_MESSAGES : {
                dispatch(openLhs());
                break;
            }
            case OnboardingTourSteps.CREATE_AND_JOIN_CHANNELS : {
                dispatch(setAddChannelDropdown(true));
                break;
            }
            case OnboardingTourSteps.INVITE_PEOPLE : {
                dispatch(setAddChannelDropdown(true));
                break;
            }
            case OnboardingTourSteps.SEND_MESSAGE : {
                dispatch(switchToChannels());
                break;
            }
            case OnboardingTourSteps.FINISHED: {
                let preferences = [
                    {
                        user_id: currentUserId,
                        category: OnboardingTaskCategory,
                        name: OnboardingTasksName.CHANNELS_TOUR,
                        value: FINISHED.toString(),
                    },
                ];
                preferences = [...preferences,
                    {
                        user_id: currentUserId,
                        category: OnboardingTaskCategory,
                        name: OnboardingTaskList.ONBOARDING_TASK_LIST_OPEN,
                        value: 'true',
                    },
                ];
                dispatch(savePreferences(currentUserId, preferences));
                break;
            }
            default:
            }
        } else if (tourCategory === TutorialTourName.CRT_TUTORIAL_STEP) {
            switch (step) {
            case CrtTutorialSteps.WELCOME_POPOVER : {
                dispatch(openLhs());
                break;
            }
            case CrtTutorialSteps.LIST_POPOVER : {
                const nextUrl = `${teamUrl}/threads`;
                getHistory().push(nextUrl);
                break;
            }
            case CrtTutorialSteps.UNREAD_POPOVER : {
                break;
            }
            default:
            }
        } else if (tourCategory === TutorialTourName.EXPLORE_OTHER_TOOLS) {
            switch (step) {
            case ExploreOtherToolsTourSteps.FINISHED : {
                dispatch(setProductMenuSwitcherOpen(false));
                let preferences = [
                    {
                        user_id: currentUserId,
                        category: OnboardingTaskCategory,
                        name: OnboardingTasksName.EXPLORE_OTHER_TOOLS,
                        value: FINISHED.toString(),
                    },
                ];
                preferences = [...preferences,
                    {
                        user_id: currentUserId,
                        category: OnboardingTaskCategory,
                        name: OnboardingTaskList.ONBOARDING_TASK_LIST_OPEN,
                        value: 'true',
                    },
                ];
                dispatch(savePreferences(currentUserId, preferences));
                break;
            }
            default:
            }
        } else if (tourCategory === TutorialTourName.WORK_TEMPLATE_TUTORIAL) {
            const navigationPluggableId = without(pluggableIds, pluggableId)[0];
            const stepMatches = step === WorkTemplateTourSteps.BOARDS_TOUR_TIP || step === WorkTemplateTourSteps.PLAYBOOKS_TOUR_TIP;
            const multiStep = Boolean(boardsCount && playbooksCount);

            if (!multiStep) {
                const preferences = [
                    {
                        user_id: currentUserId,
                        category: TutorialTourName.WORK_TEMPLATE_TUTORIAL,
                        name: currentUserId,
                        value: FINISHED.toString(),
                    },
                ];
                dispatch(savePreferences(currentUserId, preferences));
                return;
            }
            if (navigationPluggableId && stepMatches) {
                dispatch(showRHSPlugin(navigationPluggableId));
            }
        }
    }, [currentUserId, teamUrl, tourCategory]);

    const lastStepActions = useCallback((lastStep: number) => {
        if (tourCategory === TutorialTourName.ONBOARDING_TUTORIAL_STEP) {
            switch (lastStep) {
            case OnboardingTourSteps.CREATE_AND_JOIN_CHANNELS : {
                dispatch(setAddChannelDropdown(false));
                break;
            }
            case OnboardingTourSteps.INVITE_PEOPLE : {
                dispatch(setAddChannelDropdown(false));
                break;
            }
            default:
            }
        } else if (tourCategory === TutorialTourName.CRT_TUTORIAL_STEP) {
            switch (lastStep) {
            case CrtTutorialSteps.WELCOME_POPOVER : {
                dispatch(closeLhs());
                break;
            }
            default:
            }
        }
    }, [currentUserId, tourCategory]);

    return useCallback((step: number, lastStep: number) => {
        lastStepActions(lastStep);
        nextStepActions(step);
    }, [nextStepActions, lastStepActions]);
};
