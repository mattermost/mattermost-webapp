// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';

import {Preferences} from 'utils/constants';

export const getABTestPreferences = (() => {
    const getCategory = makeGetCategory();

    return (state: GlobalState) => getCategory(state, Preferences.AB_TEST_PREFERENCE_VALUE);
})();

export function getFirstChannelNameViews(state: GlobalState) {
    return state.views.channelSidebar.firstChannelName;
}

export function getFirstChannelName(state: GlobalState) {
    return getFirstChannelNameViews(state);
}

export function getShowLaunchingWorkspace(state: GlobalState) {
    return state.views.modals.showLaunchingWorkspace;
}
