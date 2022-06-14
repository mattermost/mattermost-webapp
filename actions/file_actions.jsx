// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {FileTypes} from 'mattermost-redux/action_types';
import {getLogErrorAction} from 'mattermost-redux/actions/errors';
import {forceLogoutIfNecessary} from 'mattermost-redux/actions/helpers';
import {Client4} from 'mattermost-redux/client';

import * as Utils from 'utils/utils';

export function uploadFile({file, name, type, rootId, channelId, clientId, onProgress, onSuccess, onError}) {
    return (dispatch, getState) => {
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
        formData.append('files', file, name); // appending file in the end for steaming support

        if (onProgress && xhr.upload) {
            xhr.upload.onprogress = (event) => {
                const percent = parseInt((event.loaded / event.total) * 100, 10);
                onProgress({
                    clientId,
                    name,
                    percent,
                    type,
                });
            };
        }

        if (onSuccess) {
            xhr.onload = () => {
                if (xhr.status === 201 && xhr.readyState === 4) {
                    const response = JSON.parse(xhr.response);
                    const data = response.file_infos.map((fileInfo, index) => {
                        return {
                            ...fileInfo,
                            clientId: response.client_ids[index],
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

                    onSuccess(response, channelId, rootId);
                }
            };
        }

        if (onError) {
            xhr.onerror = () => {
                if (xhr.readyState === 4 && xhr.responseText.length !== 0) {
                    const errorResponse = JSON.parse(xhr.response);

                    forceLogoutIfNecessary(errorResponse, dispatch, getState);

                    const uploadFailureAction = {
                        type: FileTypes.UPLOAD_FILES_FAILURE,
                        clientIds: [clientId],
                        channelId,
                        rootId,
                        error: errorResponse,
                    };

                    dispatch(batchActions([uploadFailureAction, getLogErrorAction(errorResponse)]));
                    onError(errorResponse, clientId, channelId, rootId);
                } else {
                    const errorMessage = xhr.status === 0 || !xhr.status ? {message: Utils.localizeMessage('file_upload.generic_error', 'There was a problem uploading your files.')} : {message: Utils.localizeMessage('channel_loader.unknown_error', 'We received an unexpected status code from the server.') + ' (' + xhr.status + ')'};

                    dispatch({
                        type: FileTypes.UPLOAD_FILES_FAILURE,
                        clientIds: [clientId],
                        channelId,
                        rootId,
                    });

                    onError(errorMessage, clientId, channelId, rootId);
                }
            };
        }

        xhr.send(formData);

        return xhr;
    };
}
