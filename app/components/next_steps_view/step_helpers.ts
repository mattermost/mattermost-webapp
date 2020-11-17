// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {isEqual} from 'lodash';

import {StepType} from './steps';

export function getAnalyticsCategory(isAdmin: boolean) {
    return isAdmin ? 'cloud_first_user_onboarding' : 'cloud_end_user_onboarding';
}

// Filter the steps shown by checking if our user has any of the required roles for that step
export function isStepForUser(step: StepType, roles: string): boolean {
    const userRoles = roles.split(' ');
    return (
        isEqual(userRoles.sort(), step.roles.sort()) ||
          step.roles.length === 0
    );
}
