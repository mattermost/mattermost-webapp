// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

export function getCustomStatus(state: GlobalState, userID: string) {
    const user = getUser(state, userID);
    const userProps = user.props || {};
    return userProps.customStatus ? JSON.parse(userProps.customStatus) : {};
}

export function getRecentCustomStatuses(state: GlobalState, userID: string) {
    const user = getUser(state, userID);
    const userProps = user.props || {};
    return userProps.recentCustomStatuses ? JSON.parse(userProps.recentCustomStatuses) : [];
}
