// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {CloseIcon, MicrophoneOutlineIcon, RefreshIcon} from '@mattermost/compass-icons/components';

import {
    AttachmentRootContainer,
    CancelButton,
    TextColumn,
    Title,
    Subtitle,
} from 'components/advanced_text_editor/voice_message_attachment/components/file_attachment_containers';

interface Props {
    recordedAudio?: File;
    onRetry: () => void;
    onCancel: () => void;
}

const VoiceMessageRecordingFailed = (props: Props) => {
    const intl = useIntl();

    let errorMessage;
    if (props.recordedAudio) {
        errorMessage = intl.formatMessage({
            id: 'voiceMessage.uploadFailed.retry',
            defaultMessage: 'Upload failed. Click to retry.',
        });
    } else {
        errorMessage = intl.formatMessage({
            id: 'voiceMessage.uploadFailed.tryAgain',
            defaultMessage: 'Upload failed. Please try again.',
        });
    }

    return (
        <AttachmentRootContainer
            icon={props.recordedAudio ? (
                <RefreshIcon
                    size={24}
                    color='#FFFFFF'
                />
            ) : (
                <MicrophoneOutlineIcon
                    size={24}
                    color='#FFFFFF'
                />
            )}
            iconDanger={true}
            onIconClick={props.recordedAudio ? props.onRetry : undefined}
        >
            <TextColumn>
                <Title>
                    <FormattedMessage
                        id='voiceMessage.preview.title'
                        defaultMessage='Voice message'
                    />
                </Title>
                <Subtitle title={errorMessage}>
                    {errorMessage}
                </Subtitle>
            </TextColumn>
            <CancelButton onClick={props.onCancel}>
                <CloseIcon
                    size={18}
                />
            </CancelButton>
        </AttachmentRootContainer>
    );
};

export default VoiceMessageRecordingFailed;

