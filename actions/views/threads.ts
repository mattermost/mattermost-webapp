// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Threads} from 'utils/constants';

export function setSelectedThreadId(teamId: string, threadId: string | undefined) {
    return {
        type: Threads.CHANGED_SELECTED_THREAD,
        data: {
            thread_id: threadId,
            team_id: teamId,
        },
    };
}
