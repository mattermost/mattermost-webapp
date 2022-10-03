// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import {
    CloseIcon,
    PlayIcon,
    PauseIcon,
} from '@mattermost/compass-icons/components';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';

import {convertSecondsToMSS} from 'utils/datetime';

import {useAudioPlayer, AudioPlayerState} from 'components/common/hooks/useAudioPlayer';

import {AttachmentContainer, CancelButton, Duration} from '../containers';

interface Props {
    theme: Theme;
    src: string;
    onCancel: () => void;
}

const VoiceMessageUploadCompleted = (props: Props) => {
    const {playerState, duration, togglePlayPause} = useAudioPlayer(props.src);

    return (
        <AttachmentContainer
            icon={
                playerState === AudioPlayerState.Playing ? (
                    <PauseIcon
                        size={24}
                        color={props.theme.buttonBg}
                    />
                ) : (
                    <PlayIcon
                        size={24}
                        color={props.theme.buttonBg}
                    />
                )
            }
            onIconClick={togglePlayPause}
        >
            <VisualizerContainer><span>k</span></VisualizerContainer>
            <Duration>
                {convertSecondsToMSS(duration)}
            </Duration>
            <CancelButton onClick={props.onCancel}>
                <CloseIcon size={18}/>
            </CancelButton>
        </AttachmentContainer>
    );
};

export const VisualizerContainer = styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 1rem;
`;

export default VoiceMessageUploadCompleted;
