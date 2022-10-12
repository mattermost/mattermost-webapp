// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {
    PlayIcon,
    PauseIcon,
    DotsVerticalIcon,
    CloseIcon,
} from '@mattermost/compass-icons/components';

import {FileInfo} from '@mattermost/types/files';

import {
    AudioPlayerState,
    useAudioPlayer,
} from 'components/common/hooks/useAudioPlayer';
import {convertSecondsToMSS} from 'utils/datetime';

interface Props {
    fileId: FileInfo['id'];
    inPost?: boolean;
    onCancel?: () => void;
}

function VoiceMessageAttachmentPlayer(props: Props) {
    const {playerState, duration, elapsed, togglePlayPause} = useAudioPlayer(props.fileId ? `/api/v4/files/${props.fileId}` : '');

    const progressValue = elapsed === 0 || duration === 0 ? '0' : (elapsed / duration).toFixed(2);

    return (
        <div className='post-image__column'>
            <div className='post-image__thumbnail'>
                <div
                    className='post-image__icon-background'
                    onClick={togglePlayPause}
                >
                    {playerState === AudioPlayerState.Playing ? (
                        <PauseIcon
                            size={24}
                            color='var(--button-bg)'
                        />
                    ) : (
                        <PlayIcon
                            size={24}
                            color='var(--button-bg)'
                        />
                    )}
                </div>
            </div>
            <div className='post-image__details'>
                <div className='post-image__detail_wrapper'>
                    <div className='post-image__detail'>
                        <div className='temp__audio-seeker'>
                            <progress
                                value={progressValue}
                                max='1'
                            />
                        </div>
                    </div>
                </div>
                <div className='post-image__elapsed-time'>
                    {playerState === AudioPlayerState.Playing || playerState === AudioPlayerState.Paused ? convertSecondsToMSS(elapsed) : convertSecondsToMSS(duration)}
                </div>
                {props.inPost ? (
                    <button className='post-image__end-button'>
                        <DotsVerticalIcon
                            size={18}
                            color='currentColor'
                        />
                    </button>
                ) : (
                    <button
                        className='post-image__end-button'
                        onClick={props.onCancel}
                    >
                        <CloseIcon
                            size={18}
                            color='currentColor'
                        />
                    </button>
                )}
            </div>
        </div>
    );
}

export default VoiceMessageAttachmentPlayer;
