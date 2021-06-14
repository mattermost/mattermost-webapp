// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GenericAction} from 'mattermost-redux/types/actions';

import {ViewsState} from 'types/store/views';
import {ActionTypes} from 'utils/constants';

export default function rhsStash(state: ViewsState['rhsStash'] = null, action: GenericAction): ViewsState['rhsStash'] {
    switch (action.type) {
    case ActionTypes.SAVE_RHS_STASH:
        return action.data;
    case ActionTypes.UPDATE_RHS_STATE:
        if (action.state === null) {
            return state;
        }
        return null;
    case ActionTypes.SELECT_POST:
        if (action.postId === '') {
            return state;
        }
        return null;
    case ActionTypes.SELECT_POST_CARD:
        if (action.postId === '') {
            return state;
        }
        return null;
    default:
        return state;
    }
}
