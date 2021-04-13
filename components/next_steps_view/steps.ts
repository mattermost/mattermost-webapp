// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {createSelector} from 'reselect';

import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {UserProfile} from 'mattermost-redux/types/users';

import {getCurrentUser, getUsers} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';
import {RecommendedNextSteps, Preferences} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import CompleteProfileStep from './steps/complete_profile_step';
import SetupPreferencesStep from './steps/setup_preferences_step/setup_preferences_step';
import InviteMembersStep from './steps/invite_members_step';
import TeamProfileStep from './steps/team_profile_step';
import EnableNotificationsStep from './steps/enable_notifications_step/enable_notifications_step';
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
    title: string;
    component: React.ComponentType<StepComponentProps>;
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
        title: localizeMessage(
            'next_steps_view.titles.completeProfile',
            'Complete your profile',
        ),
        component: CompleteProfileStep,
        roles: [],
        visible: true,
    },
    {
        id: RecommendedNextSteps.TEAM_SETUP,
        title: localizeMessage(
            'next_steps_view.titles.teamSetup',
            'Name your team',
        ),
        roles: ['first_admin'],
        component: TeamProfileStep,
        visible: true,
    },
    {
        id: RecommendedNextSteps.NOTIFICATION_SETUP,
        title: localizeMessage(
            'next_steps_view.notificationSetup.setNotifications',
            'Set up desktop notifications',
        ),
        roles: ['system_user'],
        component: EnableNotificationsStep,
        visible: true,
    },
    {
        id: RecommendedNextSteps.PREFERENCES_SETUP,
        title: localizeMessage(
            'next_steps_view.titles.preferenceSetup',
            'Set your preferences',
        ),
        roles: ['system_user'],
        component: SetupPreferencesStep,
        visible: false,
    },
    {
        id: RecommendedNextSteps.INVITE_MEMBERS,
        title: localizeMessage(
            'next_steps_view.titles.inviteMembers',
            'Invite members to the team',
        ),
        roles: ['system_admin', 'system_user'],
        component: InviteMembersStep,
        visible: true,
    },
];

export const isFirstAdmin = createSelector(
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

export const getSteps = createSelector(
    (state: GlobalState) => getCurrentUser(state),
    (state: GlobalState) => isFirstAdmin(state),
    (currentUser, firstAdmin) => {
        const roles = firstAdmin ? `first_admin ${currentUser.roles}` : currentUser.roles;
        return Steps.filter((step) =>
            isStepForUser(step, roles) && step.visible,
        );
    },
);

const getCategory = makeGetCategory();
export const showOnboarding = createSelector(
    (state: GlobalState) => showNextSteps(state),
    (state: GlobalState) => showNextStepsTips(state),
    (state: GlobalState) => getLicense(state),
    (state: GlobalState) => state.views.nextSteps.show,
    (showNextSteps, showNextStepsTips, license, showNextStepsEphemeral) => {
        return !showNextStepsEphemeral && license.Cloud === 'true' && (showNextSteps || showNextStepsTips);
    });

export const isOnboardingHidden = createSelector(
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (stepPreferences) => {
        return stepPreferences.some((pref) => (pref.name === RecommendedNextSteps.HIDE && pref.value === 'true'));
    },
);

// Only show next steps if they haven't been skipped and there are steps unfinished
export const showNextSteps = createSelector(
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (state: GlobalState) => getLicense(state),
    (state: GlobalState) => nextStepsNotFinished(state),
    (stepPreferences, license, nextStepsNotFinished) => {
        if (stepPreferences.some((pref) => (pref.name === RecommendedNextSteps.SKIP && pref.value === 'true'))) {
            return false;
        }

        if (license.Cloud !== 'true') {
            return false;
        }

        return nextStepsNotFinished;
    },
);

// Only show tips if they have been skipped, or there are no unfinished steps
export const showNextStepsTips = createSelector(
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (state: GlobalState) => getLicense(state),
    (state: GlobalState) => nextStepsNotFinished(state),
    (stepPreferences, license, nextStepsNotFinished) => {
        if (stepPreferences.some((pref) => (pref.name === RecommendedNextSteps.SKIP && pref.value === 'true'))) {
            return true;
        }

        if (license.Cloud !== 'true') {
            return false;
        }

        return !nextStepsNotFinished;
    },
);

// Loop through all Steps. For each step, check that
export const nextStepsNotFinished = createSelector(
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (state: GlobalState) => getCurrentUser(state),
    (state: GlobalState) => isFirstAdmin(state),
    (stepPreferences, currentUser, firstAdmin) => {
        const roles = firstAdmin ? `first_admin ${currentUser.roles}` : currentUser.roles;
        const checkPref = (step: StepType) => stepPreferences.some((pref) => (pref.name === step.id && pref.value === 'true') || !isStepForUser(step, roles));
        return !Steps.every(checkPref);
    },
);
