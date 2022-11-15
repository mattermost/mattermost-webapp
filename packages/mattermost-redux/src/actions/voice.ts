// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {VoiceTypes} from '../action_types';
import {ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';
import {uploadFile} from 'actions/file_actions';
import {generateId} from 'utils/utils';
import {Client4} from 'mattermost-redux/client';
import {PostTypes} from 'mattermost-redux/action_types';
import {Posts} from 'mattermost-redux/constants';

function openRecordingModal(): ActionFunc {
    return (dispatch: DispatchFunc) => {
        dispatch({
            type: VoiceTypes.OPEN_RECORDING_MODAL,
        });
    };
}

function closeRecordingModal(): ActionFunc {
    return (dispatch: DispatchFunc) => {
        dispatch({
            type: VoiceTypes.CLOSE_RECORDING_MODAL,
        });
    };
}

export function stopRecording(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        closeRecordingModal()(dispatch);
    };
}

export function startRecording(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        openRecordingModal()(dispatch);
    };
}

export function sendRecording(channelId: string, rootId: string, record: File, duration: number) {
    return async (dispatch: DispatchFunc) => {
        const clientId = generateId();
        const filename = `${new Date().getTime()}.mp3`;
        const onSuccess = async (response: any, cId: string, rId: string) => {
            const data = {
                channel_id: cId,
                root_id: rId,
                message: 'Voice Message',
                type: Posts.POST_TYPES.VOICE,
                props: {
                    fileId: response.file_infos[0].id,
                    duration,
                },
            };
            const result = await Client4.createVoiceRecord(data);

            dispatch({
                type: PostTypes.RECEIVED_NEW_POST,
                data: result,
            });
        };
        const onError = ({message}: {message: string}) => {
            return message;
        };

        try {
            await dispatch(uploadFile({file: record, name: filename, type: record.type, rootId, channelId, clientId, onSuccess, onError, onProgress: () => null}));
        } catch (e) {
            return e;
        }
        stopRecording()(dispatch);

        return {data: true};
    };
}
