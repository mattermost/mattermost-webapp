// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {ActionTypes} from 'utils/constants.jsx';

export const toggle = () => (dispatch) => dispatch({
    type: ActionTypes.TOGGLE_LHS,
});

export const open = () => (dispatch) => dispatch({
    type: ActionTypes.OPEN_LHS,
});

export const close = () => (dispatch) => dispatch({
    type: ActionTypes.CLOSE_LHS,
});
