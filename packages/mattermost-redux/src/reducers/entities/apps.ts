// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {combineReducers} from 'redux';

import {AppsTypes} from 'mattermost-redux/action_types';
import {AppBinding, AppsState} from 'mattermost-redux/types/apps';
import {GenericAction} from 'mattermost-redux/types/actions';
import {validateBindings} from 'mattermost-redux/utils/apps';

// This file's contents belong to the Apps Framework feature.
// Apps Framework feature is experimental, and the contents of this file are
// susceptible to breaking changes without pushing the major version of this package.

export function bindings(state: AppBinding[] = [], action: GenericAction): AppBinding[] {
    switch (action.type) {
    case AppsTypes.RECEIVED_APP_BINDINGS: {
        validateBindings(action.data);
        return action.data || [];
    }
    default:
        return state;
    }
}

export default (combineReducers({
    bindings,
}) as (b: AppsState, a: GenericAction) => AppsState);
