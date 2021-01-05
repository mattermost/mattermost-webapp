// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {Threads} from 'utils/constants';

export function setSelectedThreadId(userId: string, teamId: string, threadId: string | undefined) {
    return async (dispatch: DispatchFunc) => {
        dispatch({
            type: Threads.CHANGED_SELECTED_THREAD,
            data: {
                id: threadId,
                team_id: teamId,
            },
        });
    };
}
