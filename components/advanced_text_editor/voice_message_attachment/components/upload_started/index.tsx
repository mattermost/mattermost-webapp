// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {ProgressBar} from 'react-bootstrap';

import {MicrophoneOutlineIcon, CloseIcon} from '@mattermost/compass-icons/components';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';

import {
    AttachmentRootContainer,
    CancelButton,
    TextColumn,
    Title,
    Subtitle,
} from 'components/advanced_text_editor/voice_message_attachment/components/file_attachment_containers';

interface Props {
    theme: Theme;
    progress: number;
    onCancel: () => void;
}

const VoiceMessageUploadingStarted = (props: Props) => {
    const percentageUploaded = `(${props.progress}%)`;

    return (
        <AttachmentRootContainer
            icon={(
                <MicrophoneOutlineIcon
                    size={24}
                    color={props.theme.buttonBg}
                />
            )}
        >
            <TextColumn>
                <Title>
                    <FormattedMessage
                        id='voiceMessage.preview.title'
                        defaultMessage='Voice message'
                    />
                </Title>
                <Subtitle>
                    <FormattedMessage
                        id='voiceMessage.uploading'
                        defaultMessage='Uploading...'
                    />
                    <span>{percentageUploaded}</span>
                </Subtitle>
            </TextColumn>
            <CancelButton onClick={props.onCancel}>
                <CloseIcon
                    size={18}
                />
            </CancelButton>
            <ProgressBar
                className='attachments-progress-bar'
                now={props.progress}
                active={props.progress === 100}
            />
        </AttachmentRootContainer>
    );
};

export default VoiceMessageUploadingStarted;

