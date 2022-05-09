// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';
import request from 'superagent';

import {FileTypes} from 'mattermost-redux/action_types';
import {getLogErrorAction} from 'mattermost-redux/actions/errors';
import {forceLogoutIfNecessary} from 'mattermost-redux/actions/helpers';
import {Client4} from 'mattermost-redux/client';

import * as Utils from 'utils/utils';

export function uploadFilez(file, name, channelId, clientId) {
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

function futch(url, opts = {}, onProgress) {
    return new Promise((res, rej) => {
        var xhr = new XMLHttpRequest();

        xhr.open('POST', Client4.getFilesRoute(), true);
        for (const header in Client4.getOptions().headers) {
            if (Client4.getOptions().headers.hasOwnProperty(header)) {
                xhr.setRequestHeader(header, Client4.getOptions().headers[header]);
            }
        }
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = (e) => res(e.target.responseText);
        xhr.onerror = rej;
        if (xhr.upload && onProgress) {
            xhr.upload.onprogress = (e) => {
                e.loaded
            };
            xhr.upload.onprogress = onProgress;
        } // event.loaded / event.total * 100 ; //event.lengthComputable
        xhr.send(opts.body);
    });
}

export function uploadFile(file, name, channelId, clientId) {
    return (dispatch) => {
        dispatch({type: FileTypes.UPLOAD_FILES_REQUEST});

        var xhr = new XMLHttpRequest();

        xhr.open('POST', Client4.getFilesRoute(), true);
        for (const header in Client4.getOptions({method: 'POST'}).headers) {
            if (Client4.getOptions({method: 'POST'}).headers.hasOwnProperty(header)) {
                xhr.setRequestHeader(header, Client4.getOptions({method: 'POST'}).headers[header]);
            }
        }
        xhr.setRequestHeader('Accept', 'application/json');

        const formData = new FormData();

        formData.append('channel_id', channelId);
        formData.append('client_ids', clientId);

        // The order here is important:
        // keeping the channel_id/client_ids fields before the files contents
        // allows the server to stream the uploads instead of loading them in memory.
        formData.append('files', file, name);

        xhr.upload.onprogress = (progressEvent) => {
            const percentCompleted = (progressEvent.loaded / progressEvent.total) * 100;

            console.log('percentCompleted', percentCompleted, progressEvent.loaded, progressEvent.total);
            // this.props.onUploadProgress({
            //     clientId,
            //     name: sortedFiles[i].name,
            //     percent: percentCompleted,
            //     type: sortedFiles[i].type,
            // });
        };

        xhr.send(formData);

        return xhr;
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
