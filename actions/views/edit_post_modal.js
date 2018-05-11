// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as PostActions from 'mattermost-redux/actions/posts';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {ActionTypes} from 'utils/constants.jsx';

export function editPost(post) {
    return async (dispatch, getState) => {
        const result = await PostActions.editPost(post)(dispatch, getState);

        if (result.error) {
            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_ERROR,
                err: {
                    id: result.error.server_error_id,
                    ...result.error,
                },
            });
        }

        return result;
    };
}
