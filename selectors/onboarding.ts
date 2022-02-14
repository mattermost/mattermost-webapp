// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';

import {Preferences, RecommendedNextSteps} from 'utils/constants';

export const getABTestPreferences = (() => {
    const getCategory = makeGetCategory();

    return (state: GlobalState) => getCategory(state, Preferences.AB_TEST_PREFERENCE_VALUE);
})();

const getFirstChannelNamePref = createSelector(
    'getFirstChannelNamePref',
    getABTestPreferences,
    (preferences) => {
        return preferences.find((pref) => pref.name === RecommendedNextSteps.CREATE_FIRST_CHANNEL);
    },
);

export function getFirstChannelName(state: GlobalState) {
    let firstChannelName = state.views.channelSidebar.firstChannelName;
    if (!firstChannelName) {
        firstChannelName = getFirstChannelNamePref(state)?.value || '';
    }

    return firstChannelName;
}
