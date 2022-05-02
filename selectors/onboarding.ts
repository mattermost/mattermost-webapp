// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {isMobile} from 'utils/utils';

import {createSelector} from 'reselect';

import {makeGetCategory, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser, isFirstAdmin} from 'mattermost-redux/selectors/entities/users';

import {OnboardingTaskCategory, OnboardingTaskList} from 'components/onboarding_tasks';

import {GlobalState} from 'types/store';

import {RecommendedNextStepsLegacy, Preferences} from 'utils/constants';

const getCategory = makeGetCategory();
export const getABTestPreferences = (() => {
    return (state: GlobalState) => getCategory(state, Preferences.AB_TEST_PREFERENCE_VALUE);
})();

const getFirstChannelNamePref = createSelector(
    'getFirstChannelNamePref',
    getABTestPreferences,
    (preferences) => {
        return preferences.find((pref) => pref.name === RecommendedNextStepsLegacy.CREATE_FIRST_CHANNEL);
    },
);

export function getFirstChannelNameViews(state: GlobalState) {
    return state.views.channelSidebar.firstChannelName;
}

export function getFirstChannelName(state: GlobalState) {
    return getFirstChannelNameViews(state) || getFirstChannelNamePref(state)?.value || '';
}

export function getShowLaunchingWorkspace(state: GlobalState) {
    return state.views.modals.showLaunchingWorkspace;
}

// Legacy nextSteps section used to determine when to hide the onboarding to end users who have already completed/unfinished it
export type StepType = {
    id: string;

    // An array of all roles a user must have in order to see the step e.g. admins are both system_admin and system_user
    // so you would require ['system_admin','system_user'] to match.
    // to show step for all roles, leave the roles array blank.
    // for a step that must be shown only to the first admin, add the first_admin role to that step
    roles: string[];
};

export const Steps: StepType[] = [
    {
        id: RecommendedNextStepsLegacy.COMPLETE_PROFILE,
        roles: [],
    },
    {
        id: RecommendedNextStepsLegacy.TEAM_SETUP,
        roles: ['first_admin'],
    },
    {
        id: RecommendedNextStepsLegacy.NOTIFICATION_SETUP,
        roles: ['system_user'],
    },
    {
        id: RecommendedNextStepsLegacy.PREFERENCES_SETUP,
        roles: ['system_user'],
    },
    {
        id: RecommendedNextStepsLegacy.INVITE_MEMBERS,
        roles: ['system_admin', 'system_user'],
    },
    {
        id: RecommendedNextStepsLegacy.DOWNLOAD_APPS,
        roles: [],
    },
];

// Filter the steps shown by checking if our user has any of the required roles for that step
export function isStepForUser(step: StepType, roles: string): boolean {
    const userRoles = roles?.split(' ');
    return (
        userRoles?.some((role) => step.roles.includes(role)) ||
          step.roles.length === 0
    );
}

const getSteps = createSelector(
    'getSteps',
    (state: GlobalState) => getCurrentUser(state),
    (state: GlobalState) => isFirstAdmin(state),
    (currentUser, firstAdmin) => {
        const roles = firstAdmin ? `first_admin ${currentUser?.roles}` : currentUser?.roles;
        return Steps.filter((step) => isStepForUser(step, roles));
    },
);

// show Onboarding task list if they haven't skipped/finished the legacy steps or there are legacy steps unfinished
export const showOnboardingTaskListToExistingUsers = createSelector(
    'showOnboardingTaskListToExistingUsers',
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (state: GlobalState) => legacyNextStepsNotFinished(state),
    (stepPreferences, legacyNextStepsNotFinished) => {
        if (stepPreferences.some((pref) => (pref.name === RecommendedNextStepsLegacy.SKIP && pref.value === 'true'))) {
            return false;
        }

        if (stepPreferences.some((pref) => (pref.name === RecommendedNextStepsLegacy.HIDE && pref.value === 'true'))) {
            return false;
        }

        return legacyNextStepsNotFinished;
    },
);

// Loop through all Steps. For each step, check that
export const legacyNextStepsNotFinished = createSelector(
    'legacyNextStepsNotFinished',
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (state: GlobalState) => getCurrentUser(state),
    (state: GlobalState) => isFirstAdmin(state),
    (state: GlobalState) => getSteps(state),
    (stepPreferences, currentUser, firstAdmin, mySteps) => {
        const roles = firstAdmin ? `first_admin ${currentUser?.roles}` : currentUser?.roles;
        const checkPref = (step: StepType) => stepPreferences.some((pref) => (pref.name === step.id && pref.value === 'true') || !isStepForUser(step, roles));
        return !mySteps.every(checkPref);
    },
);

export const getShowTaskListBool = createSelector(
    'getShowTaskListBool',
    (state: GlobalState) => state,
    (state: GlobalState) => getCategory(state, OnboardingTaskCategory),
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (state, onboardingPreferences, legacyStepsPreferences) => {
        // conditions to validate scenario where users (initially first_admins) had already set any of the onboarding task list preferences values.
        // We check wether the preference value exists meaning the onboarding tasks list already started no matter what the state of the process is
        const hasUserStartedOnboardingTaskListProcess = onboardingPreferences?.some((pref) =>
            pref.name === OnboardingTaskList.ONBOARDING_TASK_LIST_SHOW || pref.name === OnboardingTaskList.ONBOARDING_TASK_LIST_OPEN);

        // This condition verifies existing users hasn't finished nor skipped legacy next steps or there are still steps not completed
        const hasLegacyNextStepsPrefs = legacyStepsPreferences?.some((pref) =>
            pref.name === RecommendedNextStepsLegacy.SKIP || pref.name === RecommendedNextStepsLegacy.HIDE);

        const existingUserHasntFinishedNorSkippedLegacyNextSteps = hasLegacyNextStepsPrefs && showOnboardingTaskListToExistingUsers(state);

        const completelyNewUserForOnboarding = !hasUserStartedOnboardingTaskListProcess && !hasLegacyNextStepsPrefs;

        const firstTimeOnboarding = completelyNewUserForOnboarding || existingUserHasntFinishedNorSkippedLegacyNextSteps;

        const taskListStatus = getBool(state, OnboardingTaskCategory, OnboardingTaskList.ONBOARDING_TASK_LIST_SHOW);
        const isMobileView = isMobile();
        const showTaskList = (firstTimeOnboarding || taskListStatus) && !isMobileView;

        return [showTaskList, firstTimeOnboarding];
    },
);
