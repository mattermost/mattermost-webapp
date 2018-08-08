// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {rethreadPost as rethreadPostRedux} from 'mattermost-redux/actions/posts';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import {ActionTypes} from 'utils/constants.jsx';
import store from 'stores/redux_store.jsx';

const doDispatch = store.dispatch;

export function rethreadPost(post) {

    return async (dispatch, getState) => {
        const result = await rethreadPostRedux(post)(dispatch, getState);

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
