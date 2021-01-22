// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import Constants from './constants';

export function showCustomStatusPulsatingDot(state: GlobalState) {
    const user = getCurrentUser(state);
    const userProps = user.props;
    if (!(userProps && userProps.customStatusInitialisationState)) {
        return true;
    }

    const initialState = userProps.customStatusInitialisationState ? JSON.parse(userProps.customStatusInitialisationState) : {};
    const hasClickedSidebarHeaderFirstTime = initialState?.hasClickedSidebarHeaderFirstTime;
    const menuOpenedFromPostHeader = initialState?.menuOpenedOnClick === Constants.CustomStatusInitialisationStates.MENU_OPENED_BY_POST_HEADER;

    return hasClickedSidebarHeaderFirstTime || menuOpenedFromPostHeader;
}

export function showUpdateStatusButton(state: GlobalState) {
    const user = getCurrentUser(state);
    const userProps = user.props;
    if (!userProps) {
        return true;
    }

    const hasSetCustomStatusBefore = userProps && userProps.recentCustomStatuses;
    const initialState = userProps.customStatusInitialisationState ? JSON.parse(userProps.customStatusInitialisationState) : {};
    return !(hasSetCustomStatusBefore || initialState.hasClickedUpdateStatusBefore);
}
