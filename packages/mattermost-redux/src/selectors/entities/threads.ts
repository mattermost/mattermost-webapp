// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'mattermost-redux/types/store';
import {Team} from 'mattermost-redux/types/teams';
import {UserThread, ThreadsState} from 'mattermost-redux/types/threads';
import {$ID, IDMappedObjects, RelationOneToMany} from 'mattermost-redux/types/utilities';

export function getThreadsInTeam(state: GlobalState): RelationOneToMany<Team, UserThread> {
    return state.entities.threads.threadsInTeam;
}

export const getThreadsInCurrentTeam: (state: GlobalState) => Array<$ID<UserThread>> = createSelector(
    getCurrentTeamId,
    getThreadsInTeam,
    (
        currentTeamId,
        threadsInTeam,
    ) => {
        return threadsInTeam?.[currentTeamId] ?? [];
    },
);

export function getThreadCounts(state: GlobalState): ThreadsState['counts'] {
    return state.entities.threads.counts;
}

export function getTeamThreadCounts(state: GlobalState, teamId: $ID<Team>): ThreadsState['counts'][$ID<Team>] {
    return getThreadCounts(state)[teamId];
}

export const getThreadCountsInCurrentTeam: (state: GlobalState) => ThreadsState['counts'][$ID<Team>] = createSelector(
    getCurrentTeamId,
    getThreadCounts,
    (
        currentTeamId,
        counts,
    ) => {
        return counts?.[currentTeamId];
    },
);

export function getThreads(state: GlobalState): IDMappedObjects<UserThread> {
    return state.entities.threads.threads;
}

export function getThread(state: GlobalState, threadId: $ID<UserThread> | undefined): UserThread | null {
    if (!threadId || !getThreadsInCurrentTeam(state)?.includes(threadId)) {
        return null;
    }
    return getThreads(state)[threadId];
}

export const getThreadOrderInCurrentTeam: (state: GlobalState, selectedThreadIdInTeam?: $ID<UserThread>) => Array<$ID<UserThread>> = createSelector(
    getThreadsInCurrentTeam,
    getThreads,
    (state: GlobalState, selectedThreadIdInTeam?: $ID<UserThread>) => selectedThreadIdInTeam,

    (
        threadsInTeam,
        threads,
        selectedThreadIdInTeam,
    ) => {
        const ids = [...threadsInTeam.filter((id) => threads[id].is_following)];

        if (selectedThreadIdInTeam && !ids.includes(selectedThreadIdInTeam)) {
            ids.push(selectedThreadIdInTeam);
        }

        return sortByLastReply(ids, threads);
    },
);

export const getUnreadThreadOrderInCurrentTeam: (
    state: GlobalState,
    selectedThreadIdInTeam?: $ID<UserThread>,
) => Array<$ID<UserThread>> = createSelector(
    getThreadsInCurrentTeam,
    getThreads,
    (state: GlobalState, selectedThreadIdInTeam?: $ID<UserThread>) => selectedThreadIdInTeam,
    (
        threadsInTeam,
        threads,
        selectedThreadIdInTeam,
    ) => {
        const ids = threadsInTeam.filter((id) => {
            const thread = threads[id];
            return thread.is_following && (thread.unread_mentions || thread.unread_replies);
        });

        if (selectedThreadIdInTeam && !ids.includes(selectedThreadIdInTeam)) {
            ids.push(selectedThreadIdInTeam);
        }

        return sortByLastReply(ids, threads);
    },
);

function sortByLastReply(ids: Array<$ID<UserThread>>, threads: ReturnType<typeof getThreads>) {
    return ids.sort((a, b) => threads[b].last_reply_at - threads[a].last_reply_at);
}
