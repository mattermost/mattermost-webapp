// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AnyAction} from 'redux';
import {BatchAction} from 'redux-batched-actions';

import {GlobalState} from './store';

export type GetStateFunc = () => GlobalState;
export type GenericAction = AnyAction;
export type Thunk = (b: DispatchFunc, a: GetStateFunc) => Promise<ActionResult> | ActionResult;

export type Action = GenericAction | Thunk | BatchAction | ActionFunc;

export type ActionResult = {
    data?: any;
    error?: any;
};

export type DispatchFunc = (action: Action, getState?: GetStateFunc | null) => Promise<ActionResult>;
export type ActionFunc = (dispatch: DispatchFunc, getState: GetStateFunc) => Promise<ActionResult|ActionResult[]> | ActionResult;
