// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {selectChannel} from 'mattermost-redux/actions/channels';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {ActionTypes} from 'utils/constants';
import {isNonChannelLHSItem, LHSItem} from 'utils/lhs_utils';

export function selectItem(item: LHSItem) {
    return (dispatch: DispatchFunc) => {
        let id = item;

        if (isNonChannelLHSItem(item)) {
            id = '';
        }

        dispatch(selectChannel(id));

        dispatch({
            type: ActionTypes.SELECT_LHS_NAV_ITEM,
            item,
        });

        return {data: true};
    };
}
