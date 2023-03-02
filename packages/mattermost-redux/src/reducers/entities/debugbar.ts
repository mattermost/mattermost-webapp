// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {
    DebugBarState,
    DebugBarAPICall,
    DebugBarSQLQuery,
    DebugBarStoreCall,
    DebugBarEmailSent,
    DebugBarLog,
} from '@mattermost/types/debugbar';
import {DebugBarTypes} from 'mattermost-redux/action_types';

export function emailsSent(state: DebugBarEmailSent[] = [], action: GenericAction): DebugBarEmailSent[] {
    switch (action.type) {
    case DebugBarTypes.ADD_LINE: {
        if (action.data?.type === 'email-sent') {
            return [action.data, ...state];
        }
        return state;
    }
    case DebugBarTypes.CLEAR_LINES: {
        return [];
    }
    default:
        return state;
    }
}

export function apiCalls(state: DebugBarAPICall[] = [], action: GenericAction): DebugBarAPICall[] {
    switch (action.type) {
    case DebugBarTypes.ADD_LINE: {
        if (action.data?.type === 'api-call') {
            return [action.data, ...state];
        }
        return state;
    }
    case DebugBarTypes.CLEAR_LINES: {
        return [];
    }
    default:
        return state;
    }
}

export function storeCalls(state: DebugBarStoreCall[] = [], action: GenericAction): DebugBarStoreCall[] {
    switch (action.type) {
    case DebugBarTypes.ADD_LINE: {
        if (action.data?.type === 'store-call') {
            return [action.data, ...state];
        }
        return state;
    }
    case DebugBarTypes.CLEAR_LINES: {
        return [];
    }
    default:
        return state;
    }
}

export function sqlQueries(state: DebugBarSQLQuery[] = [], action: GenericAction): DebugBarSQLQuery[] {
    switch (action.type) {
    case DebugBarTypes.ADD_LINE: {
        if (action.data?.type === 'sql-query') {
            return [action.data, ...state];
        }
        return state;
    }
    case DebugBarTypes.CLEAR_LINES: {
        return [];
    }
    default:
        return state;
    }
}

export function logs(state: DebugBarLog[] = [], action: GenericAction): DebugBarLog[] {
    switch (action.type) {
    case DebugBarTypes.ADD_LINE: {
        if (action.data?.type === 'log-line') {
            return [action.data, ...state];
        }
        return state;
    }
    case DebugBarTypes.CLEAR_LINES: {
        return [];
    }
    default:
        return state;
    }
}

export default (combineReducers({
    apiCalls,
    storeCalls,
    sqlQueries,
    logs,
    emailsSent,
}) as (b: DebugBarState, a: GenericAction) => DebugBarState);
