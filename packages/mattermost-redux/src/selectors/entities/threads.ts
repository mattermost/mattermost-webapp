// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'mattermost-redux/types/store';
import {Team} from 'mattermost-redux/types/teams';
import {UserThread, ThreadsState, UserThreadType, UserThreadSynthetic} from 'mattermost-redux/types/threads';
import {Post} from 'mattermost-redux/types/posts';
import {IDMappedObjects, RelationOneToMany} from 'mattermost-redux/types/utilities';

export function getThreadsInTeam(state: GlobalState): RelationOneToMany<Team, UserThread> {
    return state.entities.threads.threadsInTeam;
}

export function getUnreadThreadsInTeam(state: GlobalState): RelationOneToMany<Team, UserThread> {
    return state.entities.threads.unreadThreadsInTeam;
}

export const getThreadsInCurrentTeam: (state: GlobalState) => Array<UserThread['id']> = createSelector(
    'getThreadsInCurrentTeam',
    getCurrentTeamId,
    getThreadsInTeam,
    (
        currentTeamId,
        threadsInTeam,
    ) => {
        return threadsInTeam?.[currentTeamId] ?? [];
    },
);

export const getUnreadThreadsInCurrentTeam: (state: GlobalState) => Array<UserThread['id']> = createSelector(
    'getUnreadThreadsInCurrentTeam',
    getCurrentTeamId,
    getUnreadThreadsInTeam,
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

export function getThreadCountsIncludingDirect(state: GlobalState): ThreadsState['counts'] {
    return state.entities.threads.countsIncludingDirect;
}

export const getThreadCountsInCurrentTeam: (state: GlobalState) => ThreadsState['counts'][Team['id']] = createSelector(
    'getThreadCountsInCurrentTeam',
    getCurrentTeamId,
    getThreadCountsIncludingDirect,
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

export function getThread(state: GlobalState, threadId?: UserThread['id']) {
    if (!threadId) {
        return null;
    }

    const threads = getThreads(state);
    return threads[threadId];
}

export function getThreadOrSynthetic(state: GlobalState, rootPost: Post): UserThread | UserThreadSynthetic {
    const thread = getThreads(state)[rootPost.id];

    if (thread?.id) {
        return thread;
    }

    return {
        id: rootPost.id,
        type: UserThreadType.Synthetic,
        reply_count: rootPost.reply_count,
        participants: rootPost.participants,
        last_reply_at: rootPost.last_reply_at ?? 0,
        is_following: thread?.is_following ?? rootPost.is_following ?? null,
        post: {
            user_id: rootPost.user_id,
            channel_id: rootPost.channel_id,
        },
    };
}

export const getThreadOrderInCurrentTeam: (state: GlobalState, selectedThreadIdInTeam?: UserThread['id']) => Array<UserThread['id']> = createSelector(
    'getThreadOrderInCurrentTeam',
    getThreadsInCurrentTeam,
    getThreads,
    (state: GlobalState, selectedThreadIdInTeam?: UserThread['id']) => selectedThreadIdInTeam,
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
    selectedThreadIdInTeam?: UserThread['id'],
) => Array<UserThread['id']> = createSelector(
    'getUnreadThreadOrderInCurrentTeam',
    getUnreadThreadsInCurrentTeam,
    getThreads,
    (state: GlobalState, selectedThreadIdInTeam?: UserThread['id']) => selectedThreadIdInTeam,
    (
        threadsInTeam,
        threads,
        selectedThreadIdInTeam,
    ) => {
        const ids = threadsInTeam.filter((id) => {
            const thread = threads[id];
            return thread.is_following && (thread.unread_replies || thread.unread_mentions);
        });

        if (selectedThreadIdInTeam && !ids.includes(selectedThreadIdInTeam)) {
            ids.push(selectedThreadIdInTeam);
        }

        return sortByLastReply(ids, threads);
    },
);

function sortByLastReply(ids: Array<UserThread['id']>, threads: ReturnType<typeof getThreads>) {
    return ids.sort((a, b) => threads[b].last_reply_at - threads[a].last_reply_at);
}

export const getThreadsInChannel: (
    state: GlobalState,
    channelID: string,
) => Array<UserThread['id']> = createSelector(
    'getThreadsInChannel',
    getThreads,
    (state: GlobalState, channelID: string) => channelID,
    (allThreads: IDMappedObjects<UserThread>, channelID: string) => {
        return Object.keys(allThreads).filter((id) => allThreads[id].post.channel_id === channelID);
    },
);
