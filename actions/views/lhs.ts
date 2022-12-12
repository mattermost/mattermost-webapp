// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionTypes} from 'utils/constants';
import {DispatchFunc} from 'mattermost-redux/types/actions';

export const toggle = () => (dispatch: DispatchFunc) => dispatch({
    type: ActionTypes.TOGGLE_LHS,
});

export const open = () => (dispatch: DispatchFunc) => dispatch({
    type: ActionTypes.OPEN_LHS,
});

export const close = () => (dispatch: DispatchFunc) => dispatch({
    type: ActionTypes.CLOSE_LHS,
});
