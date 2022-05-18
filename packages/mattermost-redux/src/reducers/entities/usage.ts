// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {UsageTypes, UserTypes} from 'mattermost-redux/action_types';
import {GenericAction} from 'mattermost-redux/types/actions';
import {IntegrationsUsage} from '@mattermost/types/usage';

// integrations tracks the count of integrations enabled on this server
function integrations(state = {count: 0}, action: GenericAction): IntegrationsUsage | null {
    switch (action.type) {
    case UsageTypes.RECEIVED_INTEGRATIONS_USAGE:
        return action.data ? action.data : state;
    case UserTypes.LOGOUT_SUCCESS:
        return null;
    default:
        return state;
    }
}

export default combineReducers({
    // usage of integrations
    integrations,
});
