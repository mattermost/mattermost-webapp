// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

export function apiCalls(state: any[] = [], action: GenericAction): any[] {
    // TODO Move the action types to the right place
    switch (action.type) {
    case 'add-line': {
        if (action.data?.type == 'api-call') {
            return [action.data, ...state];
        }
        return state
    }
    case 'clear-lines': {
        return [];
    }
    default:
        return state;
    }
}

export function storeCalls(state: any[] = [], action: GenericAction): any[] {
    // TODO Move the action types to the right place
    switch (action.type) {
    case 'add-line': {
        if (action.data?.type == 'store-call') {
            return [action.data, ...state];
        }
        return state
    }
    case 'clear-lines': {
        return [];
    }
    default:
        return state;
    }
}

export function sqlQueries(state: any[] = [], action: GenericAction): any[] {
    // TODO Move the action types to the right place
    switch (action.type) {
    case 'add-line': {
        if (action.data?.type == 'sql-query') {
            return [action.data, ...state];
        }
        return state
    }
    case 'clear-lines': {
        return [];
    }
    default:
        return state;
    }
}

export function logs(state: any[] = [], action: GenericAction): any[] {
    // TODO Move the action types to the right place
    switch (action.type) {
    case 'add-line': {
        if (action.data?.type == 'log-line') {
            return [action.data, ...state];
        }
        return state
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
    apiCalls,
    storeCalls,
    sqlQueries,
    logs,
}) as (b: {apiCalls: any[], storeCalls: any[], sqlQueries: any[], logs: any[]}, a: GenericAction) => {apiCalls: any[], storeCalls: any[], sqlQueries: any[], logs: any[]});
