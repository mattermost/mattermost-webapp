// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChannelTypes, PostTypes, TeamTypes, ThreadTypes, UserTypes} from 'mattermost-redux/action_types';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Team, TeamUnread} from 'mattermost-redux/types/teams';
import {Post} from 'mattermost-redux/types/posts';
import {ThreadsState, UserThread} from 'mattermost-redux/types/threads';
import {UserProfile} from 'mattermost-redux/types/users';
import {IDMappedObjects} from 'mattermost-redux/types/utilities';

import {threadsInTeamReducer, unreadThreadsInTeamReducer, ExtraData} from './threadsInTeam/threadsInTeam';

export const threadsReducer = (state: ThreadsState['threads'] = {}, action: GenericAction, extra: ExtraData) => {
    switch (action.type) {
    case ThreadTypes.RECEIVED_UNREAD_THREADS:
    case ThreadTypes.RECEIVED_THREADS: {
        const {threads} = action.data;
        return {
            ...state,
            ...threads.reduce((results: IDMappedObjects<UserThread>, thread: UserThread) => {
                results[thread.id] = thread;
                return results;
            }, {}),
        };
    }
    case PostTypes.POST_REMOVED: {
        const post = action.data;

        if (post.root_id || !state[post.id]) {
            return state;
        }

        const nextState = {...state};
        Reflect.deleteProperty(nextState, post.id);

        return nextState;
    }
    case ThreadTypes.RECEIVED_THREAD: {
        const {thread} = action.data;
        return {
            ...state,
            [thread.id]: thread,
        };
    }
    case ThreadTypes.READ_CHANGED_THREAD: {
        const {
            id,
            newUnreadMentions,
            newUnreadReplies,
            lastViewedAt,
        } = action.data;

        return {
            ...state,
            [id]: {
                ...(state[id] || {}),
                last_viewed_at: lastViewedAt,
                unread_mentions: newUnreadMentions,
                unread_replies: newUnreadReplies,
                is_following: true,
            },
        };
    }
    case ThreadTypes.FOLLOW_CHANGED_THREAD: {
        const {id, following} = action.data;
        return {
            ...state,
            [id]: {
                ...(state[id] || {}),
                is_following: following,
            },
        };
    }
    case PostTypes.RECEIVED_NEW_POST: {
        const post: Post = action.data;
        const thread: UserThread | undefined = state[post.root_id];
        if (post.root_id && thread) {
            const participants = thread.participants || [];
            const nextThread = {...thread};
            if (!participants.find((user: UserProfile | {id: string}) => user.id === post.user_id)) {
                nextThread.participants = [...participants, {id: post.user_id}];
            }

            if (post.reply_count) {
                nextThread.reply_count = post.reply_count;
            }

            return {
                ...state,
                [post.root_id]: nextThread,
            };
        }
        return state;
    }
    case ThreadTypes.ALL_TEAM_THREADS_READ: {
        return Object.entries(state).reduce<ThreadsState['threads']>((newState, [id, thread]) => {
            newState[id] = {
                ...thread,
                unread_mentions: 0,
                unread_replies: 0,
            };
            return newState;
        }, {});
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    case ChannelTypes.LEAVE_CHANNEL: {
        if (!extra.threadsToDelete || extra.threadsToDelete.length === 0) {
            return state;
        }

        let threadDeleted = false;

        // Remove entries for any thread in the channel
        const nextState = {...state};
        for (const thread of extra.threadsToDelete) {
            Reflect.deleteProperty(nextState, thread.id);
            threadDeleted = true;
        }

        if (!threadDeleted) {
            // Nothing was actually removed
            return state;
        }

        return nextState;
    }
    }

    return state;
};

export const countsReducer = (state: ThreadsState['counts'] = {}, action: GenericAction, extra: ExtraData) => {
    switch (action.type) {
    case ThreadTypes.ALL_TEAM_THREADS_READ: {
        const counts = state[action.data.team_id] ?? {};
        return {
            ...state,
            [action.data.team_id]: {
                ...counts,
                total_unread_mentions: 0,
                total_unread_threads: 0,
            },
        };
    }
    case TeamTypes.RECEIVED_MY_TEAM_UNREADS: {
        const members = action.data;
        return {
            ...state,
            ...members.reduce((result: ThreadsState['counts'], member: TeamUnread) => {
                result[member.team_id] = {
                    ...state[member.team_id],
                    total_unread_threads: member.thread_count || 0,
                    total_unread_mentions: member.thread_mention_count || 0,
                };

                return result;
            }, {}),
        };
    }
    case ThreadTypes.READ_CHANGED_THREAD: {
        const {
            teamId,
            prevUnreadMentions = 0,
            newUnreadMentions = 0,
            prevUnreadReplies = 0,
            newUnreadReplies = 0,
        } = action.data;
        const counts = state[teamId] ? {
            ...state[teamId],
        } : {
            total_unread_threads: 0,
            total: 0,
            total_unread_mentions: 0,
        };
        const unreadMentionDiff = newUnreadMentions - prevUnreadMentions;

        counts.total_unread_mentions += unreadMentionDiff;

        if (newUnreadReplies > 0 && prevUnreadReplies === 0) {
            counts.total_unread_threads += 1;
        } else if (prevUnreadReplies > 0 && newUnreadReplies === 0) {
            counts.total_unread_threads -= 1;
        }

        return {
            ...state,
            [action.data.teamId]: counts,
        };
    }
    case ThreadTypes.RECEIVED_THREADS: {
        return {
            ...state,
            [action.data.team_id]: {
                total: action.data.total,
                total_unread_threads: action.data.total_unread_threads,
                total_unread_mentions: action.data.total_unread_mentions,
            },
        };
    }
    case TeamTypes.LEAVE_TEAM: {
        const team: Team = action.data;

        if (!state[team.id]) {
            return state;
        }

        const nextState = {...state};
        Reflect.deleteProperty(nextState, team.id);

        return nextState;
    }

    case UserTypes.LOGOUT_SUCCESS:
        return {};
    case ChannelTypes.LEAVE_CHANNEL: {
        if (!extra.threadsToDelete || extra.threadsToDelete.length === 0) {
            return state;
        }

        const teamId = action.data.team_id;

        const {unreadMentions, unreadThreads} = extra.threadsToDelete.reduce((curr, item: UserThread) => {
            curr.unreadMentions += item.unread_mentions;
            curr.unreadThreads = item.unread_replies > 0 ? curr.unreadThreads + 1 : curr.unreadThreads;
            return curr;
        }, {unreadMentions: 0, unreadThreads: 0});

        const {total, total_unread_mentions: totalUnreadMentions, total_unread_threads: totalUnreadThreads} = state[teamId];

        return {
            ...state,
            [teamId]: {
                total: Math.max(total - extra.threadsToDelete.length, 0),
                total_unread_mentions: Math.max(totalUnreadMentions - unreadMentions, 0),
                total_unread_threads: Math.max(totalUnreadThreads - unreadThreads, 0),
            },
        };
    }
    }
    return state;
};

function getThreadsOfChannel(threads: ThreadsState['threads'], channelId: string) {
    const threadsToDelete: UserThread[] = [];
    for (const rootId of Object.keys(threads)) {
        if (
            threads[rootId] &&
            threads[rootId].post &&
            threads[rootId].post.channel_id === channelId
        ) {
            threadsToDelete.push(threads[rootId]);
        }
    }

    return threadsToDelete;
}

const initialState = {
    threads: {},
    threadsInTeam: {},
    unreadThreadsInTeam: {},
    counts: {},
};

// custom combineReducers function
// enables passing data between reducers
function reducer(state: ThreadsState = initialState, action: GenericAction): ThreadsState {
    const extra: ExtraData = {};

    // acting as a 'middleware'
    if (action.type === ChannelTypes.LEAVE_CHANNEL) {
        if (!action.data.viewArchivedChannels) {
            extra.threadsToDelete = getThreadsOfChannel(state.threads, action.data.id);
        }
    }

    const nextState = {

        // Object mapping thread ids to thread objects
        threads: threadsReducer(state.threads, action, extra),

        // Object mapping teams ids to thread ids
        threadsInTeam: threadsInTeamReducer(state.threadsInTeam, action, extra),

        // Object mapping teams ids to unread thread ids
        unreadThreadsInTeam: unreadThreadsInTeamReducer(state.unreadThreadsInTeam, action, extra),

        // Object mapping teams ids to unread counts
        counts: countsReducer(state.counts, action, extra),
    };

    if (
        state.threads === nextState.threads &&
        state.threadsInTeam === nextState.threadsInTeam &&
        state.unreadThreadsInTeam === nextState.unreadThreadsInTeam &&
        state.counts === nextState.counts
    ) {
        // None of the children have changed so don't even let the parent object change
        return state;
    }

    return nextState;
}

export default reducer;
