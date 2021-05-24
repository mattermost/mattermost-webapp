// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {getThread} from 'mattermost-redux/selectors/entities/threads';

import {Threads} from 'utils/constants';

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
    return (dispatch: DispatchFunc, getState: GetStateFunc): void => {
        const thread = getThread(getState(), threadId);

        if (thread) {
            dispatch(updateThreadLastOpened(thread.id, thread.last_viewed_at));
        }

        dispatch({
            type: Threads.CHANGED_SELECTED_THREAD,
            data: {
                thread_id: threadId,
                team_id: teamId,
            },
        });
    };
}
