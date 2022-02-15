// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AnyAction} from 'redux';

import {GlobalState} from './store';

export type GetStateFunc = () => GlobalState;
export type GenericAction = AnyAction;
export type Thunk = (b: DispatchFunc, a: GetStateFunc) => Promise<ActionResult> | ActionResult;

type BatchAction = {
    type: 'BATCHING_REDUCER.BATCH';
    payload: GenericAction[];
    meta: {
        batch: true;
    };
};
export type Action = GenericAction | Thunk | BatchAction | ActionFunc;

export type ActionResult = {
    data?: any;
    error?: any;
};

export type DispatchFunc = (action: Action, getState?: GetStateFunc | null) => Promise<ActionResult>;
export type ActionFunc = (dispatch: DispatchFunc, getState: GetStateFunc) => Promise<ActionResult|ActionResult[]> | ActionResult;
export type PlatformType = 'web' | 'ios' | 'android';

export const BATCH = 'BATCHING_REDUCER.BATCH';

// TODO remove me in favour of just using redux-batched-actions directly
export function batchActions(actions: Action[], type = BATCH) {
    return {type, meta: {batch: true}, payload: actions};
}
