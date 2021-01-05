
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {updateMe} from 'mattermost-redux/actions/users';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

type CustomStatus = {
    emoji: string;
    text: string;
}

export function updateUserCustomStatus(newCustomStatus: CustomStatus) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const userProps = Object.assign({}, getCurrentUser(getState()).props);
        const recentCustomStatuses = userProps.recentCustomStatuses ? JSON.parse(userProps.recentCustomStatuses) : [];
        const updatedRecentCustomStatuses = recentCustomStatuses.filter((status: CustomStatus) => status.text !== newCustomStatus.text);
        updatedRecentCustomStatuses.unshift(newCustomStatus);
        if (updatedRecentCustomStatuses.length > 5) {
            updatedRecentCustomStatuses.pop();
        }
        userProps.customStatus = JSON.stringify(newCustomStatus);
        userProps.recentCustomStatuses = JSON.stringify(updatedRecentCustomStatuses);
        const user = Object.assign({}, getCurrentUser(getState()), {props: userProps});
        await dispatch(updateMe(user));
    };
}

export function unsetUserCustomStatus() {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const userProps = Object.assign({}, getCurrentUser(getState()).props);
        delete userProps.customStatus;
        const user = Object.assign({}, getCurrentUser(getState()), {props: userProps});
        await dispatch(updateMe(user));
    };
}

export function removeRecentCustomStatus(status: CustomStatus) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const userProps = Object.assign({}, getCurrentUser(getState()).props);
        const recentCustomStatuses = userProps.recentCustomStatuses ? JSON.parse(userProps.recentCustomStatuses) : [];
        const updatedRecentCustomStatuses = recentCustomStatuses.filter((recentStatus: CustomStatus) => recentStatus.text !== status.text);
        userProps.recentCustomStatuses = JSON.stringify(updatedRecentCustomStatuses);
        const user = Object.assign({}, getCurrentUser(getState()), {props: userProps});
        await dispatch(updateMe(user));
    };
}
