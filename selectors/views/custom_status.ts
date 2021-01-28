// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getCurrentUser, getUser} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';

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
    return config && config.EnableCustomUserStatuses === 'true';
}
