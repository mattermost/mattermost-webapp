// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {enableBatching, Action, Reducer} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';
import deepFreezeAndThrowOnMutation from 'mattermost-redux/utils/deep_freeze';

import reducerRegistry from './reducer_registry';

export function createReducer(baseState: GlobalState, ...reducers: Reducer[]): Reducer<GlobalState, Action> {
    reducerRegistry.setReducers(Object.assign({}, ...reducers));
    const baseReducer = combineReducers(reducerRegistry.getReducers());

    return enableFreezing(enableBatching(baseReducer as any));
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
