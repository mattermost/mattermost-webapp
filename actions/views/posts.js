// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as PostActions from 'mattermost-redux/actions/posts';

import {logError} from 'mattermost-redux/actions/errors';

import {ActionTypes, AnnouncementBarTypes} from 'utils/constants.jsx';

export function editPost(post) {
    return async (dispatch, getState) => {
        const result = await PostActions.editPost(post)(dispatch, getState);

        // Send to error bar if it's an edit post error about time limit.
        if (result.error && result.error.server_error_id === 'api.post.update_post.permissions_time_limit.app_error') {
            dispatch(logError({type: AnnouncementBarTypes.ANNOUNCEMENT, message: result.error.message}, true));
        }

        return result;
    };
}

export function selectAttachmentMenuAction(postId, actionId, cookie, dataSource, text, value) {
    return async (dispatch) => {
        dispatch({
            type: ActionTypes.SELECT_ATTACHMENT_MENU_ACTION,
            postId,
            data: {
                [actionId]: {
                    text,
                    value,
                },
            },
        });

        dispatch(PostActions.doPostActionWithCookie(postId, actionId, cookie, value));
    };
}
