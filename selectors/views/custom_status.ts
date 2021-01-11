// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

export function getCustomStatus(state: GlobalState) {
    const user = getCurrentUser(state);
    const userProps = user.props || {};
    return userProps.customStatus ? JSON.parse(userProps.customStatus) : {emoji: '', text: ''};
}

export function getRecentCustomStatuses(state: GlobalState) {
    const user = getCurrentUser(state);
    const userProps = user.props || {};
    return userProps.recentCustomStatuses ? JSON.parse(userProps.recentCustomStatuses) : [];
}
