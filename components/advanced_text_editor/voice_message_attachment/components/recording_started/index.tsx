// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {forwardRef} from 'react';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';

import {MicrophoneIcon, CloseIcon, CheckIcon} from '@mattermost/compass-icons/components';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';

import {convertSecondsToMSS} from 'utils/datetime';

import {AttachmentContainer, CancelButton, OkButton, Duration} from '../containers';

interface Props {
    theme: Theme;
    elapsedTime: number;
    onCancel: () => void;
    onComplete: () => Promise<void>;
}

const VoiceMessageRecordingStarted = forwardRef((props: Props, ref: React.Ref<HTMLCanvasElement>) => {
    return (
        <AttachmentContainer
            icon={(
                <MicrophoneIcon
                    size={24}
                    color={props.theme.buttonBg}
                />
            )}
        >
            <VisualizerContainer>
                <Canvas ref={ref}>
                    <FormattedMessage
                        id='voiceMessage.canvasFallback.recording'
                        defaultMessage='Recording started'
                    />
                </Canvas>
            </VisualizerContainer>
            <Duration>
                {convertSecondsToMSS(props.elapsedTime)}
            </Duration>
            <CancelButton onClick={props.onCancel}>
                <CloseIcon
                    size={18}
                />
            </CancelButton>
            <OkButton onClick={props.onComplete}>
                <CheckIcon
                    size={18}
                    color={props.theme.buttonColor}
                />
            </OkButton>
        </AttachmentContainer>
    );
});

export const VisualizerContainer = styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 1rem;
`;

const Canvas = styled.canvas`
    width: 100%;
    height: 24px;
`;

export default VoiceMessageRecordingStarted;

