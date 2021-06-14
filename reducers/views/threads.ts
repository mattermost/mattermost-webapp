// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {ViewsState} from 'types/store/views';

import {Threads} from 'utils/constants';

export const selectedThreadIdInTeam = (state: ViewsState['threads']['selectedThreadIdInTeam'] | null = null, action: GenericAction) => {
    switch (action.type) {
    case Threads.CHANGED_SELECTED_THREAD:
        return {
            ...state,
            [action.data.team_id]: action.data.thread_id,
        };
    }
    return state;
};

export const lastViewedAt = (state: ViewsState['threads']['lastViewedAt'] | Record<string, unknown> = {}, action: GenericAction) => {
    switch (action.type) {
    case Threads.CHANGED_LAST_VIEWED_AT:
        return {
            ...state,
            [action.data.threadId]: action.data.lastViewedAt,
        };
    }
    return state;
};

export default combineReducers({
    selectedThreadIdInTeam,
    lastViewedAt,
});
