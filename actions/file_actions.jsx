// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';
import request from 'superagent';
import {FileTypes} from 'mattermost-redux/action_types';
import {getLogErrorAction} from 'mattermost-redux/actions/errors';
import {forceLogoutIfNecessary} from 'mattermost-redux/actions/helpers';
import {Client4} from 'mattermost-redux/client';

import * as Utils from 'utils/utils.jsx';

export function uploadFile(file, name, channelId, rootId, clientId) {
    return (dispatch) => {
        dispatch({type: FileTypes.UPLOAD_FILES_REQUEST});

        return request.
            post(Client4.getFilesRoute()).
            set(Client4.getOptions({method: 'post'}).headers).

            // The order here is important:
            // keeping the channel_id/client_ids fields before the files contents
            // allows the server to stream the uploads instead of loading them in memory.
            field('channel_id', channelId).
            field('client_ids', clientId).
            attach('files', file, name).
            accept('application/json');
    };
}

export function handleFileUploadEnd(file, name, channelId, rootId, clientId, {err, res}) {
    return (dispatch, getState) => {
        if (err) {
            let e;
            if (res && res.body && res.body.id) {
                e = res.body;
            } else if (err.status === 0 || !err.status) {
                e = {message: Utils.localizeMessage('file_upload.generic_error', 'There was a problem uploading your files.')};
            } else {
                e = {message: Utils.localizeMessage('channel_loader.unknown_error', 'We received an unexpected status code from the server.') + ' (' + err.status + ')'};
            }

            forceLogoutIfNecessary(err, dispatch, getState);

            const failure = {
                type: FileTypes.UPLOAD_FILES_FAILURE,
                clientIds: [clientId],
                channelId,
                rootId,
                error: err,
            };

            dispatch(batchActions([failure, getLogErrorAction(err)]));
            return {error: e};
        }
        const data = res.body.file_infos.map((fileInfo, index) => {
            return {
                ...fileInfo,
                clientId: res.body.client_ids[index],
            };
        });

        dispatch(batchActions([
            {
                type: FileTypes.RECEIVED_UPLOAD_FILES,
                data,
                channelId,
                rootId,
            },
            {
                type: FileTypes.UPLOAD_FILES_SUCCESS,
            },
        ]));

        return {data: res.body};
    };
}
