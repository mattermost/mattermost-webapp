// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {$ID} from 'mattermost-redux/types/utilities';
import {Post} from 'mattermost-redux/types/posts';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getThreads} from 'mattermost-redux/selectors/entities/threads';

import {Team} from 'mattermost-redux/types/teams';
import {UserThread} from 'mattermost-redux/types/threads';

import {GlobalState} from 'types/store';
import {ViewsState} from 'types/store/views';
import {getSelectedPostId} from 'selectors/rhs';

export function getSelectedThreadIdInTeam(state: GlobalState) {
    return state.views.threads.selectedThreadIdInTeam;
}

export const getSelectedThreadIdInCurrentTeam: (state: GlobalState) => ViewsState['threads']['selectedThreadIdInTeam'][$ID<Team>] = createSelector(
    getCurrentTeamId,
    getSelectedThreadIdInTeam,
    (
        currentTeamId,
        selectedThreadIdInTeam,
    ) => {
        return selectedThreadIdInTeam?.[currentTeamId] ?? null;
    },
);

export const getSelectedThreadInCurrentTeam: (state: GlobalState) => UserThread | null = createSelector(
    getCurrentTeamId,
    getSelectedThreadIdInTeam,
    getThreads,
    (
        currentTeamId,
        selectedThreadIdInTeam,
        threads,
    ) => {
        const threadId = selectedThreadIdInTeam?.[currentTeamId];
        return threadId ? threads[threadId] : null;
    },
);

export function makeGetThreadLastViewedAt(): (state: GlobalState, threadId: $ID<Post>) => number {
    return createSelector(
        (state: GlobalState, threadId: $ID<Post>) => state.views.threads.lastViewedAt[threadId],
        getThreads,
        (_state, threadId) => threadId,
        (lastViewedAt, threads, threadId) => {
            if (lastViewedAt) {
                return lastViewedAt;
            }

            return threads[threadId]?.last_viewed_at || 0;
        },
    );
}

export const getOpenThreadId: (state: GlobalState) => $ID<UserThread> | null = createSelector(
    getSelectedThreadIdInCurrentTeam,
    getSelectedPostId,
    (selectedThreadId, selectedPostId) => {
        return selectedPostId || selectedThreadId;
    },
);

export const isThreadOpen = (state: GlobalState, threadId: $ID<UserThread>): boolean => {
    return threadId === getOpenThreadId(state);
};
