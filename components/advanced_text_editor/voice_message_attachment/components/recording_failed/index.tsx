// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {MicrophoneOutlineIcon, CloseIcon} from '@mattermost/compass-icons/components';

import {
    AttachmentRootContainer,
    CancelButton,
    TextColumn,
    Title,
    Subtitle,
} from 'components/advanced_text_editor/voice_message_attachment/components/file_attachment_containers';

interface Props {
    onCancel: () => void;
}

const VoiceMessageRecordingFailed = (props: Props) => {
    const intl = useIntl();

    const errorMessage = intl.formatMessage({
        id: 'voiceMessage.recordingFailed',
        defaultMessage: 'Failed to record',
    });

    return (
        <AttachmentRootContainer
            icon={(
                <MicrophoneOutlineIcon
                    size={24}
                    color='#FFFFFF'
                />
            )}
            iconDanger={true}
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

