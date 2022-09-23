// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';
import moment from 'moment';
import {ProgressBar} from 'react-bootstrap';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {MicrophoneIcon, CheckIcon, CloseIcon} from '@mattermost/compass-icons/components';

import Constants from 'utils/constants';
import {FormattedMessage} from 'react-intl';

declare global {
    interface Window {
        webkitAudioContext: AudioContext;
    }
}

enum VoiceMessageStates {
    Recording = 'recording',
    Encoding = 'encoding',
    Uploading = 'uploading',
}

const VoiceMessagePreview = () => {
    const theme = useSelector(getTheme);

    const dispatch = useDispatch();

    const [voiceMessageIs, setVoiceMessageIs] = useState(VoiceMessageStates.Recording);

    const audioContextRef = useRef<AudioContext>();
    const audioAnalyzerRef = useRef<AnalyserNode>();

    const audioRecorderRef = useRef<MediaRecorder>();
    const audioChunksRef = useRef<Blob[]>([]);

    const refreshIntervalTimer = useRef<ReturnType<typeof setTimeout> | null>();
    const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const visualizerCanvasRef = useRef<HTMLCanvasElement>(null);

    const [countdownTimer, setCountdownTimer] = useState<number>(0);

    function drawOnVisualizerCanvas(amplitudeArray: Uint8Array) {
        const visualizerCanvasContext = visualizerCanvasRef.current?.getContext('2d');
        if (visualizerCanvasContext && visualizerCanvasRef.current) {
            // We need to clear the canvas before drawing the new visualizer
            visualizerCanvasContext.clearRect(0, 0, visualizerCanvasRef.current.width, visualizerCanvasRef.current.height);

            visualizerCanvasContext.fillStyle = theme.centerChannelBg;
            visualizerCanvasContext.lineWidth = 4;
            visualizerCanvasContext.strokeStyle = theme.buttonBg;
            const spacing = Number(visualizerCanvasRef.current?.width) / amplitudeArray.length;
            amplitudeArray.forEach((amplitude, index) => {
                // skipping the first one because its was looking weird. Change later
                if (index !== 0) {
                    visualizerCanvasContext.beginPath();
                    visualizerCanvasContext.moveTo(spacing * index, Number(visualizerCanvasRef.current?.width));
                    visualizerCanvasContext.lineTo(spacing * index, Number(visualizerCanvasRef.current?.height) - amplitude);
                    visualizerCanvasContext.stroke();
                }
            });
        }
    }

    function refreshAnalyzer() {
        const bufferLength = audioAnalyzerRef.current?.frequencyBinCount ?? 0;

        const amplitudeArray = new Uint8Array(bufferLength);
        audioAnalyzerRef.current?.getByteFrequencyData(amplitudeArray);

        requestAnimationFrame(() => {
            drawOnVisualizerCanvas(amplitudeArray);
        });
    }

    async function cleanUpAfterRecordings() {
        // eslint-disable-next-line no-console
        console.log('cleanUpAfterRecordings');

        if (audioContextRef.current) {
            await audioContextRef.current.close();
        }

        if (audioRecorderRef.current) {
            audioRecorderRef.current.stop();
        }

        if (refreshIntervalTimer && refreshIntervalTimer.current) {
            clearInterval(refreshIntervalTimer.current);
        }

        if (countdownTimerRef && countdownTimerRef.current) {
            clearTimeout(countdownTimerRef.current);
        }
    }

    function unmountVoiceMessageComponent() {
        // We don't stop recording here as when the component is unmounted, the recording is stopped
        dispatch({
            type: Constants.ActionTypes.OPEN_VOICE_MESSAGE_AT,
            data: {
                location: '',
                channelId: '',
            },
        });
    }

    function pushStreamToAudioChunks(event: BlobEvent) {
        audioChunksRef.current.push(event.data);
    }

    function onRecordedStopped() {
        const audioBlob = new Blob(audioChunksRef.current);
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('audioUrl', audioUrl);
        audioChunksRef.current = [];
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

            audioRecorderRef.current = new MediaRecorder(audioStream, {
                audioBitsPerSecond: 128000,
            });

            audioRecorderRef.current.start();

            audioRecorderRef.current.ondataavailable = (event) => {
                pushStreamToAudioChunks(event);
            };

            audioRecorderRef.current.onstop = () => {
                onRecordedStopped();
            };

            const audioSourceNode = audioCtx.createMediaStreamSource(audioStream);
            audioSourceNode.connect(audioAnalyzer);

            audioAnalyzer.minDecibels = -90;
            audioAnalyzer.maxDecibels = -10;

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

    function handleCompleteRecordingClicked() {
        setVoiceMessageIs(VoiceMessageStates.Encoding);

        if (audioRecorderRef.current) {
            audioRecorderRef.current.stop();
        }
    }

    // We start the recording as soon as the component is mounted
    useEffect(() => {
        startRecording();

        return () => {
            cleanUpAfterRecordings();
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
                <ControlsColumn>
                    {voiceMessageIs === VoiceMessageStates.Recording && (
                        <VisualizerContainer>
                            {/* Separate this into component with forwardRef */}
                            <Canvas ref={visualizerCanvasRef}/>
                        </VisualizerContainer>
                    )}
                    {(voiceMessageIs === VoiceMessageStates.Encoding || voiceMessageIs === VoiceMessageStates.Uploading) && (
                        <TextColumn>
                            <TitleContainer>
                                <FormattedMessage
                                    id='voiceMessage.main'
                                    defaultMessage='Voice message'
                                />
                            </TitleContainer>
                            {voiceMessageIs === VoiceMessageStates.Encoding && (
                                <SubtitleContainer>
                                    <FormattedMessage
                                        id='voiceMessage.encoding'
                                        defaultMessage='Encoding...'
                                    />
                                </SubtitleContainer>
                            )}
                        </TextColumn>
                    )}
                    {voiceMessageIs === VoiceMessageStates.Recording && (
                        <span>
                            {moment.utc(countdownTimer * 1000).format('mm:ss')}
                        </span>
                    )}
                    <CancelButton onClick={unmountVoiceMessageComponent}>
                        <CloseIcon
                            size={18}
                        />
                    </CancelButton>
                    {voiceMessageIs === VoiceMessageStates.Recording && (
                        <OkButton onClick={handleCompleteRecordingClicked}>
                            <CheckIcon
                                size={18}
                                color={theme.buttonColor}
                            />
                        </OkButton>
                    )}
                    <ProgressBar
                        className='post-image__progressBar'
                        now={20}
                        active={20 === 100}
                    />
                    <audio controls src='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'/>
                </ControlsColumn>
            </div>
        </div>
    );
};

const TextColumn = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const ControlsColumn = styled.div`
    position: relative;
    display: flex;
    overflow: hidden;
    height: 100%;
    flex: 1;
    align-items: center;
    font-size: 12px;
    text-align: left;
    padding-right: 1rem;
`;

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

const VisualizerContainer = styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 1rem
`;

const Canvas = styled.canvas`
    width: 100%;
    height: 20px;
`;

const TitleContainer = styled.div`
    display: block;
    overflow: hidden;
    max-width: 151px;
    margin-bottom: 3px;
    font-weight: 600;
    outline: none;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-word;
`;

const SubtitleContainer = styled.div`
    color: rgba(var(--center-channel-color-rgb), 0.56);
    font-size: 12px;
    text-align: left;
    overflow: hidden;
`;

export default VoiceMessagePreview;
