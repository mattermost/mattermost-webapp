// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Client4} from 'mattermost-redux/client';
import {FileTypes} from 'mattermost-redux/action_types';

import {batchActions, DispatchFunc, GetStateFunc, ActionFunc, Action} from 'mattermost-redux/types/actions';

import {FileUploadResponse, FileSearchResultItem} from 'mattermost-redux/types/files';

import {logError} from './errors';
import {bindClientFunc, forceLogoutIfNecessary} from './helpers';

export function receivedFiles(files: Map<string, FileSearchResultItem>): Action {
    return {
        type: FileTypes.RECEIVED_FILES_FOR_SEARCH,
        data: files,
    };
}

export function getFilesForPost(postId: string): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let files;

        try {
            files = await Client4.getFileInfosForPost(postId);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        dispatch({
            type: FileTypes.RECEIVED_FILES_FOR_POST,
            data: files,
            postId,
        });

        return {data: true};
    };
}

export function uploadFile(channelId: string, rootId: string, clientIds: string[], fileFormData: File, formBoundary: string): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        dispatch({type: FileTypes.UPLOAD_FILES_REQUEST, data: {}});

        let files: FileUploadResponse;
        try {
            files = await Client4.uploadFile(fileFormData, formBoundary);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);

            const failure = {
                type: FileTypes.UPLOAD_FILES_FAILURE,
                clientIds,
                channelId,
                rootId,
                error,
            };

            dispatch(batchActions([failure, logError(error)]));
            return {error};
        }

        const data = files.file_infos.map((file, index) => {
            return {
                ...file,
                clientId: files.client_ids[index],
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

        return {data: files};
    };
}

export function getFilePublicLink(fileId: string): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getFilePublicLink,
        onSuccess: FileTypes.RECEIVED_FILE_PUBLIC_LINK,
        params: [
            fileId,
        ],
    });
}
