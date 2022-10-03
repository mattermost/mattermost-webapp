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

    function animateRecordingVisualizer() {
        const bufferLength = audioAnalyzerRef.current?.frequencyBinCount ?? 0;

        const amplitudeArray = new Uint8Array(bufferLength);
        audioAnalyzerRef.current?.getByteFrequencyData(amplitudeArray);

        drawOnVisualizerCanvas(amplitudeArray);

        visualizerRefreshRafId.current = window.requestAnimationFrame(() => {
            animateRecordingVisualizer();
        });
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
            audioAnalyzer.fftSize = 32;

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

            audioContextRef.current = audioContext;
            audioAnalyzerRef.current = audioAnalyzer;
            audioScriptProcessorRef.current = scriptProcessorNode;

            animateRecordingVisualizer();

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
