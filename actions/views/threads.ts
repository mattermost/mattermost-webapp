// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {GetStateFunc, DispatchFunc} from 'mattermost-redux/types/actions';
import {ActionTypes, Threads} from 'utils/constants';

import {browserHistory} from 'utils/browser_history';

import {GlobalState} from 'types/store';

export function updateThreadLastOpened(threadId: string, lastViewedAt: number) {
    return {
        type: Threads.CHANGED_LAST_VIEWED_AT,
        data: {
            threadId,
            lastViewedAt,
        },
    };
}

export function setSelectedThreadId(teamId: string, threadId: string | undefined) {
    return {
        type: Threads.CHANGED_SELECTED_THREAD,
        data: {
            thread_id: threadId,
            team_id: teamId,
        },
    };
}

export function manuallyMarkThreadAsUnread(threadId: string, lastViewedAt: number) {
    return batchActions([
        updateThreadLastOpened(threadId, lastViewedAt),
        {
            type: Threads.MANUALLY_UNREAD_THREAD,
            data: {threadId},
        },
    ]);
}

export function switchToGlobalThreads() {
    return (_dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;
        const teamUrl = getCurrentRelativeTeamUrl(state);
        browserHistory.push(`${teamUrl}/threads`);

        return {data: true};
    };
}

export function updateThreadToastStatus(status: boolean) {
    return {
        type: ActionTypes.UPDATE_THREAD_TOAST_STATUS,
        data: status,
    };
}
