// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';
import moment from 'moment';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {MicrophoneIcon, CheckIcon, CloseIcon} from '@mattermost/compass-icons/components';

import Constants from 'utils/constants';

declare global {
    interface Window {
        webkitAudioContext: AudioContext;
    }
}

const VoiceMessagePreview = () => {
    const theme = useSelector(getTheme);

    const dispatch = useDispatch();

    const audioContextRef = useRef<AudioContext>();
    const audioAnalyzerRef = useRef<AnalyserNode>();

    const refreshIntervalTimer = useRef<ReturnType<typeof setTimeout> | null>();
    const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [countdownTimer, setCountdownTimer] = useState<number>(0);

    function refreshAnalyzer() {
        const bufferLength = audioAnalyzerRef.current?.frequencyBinCount ?? 0;

        const amplitudeArray = new Uint8Array(bufferLength);
        audioAnalyzerRef.current?.getByteFrequencyData(amplitudeArray);

        console.log('amplitudeArray', amplitudeArray, bufferLength);
    }

    async function stopRecording() {
        // eslint-disable-next-line no-console
        console.log('stopRecording');

        if (audioContextRef.current) {
            await audioContextRef.current.close();
        }

        if (refreshIntervalTimer && refreshIntervalTimer.current) {
            clearInterval(refreshIntervalTimer.current);
        }

        if (countdownTimerRef && countdownTimerRef.current) {
            clearTimeout(countdownTimerRef.current);
        }
    }

    function dispatchOpenVoiceMessageAtToClear() {
        dispatch({
            type: Constants.ActionTypes.OPEN_VOICE_MESSAGE_AT,
            data: {
                location: '',
                channelId: '',
            },
        });
    }

    async function startRecording() {
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            const audioAnalyzer = audioCtx.createAnalyser();
            audioAnalyzer.fftSize = 32;

            const audioSourceNode = audioCtx.createMediaStreamSource(audioStream);
            audioSourceNode.connect(audioAnalyzer);

            // audioAnalyzer.minDecibels = -90;
            // audioAnalyzer.maxDecibels = -10;

            audioContextRef.current = audioCtx;
            audioAnalyzerRef.current = audioAnalyzer;

            refreshIntervalTimer.current = setInterval(() => {
                refreshAnalyzer();
            }, 100);

            countdownTimerRef.current = setInterval(() => {
                setCountdownTimer((countdownTimer) => countdownTimer + 1);
            }, 1000);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
        }
    }

    // We start the recording as soon as the component is mounted
    useEffect(() => {
        startRecording();

        return () => {
            stopRecording();
        };
    }, []);

    return (
        <div className='file-preview__container'>
            <div className='file-preview post-image__column'>
                <div className='post-image__thumbnail'>
                    <IconWrapper>
                        <MicrophoneIcon
                            size={24}
                            color={theme.buttonBg}
                        />
                    </IconWrapper>
                </div>
                <div className='post-image__details'>
                    {moment.utc(countdownTimer * 1000).format('mm:ss')}
                    <CancelButton onClick={dispatchOpenVoiceMessageAtToClear}>
                        <CloseIcon
                            size={18}
                        />
                    </CancelButton>
                    <OkButton>
                        <CheckIcon
                            size={18}
                            color={theme.buttonColor}
                        />
                    </OkButton>
                </div>
            </div>
        </div>
    );
};

const IconWrapper = styled.div`
    width: 40px;
    background-color: rgba(var(--button-bg-rgb), 0.12);
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
`;

const OkButton = styled.button`
    background-color: var(--button-bg);
    color: var(--button-color);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    border-width: 0;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const CancelButton = styled.button`
    background-color: var(--button-color);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    border-width: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 4px;
`;

export default VoiceMessagePreview;
