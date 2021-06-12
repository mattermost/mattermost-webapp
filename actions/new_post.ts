// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as Redux from 'redux';
import {batchActions} from 'redux-batched-actions';

import {isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {
    actionsToMarkChannelAsRead,
    actionsToMarkChannelAsUnread,
    actionsToMarkChannelAsViewed,
    markChannelAsReadOnServer,
} from 'mattermost-redux/actions/channels';
import * as PostActions from 'mattermost-redux/actions/posts';
import {updateThreadRead} from 'mattermost-redux/actions/threads';

import {WebsocketEvents} from 'mattermost-redux/constants';

import {getCurrentChannelId, isManuallyUnread} from 'mattermost-redux/selectors/entities/channels';
import * as PostSelectors from 'mattermost-redux/selectors/entities/posts';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getThread} from 'mattermost-redux/selectors/entities/threads';

import {ActionFunc, DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {Post} from 'mattermost-redux/types/posts';

import {
    isFromWebhook,
    isSystemMessage,
    shouldIgnorePost,
} from 'mattermost-redux/utils/post_utils';

import {GlobalState} from 'types/store';

import {updateThreadLastOpened} from 'actions/views/threads';
import {sendDesktopNotification} from 'actions/notification_actions.jsx';

import {ActionTypes} from 'utils/constants';
import {isThreadOpen, makeGetThreadLastViewedAt} from 'selectors/views/threads';

type NewPostMessageProps = {
    mentions: string[];
    team_id: string;
}

export function completePostReceive(post: Post, websocketMessageProps: NewPostMessageProps, fetchedChannelMember: boolean): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const rootPost = PostSelectors.getPost(state, post.root_id);
        if (post.root_id && !rootPost) {
            const result = await dispatch(PostActions.getPostThread(post.root_id));

            if ('error' in result) {
                return result;
            }
        }
        const actions: Redux.AnyAction[] = [];

        if (post.channel_id === getCurrentChannelId(getState())) {
            actions.push({
                type: ActionTypes.INCREASE_POST_VISIBILITY,
                data: post.channel_id,
                amount: 1,
            });
        }

        const collapsedThreadsEnabled = isCollapsedThreadsEnabled(state);

        actions.push(
            PostActions.receivedNewPost(post, collapsedThreadsEnabled),
            {
                type: WebsocketEvents.STOP_TYPING,
                data: {
                    id: post.channel_id + post.root_id,
                    userId: post.user_id,
                    now: Date.now(),
                },
            },
            ...setChannelReadAndViewed(dispatch, getState, post, websocketMessageProps, fetchedChannelMember),
        );

        dispatch(batchActions(actions));

        if (collapsedThreadsEnabled && post.root_id) {
            dispatch(setThreadRead(post));
        }

        return dispatch(sendDesktopNotification(post, websocketMessageProps) as unknown as ActionFunc);
    };
}

// setChannelReadAndViewed returns an array of actions to mark the channel read and viewed, and it dispatches an action
// to asynchronously mark the channel as read on the server if necessary.
export function setChannelReadAndViewed(dispatch: DispatchFunc, getState: GetStateFunc, post: Post, websocketMessageProps: NewPostMessageProps, fetchedChannelMember: boolean): Redux.AnyAction[] {
    const state = getState();
    const currentUserId = getCurrentUserId(state);

    // ignore system message posts, except when added to a team
    if (shouldIgnorePost(post, currentUserId)) {
        return [];
    }

    let markAsRead = false;
    let markAsReadOnServer = false;

    // Skip marking a channel as read (when the user is viewing a channel)
    // if they have manually marked it as unread.
    if (!isManuallyUnread(getState(), post.channel_id)) {
        if (
            post.user_id === getCurrentUserId(state) &&
            !isSystemMessage(post) &&
            !isFromWebhook(post)
        ) {
            markAsRead = true;
            markAsReadOnServer = false;
        } else if (
            post.channel_id === getCurrentChannelId(state) &&
            window.isActive
        ) {
            markAsRead = true;
            markAsReadOnServer = true;
        }
    }

    if (markAsRead) {
        if (markAsReadOnServer) {
            dispatch(markChannelAsReadOnServer(post.channel_id));
        }

        return [
            ...actionsToMarkChannelAsRead(getState, post.channel_id),
            ...actionsToMarkChannelAsViewed(getState, post.channel_id),
        ];
    }

    return actionsToMarkChannelAsUnread(getState, websocketMessageProps.team_id, post.channel_id, websocketMessageProps.mentions, fetchedChannelMember, post.root_id === '');
}

export function setThreadRead(post: Post) {
    const getThreadLastViewedAt = makeGetThreadLastViewedAt();
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;

        const currentUserId = getCurrentUserId(state);
        const thread = getThread(state, post.root_id);
        const currentTeamId = getCurrentTeamId(state);

        // mark a thread as read (when the user is viewing the thread)
        if (
            thread &&
            post.user_id !== currentUserId &&
            !isSystemMessage(post) &&
            !isFromWebhook(post) &&
            isThreadOpen(state, thread.id)
        ) {
            // update the new messages line (when there are no previous unreads)
            if (thread.last_reply_at < getThreadLastViewedAt(state, thread.id)) {
                dispatch(updateThreadLastOpened(thread.id, post.create_at));
            }

            dispatch(updateThreadRead(currentUserId, currentTeamId, thread.id, post.create_at + 1));
        }

        return {data: true};
    };
}
