// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createEncoder, WasmMediaEncoder} from 'wasm-media-encoders';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {generateId} from 'utils/utils';

import {uploadFile} from 'actions/file_actions';

import {Channel} from '@mattermost/types/channels';
import {Post} from '@mattermost/types/posts';
import {FileInfo, FileUploadResponse} from '@mattermost/types/files';
import {ServerError} from '@mattermost/types/errors';

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

const MP3MimeType = 'audio/mpeg';
const MP3_EXT = 'mp3';
const AUDIO_FILE_NAME_PREFIX = 'voice_message_';
const FFT_SIZE = 32;
const REDUCED_SAMPLE_SIZE = 9;
const MINIMUM_AMPLITUDE_PERCENTAGE = 14;
const MAX_SCALE_FREQUENCY_DATA = 255;
const VISUALIZER_BAR_WIDTH = 5;

interface Props {
    isRecording: boolean;
    isUploading: boolean;
    isAttached: boolean;
    isUploadFailed: boolean;
    channelId: Channel['id'];
    rootId: Post['id'];
    uploadedAudioFile?: FileInfo;
    onUploadStart: (clientIds: string, channelId: Channel['id']) => void;
    uploadClientId: string;
    onUploadProgress: (filePreviewInfo: FilePreviewInfo) => void;
    uploadsProgress: {[clientID: string]: FilePreviewInfo};
    onUploadComplete: (fileInfos: FileInfo[], clientIds: string[], channelId: string, rootId?: string) => void;
    onUploadError: (err: string | ServerError, clientId?: string, channelId?: string) => void;
    onRemoveRecording: () => void;
    onRemoveDraft: (fileInfoId: FileInfo['id']) => void;
}

const VoiceMessageAttachment = (props: Props) => {
    const theme = useSelector(getTheme);

    const dispatch = useDispatch();

    const [isRecordingFailed, setIsRecordingFailed] = useState(false);

    const audioContextRef = useRef<AudioContext>();
    const audioAnalyzerRef = useRef<AnalyserNode>();
    const audioScriptProcessorRef = useRef<ScriptProcessorNode>();
    const audioRecorderRef = useRef<MediaRecorder>();
    const audioEncoderRef = useRef<WasmMediaEncoder<typeof MP3MimeType>>();

    const amplitudeArrayRef = useRef<Uint8Array>();
    const audioChunksRef = useRef<Uint8Array[]>([]);

    const [recordedAudio, setRecordedAudio] = useState<File | undefined>(undefined);

    const visualizerRefreshRafId = useRef<ReturnType<AnimationFrameProvider['requestAnimationFrame']>>();
    const countdownTimerRafId = useRef<ReturnType<AnimationFrameProvider['requestAnimationFrame']>>();

    const visualizerCanvasRef = useRef<HTMLCanvasElement>(null);

    const xmlRequestRef = useRef<XMLHttpRequest>();

    const [elapsedTime, setElapsedTimer] = useState<number>(0);
    const lastCountdownTime = useRef<number>((new Date()).getTime());

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

            const audioFileName = generateDateSpecificFileName(AUDIO_FILE_NAME_PREFIX, `.${MP3_EXT}`);
            const audioFile = new File([audioBlob], audioFileName, {
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
            setIsRecordingFailed(true);
        }
    }

    function handleOnUploadComplete(data: FileUploadResponse, channelId: string, currentRootId: string) {
        if (data) {
            props.onUploadComplete(data.file_infos, data.client_ids, channelId, currentRootId);
        }
    }

    function recordingUpload(recordedAudioFile: File) {
        const clientId = generateId();

        const request = dispatch(uploadFile({
            file: recordedAudioFile,
            name: recordedAudioFile.name,
            type: MP3_EXT,
            rootId: props.rootId || '',
            channelId: props.channelId,
            clientId,
            onProgress: props.onUploadProgress,
            onSuccess: handleOnUploadComplete,
            onError: props.onUploadError,
        })) as unknown as XMLHttpRequest;

        xmlRequestRef.current = request;

        props.onUploadStart(clientId, props.channelId);
    }

    async function handleCompleteRecordingClicked() {
        await recordingCleanup();

        const recordedAudioFile = recordingStop();

        if (recordedAudioFile) {
            props.onRemoveRecording();
            recordingUpload(recordedAudioFile);
        } else {
            setIsRecordingFailed(true);
        }
    }

    // We start the recording as soon as the component is mounted
    useEffect(() => {
        if (props.isRecording) {
            recordingStart();
        }

        return () => {
            recordingCleanup();
        };
    }, [props.isRecording]);

    function handleUploadRetryClicked() {
        if (recordedAudio) {
            recordingUpload(recordedAudio);
        }
    }

    function handleRemoveBeforeUpload() {
        // TODO cancelling not working
        if (xmlRequestRef.current) {
            xmlRequestRef.current.abort();
        }

        props.onRemoveRecording();
        props.onRemoveDraft(props.uploadClientId);
    }

    function handleRemoveAfterUpload() {
        props.onRemoveRecording();
        props.onRemoveDraft(props.uploadClientId);
    }

    if (props.isRecording) {
        return (
            <VoiceMessageRecordingStarted
                ref={visualizerCanvasRef}
                theme={theme}
                elapsedTime={elapsedTime}
                onComplete={handleCompleteRecordingClicked}
                onCancel={props.onRemoveRecording}
            />
        );
    }

    if (isRecordingFailed) {
        return (
            <VoiceMessageRecordingFailed
                onCancel={props.onRemoveRecording}
            />
        );
    }

    if (props.isUploading) {
        const progress = props?.uploadsProgress?.[props.uploadClientId]?.percent ?? 0;
        return (
            <VoiceMessageUploadingStarted
                theme={theme}
                progress={progress}
                onCancel={handleRemoveBeforeUpload}
            />
        );
    }

    if (props.isUploadFailed) {
        return (
            <VoiceMessageUploadingFailed
                recordedAudio={recordedAudio}
                onRetry={handleUploadRetryClicked}
                onCancel={handleRemoveAfterUpload}
            />
        );
    }

    if (props.isAttached) {
        return (
            <VoiceMessageUploadingCompleted
                theme={theme}
                src={props.uploadedAudioFile?.id ?? ''}
                onCancel={handleRemoveAfterUpload}
            />
        );
    }

    return null;
};

function generateDateSpecificFileName(prefix: string, ext: string) {
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const name = prefix + now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' + hour + '-' + minute + ext;

    return name;
}

export default memo(VoiceMessageAttachment);
