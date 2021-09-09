// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChannelTypes, PostTypes, TeamTypes, ThreadTypes, UserTypes} from 'mattermost-redux/action_types';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Team} from 'mattermost-redux/types/teams';
import {ThreadsState, UserThread} from 'mattermost-redux/types/threads';

export type ExtraData = {
    threadsToDelete?: UserThread[];
}

type State = ThreadsState['threadsInTeam'] | ThreadsState['unreadThreadsInTeam'];

function handlePostRemoved(state: State, action: GenericAction) {
    const post = action.data;
    if (post.root_id) {
        return state;
    }

    const teamId = Object.keys(state).
        find((id) => state[id].indexOf(post.id) !== -1);

    if (!teamId) {
        return state;
    }

    const index = state[teamId].indexOf(post.id);

    return {
        ...state,
        [teamId]: [
            ...state[teamId].slice(0, index),
            ...state[teamId].slice(index + 1),
        ],
    };
}

function handleReceiveThreads(state: State, action: GenericAction) {
    const nextSet = new Set(state[action.data.team_id] || []);

    action.data.threads.forEach((thread: UserThread) => {
        nextSet.add(thread.id);
    });

    return {
        ...state,
        [action.data.team_id]: [...nextSet],
    };
}

function handleLeaveChannel(state: State, action: GenericAction, extra: ExtraData) {
    if (!extra.threadsToDelete || extra.threadsToDelete.length === 0) {
        return state;
    }

    const teamId = action.data.team_id;

    let threadDeleted = false;

    // Remove entries for any thread in the channel
    const nextState = {...state};
    for (const thread of extra.threadsToDelete) {
        if (nextState[teamId]) {
            const index = nextState[teamId].indexOf(thread.id);
            nextState[teamId] = [...nextState[teamId].slice(0, index), ...nextState[teamId].slice(index + 1)];
            threadDeleted = true;
        }
    }

    if (!threadDeleted) {
        // Nothing was actually removed
        return state;
    }

    return nextState;
}

function handleLeaveTeam(state: State, action: GenericAction) {
    const team: Team = action.data;

    if (!state[team.id]) {
        return state;
    }

    const nextState = {...state};
    Reflect.deleteProperty(nextState, team.id);

    return nextState;
}
export const threadsInTeamReducer = (state: ThreadsState['threadsInTeam'] = {}, action: GenericAction, extra: ExtraData) => {
    switch (action.type) {
    case PostTypes.POST_REMOVED:
        return handlePostRemoved(state, action);
    case ThreadTypes.RECEIVED_THREADS:
        return handleReceiveThreads(state, action);
    case ThreadTypes.RECEIVED_THREAD: {
        if (state[action.data.team_id]?.includes(action.data.thread.id)) {
            return state;
        }

        const nextSet = new Set(state[action.data.team_id]);

        nextSet.add(action.data.thread.id);

        return {
            ...state,
            [action.data.team_id]: [...nextSet],
        };
    }
    case TeamTypes.LEAVE_TEAM:
        return handleLeaveTeam(state, action);
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    case ChannelTypes.LEAVE_CHANNEL:
        return handleLeaveChannel(state, action, extra);
    }

    return state;
};

export const unreadThreadsInTeamReducer = (state: ThreadsState['unreadThreadsInTeam'] = {}, action: GenericAction, extra: ExtraData) => {
    switch (action.type) {
    case ThreadTypes.READ_CHANGED_THREAD: {
        const {
            id,
            teamId,
            newUnreadMentions,
            newUnreadReplies,
        } = action.data;
        const team = state[teamId] || [];

        // if the thread is unread keep it or add it
        if (newUnreadReplies || newUnreadMentions) {
            const newSet = new Set(team);
            newSet.add(id);

            return {
                ...state,
                [teamId]: [...newSet],
            };
        }

        // if the thread is read remove it
        const index = team.indexOf(id);
        if (index === -1) {
            return state;
        }

        return {
            ...state,
            [teamId]: [
                ...team.slice(0, index),
                ...team.slice(index + 1),
            ],
        };
    }
    case PostTypes.POST_REMOVED:
        return handlePostRemoved(state, action);
    case ThreadTypes.RECEIVED_UNREAD_THREADS:
        return handleReceiveThreads(state, action);
    case TeamTypes.LEAVE_TEAM:
        return handleLeaveTeam(state, action);
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    case ChannelTypes.LEAVE_CHANNEL:
        return handleLeaveChannel(state, action, extra);
    }
    return state;
};
