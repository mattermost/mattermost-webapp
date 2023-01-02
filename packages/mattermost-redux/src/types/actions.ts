// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ThunkAction} from 'redux-thunk';
import {AnyAction} from 'redux';
import {BatchAction} from 'redux-batched-actions';

import {GlobalState} from '@mattermost/types/store';
import {ServerError} from '@mattermost/types/errors';

export type GetStateFunc = () => GlobalState;
export type GenericAction = AnyAction;
export type Thunk = (b: DispatchFunc, a: GetStateFunc) => Promise<ActionResult> | ActionResult;

export type Action = GenericAction | Thunk | BatchAction | ActionFunc;

export type ActionResult<Data = unknown, Error = unknown> = {
    data?: Data;
    error?: Error;
};

export type DispatchFunc = (
    action: Action,
    getState?: GetStateFunc | null
) => Promise<ActionResult>;

export type ActionFunc<Data = any, State = GlobalState, Error = ServerError, ExtraThunkArg = null> = ThunkAction<
Promise<ActionResult<Data, Error>> | ActionResult<Data, Error>,
State,
ExtraThunkArg,
AnyAction
>;
