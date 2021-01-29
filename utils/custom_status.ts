// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

function showCustomStatusPulsatingDotAndPostHeader(state: GlobalState) {
    const user = getCurrentUser(state);
    const userProps = user.props;
    if (!(userProps && userProps.customStatusInitialisationState)) {
        return true;
    }

    const initialState = userProps.customStatusInitialisationState ? JSON.parse(userProps.customStatusInitialisationState) : {};
    return !(initialState && initialState.hasOpenedSetCustomStatusModal);
}

export function showStatusDropdownPulsatingDot(state: GlobalState) {
    return showCustomStatusPulsatingDotAndPostHeader(state);
}

export function showPostHeaderUpdateStatusButton(state: GlobalState) {
    return showCustomStatusPulsatingDotAndPostHeader(state);
}
