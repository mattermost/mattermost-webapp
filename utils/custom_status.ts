// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import Constants from './constants';

export function showPulsatingDot(state: GlobalState) {
    const user = getCurrentUser(state);
    const userProps = user.props;
    if (!userProps) {
        return true;
    }

    const initialProps = userProps.initialProps ? JSON.parse(userProps.initialProps) : {};
    const hasClickedSidebarHeaderFirstTime = initialProps?.hasClickedSidebarHeaderFirstTime;
    const menuOpenedFromPostHeader = initialProps?.menuOpenedOnClick === Constants.CustomStatusInitialProps.MENU_OPENED_BY_POST_HEADER;

    return hasClickedSidebarHeaderFirstTime || menuOpenedFromPostHeader;
}

export function showUpdateStatusButton(state: GlobalState) {
    const user = getCurrentUser(state);
    const userProps = user.props;
    if (!userProps) {
        return true;
    }

    const hasSetCustomStatusBefore = userProps && userProps.recentCustomStatuses;
    const initialProps = userProps.initialProps ? JSON.parse(userProps.initialProps) : {};
    return !(hasSetCustomStatusBefore || initialProps.hasClickedUpdateStatusBefore);
}
