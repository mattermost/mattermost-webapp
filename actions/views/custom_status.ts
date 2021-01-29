// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {updateMe} from 'mattermost-redux/actions/users';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {CustomStatusInitialisationStates} from 'types/store/custom_status';

export function setCustomStatusInitialisationState(props: Partial<CustomStatusInitialisationStates>) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const user = {...getCurrentUser(getState())};
        const userProps = {...user.props};
        let initialState = userProps.customStatusInitialisationState ? JSON.parse(userProps.customStatusInitialisationState) : {};
        initialState = {...initialState, ...props};
        userProps.customStatusInitialisationState = JSON.stringify(initialState);
        user.props = userProps;
        await dispatch(updateMe(user));
    };
}

export function clearCustomStatusInitialisationState() {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const user = {...getCurrentUser(getState())};
        const userProps = {...user.props};
        userProps.customStatusInitialisationState = '';
        user.props = userProps;
        await dispatch(updateMe(user));
    };
}
