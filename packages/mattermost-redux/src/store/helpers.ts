// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {General} from '../constants';

import {enableBatching, Action, Reducer} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';
import deepFreezeAndThrowOnMutation from 'mattermost-redux/utils/deep_freeze';

import reducerRegistry from './reducer_registry';

export function createReducer(baseState: any, ...reducers: Reducer[]) {
    reducerRegistry.setReducers(Object.assign({}, ...reducers));
    const baseReducer = combineReducers(reducerRegistry.getReducers());

    // Root reducer wrapper that listens for reset events.
    // Returns whatever is passed for the data property
    // as the new state.
    function offlineReducer(state = {}, action: Action) {
        if ('type' in action && 'data' in action && action.type === General.OFFLINE_STORE_RESET) {
            return baseReducer(action.data || baseState, action);
        }

        return baseReducer(state, action as any);
    }

    return enableFreezing(enableBatching(offlineReducer));
}

function enableFreezing(reducer: Reducer) {
    // Skip the overhead of freezing in production.
    if (process.env.NODE_ENV === 'production') {
        return reducer;
    }

    return (state: GlobalState, action: Action) => {
        const nextState = reducer(state, action);

        if (nextState !== state) {
            deepFreezeAndThrowOnMutation(nextState);
        }

        return nextState;
    };
}
