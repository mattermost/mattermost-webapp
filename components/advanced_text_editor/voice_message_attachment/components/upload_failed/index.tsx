// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {CloseIcon, RefreshIcon} from '@mattermost/compass-icons/components';

import {AttachmentContainer, CancelButton, TextColumn, Title, Subtitle} from '../containers';

interface Props {
    onRetry: () => void;
    onCancel: () => void;
}

const VoiceMessageRecordingFailed = (props: Props) => {
    const intl = useIntl();

    const errorMessage = intl.formatMessage({
        id: 'voiceMessage.uploadFailed',
        defaultMessage: 'Upload failed. Click to retry.',
    });

    return (
        <AttachmentContainer
            icon={(
                <RefreshIcon
                    size={24}
                    color='#FFFFFF'
                />
            )}
            iconDanger={true}
            onIconClick={props.onRetry}
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
        </AttachmentContainer>
    );
};

export default VoiceMessageRecordingFailed;

