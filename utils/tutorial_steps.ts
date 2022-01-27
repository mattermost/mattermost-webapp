// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'mattermost-redux/types/store';

export type TSteps = Record<string, number>;

export const AdminTutorialSteps = {
    ADD_FIRST_CHANNEL: -1,
    POST_POPOVER: 0,
    CHANNEL_POPOVER: 1,
    ADD_CHANNEL_POPOVER: 2,
    MENU_POPOVER: 3,
    PRODUCT_SWITCHER: 4,
    SETTINGS: 5,
    START_TRIAL: 6,
    FINISHED: 999,
};

export const TutorialSteps = {
    ADD_FIRST_CHANNEL: -1,
    POST_POPOVER: 0,
    CHANNEL_POPOVER: 1,
    ADD_CHANNEL_POPOVER: 2,
    MENU_POPOVER: 3,
    PRODUCT_SWITCHER: 4,
    SETTINGS: 5,
    FINISHED: 999,
};

export const getTutorialSteps = createSelector(
    'getTutorialSteps',
    (state: GlobalState) => getCurrentUser(state),
    (currentUser): TSteps => {
        if (currentUser.roles.includes('system_admin')) {
            return AdminTutorialSteps;
        }
        return TutorialSteps;
    },
);
