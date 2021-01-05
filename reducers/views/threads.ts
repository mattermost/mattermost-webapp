// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {ViewsState} from 'types/store/views';

import {Threads} from 'utils/constants';

export const selectedThreadIdInTeam = (state: ViewsState['threads']['selectedThreadIdInTeam'] | null = null, action: GenericAction) => {
    if (action.type === Threads.CHANGED_SELECTED_THREAD) {
        return {
            ...state,
            [action.data.team_id]: action.data.id,
        };
    }
    return state;
};

export default combineReducers({
    selectedThreadIdInTeam,
});
