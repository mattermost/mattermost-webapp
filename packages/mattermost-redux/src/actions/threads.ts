// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {uniq} from 'lodash';

import {ThreadTypes, PostTypes, UserTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';

import ThreadConstants from 'mattermost-redux/constants/threads';

import {DispatchFunc, GetStateFunc, batchActions} from 'mattermost-redux/types/actions';

import type {UserThread, UserThreadList} from 'mattermost-redux/types/threads';

import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {getThreadsInChannel} from 'mattermost-redux/selectors/entities/threads';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import {logError} from './errors';
import {forceLogoutIfNecessary} from './helpers';

export function getThreads(userId: string, teamId: string, {before = '', after = '', perPage = ThreadConstants.THREADS_CHUNK_SIZE, unread = false} = {}) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let userThreadList: undefined | UserThreadList;

        try {
            userThreadList = await Client4.getUserThreads(userId, teamId, {before, after, perPage, extended: false, unread});
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        if (userThreadList?.threads?.length) {
            await dispatch(getMissingProfilesByIds(uniq(userThreadList.threads.map(({participants}) => participants.map(({id}) => id)).flat())));

            dispatch({
                type: PostTypes.RECEIVED_POSTS,
                data: {posts: userThreadList.threads.map(({post}) => ({...post, update_at: 0}))},
            });
        }

        dispatch({
            type: ThreadTypes.RECEIVED_THREADS,
            data: {
                ...userThreadList,
                threads: userThreadList?.threads?.map((thread) => ({...thread, is_following: true})) ?? [],
                team_id: teamId,
            },
        });

        return {data: userThreadList};
    };
}

export function handleThreadArrived(dispatch: DispatchFunc, getState: GetStateFunc, threadData: UserThread, teamId: string) {
    const state = getState();
    const currentUserId = getCurrentUserId(state);
    const currentTeamId = getCurrentTeamId(state);
    const thread = {...threadData, is_following: true};

    dispatch({
        type: UserTypes.RECEIVED_PROFILES_LIST,
        data: thread.participants.filter((user) => user.id !== currentUserId),
    });

    dispatch({
        type: PostTypes.RECEIVED_POST,
        data: {...thread.post, update_at: 0},
    });

    dispatch({
        type: ThreadTypes.RECEIVED_THREAD,
        data: {
            thread,
            team_id: teamId || currentTeamId,
        },
    });

    const oldThreadData = state.entities.threads.threads[threadData.id];
    handleReadChanged(
        dispatch,
        thread.id,
        teamId || currentTeamId,
        thread.post.channel_id,
        {
            lastViewedAt: thread.last_viewed_at,
            prevUnreadMentions: oldThreadData?.unread_mentions ?? 0,
            newUnreadMentions: thread.unread_mentions,
            prevUnreadReplies: oldThreadData?.unread_replies ?? 0,
            newUnreadReplies: thread.unread_replies,
        },
    );

    return thread;
}

export function getThread(userId: string, teamId: string, threadId: string, extended = true) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let thread;
        try {
            thread = await Client4.getUserThread(userId, teamId, threadId, extended);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        if (thread) {
            thread = handleThreadArrived(dispatch, getState, thread, teamId);
        }

        return {data: thread};
    };
}

export function handleAllMarkedRead(dispatch: DispatchFunc, teamId: string) {
    dispatch({
        type: ThreadTypes.ALL_TEAM_THREADS_READ,
        data: {
            team_id: teamId,
        },
    });
}

export function markAllThreadsInTeamRead(userId: string, teamId: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        try {
            await Client4.updateThreadsReadForUser(userId, teamId);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        handleAllMarkedRead(dispatch, teamId);

        return {};
    };
}

export function updateThreadRead(userId: string, teamId: string, threadId: string, timestamp: number) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        try {
            await Client4.updateThreadReadForUser(userId, teamId, threadId, timestamp);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        return {};
    };
}

export function handleReadChanged(
    dispatch: DispatchFunc,
    threadId: string,
    teamId: string,
    channelId: string,
    {
        lastViewedAt,
        prevUnreadMentions,
        newUnreadMentions,
        prevUnreadReplies,
        newUnreadReplies,
    }: {
        lastViewedAt: number;
        prevUnreadMentions: number;
        newUnreadMentions: number;
        prevUnreadReplies: number;
        newUnreadReplies: number;
    },
) {
    dispatch({
        type: ThreadTypes.READ_CHANGED_THREAD,
        data: {
            id: threadId,
            teamId,
            channelId,
            lastViewedAt,
            prevUnreadMentions,
            newUnreadMentions,
            prevUnreadReplies,
            newUnreadReplies,
        },
    });
}

export function handleFollowChanged(dispatch: DispatchFunc, threadId: string, teamId: string, following: boolean) {
    dispatch({
        type: ThreadTypes.FOLLOW_CHANGED_THREAD,
        data: {
            id: threadId,
            team_id: teamId,
            following,
        },
    });
}

export function setThreadFollow(userId: string, teamId: string, threadId: string, newState: boolean) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        handleFollowChanged(dispatch, threadId, teamId, newState);

        try {
            await Client4.updateThreadFollowForUser(userId, teamId, threadId, newState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }
        return {};
    };
}

export function handleAllThreadsInChannelMarkedRead(dispatch: DispatchFunc, getState: GetStateFunc, channelId: string, lastViewedAt: number) {
    const state = getState();
    const threadsInChannel = getThreadsInChannel(state, channelId);
    const channel = getChannel(state, channelId);
    if (channel == null) {
        return;
    }
    const teamId = channel.team_id;
    const actions = [];

    for (const id of threadsInChannel) {
        actions.push({
            type: ThreadTypes.READ_CHANGED_THREAD,
            data: {
                id,
                channelId,
                teamId,
                lastViewedAt,
                newUnreadMentions: 0,
                newUnreadReplies: 0,
            },
        });
    }

    dispatch(batchActions(actions));
}
