// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {createSelector} from 'reselect';

import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {UserProfile} from 'mattermost-redux/types/users';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {isEqual} from 'lodash';

import {GlobalState} from 'types/store';
import {RecommendedNextSteps, Preferences} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import CompleteProfileStep from './steps/complete_profile_step';
import SetupPreferencesStep from './steps/setup_preferences_step/setup_preferences_step';
import InviteMembersStep from './steps/invite_members_step';
import TeamProfileStep from './steps/team_profile_step';
import EnableNotificationsStep from './steps/enable_notifications_step/enable_notifications_step';

export type StepComponentProps = {
    id: string;
    currentUser: UserProfile;
    onSkip: (id: string) => void;
    onFinish: (id: string) => void;
}
export type StepType = {
    id: string;
    title: string;
    component: React.ComponentType<StepComponentProps>;

    // An array of all roles a user must have in order to see the step e.g. admins are both system_admin and system_user
    // so you would require ['system_admin','system_user'] to match.
    // to show step for all roles, leave the roles array blank.
    roles: Array<string>;
};

export const Steps: StepType[] = [
    {
        id: RecommendedNextSteps.COMPLETE_PROFILE,
        title: localizeMessage(
            'next_steps_view.titles.completeProfile',
            'Complete your profile'
        ),
        component: CompleteProfileStep,
        roles: [],
    },
    {
        id: RecommendedNextSteps.TEAM_SETUP,
        title: localizeMessage(
            'next_steps_view.titles.teamSetup',
            'Name your team'
        ),
        roles: ['system_admin', 'system_user'],
        component: TeamProfileStep,
    },
    {
        id: RecommendedNextSteps.INVITE_MEMBERS,
        title: localizeMessage(
            'next_steps_view.titles.inviteMembers',
            'Invite members to the team'
        ),
        roles: ['system_admin', 'system_user'],
        component: InviteMembersStep,
    },
    {
        id: RecommendedNextSteps.NOTIFICATION_SETUP,
        title: localizeMessage(
            'next_steps_view.notificationSetup.setNotifications',
            'Turn on notifications'
        ),
        roles: ['system_user'],
        component: EnableNotificationsStep,
    },
    {
        id: RecommendedNextSteps.PREFERENCES_SETUP,
        title: localizeMessage(
            'next_steps_view.titles.preferenceSetup',
            'Set your preferences'
        ),
        roles: ['system_user'],
        component: SetupPreferencesStep,
    },
];

// Filter the steps shown by checking if our user has any of the required roles for that step
export function isStepForUser(step: StepType, roles: string): boolean {
    const userRoles = roles.split(' ');
    return (
        isEqual(userRoles.sort(), step.roles.sort()) ||
          step.roles.length === 0
    );
}

export const getSteps = createSelector(
    (state: GlobalState) => getCurrentUser(state),
    (currentUser) => {
        return Steps.filter((step) => isStepForUser(step, currentUser.roles));
    }
);

const getCategory = makeGetCategory();
export const showNextSteps = createSelector(
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (state: GlobalState) => getLicense(state),
    (state: GlobalState) => nextStepsNotFinished(state),
    (stepPreferences, license, nextStepsNotFinished) => {
        if (stepPreferences.some((pref) => pref.name === RecommendedNextSteps.HIDE && pref.value === 'true')) {
            return false;
        }

        if (license.Cloud !== 'true') {
            return false;
        }

        return nextStepsNotFinished;
    }
);

export const nextStepsNotFinished = createSelector(
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (state: GlobalState) => getCurrentUser(state),
    (stepPreferences, currentUser) => {
        const checkPref = (step: StepType) => stepPreferences.some((pref) => (pref.name === step.id && pref.value === 'true') || !isStepForUser(step, currentUser.roles));
        return !Steps.every(checkPref);
    }
);
