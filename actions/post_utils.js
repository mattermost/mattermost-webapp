// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';
import {PostTypes} from 'mattermost-redux/action_types';
import {
    markChannelAsRead,
    markChannelAsUnread,
    markChannelAsViewed,
} from 'mattermost-redux/actions/channels';
import * as PostActions from 'mattermost-redux/actions/posts';
import {WebsocketEvents} from 'mattermost-redux/constants';
import * as PostSelectors from 'mattermost-redux/selectors/entities/posts';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {
    isFromWebhook,
    isSystemMessage,
    shouldIgnorePost,
} from 'mattermost-redux/utils/post_utils';

import {sendDesktopNotification} from 'actions/notification_actions.jsx';

import {ActionTypes} from 'utils/constants';

export function completePostReceive(post, websocketMessageProps) {
    return async (dispatch, getState) => {
        const state = getState();

        const rootPost = PostSelectors.getPost(state, post.root_id);
        if (post.root_id && !rootPost) {
            const {data: posts} = await dispatch(PostActions.getPostThread(post.root_id));
            if (posts) {
                dispatch(lastPostActions(post, websocketMessageProps));
            }

            return;
        }

        dispatch(lastPostActions(post, websocketMessageProps));
    };
}

export function lastPostActions(post, websocketMessageProps) {
    return (dispatch, getState) => {
        const currentChannelId = getCurrentChannelId(getState());

        if (post.channel_id === currentChannelId) {
            dispatch({
                type: ActionTypes.INCREASE_POST_VISIBILITY,
                data: post.channel_id,
                amount: 1,
            });
        }

        // Need manual dispatch to remove pending post
        const actions = [{
            type: PostTypes.RECEIVED_POSTS,
            data: {
                order: [],
                posts: {
                    [post.id]: post,
                },
            },
            channelId: post.channel_id,
        }, {
            type: WebsocketEvents.STOP_TYPING,
            data: {
                id: post.channel_id + post.root_id,
                userId: post.user_id,
                now: post.create_at,
            },
        }];

        dispatch(batchActions(actions));

        // Still needed to update unreads

        dispatch(setChannelReadAndView(post, websocketMessageProps));

        dispatch(sendDesktopNotification(post, websocketMessageProps));
    };
}

export function setChannelReadAndView(post, websocketMessageProps) {
    return (dispatch, getState) => {
        const state = getState();
        if (shouldIgnorePost(post)) {
            return;
        }

        let markAsRead = false;
        let markAsReadOnServer = false;
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

        if (markAsRead) {
            dispatch(markChannelAsRead(post.channel_id, null, markAsReadOnServer));
            dispatch(markChannelAsViewed(post.channel_id));
        } else {
            dispatch(markChannelAsUnread(websocketMessageProps.team_id, post.channel_id, websocketMessageProps.mentions));
        }
    };
}
