// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo, useState} from 'react';
import styled from 'styled-components';

import {
    CloseIcon,
    PlayIcon,
    PauseIcon,
} from '@mattermost/compass-icons/components';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';

import {convertSecondsToMSS} from 'utils/datetime';

import {AttachmentContainer, CancelButton, Duration} from '../containers';

interface Props {
    theme: Theme;
    src: string;
    onCancel: () => void;
}

enum PlayerState {
    Playing = 'PLAYING',
    Paused = 'PAUSED',
    Stopped = 'STOPPED',
}

const VoiceMessageUploadCompleted = (props: Props) => {
    const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.Stopped);
    const [duration, setDuration] = useState('00:00');

    const audio = useMemo(() => new Audio(props.src), [props.src]);

    useEffect(() => {
        function onEnded() {
            setPlayerState(PlayerState.Stopped);
            audio.currentTime = 0;
        }

        function onLoadedData() {
            setDuration(convertSecondsToMSS(audio.duration));
        }

        audio.addEventListener('loadeddata', onLoadedData);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('loadeddata', onLoadedData);
            audio.removeEventListener('ended', onEnded);
        };
    }, [audio]);

    function togglePlayPause() {
        if (audio.readyState === 4) {
            const isPlaying = audio.currentTime > 0 && !audio.paused && !audio.ended;
            if (isPlaying) {
                audio.pause();
                setPlayerState(PlayerState.Paused);
            } else {
                audio.play();
                setPlayerState(PlayerState.Playing);
            }
        }
    }

    return (
        <AttachmentContainer
            icon={
                playerState === PlayerState.Playing ? (
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
                {duration}
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
