// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

export function lines(state: any[] = [], action: GenericAction): any[] {
    // TODO Move the action types to the right place
    switch (action.type) {
    case 'add-line': {
        return [...state, action.data];
    }
    case 'clear-lines': {
        return [];
    }
    default:
        return state;
    }
}

// TODO: Create the DebugState in the types and use it here
export default (combineReducers({
    lines,
}) as (b: {lines: any[]}, a: GenericAction) => {lines: any[]});
