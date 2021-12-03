// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {createSelector} from 'reselect';

import {
    makeGetCategory,
    getCreateGuidedChannel,
} from 'mattermost-redux/selectors/entities/preferences';
import {UserProfile} from 'mattermost-redux/types/users';

import {getCurrentUser, getUsers} from 'mattermost-redux/selectors/entities/users';

import {makeAsyncComponent} from 'components/async_load';
import {GlobalState} from 'types/store';
import {RecommendedNextSteps, Preferences} from 'utils/constants';
import {t} from 'utils/i18n';

const CompleteProfileStep = makeAsyncComponent('CompleteProfileStep', React.lazy(() => import('./steps/complete_profile_step')));
const SetupPreferencesStep = makeAsyncComponent('SetupPreferencesSteup', React.lazy(() => import('./steps/setup_preferences_step/setup_preferences_step')));
const InviteMembersStep = makeAsyncComponent('InviteMembersStep', React.lazy(() => import('./steps/invite_members_step')));
const TeamProfileStep = makeAsyncComponent('TeamProfileStep', React.lazy(() => import('./steps/team_profile_step')));
const EnableNotificationsStep = makeAsyncComponent('EnableNotificationsStep', React.lazy(() => import('./steps/enable_notifications_step/enable_notifications_step')));
const DownloadAppsStep = makeAsyncComponent('DownloadAppsStep', React.lazy(() => import('./steps/download_apps_step/download_apps_step')));
const CreateFirstChannelStep = makeAsyncComponent('CreateFirstChannelStep', React.lazy(() => import('./steps/create_first_channel_step/create_first_channel_step')));

import {isStepForUser} from './step_helpers';

type CompleteStepButtonText = {
    id: string;
    defaultMessage: string;
};

export type StepComponentProps = {
    id: string;
    expanded: boolean;
    isAdmin: boolean;
    currentUser: UserProfile;
    onSkip: (id: string) => void;
    onFinish: (id: string) => void;

    // isLastStep is passed to every step component to inform it of it's position. A check can then be made within the component to display certain text
    // depending on the value of isLastStep. For example, we can display 'Finish' as the text of the finish button if this prop is true.
    isLastStep: boolean;
    completeStepButtonText: CompleteStepButtonText;
}
export type StepType = {
    id: string;
    title: {
        titleId: string;
        titleMessage: string;
    };
    component: React.ComponentType<StepComponentProps | StepComponentProps & {isFirstAdmin: boolean}>;
    visible: boolean;
    completeStepButtonText: CompleteStepButtonText;

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
        completeStepButtonText: {
            id: t('next_steps_view.complete_profile_step.saveProfile'),
            defaultMessage: 'Save profile',
        },
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
        completeStepButtonText: {
            id: t('next_steps_view.team_profile_step.saveTeam'),
            defaultMessage: 'Save team',
        },
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
        completeStepButtonText: {
            id: t('next_steps_view.notificationSetup.setNotifications'),
            defaultMessage: 'Set up notifications',
        },
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
        completeStepButtonText: {
            id: t('next_steps_view.preferenceSetup.setPreferences'),
            defaultMessage: 'Set Preferences',
        },
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
        completeStepButtonText: {
            id: t('next_steps_view.next'),
            defaultMessage: 'Next step',
        },
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
        completeStepButtonText: {
            id: t('next_steps_view.next'),
            defaultMessage: 'Next step',
        },
    },
    {
        id: RecommendedNextSteps.CREATE_FIRST_CHANNEL,
        title: {
            titleId: t('next_steps_view.titles.createChannel'),
            titleMessage: 'Create your first channel',
        },
        roles: ['system_admin'],
        component: CreateFirstChannelStep,
        visible: true,
        completeStepButtonText: {
            id: t('first_channel.createNew'),
            defaultMessage: 'Create Channel',
        },
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

// filter the steps depending on the feature flag value
function filterStepBasedOnFFVal(step: StepType, enableStep: boolean, stepId: string): boolean {
    if (step.id !== stepId) {
        return true;
    }
    return enableStep;
}

export const getSteps = createSelector(
    'getSteps',
    (state: GlobalState) => getCurrentUser(state),
    (state: GlobalState) => isFirstAdmin(state),
    (state: GlobalState) => getCreateGuidedChannel(state),
    (currentUser, firstAdmin, guidedFirstChannel) => {
        const roles = firstAdmin ? `first_admin ${currentUser.roles}` : currentUser.roles;
        return Steps.filter((step) =>
            isStepForUser(step, roles) &&
                step.visible && filterStepBasedOnFFVal(step, guidedFirstChannel, RecommendedNextSteps.CREATE_FIRST_CHANNEL),
        );
    },
);

const getCategory = makeGetCategory();

export const showOnboarding = createSelector(
    'getCategory',
    (state: GlobalState) => showNextSteps(state),
    (state: GlobalState) => state.views.nextSteps.show,
    (showNextSteps, showNextStepsEphemeral) => {
        return !showNextStepsEphemeral && showNextSteps;
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
