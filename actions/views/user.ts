
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {updateMe} from 'mattermost-redux/actions/users';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

interface CustomStatus{
    emoji: string;
    text: string;
}

export function updateUserCustomStatus(newCustomStatus: CustomStatus) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const userProps = Object.assign({}, getCurrentUser(getState()).props);
        const oldCustomStatus = userProps.customStatus ? JSON.parse(userProps.customStatus) : {};
        const recentCustomStatuses = userProps.recentCustomStatuses ? JSON.parse(userProps.recentCustomStatuses) : [];
        if (oldCustomStatus) {
            recentCustomStatuses.unshift(oldCustomStatus);
        }
        const updatedRecentCustomStatuses = recentCustomStatuses.filter((status: CustomStatus) => status.text !== newCustomStatus.text);
        if (updatedRecentCustomStatuses.length > 5) {
            updatedRecentCustomStatuses.pop();
        }
        userProps.customStatus = JSON.stringify(newCustomStatus);
        userProps.recentCustomStatuses = JSON.stringify(updatedRecentCustomStatuses);
        const user = Object.assign({}, getCurrentUser(getState()), {props: userProps});
        await dispatch(updateMe(user));
    };
}
