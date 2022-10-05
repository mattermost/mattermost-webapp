// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createEncoder, WasmMediaEncoder} from 'wasm-media-encoders';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import Constants, {Locations} from 'utils/constants';
import {generateId} from 'utils/utils';

import {uploadFile} from 'actions/file_actions';

import {Channel} from '@mattermost/types/channels';
import {Post} from '@mattermost/types/posts';
import {FileUploadResponse} from '@mattermost/types/files';

import {FilePreviewInfo} from 'components/file_preview/file_preview';

import VoiceMessageRecordingStarted from './components/recording_started';
import VoiceMessageRecordingFailed from './components/recording_failed';
import VoiceMessageUploadingStarted from './components/upload_started';
import VoiceMessageUploadingFailed from './components/upload_failed';
import VoiceMessageUploadingCompleted from './components/upload_complete';

declare global {
    interface Window {
        webkitAudioContext: AudioContext;
    }
}

enum VMStates {
    RecordingStarted = 'RECORDING_STARTED',
    RecordingFailed = 'RECORDING_FAILED',
    UploadingStarted = 'UPLOADING_STARTED',
    UploadingFailed = 'UPLOADING_FAILED',
    UploadingCompleted = 'UPLOADING_COMPLETED',
}

const MP3MimeType = 'audio/mpeg';
const MP3Extension = 'mp3';
const AUDIO_FILE_NAME_PREFIX = 'voice_message_';
const FFT_SIZE = 32;
const REDUCED_SAMPLE_SIZE = 9;
const MINIMUM_AMPLITUDE_PERCENTAGE = 14;
const MAX_SCALE_FREQUENCY_DATA = 255;
const VISUALIZER_BAR_WIDTH = 5;

interface Props {
    channelId: Channel['id'];
    rootId: Post['id'];
    location: string;
}

