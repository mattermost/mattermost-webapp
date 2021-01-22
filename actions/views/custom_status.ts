// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {updateMe} from 'mattermost-redux/actions/users';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {CustomStatus, CustomStatusInitialProps} from 'types/store/custom_status';
import Constants from 'utils/constants';

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

export function setCustomStatusInitialProps(props: Partial<CustomStatusInitialProps>) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const user = {...getCurrentUser(getState())};
        const userProps = {...user.props};
        let initialProps = userProps.initialProps ? JSON.parse(userProps.initialProps) : {};
        initialProps = {...initialProps, ...props};
        if (initialProps.menuOpenedOnClick === Constants.CustomStatusInitialProps.MENU_OPENED_BY_SIDEBAR_HEADER) {
            if (initialProps.hasClickedSidebarHeaderFirstTime === undefined) {
                initialProps.hasClickedSidebarHeaderFirstTime = true;
            } else {
                initialProps.hasClickedSidebarHeaderFirstTime = false;
            }
        }

        initialProps.hasClickedUpdateStatusBefore = initialProps.hasClickedUpdateStatusBefore || initialProps.menuOpenedOnClick === Constants.CustomStatusInitialProps.MENU_OPENED_BY_POST_HEADER;
        userProps.initialProps = JSON.stringify(initialProps);
        user.props = userProps;
        await dispatch(updateMe(user));
    };
}

export function clearCustomStatusInitialProps() {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const user = {...getCurrentUser(getState())};
        const userProps = {...user.props};
        userProps.initialProps = '';
        user.props = userProps;
        await dispatch(updateMe(user));
    };
}
