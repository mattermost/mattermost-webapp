// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getMyChannels} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'mattermost-redux/types/store';
import {Team} from 'mattermost-redux/types/teams';
import {UserThread, ThreadsState, UserThreadType, UserThreadSynthetic} from 'mattermost-redux/types/threads';
import {Post} from 'mattermost-redux/types/posts';
import {$ID, IDMappedObjects, RelationOneToMany} from 'mattermost-redux/types/utilities';

export function getThreadsInTeam(state: GlobalState): RelationOneToMany<Team, UserThread> {
    return state.entities.threads.threadsInTeam;
}

export function getUnreadThreadsInTeam(state: GlobalState): RelationOneToMany<Team, UserThread> {
    return state.entities.threads.unreadThreadsInTeam;
}

export const getThreadsInCurrentTeam: (state: GlobalState) => Array<$ID<UserThread>> = createSelector(
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

export const getUnreadThreadsInCurrentTeam: (state: GlobalState) => Array<$ID<UserThread>> = createSelector(
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

export function getTeamThreadCounts(state: GlobalState, teamId: $ID<Team>): ThreadsState['counts'][$ID<Team>] {
    return getThreadCounts(state)[teamId];
}

export const getThreadCountsInCurrentTeam: (state: GlobalState) => ThreadsState['counts'][$ID<Team>] = createSelector(
    'getThreadCountsInCurrentTeam',
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

export function getThread(state: GlobalState, threadId?: $ID<UserThread>) {
    const threads = getThreads(state);
    const myChannels = getMyChannels(state).map((c) => c.id);

    if (!threadId) {
        return null;
    }

    const thread = threads[threadId];
    if (!thread || (thread.post && myChannels.indexOf(thread.post.channel_id) === -1)) {
        return null;
    }

    return thread;
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
        is_following: thread?.is_following ?? rootPost.is_following ?? false,
        post: {
            user_id: rootPost.user_id,
            channel_id: rootPost.channel_id,
        },
    };
}

export const getThreadOrderInCurrentTeam: (state: GlobalState, selectedThreadIdInTeam?: $ID<UserThread>) => Array<$ID<UserThread>> = createSelector(
    'getThreadOrderInCurrentTeam',
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
    'getUnreadThreadOrderInCurrentTeam',
    getUnreadThreadsInCurrentTeam,
    getThreads,
    (state: GlobalState, selectedThreadIdInTeam?: $ID<UserThread>) => selectedThreadIdInTeam,
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

function sortByLastReply(ids: Array<$ID<UserThread>>, threads: ReturnType<typeof getThreads>) {
    return ids.sort((a, b) => threads[b].last_reply_at - threads[a].last_reply_at);
}

export const getThreadsInChannel: (
    state: GlobalState,
    channelID: string,
) => Array<$ID<UserThread>> = createSelector(
    'getThreadsInChannel',
    getThreads,
    (state: GlobalState, channelID: string) => channelID,
    (allThreads: IDMappedObjects<UserThread>, channelID: string) => {
        return Object.keys(allThreads).filter((id) => allThreads[id].post.channel_id === channelID);
    },
);
