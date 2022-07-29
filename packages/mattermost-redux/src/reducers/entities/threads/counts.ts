// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChannelTypes, TeamTypes, ThreadTypes, UserTypes} from 'mattermost-redux/action_types';
import {GenericAction} from 'mattermost-redux/types/actions';
import {ThreadsState, UserThread} from '@mattermost/types/threads';
import {Team, TeamUnread} from '@mattermost/types/teams';
import {Channel} from '@mattermost/types/channels';

import Constants from 'utils/constants';

import {ExtraData} from './types';

function isDmGmChannel(channelType: Channel['type']) {
    return channelType === Constants.DM_CHANNEL || channelType === Constants.GM_CHANNEL;
}

function handleAllTeamThreadsRead(state: ThreadsState['counts'], action: GenericAction): ThreadsState['counts'] {
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

function isEqual(state: ThreadsState['counts'], action: GenericAction, unreads: boolean) {
    const counts = state[action.data.team_id] ?? {};

    const {
        total,
        total_unread_threads: totalUnreadThreads,
        total_unread_mentions: totalUnreadMentions,
    } = action.data;

    if (
        totalUnreadMentions !== counts.total_unread_mentions ||
        totalUnreadThreads !== counts.total_unread_threads
    ) {
        return false;
    }

    // in unread threads we exclude saving the total number,
    // since it doesn't reflect the actual total of threads
    // but only the total of unread threads
    if (!unreads && total !== counts.total) {
        return false;
    }

    return true;
}

function handleReadChangedThread(state: ThreadsState['counts'], action: GenericAction, teamId: string): ThreadsState['counts'] {
    const {
        prevUnreadMentions = 0,
        newUnreadMentions = 0,
        prevUnreadReplies = 0,
        newUnreadReplies = 0,
    } = action.data;
    const counts = state[teamId] ? {
        ...state[teamId],
    } : {
        total_unread_threads: prevUnreadReplies,
        total: 1,
        total_unread_mentions: prevUnreadMentions,
    };

    const unreadMentionDiff = newUnreadMentions - prevUnreadMentions;

    counts.total_unread_mentions = Math.max(counts.total_unread_mentions + unreadMentionDiff, 0);

    if (newUnreadReplies > 0 && prevUnreadReplies === 0) {
        counts.total_unread_threads += 1;
    } else if (prevUnreadReplies > 0 && newUnreadReplies === 0) {
        counts.total_unread_threads = Math.max(counts.total_unread_threads - 1, 0);
    }

    return {
        ...state,
        [teamId]: counts,
    };
}

function handleLeaveTeam(state: ThreadsState['counts'], action: GenericAction): ThreadsState['counts'] {
    const team: Team = action.data;

    if (!state[team.id]) {
        return state;
    }

    const nextState = {...state};
    Reflect.deleteProperty(nextState, team.id);

    return nextState;
}

function handleLeaveChannel(state: ThreadsState['counts'] = {}, action: GenericAction, extra: ExtraData) {
    if (!extra.threadsToDelete || extra.threadsToDelete.length === 0) {
        return state;
    }

    const teamId = action.data.team_id;

    if (!teamId || !state[teamId]) {
        return state;
    }

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

function handleDecrementThreadCounts(state: ThreadsState['counts'], action: GenericAction) {
    const {teamId, replies, mentions} = action;
    const counts = state[teamId];
    if (!counts) {
        return state;
    }

    return {
        ...state,
        [teamId]: {
            total: Math.max(counts.total - 1, 0),
            total_unread_mentions: Math.max(counts.total_unread_mentions - mentions, 0),
            total_unread_threads: Math.max(counts.total_unread_threads - replies, 0),
        },
    };
}

export function countsIncludingDirectReducer(state: ThreadsState['counts'] = {}, action: GenericAction, extra: ExtraData) {
    switch (action.type) {
    case ThreadTypes.ALL_TEAM_THREADS_READ:
        return handleAllTeamThreadsRead(state, action);
    case ThreadTypes.READ_CHANGED_THREAD: {
        const {teamId, channelType} = action.data;
        if (teamId === '' || isDmGmChannel(channelType)) {
            const teamIds = new Set(Object.keys(state));

            // if the case of dm/gm make sure we add counts for all teams
            if (teamId !== '') {
                teamIds.add(teamId);
            }

            let newState = {...state};
            teamIds.forEach((teamId) => {
                newState = handleReadChangedThread(newState, action, teamId);
            });

            return newState;
        }

        return handleReadChangedThread(state, action, teamId);
    }
    case ThreadTypes.FOLLOW_CHANGED_THREAD: {
        const {team_id: teamId, following} = action.data;
        const counts = state[teamId];

        if (counts?.total == null) {
            return state;
        }

        return {
            ...state,
            [teamId]: {
                ...counts,
                total: following ? counts.total + 1 : counts.total - 1,
            },
        };
    }
    case TeamTypes.LEAVE_TEAM:
        return handleLeaveTeam(state, action);
    case ChannelTypes.RECEIVED_CHANNEL_DELETED:
    case ChannelTypes.LEAVE_CHANNEL:
        return handleLeaveChannel(state, action, extra);
    case ThreadTypes.RECEIVED_THREAD_COUNTS:
        if (isEqual(state, action, false)) {
            return state;
        }

        return {
            ...state,
            [action.data.team_id]: {
                total: action.data.total,
                total_unread_threads: action.data.total_unread_threads,
                total_unread_mentions: action.data.total_unread_mentions,
            },
        };
    case ThreadTypes.DECREMENT_THREAD_COUNTS:
        return handleDecrementThreadCounts(state, action);
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    }
    return state;
}

export function countsReducer(state: ThreadsState['counts'] = {}, action: GenericAction, extra: ExtraData) {
    switch (action.type) {
    case ThreadTypes.ALL_TEAM_THREADS_READ:
        return handleAllTeamThreadsRead(state, action);
    case ThreadTypes.READ_CHANGED_THREAD:
        if (isDmGmChannel(action.data.channelType)) {
            return state;
        }
        return handleReadChangedThread(state, action, action.data.teamId);
    case TeamTypes.LEAVE_TEAM:
        return handleLeaveTeam(state, action);
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    case ChannelTypes.RECEIVED_CHANNEL_DELETED:
    case ChannelTypes.LEAVE_CHANNEL:
        return handleLeaveChannel(state, action, extra);
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
    case ThreadTypes.DECREMENT_THREAD_COUNTS: {
        if (isDmGmChannel(action.channelType)) {
            return state;
        }
        return handleDecrementThreadCounts(state, action);
    }
    }
    return state;
}
