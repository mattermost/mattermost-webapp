// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {updateMe} from 'mattermost-redux/actions/users';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {CustomStatus} from 'types/store/custom_status';

export function updateUserCustomStatus(newCustomStatus: CustomStatus) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const user = {...getCurrentUser(getState())};
        const userProps = {...user.props};
        const recentCustomStatuses = userProps.recentCustomStatuses ? JSON.parse(userProps.recentCustomStatuses) : [];
        const updatedRecentCustomStatuses = [
            newCustomStatus,
            ...recentCustomStatuses.
                filter((status: CustomStatus) => status.text !== newCustomStatus.text).
                slice(0, 4),
        ];
        userProps.customStatus = JSON.stringify(newCustomStatus);
        userProps.recentCustomStatuses = JSON.stringify(updatedRecentCustomStatuses);
        user.props = userProps;
        await dispatch(updateMe(user));
    };
}

export function unsetUserCustomStatus() {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const user = {...getCurrentUser(getState())};
        const userProps = {...user.props};
        delete userProps.customStatus;
        user.props = userProps;
        await dispatch(updateMe(user));
    };
}

export function removeRecentCustomStatus(status: CustomStatus) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const user = {...getCurrentUser(getState())};
        const userProps = {...user.props};
        const recentCustomStatuses = userProps.recentCustomStatuses ? JSON.parse(userProps.recentCustomStatuses) : [];
        const updatedRecentCustomStatuses = recentCustomStatuses.filter((recentStatus: CustomStatus) => recentStatus.text !== status.text);
        userProps.recentCustomStatuses = JSON.stringify(updatedRecentCustomStatuses);
        user.props = userProps;
        await dispatch(updateMe(user));
    };
}

export function setCustomStatusInitialProps(prop: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const user = {...getCurrentUser(getState())};
        const userProps = {...user.props};
        userProps.initialProps = prop;
        user.props = userProps;
        await dispatch(updateMe(user));
    };
}
