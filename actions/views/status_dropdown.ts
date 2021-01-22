// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {ActionTypes} from 'utils/constants';

export function setStatusDropdown(open: boolean) {
    return (dispatch: DispatchFunc) => {
        dispatch({
            type: ActionTypes.STATUS_DROPDOWN_TOGGLE,
            open,
        });
    };
}
