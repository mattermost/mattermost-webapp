// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers, AnyAction} from 'redux';

import {General} from '../constants';

import {enableBatching, Action, Reducer} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';
import deepFreezeAndThrowOnMutation from 'mattermost-redux/utils/deep_freeze';

import reducerRegistry from './reducer_registry';

export function createReducer(baseState: GlobalState, ...reducers: Reducer[]): Reducer<GlobalState, Action> {
    reducerRegistry.setReducers(Object.assign({}, ...reducers));
    const baseReducer = combineReducers(reducerRegistry.getReducers());

    // Root reducer wrapper that listens for reset events.
    // Returns whatever is passed for the data property
    // as the new state.
    const offlineReducer = (state: GlobalState, action: Action) => {
        if ('type' in action && 'data' in action && action.type === General.OFFLINE_STORE_RESET) {
            return baseReducer(action.data || baseState, action);
        }

        return baseReducer(state, action as AnyAction);
    };

    return enableFreezing(enableBatching(offlineReducer as Reducer<GlobalState, Action>));
}

function enableFreezing(reducer: Reducer) {
    // Skip the overhead of freezing in production.
    // eslint-disable-next-line no-process-env
    if (process.env.NODE_ENV === 'production') {
        return reducer;
    }

    const frozenReducer = (state: GlobalState, action: Action) => {
        const nextState = reducer(state, action);

        if (nextState !== state) {
            deepFreezeAndThrowOnMutation(nextState);
        }

        return nextState;
    };

    return frozenReducer as Reducer<GlobalState, Action>;
}
