// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState, useMemo} from 'react';

export enum AudioPlayerState {
    Playing = 'PLAYING',
    Paused = 'PAUSED',
    Stopped = 'STOPPED',
}

export function useAudioPlayer(src?: string) {
    const [playerState, setPlayerState] = useState<AudioPlayerState>(AudioPlayerState.Stopped);
    const [duration, setDuration] = useState(0);
    const [elapsed, setElapsedTime] = useState(0);

    // Create audio element with given src
    const audio = useMemo(() => new Audio(src), [src]);

    // Add event listeners to audio element
    useEffect(() => {
        function onEnded() {
            setPlayerState(AudioPlayerState.Stopped);
            audio.currentTime = 0;
            setElapsedTime(0);
        }

        function onLoadedData() {
            setDuration(audio.duration);
            audio.currentTime = 0;
            setElapsedTime(0);
        }

        audio.addEventListener('ended', onEnded);
        audio.addEventListener('loadeddata', onLoadedData);

        return () => {
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('loadeddata', onLoadedData);
        };
    }, [audio]);

    function togglePlayPause() {
        if (audio && audio.readyState === 4) {
            const isPlaying = audio.currentTime > 0 && !audio.paused && !audio.ended;
            if (isPlaying) {
                audio.pause();
                setPlayerState(AudioPlayerState.Paused);
            } else {
                audio.play();
                setPlayerState(AudioPlayerState.Playing);
            }
        }
    }

    return {
        playerState,
        duration,
        elapsed,
        togglePlayPause,
    };
}
