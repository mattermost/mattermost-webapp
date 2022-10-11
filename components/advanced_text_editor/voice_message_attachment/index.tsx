// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {uploadFile} from 'actions/file_actions';
import {generateId} from 'utils/utils';
import {VoiceMessageStates} from 'utils/post_utils';
import {PostDraft} from 'types/store/draft';
import {AudioFileExtensions, Locations} from 'utils/constants';

import {Channel} from '@mattermost/types/channels';
import {Post} from '@mattermost/types/posts';
import {FileInfo, FileUploadResponse} from '@mattermost/types/files';
import {ServerError} from '@mattermost/types/errors';

import {FilePreviewInfo} from 'components/file_preview/file_preview';
import VoiceMessageRecordingStarted from 'components/advanced_text_editor/voice_message_attachment/components/recording_started';
import VoiceMessageUploadingStarted from 'components/advanced_text_editor/voice_message_attachment/components/upload_started';
import VoiceMessageUploadingFailed from 'components/advanced_text_editor/voice_message_attachment/components/upload_failed';
import VoiceMessageAttachmentPlayer from 'components/voice_message_attachment_player';

declare global {
    interface Window {
        webkitAudioContext: AudioContext;
    }
}

interface Props {
    channelId: Channel['id'];
    rootId: Post['id'];
    draft: PostDraft;
    location: string;
    vmState: VoiceMessageStates;
    didUploadFail: boolean;
    uploadingClientId: string;
    setDraftAsPostType: (channelOrRootId: Channel['id'] | Post['id'], draft: PostDraft) => void;
    onUploadStart: (clientIds: string, channelOrRootId: Channel['id'] | Post['id']) => void;
    uploadProgress: number;
    onUploadProgress: (filePreviewInfo: FilePreviewInfo) => void;
    onUploadComplete: (fileInfos: FileInfo[], clientIds: string[], channelId: Channel['id'], rootId?: Post['id']) => void;
    onUploadError: (err: string | ServerError, clientId?: string, channelId?: Channel['id'], rootId?: Post['id']) => void;
    onRemoveDraft: (fileInfoIdOrClientId: FileInfo['id'] | string) => void;
}

const VoiceMessageAttachment = (props: Props) => {
    const theme = useSelector(getTheme);

    const dispatch = useDispatch();

    const xmlRequestRef = useRef<XMLHttpRequest>();

    const audioFileRef = useRef<File>();

    function handleOnUploadComplete(data: FileUploadResponse | undefined, channelId: string, rootId: string) {
        if (data) {
            props.onUploadComplete(data.file_infos, data.client_ids, channelId, rootId);
        }
    }

    function uploadRecording(recordedAudioFile: File) {
        const clientId = generateId();

        xmlRequestRef.current = dispatch(uploadFile({
            file: recordedAudioFile,
            name: recordedAudioFile.name,
            type: AudioFileExtensions.MP3,
            rootId: props.rootId || '',
            channelId: props.channelId,
            clientId,
            onProgress: props.onUploadProgress,
            onSuccess: handleOnUploadComplete,
            onError: props.onUploadError,
        })) as unknown as XMLHttpRequest;

        if (props.location === Locations.CENTER) {
            props.onUploadStart(clientId, props.channelId);
        }
        if (props.location === Locations.RHS_COMMENT) {
            props.onUploadStart(clientId, props.rootId);
        }
    }

    function handleUploadRetryClicked() {
        if (audioFileRef.current) {
            uploadRecording(audioFileRef.current);
        }
    }

    function handleRemoveBeforeUpload() {
        if (xmlRequestRef.current) {
            xmlRequestRef.current.abort();
        }

        props.onRemoveDraft(props.uploadingClientId);
    }

    function handleRemoveAfterUpload() {
        const audioFileId = props.draft?.fileInfos?.[0]?.id ?? '';
        if (audioFileId) {
            props.onRemoveDraft(audioFileId);
        }
    }

    async function handleCompleteRecordingClicked(audioFile: File) {
        audioFileRef.current = audioFile;
        uploadRecording(audioFile);
    }

    function handleCancelRecordingClicked() {
        if (props.location === Locations.CENTER) {
            props.setDraftAsPostType(props.channelId, props.draft);
        }
        if (props.location === Locations.RHS_COMMENT) {
            props.setDraftAsPostType(props.rootId, props.draft);
        }
    }

    if (props.vmState === VoiceMessageStates.RECORDING) {
        return (
            <VoiceMessageRecordingStarted
                theme={theme}
                onCancel={handleCancelRecordingClicked}
                onComplete={handleCompleteRecordingClicked}
            />
        );
    }

    if (props.vmState === VoiceMessageStates.UPLOADING) {
        return (
            <VoiceMessageUploadingStarted
                theme={theme}
                progress={props.uploadProgress}
                onCancel={handleRemoveBeforeUpload}
            />
        );
    }

    if (props.didUploadFail) {
        return (
            <VoiceMessageUploadingFailed
                recordedAudio={audioFileRef.current}
                onRetry={handleUploadRetryClicked}
                onCancel={handleRemoveAfterUpload}
            />
        );
    }

    if (props.vmState === VoiceMessageStates.ATTACHED) {
        const src = props?.draft?.fileInfos?.[0]?.id ?? '';

        return (
            <div className='file-preview__container'>
                <VoiceMessageAttachmentPlayer
                    fileId={src}
                    onCancel={handleRemoveAfterUpload}
                />
            </div>
        );
    }

    return null;
};

export default memo(VoiceMessageAttachment);
