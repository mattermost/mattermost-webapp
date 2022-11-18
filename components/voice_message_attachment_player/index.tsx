// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent} from 'react';
import { useIntl } from 'react-intl';

import {
    PlayIcon,
    PauseIcon,
    DotsVerticalIcon,
    CloseIcon,
    LinkVariantIcon,
    DownloadOutlineIcon,
} from '@mattermost/compass-icons/components';

import { FileInfo } from '@mattermost/types/files';
import { Post } from '@mattermost/types/posts';

import {
    AudioPlayerState,
    useAudioPlayer,
} from 'components/common/hooks/useAudioPlayer';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';

import { convertSecondsToMSS } from 'utils/datetime';
import {copyToClipboard} from 'utils/utils';
import {getSiteURL} from 'utils/url';

interface Props {
    postId?: Post['id']
    fileId: FileInfo['id'];
    inPost?: boolean;
    onCancel?: () => void;
}

function VoiceMessageAttachmentPlayer(props: Props) {
    const { formatMessage } = useIntl()

    const { playerState, duration, elapsed, togglePlayPause } = useAudioPlayer(props.fileId ? `/api/v4/files/${props.fileId}` : '');

    const progressValue = elapsed === 0 || duration === 0 ? '0' : (elapsed / duration).toFixed(2);

    function copyLink() {
        copyToClipboard(`${getSiteURL()}/api/v4/files/${props.fileId}`);
    }

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
                {props.inPost && (
                    <MenuWrapper 
                        className={'dropdown-menu__dotmenu'}
                    >
                        <button className='post-image__end-button'>
                            <DotsVerticalIcon
                                size={18}
                                color='currentColor'
                            />
                        </button>
                        <Menu
                            openUp={true}
                            className={'Menu__content dropdown-menu'}
                            ariaLabel={formatMessage({ id: 'voiceMessageAttachment.dropdownAriaLabel', defaultMessage: 'Voice message post options' })}
                        >
                            <Menu.ItemAction
                                id={`permalink_${props.postId}`}
                                className={'MenuItem'}
                                icon={<LinkVariantIcon size={18} color="currentColor"/>}
                                text={formatMessage({id: 'voiceMessageAttachment.copyLink', defaultMessage: 'Copy link'})}
                                onClick={copyLink}
                            />
                            <Menu.ItemAction
                                id={`download_${props.postId}`}
                                icon={<DownloadOutlineIcon size={18} color="currentColor"/>}
                                text={formatMessage({id: 'voiceMessageAttachment.download', defaultMessage: 'Download'})}
                            />
                        </Menu>
                    </MenuWrapper>
                )}
                {!props.inPost && (
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
