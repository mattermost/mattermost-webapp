// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getCurrentUser, getUser} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';
import Constants from 'utils/constants';

export function getCustomStatus(state: GlobalState, userID: string | undefined) {
    const user = userID ? getUser(state, userID) : getCurrentUser(state);
    const userProps = user.props || {};
    return userProps.customStatus ? JSON.parse(userProps.customStatus) : {};
}

export function getRecentCustomStatuses(state: GlobalState, userID: string) {
    const user = getUser(state, userID);
    const userProps = user.props || {};
    return userProps.recentCustomStatuses ? JSON.parse(userProps.recentCustomStatuses) : [];
}

export function isCustomStatusEnabled(state: GlobalState) {
    const config = getConfig(state);

    // TODO: add EnableCustomUserStatuses property in config.
    return config.EnableCustomUserStatuses === 'true';
}

export function hasSetCustomStatusBefore(state: GlobalState, userID: string) {
    const user = getUser(state, userID);
    const userProps = user.props || {};
    return Boolean(userProps.recentCustomStatuses);
}

export function hasClickedOnUpdateStatusBefore(state: GlobalState, userID: string) {
    const user = getUser(state, userID);
    const userProps = user.props;
    if (!userProps) {
        return false;
    }
    return userProps.initialProps === Constants.CustomStatusInitialProps.CLICK_ON_UPDATE_STATUS_FROM_POST;
}

export function hasClickedOnSetStatusBefore(state: GlobalState, userID: string) {
    const user = getUser(state, userID);
    const userProps = user.props;
    if (!userProps) {
        return false;
    }
    return userProps.initialProps === Constants.CustomStatusInitialProps.CLICK_ON_SET_STATUS;
}
