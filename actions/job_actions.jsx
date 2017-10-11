// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import * as JobsActions from 'mattermost-redux/actions/jobs';

import store from 'stores/redux_store.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export async function createJob(job, success, error) {
    const {data, error: err} = await JobsActions.createJob(job)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function cancelJob(jobId, success, error) {
    const {data, error: err} = await JobsActions.cancelJob(jobId)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}
