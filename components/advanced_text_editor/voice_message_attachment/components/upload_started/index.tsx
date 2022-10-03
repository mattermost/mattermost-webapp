// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {ProgressBar} from 'react-bootstrap';

import {MicrophoneIcon, CloseIcon} from '@mattermost/compass-icons/components';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';

import {AttachmentContainer, CancelButton, TextColumn, Title, Subtitle} from '../containers';

interface Props {
    theme: Theme;
    progress: number;
    onCancel: () => void;
}

const VoiceMessageUploadingStarted = (props: Props) => {
    const percentageUploaded = `(${props.progress}%)`;

    return (
        <AttachmentContainer
            icon={(
                <MicrophoneIcon
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
        </AttachmentContainer>
    );
};

export default VoiceMessageUploadingStarted;

