// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {createSelector} from 'reselect';

import {makeGetCategory, getDownloadAppsCTATreatment} from 'mattermost-redux/selectors/entities/preferences';
import {DownloadAppsCTATreatments} from 'mattermost-redux/constants/config';
import {UserProfile} from 'mattermost-redux/types/users';

import {getCurrentUser, getUsers} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';
import {RecommendedNextSteps, Preferences} from 'utils/constants';
import {t} from 'utils/i18n';

import CompleteProfileStep from './steps/complete_profile_step';
import SetupPreferencesStep from './steps/setup_preferences_step/setup_preferences_step';
import InviteMembersStep from './steps/invite_members_step';
import TeamProfileStep from './steps/team_profile_step';
import EnableNotificationsStep from './steps/enable_notifications_step/enable_notifications_step';
import DownloadAppsStep from './steps/download_apps_step/download_apps_step';

import {isStepForUser} from './step_helpers';

export type StepComponentProps = {
    id: string;
    expanded: boolean;
    isAdmin: boolean;
    currentUser: UserProfile;
    onSkip: (id: string) => void;
    onFinish: (id: string) => void;
}
export type StepType = {
    id: string;
    title: {
        titleId: string;
        titleMessage: string;
    };
    component: React.ComponentType<StepComponentProps | StepComponentProps & {isFirstAdmin: boolean}>;
    visible: boolean;

    // An array of all roles a user must have in order to see the step e.g. admins are both system_admin and system_user
    // so you would require ['system_admin','system_user'] to match.
    // to show step for all roles, leave the roles array blank.
    // for a step that must be shown only to the first admin, add the first_admin role to that step
    roles: string[];
};

export const Steps: StepType[] = [
    {
        id: RecommendedNextSteps.COMPLETE_PROFILE,
        title: {
            titleId: t('next_steps_view.titles.completeProfile'),
            titleMessage: 'Complete your profile',
        },
        component: CompleteProfileStep,
        roles: [],
        visible: true,
    },
    {
        id: RecommendedNextSteps.TEAM_SETUP,
        title: {
            titleId: t('next_steps_view.titles.teamSetup'),
            titleMessage: 'Name your team',
        },
        roles: ['first_admin'],
        component: TeamProfileStep,
        visible: true,
    },
    {
        id: RecommendedNextSteps.NOTIFICATION_SETUP,
        title: {
            titleId: t('next_steps_view.notificationSetup.setNotifications'),
            titleMessage: 'Set up notifications',
        },
        roles: ['system_user'],
        component: EnableNotificationsStep,
        visible: true,
    },
    {
        id: RecommendedNextSteps.PREFERENCES_SETUP,
        title: {
            titleId: t('next_steps_view.titles.preferenceSetup'),
            titleMessage: 'Set your preferences',
        },
        roles: ['system_user'],
        component: SetupPreferencesStep,
        visible: false,
    },
    {
        id: RecommendedNextSteps.INVITE_MEMBERS,
        title: {
            titleId: t('next_steps_view.titles.inviteMembers'),
            titleMessage: 'Invite members to the team',
        },
        roles: ['system_admin', 'system_user'],
        component: InviteMembersStep,
        visible: true,
    },
    {
        id: RecommendedNextSteps.DOWNLOAD_APPS,
        title: {
            titleId: t('next_steps_view.downloadDesktopAndMobile'),
            titleMessage: 'Download the Desktop and Mobile apps',
        },
        roles: [],
        component: DownloadAppsStep,
        visible: true,
    },
];

export const isFirstAdmin = createSelector(
    'isFirstAdmin',
    (state: GlobalState) => getCurrentUser(state),
    (state: GlobalState) => getUsers(state),
    (currentUser, users) => {
        if (!currentUser.roles.includes('system_admin')) {
            return false;
        }
        const userIds = Object.keys(users);
        for (const userId of userIds) {
            const user = users[userId];
            if (user.roles.includes('system_admin') && user.create_at < currentUser.create_at) {
            // If the user in the list is an admin with create_at less than our user, than that user is older than the current one, so it can't be the first admin.
                return false;
            }
        }
        return true;
    },
);

function filterDownloadAppsStep(step: StepType, downloadAppsAsNextStep: boolean): boolean {
    if (step.id !== RecommendedNextSteps.DOWNLOAD_APPS) {
        return true;
    }

    return downloadAppsAsNextStep;
}

export const getSteps = createSelector(
    'getSteps',
    (state: GlobalState) => getCurrentUser(state),
    (state: GlobalState) => isFirstAdmin(state),
    (state: GlobalState) => getDownloadAppsCTATreatment(state) === DownloadAppsCTATreatments.TIPS_AND_NEXT_STEPS,
    (currentUser, firstAdmin, downloadAppsAsNextStep) => {
        const roles = firstAdmin ? `first_admin ${currentUser.roles}` : currentUser.roles;
        return Steps.filter((step) =>
            isStepForUser(step, roles) && step.visible && filterDownloadAppsStep(step, downloadAppsAsNextStep),
        );
    },
);

const getCategory = makeGetCategory();
export const showOnboarding = createSelector(
    'getCategory',
    (state: GlobalState) => showNextSteps(state),
    (state: GlobalState) => showNextStepsTips(state),
    (state: GlobalState) => state.views.nextSteps.show,
    (showNextSteps, showNextStepsTips, showNextStepsEphemeral) => {
        return !showNextStepsEphemeral && (showNextSteps || showNextStepsTips);
    });

export const isOnboardingHidden = createSelector(
    'isOnboardingHidden',
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (stepPreferences) => {
        // Before onboarding was introduced, there were existing users that didn't have step preferences set.
        // We don't want onboarding to suddenly pop up for them.
        if (stepPreferences.length === 0) {
            return true;
        }
        return stepPreferences.some((pref) => (pref.name === RecommendedNextSteps.HIDE && pref.value === 'true'));
    },
);

// Only show next steps if they haven't been skipped and there are steps unfinished
export const showNextSteps = createSelector(
    'showNextSteps',
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (state: GlobalState) => nextStepsNotFinished(state),
    (stepPreferences, nextStepsNotFinished) => {
        if (stepPreferences.some((pref) => (pref.name === RecommendedNextSteps.SKIP && pref.value === 'true'))) {
            return false;
        }

        return nextStepsNotFinished;
    },
);

// Only show tips if they have been skipped, or there are no unfinished steps
export const showNextStepsTips = createSelector(
    'showNextStepsTips',
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (state: GlobalState) => nextStepsNotFinished(state),
    (stepPreferences, nextStepsNotFinished) => {
        if (stepPreferences.some((pref) => (pref.name === RecommendedNextSteps.SKIP && pref.value === 'true'))) {
            return true;
        }

        return !nextStepsNotFinished;
    },
);

// Loop through all Steps. For each step, check that
export const nextStepsNotFinished = createSelector(
    'nextStepsNotFinished',
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (state: GlobalState) => getCurrentUser(state),
    (state: GlobalState) => isFirstAdmin(state),
    (state: GlobalState) => getSteps(state),
    (stepPreferences, currentUser, firstAdmin, mySteps) => {
        const roles = firstAdmin ? `first_admin ${currentUser.roles}` : currentUser.roles;
        const checkPref = (step: StepType) => stepPreferences.some((pref) => (pref.name === step.id && pref.value === 'true') || !isStepForUser(step, roles));
        return !mySteps.every(checkPref);
    },
);
