// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getCurrentUser, getUser} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {get} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {UserCustomStatus} from 'mattermost-redux/types/users';

import {createSelector} from 'reselect';

import {GlobalState} from 'types/store';

export function makeGetCustomStatus(): (state: GlobalState, userID?: string) => UserCustomStatus {
    return createSelector(
        (state: GlobalState, userID?: string) => (userID ? getUser(state, userID) : getCurrentUser(state)),
        (user) => {
            const userProps = user?.props || {};
            return userProps.customStatus ? JSON.parse(userProps.customStatus) : undefined;
        },
    );
}

export const getRecentCustomStatuses = createSelector(
    (state: GlobalState) => get(state, Preferences.CATEGORY_CUSTOM_STATUS, Preferences.NAME_RECENT_CUSTOM_STATUSES),
    (value) => {
        return value ? JSON.parse(value) : [];
    },
);

export function isCustomStatusEnabled(state: GlobalState) {
    const config = getConfig(state);
    return config && config.EnableCustomUserStatuses === 'true';
}

function showCustomStatusPulsatingDotAndPostHeader(state: GlobalState) {
    const customStatusTutorialState = get(state, Preferences.CATEGORY_CUSTOM_STATUS, Preferences.NAME_CUSTOM_STATUS_TUTORIAL_STATE);
    const modalAlreadyViewed = customStatusTutorialState && JSON.parse(customStatusTutorialState)[Preferences.CUSTOM_STATUS_MODAL_VIEWED];
    return !modalAlreadyViewed;
}

export function showStatusDropdownPulsatingDot(state: GlobalState) {
    return showCustomStatusPulsatingDotAndPostHeader(state);
}

export function showPostHeaderUpdateStatusButton(state: GlobalState) {
    return showCustomStatusPulsatingDotAndPostHeader(state);
}
