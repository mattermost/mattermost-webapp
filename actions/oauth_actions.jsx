// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import * as IntegrationActions from 'mattermost-redux/actions/integrations';

import store from 'stores/redux_store.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export async function deleteOAuthApp(id, success, error) {
    const {data, error: err} = await IntegrationActions.deleteOAuthApp(id)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}
