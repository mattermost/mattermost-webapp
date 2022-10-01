// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import {MicrophoneIcon} from '@mattermost/compass-icons/components';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {isVoiceMessagesEnabled} from 'selectors/views/textbox';

import Constants from 'utils/constants';

import {Channel} from '@mattermost/types/channels';

import {IconContainer} from '../formatting_bar/formatting_icon';

interface Props {
    location: string;
    currentChannelId?: Channel['id'];
}

const VoiceButton = (props: Props) => {
    const {formatMessage} = useIntl();

    const voiceMessageEnabled = useSelector(isVoiceMessagesEnabled);
    const dispatch = useDispatch();

    const [canRecordAudio, setCanRecordAudio] = useState(false);

    useEffect(() => {
        // Check for permissions and if the browser supports the Web Speech API
        if (navigator && navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined) {
            setCanRecordAudio(true);
        } else {
            setCanRecordAudio(false);
        }
    }, []);

    function handleVoiceMessageClick() {
        if (canRecordAudio) {
            dispatch({
                type: Constants.ActionTypes.OPEN_VOICE_MESSAGE_AT,
                data: {
                    location: props.location,
                    channelId: props.currentChannelId,
                },
            });
        }
    }

    if (!voiceMessageEnabled) {
        return null;
    }

    return (
        <OverlayTrigger
            placement='left'
            delayShow={Constants.OVERLAY_TIME_DELAY}
            trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
            overlay={
                <Tooltip id='voiceMessageButtonTooltip'>
                    {canRecordAudio ? (
                        <FormattedMessage
                            id={'voiceMessage.clickToRecord'}
                            defaultMessage='Voice message'
                        />
                    ) : (
                        <FormattedMessage
                            id={'voiceMessage.noBrowserSupport'}
                            defaultMessage='Voice message not supported'
                        />
                    )}
                </Tooltip>}
        >
            <IconContainer
                type='button'
                id='PreviewInputTextButton'
                onClick={handleVoiceMessageClick}
                aria-label={formatMessage({id: 'voiceMessage.sendMessage', defaultMessage: 'TBD change on state'})}
            >
                <MicrophoneIcon
                    size={18}
                    color={'currentColor'}
                />
            </IconContainer>
        </OverlayTrigger>
    );
};

export default VoiceButton;
