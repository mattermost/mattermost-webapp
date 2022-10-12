// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {RefObject, useRef, useState} from 'react';
import {createEncoder, WasmMediaEncoder} from 'wasm-media-encoders';

import {generateDateSpecificFileName} from 'utils/file_utils';
import {AudioFileExtensions} from 'utils/constants';

declare global {
    interface Window {
        webkitAudioContext: AudioContext;
    }
}

const MP3MimeType = 'audio/mpeg';
const MAX_SCALE_FREQUENCY_DATA = 255;

interface Props {
    canvasElemRef: RefObject<HTMLCanvasElement>;
    canvasBg: string;
    canvasBarColor: string;
    canvasBarWidth: number;
    audioAnalyzerFFTSize: number;
    reducedSampleSize: number;
    minimumAmplitudePercentage: number;
    audioFilePrefix: string;
}

export function useAudioRecorder(props: Props) {
    const audioContextRef = useRef<AudioContext>();
    const audioAnalyzerRef = useRef<AnalyserNode>();
    const audioScriptProcessorRef = useRef<ScriptProcessorNode>();
    const audioEncoderRef = useRef<WasmMediaEncoder<typeof MP3MimeType>>();

    const [hasError, setError] = useState(false);

    const amplitudeArrayRef = useRef<Uint8Array>();
    const audioChunksRef = useRef<Uint8Array[]>([]);
    const [recordedAudio, setRecordedAudio] = useState<File | undefined>();

    const visualizerRefreshRafId = useRef<ReturnType<AnimationFrameProvider['requestAnimationFrame']>>();

    const [elapsedTime, setElapsedTime] = useState(0);
    const lastCountdownTimeRef = useRef<number>((new Date()).getTime());
    const elapsedTimerRefreshRafId = useRef<ReturnType<AnimationFrameProvider['requestAnimationFrame']>>();

    function visualizeAudio() {
        function animateVisualizerRecursively(canvasContext: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, spacing: number) {
            if (amplitudeArrayRef.current && audioAnalyzerRef.current) {
                // Copies new frequency data into the amplitudeArray
                audioAnalyzerRef.current.getByteFrequencyData(amplitudeArrayRef.current);

                const amplitudeNumArray = Array.from(amplitudeArrayRef.current);
                const amplitudePercentageFrwArray = amplitudeNumArray.map((amp) => {
                    const ampPercentage = Math.floor((amp / MAX_SCALE_FREQUENCY_DATA) * 100);
                    if (ampPercentage < props.minimumAmplitudePercentage) {
                        return props.minimumAmplitudePercentage;
                    }
                    return ampPercentage;
                }).slice(0, props.reducedSampleSize);
                const amplitudePercentageRvArray = [...amplitudePercentageFrwArray].reverse();
                const amplitudePercentageArray = [...amplitudePercentageRvArray, ...amplitudePercentageFrwArray];

                // We need to clear the canvas before drawing the new visualizer changes
                canvasContext.clearRect(0, 0, canvasWidth, -canvasHeight);
                canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
                canvasContext.restore();

                amplitudePercentageArray.forEach((amplitude, index) => {
                    const xPoint = ((props.canvasBarWidth * (1 + (2 * index))) + (2 * index * spacing)) / 2;
                    const amplitudeHeight = (amplitude * canvasHeight) / (2 * 100);

                    // set properties of the visualizer bars
                    canvasContext.lineWidth = props.canvasBarWidth;
                    canvasContext.strokeStyle = props.canvasBarColor;
                    canvasContext.lineCap = 'round';
                    canvasContext.beginPath();
                    canvasContext.moveTo(xPoint, amplitudeHeight);
                    canvasContext.lineTo(xPoint, -amplitudeHeight);
                    canvasContext.stroke();
                });

                // Run the visualizer again on each animation frame
                visualizerRefreshRafId.current = window.requestAnimationFrame(() => {
                    animateVisualizerRecursively(canvasContext, canvasWidth, canvasHeight, spacing);
                });
            }
        }

        // prepare the canvas
        const visualizerCanvasContext = props.canvasElemRef.current?.getContext('2d');
        const canvasWidth = Number(props.canvasElemRef?.current?.width ?? 0);
        const canvasHeight = Number(props.canvasElemRef?.current?.height ?? 0);

        if (visualizerCanvasContext && canvasWidth !== 0 && canvasHeight !== 0 && props.canvasElemRef && props.canvasElemRef.current) {
            const spacing = (canvasWidth - ((props.reducedSampleSize * 2) * props.canvasBarWidth)) / ((props.reducedSampleSize * 2) - 1);

            // Add background color to canvas
            props.canvasElemRef.current.style.background = props.canvasBg;
            visualizerCanvasContext.fillStyle = props.canvasBg;
            visualizerCanvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

            // translate the canvas origin to middle of the height
            visualizerCanvasContext.translate(0, canvasHeight / 2);
            visualizerCanvasContext.save();

            animateVisualizerRecursively(visualizerCanvasContext, canvasWidth, canvasHeight, spacing);
        }
    }

    function startElapsedTimer() {
        const currentTime = (new Date()).getTime();
        const timeElapsed = currentTime - lastCountdownTimeRef.current;

        if (timeElapsed >= 1000) {
            setElapsedTime((elapsedTime) => elapsedTime + 1);
            lastCountdownTimeRef.current = currentTime;
        }

        elapsedTimerRefreshRafId.current = requestAnimationFrame(() => {
            startElapsedTimer();
        });
    }

    function handleOnAudioDataAvailable(event: AudioProcessingEvent) {
        const leftChannelInputData = event.inputBuffer.getChannelData(0);
        const rightChannelInputData = event.inputBuffer.getChannelData(1);

        const mp3Data = audioEncoderRef.current?.encode([leftChannelInputData, rightChannelInputData]);

        if (mp3Data) {
            audioChunksRef.current.push(new Uint8Array(mp3Data));
        }
    }

    async function startRecording() {
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            const audioAnalyzer = audioContext.createAnalyser();
            audioAnalyzer.fftSize = props.audioAnalyzerFFTSize;

            const audioSourceNode = audioContext.createMediaStreamSource(audioStream);

            // CHANGE LATER
            // migrate to use Audio Worklet instead.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const wasmFileURL = new URL('wasm-media-encoders/wasm/mp3', import.meta.url);
            audioEncoderRef.current = await createEncoder(MP3MimeType, wasmFileURL.href);

            audioEncoderRef.current.configure({
                sampleRate: 48000,
                channels: 2,
                vbrQuality: 2,
            });

            // CHANGE LATER
            // migrate createScriptProcessor as it is deprecated.
            const scriptProcessorNode = audioContext.createScriptProcessor(4096, 2, 2);

            scriptProcessorNode.onaudioprocess = handleOnAudioDataAvailable;

            audioSourceNode.connect(audioAnalyzer).connect(scriptProcessorNode);

            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0;
            scriptProcessorNode.connect(gainNode);
            gainNode.connect(audioContext.destination);

            amplitudeArrayRef.current = new Uint8Array(audioAnalyzer.frequencyBinCount);
            audioContextRef.current = audioContext;
            audioAnalyzerRef.current = audioAnalyzer;
            audioScriptProcessorRef.current = scriptProcessorNode;

            visualizeAudio();

            lastCountdownTimeRef.current = (new Date()).getTime();
            startElapsedTimer();
        } catch (error) {
            console.log('Error in recording', error); // eslint-disable-line no-console
            setError(true);
        }
    }

    async function cleanPostRecording(totalCleanup = false) {
        console.log('cleanPostRecording'); // eslint-disable-line no-console

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            await audioContextRef.current.close();
        }

        if (audioScriptProcessorRef && audioScriptProcessorRef.current) {
            audioScriptProcessorRef.current.disconnect();
        }

        if (visualizerRefreshRafId && visualizerRefreshRafId.current) {
            cancelAnimationFrame(visualizerRefreshRafId.current);
        }

        if (elapsedTimerRefreshRafId && elapsedTimerRefreshRafId.current) {
            cancelAnimationFrame(elapsedTimerRefreshRafId.current);
        }

        if (totalCleanup) {
            audioChunksRef.current = [];
            audioEncoderRef.current = undefined;
            amplitudeArrayRef.current = undefined;
            lastCountdownTimeRef.current = 0;
        }
    }

    async function stopRecording() {
        await cleanPostRecording();

        if (audioChunksRef.current && audioEncoderRef.current) {
            const mp3DataFinal = audioEncoderRef.current.finalize();
            audioChunksRef.current.push(mp3DataFinal);

            // create blob from audio chunks
            const audioBlob = new Blob(audioChunksRef.current, {type: MP3MimeType});

            const audioFileName = generateDateSpecificFileName(props.audioFilePrefix, `.${AudioFileExtensions.MP3}`);
            const audioFile = new File([audioBlob], audioFileName, {
                type: MP3MimeType,
                lastModified: Date.now(),
            });

            setRecordedAudio(audioFile);

            audioChunksRef.current = [];
            audioEncoderRef.current = undefined;

            return audioFile;
        }

        setError(true);
        return undefined;
    }

    return {
        startRecording,
        elapsedTime,
        stopRecording,
        cleanPostRecording,
        recordedAudio,
        hasError,
    };
}
