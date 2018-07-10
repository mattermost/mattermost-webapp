// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {bindClientFunc} from 'mattermost-redux/actions/helpers';
import {PostTypes} from 'mattermost-redux/action_types';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {ActionTypes} from 'utils/constants.jsx';

function rethreadPostHelper(post) {
    return bindClientFunc(
        Client4.updatePost,
        PostTypes.EDIT_POST_REQUEST,
        [PostTypes.RECEIVED_POST, PostTypes.EDIT_POST_SUCCESS],
        PostTypes.EDIT_POST_FAILURE,
        post
    );
}

export function rethreadPost(post) {
    return async (dispatch, getState) => {
        const result = await rethreadPostHelper(post)(dispatch, getState);

        if (result.error) {
            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_ERROR,
                err: {
                    id: result.error.server_error_id,
                    ...result.error,
                },
                method: 'rethreadPost',
            });
        }

        return result;
    };
}