const VoiceMessageAttachment = (props: Props) => {
    const theme = useSelector(getTheme);

    const dispatch = useDispatch();

    const [vmState, vmTransitionTo] = useState<VMStates>(VMStates.RecordingStarted);

    const audioContextRef = useRef<AudioContext>();
    const audioAnalyzerRef = useRef<AnalyserNode>();
    const audioScriptProcessorRef = useRef<ScriptProcessorNode>();
    const audioRecorderRef = useRef<MediaRecorder>();
    const audioEncoderRef = useRef<WasmMediaEncoder<typeof MP3MimeType>>();

    const amplitudeArrayRef = useRef<Uint8Array>();
    const audioChunksRef = useRef<Uint8Array[]>([]);

    const [recordedAudio, setRecordedAudio] = useState<File | undefined>(undefined);
    const [uploadedAudio, setUploadedAudio] = useState<string | undefined>(undefined);

    const visualizerRefreshRafId = useRef<ReturnType<AnimationFrameProvider['requestAnimationFrame']>>();
    const countdownTimerRafId = useRef<ReturnType<AnimationFrameProvider['requestAnimationFrame']>>();

    const visualizerCanvasRef = useRef<HTMLCanvasElement>(null);

    const xmlRequestRef = useRef<XMLHttpRequest>();
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const [elapsedTime, setElapsedTimer] = useState<number>(0);
    const lastCountdownTime = useRef<number>((new Date()).getTime());

    const generatedClientId = useMemo(() => generateId(), []);

    function drawOnVisualizerCanvas(amplitudePercentageArray: number[], visualizerCanvasContext: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, spacing: number) {
        // We need to clear the canvas before drawing the new visualizer changes
        visualizerCanvasContext.clearRect(0, 0, canvasWidth, -canvasHeight);
        visualizerCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
        visualizerCanvasContext.restore();

        amplitudePercentageArray.forEach((amplitude, index) => {
            const xPoint = ((VISUALIZER_BAR_WIDTH * (1 + (2 * index))) + (2 * index * spacing)) / 2;
            const amplitudeHeight = (amplitude * canvasHeight) / (2 * 100);

            // set properties of the visualizer bars
            visualizerCanvasContext.lineWidth = VISUALIZER_BAR_WIDTH;
            visualizerCanvasContext.strokeStyle = theme.buttonBg;
            visualizerCanvasContext.lineCap = 'round';
            visualizerCanvasContext.beginPath();
            visualizerCanvasContext.moveTo(xPoint, amplitudeHeight);
            visualizerCanvasContext.lineTo(xPoint, -amplitudeHeight);
            visualizerCanvasContext.stroke();
        });
    }

    function visualizeAudioStream() {
        function animateVisualizerRecursively(canvasContext: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, spacing: number) {
            if (amplitudeArrayRef.current && audioAnalyzerRef.current) {
                // Copies new frequency data into the amplitudeArray
                audioAnalyzerRef.current.getByteFrequencyData(amplitudeArrayRef.current);

                const amplitudeNumArray = Array.from(amplitudeArrayRef.current);
                const amplitudePercentageFrwArray = amplitudeNumArray.map((amp) => {
                    const ampPercentage = Math.floor((amp / MAX_SCALE_FREQUENCY_DATA) * 100);
                    if (ampPercentage < MINIMUM_AMPLITUDE_PERCENTAGE) {
                        return MINIMUM_AMPLITUDE_PERCENTAGE;
                    }
                    return ampPercentage;
                }).slice(0, REDUCED_SAMPLE_SIZE);
                const amplitudePercentageRvArray = [...amplitudePercentageFrwArray].reverse();
                const amplitudePercentageArray = [...amplitudePercentageRvArray, ...amplitudePercentageFrwArray];

                drawOnVisualizerCanvas(amplitudePercentageArray, canvasContext, canvasWidth, canvasHeight, spacing);

                // Run the visualizer again on each animation frame
                visualizerRefreshRafId.current = window.requestAnimationFrame(() => {
                    animateVisualizerRecursively(canvasContext, canvasWidth, canvasHeight, spacing);
                });
            }
        }

        // prepare the canvas
        const visualizerCanvasContext = visualizerCanvasRef.current?.getContext('2d');
        const canvasWidth = Number(visualizerCanvasRef?.current?.width ?? 0);
        const canvasHeight = Number(visualizerCanvasRef?.current?.height ?? 0);

        if (visualizerCanvasContext && canvasWidth !== 0 && canvasHeight !== 0 && visualizerCanvasRef && visualizerCanvasRef.current) {
            const spacing = (canvasWidth - ((REDUCED_SAMPLE_SIZE * 2) * VISUALIZER_BAR_WIDTH)) / ((REDUCED_SAMPLE_SIZE * 2) - 1);

            // Add background color to canvas
            visualizerCanvasRef.current.style.background = theme.centerChannelBg;
            visualizerCanvasContext.fillStyle = theme.centerChannelBg;
            visualizerCanvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

            // translate the canvas origin to middle of the height
            visualizerCanvasContext.translate(0, canvasHeight / 2);
            visualizerCanvasContext.save();

            animateVisualizerRecursively(visualizerCanvasContext, canvasWidth, canvasHeight, spacing);
        }
    }

    function animateCountdownTimer() {
        // Using native date api instead of moment.js for performance reasons
        const currentTime = (new Date()).getTime();
        const timeElapsed = currentTime - lastCountdownTime.current;

        if (timeElapsed >= 1000) {
            setElapsedTimer((elapsedTime) => elapsedTime + 1);
            lastCountdownTime.current = currentTime;
        }

        countdownTimerRafId.current = requestAnimationFrame(() => {
            animateCountdownTimer();
        });
    }

    async function recordingCleanup() {
        // eslint-disable-next-line no-console
        console.log('recordingCleanup');

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            await audioContextRef.current.close();
        }

        if (audioRecorderRef && audioRecorderRef.current) {
            audioRecorderRef.current.stop();
        }

        if (audioScriptProcessorRef && audioScriptProcessorRef.current) {
            audioScriptProcessorRef.current.disconnect();
        }

        if (visualizerRefreshRafId && visualizerRefreshRafId.current) {
            cancelAnimationFrame(visualizerRefreshRafId.current);
        }

        if (countdownTimerRafId && countdownTimerRafId.current) {
            cancelAnimationFrame(countdownTimerRafId.current);
        }
    }

    function recordingStop(): typeof recordedAudio {
        if (audioChunksRef.current && audioEncoderRef.current) {
            const mp3DataFinal = audioEncoderRef.current.finalize();
            audioChunksRef.current.push(mp3DataFinal);

            // create blob from audio chunks
            const audioBlob = new Blob(audioChunksRef.current, {type: MP3MimeType});

            // const audioUrl = URL.createObjectURL(audioBlob);

            const audioFile = new File([audioBlob], `${AUDIO_FILE_NAME_PREFIX}${generatedClientId}.${MP3Extension}`, {
                type: MP3MimeType,
                lastModified: Date.now(),
            });

            setRecordedAudio(audioFile);

            audioChunksRef.current = [];

            return audioFile;
        }

        return undefined;
    }

    async function recordingStart() {
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();

            const audioAnalyzer = audioContext.createAnalyser();
            audioAnalyzer.fftSize = FFT_SIZE;

            const audioSourceNode = audioContext.createMediaStreamSource(audioStream);

            const wasmFileURL = new URL('wasm-media-encoders/wasm/mp3', import.meta.url);
            audioEncoderRef.current = await createEncoder(MP3MimeType, wasmFileURL.href);

            audioEncoderRef.current.configure({
                sampleRate: 48000,
                channels: 2,
                vbrQuality: 2,
            });

            const scriptProcessorNode = audioContext.createScriptProcessor(4096, 2, 2);

            scriptProcessorNode.onaudioprocess = (event) => {
                const leftChannelInputData = event.inputBuffer.getChannelData(0);
                const rightChannelInputData = event.inputBuffer.getChannelData(1);

                const mp3Data = audioEncoderRef.current?.encode([leftChannelInputData, rightChannelInputData]);

                if (mp3Data) {
                    audioChunksRef.current.push(new Uint8Array(mp3Data));
                }
            };

            audioSourceNode.connect(audioAnalyzer).connect(scriptProcessorNode);

            const muteNode = audioContext.createGain();
            muteNode.gain.value = 0;

            scriptProcessorNode.connect(muteNode);
            muteNode.connect(audioContext.destination);

            amplitudeArrayRef.current = new Uint8Array(audioAnalyzer.frequencyBinCount);
            audioContextRef.current = audioContext;
            audioAnalyzerRef.current = audioAnalyzer;
            audioScriptProcessorRef.current = scriptProcessorNode;

            visualizeAudioStream();

            animateCountdownTimer();
        } catch (error) {
            console.log('Error in recording', error); // eslint-disable-line no-console
            vmTransitionTo(VMStates.RecordingFailed);
        }
    }

    function onRecordingUploadProgress(filePreviewInfo: FilePreviewInfo) {
        if (filePreviewInfo && filePreviewInfo.percent && filePreviewInfo.percent <= 100 && filePreviewInfo.percent >= 0) {
            vmTransitionTo(VMStates.UploadingStarted);
            setUploadProgress(filePreviewInfo.percent);
        }
    }

    function onRecordingUploadSuccess(uploadedResponse: FileUploadResponse) {
        console.log('uploadedResponse', uploadedResponse); // eslint-disable-line no-console

        const fileId = uploadedResponse?.file_infos?.[0]?.id ?? '';
        if (fileId) {
            vmTransitionTo(VMStates.UploadingCompleted);
            setUploadedAudio(uploadedResponse.file_infos[0].id);
        }
    }

    function onRecordingUploadError() {
        console.log('onRecordingUploadError'); // eslint-disable-line no-console
        vmTransitionTo(VMStates.UploadingFailed);
    }

    function recordingUpload(recordedAudioFile: File) {
        const request = dispatch(uploadFile({
            file: recordedAudioFile,
            name: recordedAudioFile.name,
            type: MP3Extension,
            rootId: props.location === Locations.RHS_COMMENT ? props.rootId : '',
            channelId: props.channelId,
            clientId: generatedClientId,
            onProgress: onRecordingUploadProgress,
            onSuccess: onRecordingUploadSuccess,
            onError: onRecordingUploadError,
        }));

        // Change "unknown" after we better type our actions
        xmlRequestRef.current = request as unknown as XMLHttpRequest;
    }

    async function handleCompleteRecordingClicked() {
        await recordingCleanup();

        const recordedAudioFile = recordingStop();

        if (!recordedAudioFile) {
            vmTransitionTo(VMStates.RecordingFailed);
            return;
        }

        recordingUpload(recordedAudioFile);
    }

    // We start the recording as soon as the component is mounted
    useEffect(() => {
        recordingStart();

        return () => {
            recordingCleanup();
        };
    }, []);

    // Automatically stop recording after Max time
    // useEffect(() => {
    //     if (elapsedTime >= 30) {
    //         handleCompleteRecordingClicked();
    //     }
    // }, [elapsedTime]);

    function unmountVoiceMessageComponent() {
        // We don't stop recording here as when the component is unmounted,
        // the recording is stopped automatically along with necessary clean ups
        dispatch({
            type: Constants.ActionTypes.OPEN_VOICE_MESSAGE_AT,
            data: {
                location: '',
                channelId: '',
            },
        });
    }

    function handleUploadRetryClicked() {
        if (recordedAudio) {
            recordingUpload(recordedAudio);
        }
    }

    function cancelUpload() {
        if (xmlRequestRef.current) {
            xmlRequestRef.current.abort();
        }

        unmountVoiceMessageComponent();
    }

    if (vmState === VMStates.RecordingStarted) {
        return (
            <VoiceMessageRecordingStarted
                ref={visualizerCanvasRef}
                theme={theme}
                elapsedTime={elapsedTime}
                onCancel={unmountVoiceMessageComponent}
                onComplete={handleCompleteRecordingClicked}
            />
        );
    }

    if (vmState === VMStates.RecordingFailed) {
        return (
            <VoiceMessageRecordingFailed
                onCancel={unmountVoiceMessageComponent}
            />
        );
    }

    if (vmState === VMStates.UploadingStarted) {
        return (
            <VoiceMessageUploadingStarted
                theme={theme}
                progress={uploadProgress}
                onCancel={cancelUpload}
            />
        );
    }

    if (vmState === VMStates.UploadingFailed) {
        return (
            <VoiceMessageUploadingFailed
                onRetry={handleUploadRetryClicked}
                onCancel={unmountVoiceMessageComponent}
            />
        );
    }

    if (vmState === VMStates.UploadingCompleted) {
        return (
            <VoiceMessageUploadingCompleted
                theme={theme}
                src={uploadedAudio}
                onCancel={unmountVoiceMessageComponent}
            />
        );
    }

    return null;
};

export default VoiceMessageAttachment;
