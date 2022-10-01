// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import {isVoiceMessagesEnabled} from 'selectors/views/textbox';

import Constants from 'utils/constants';

import {MicrophoneIcon} from '@mattermost/compass-icons/components';

import {Channel} from '@mattermost/types/channels';

import {IconContainer} from '../formatting_bar/formatting_icon';

interface Props {
    location: string;
    currentChannelId: Channel['id'];
}

const VoiceButton = (props: Props) => {
    const {formatMessage} = useIntl();

    const voiceMessageEnabled = useSelector(isVoiceMessagesEnabled);
    const dispatch = useDispatch();

    const isVoiceRecordingBrowserSupported = navigator && navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined;

    function handleOnClick() {
        if (isVoiceRecordingBrowserSupported) {
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

    if (!isVoiceRecordingBrowserSupported) {
        return null;
    }

    return (
        <OverlayTrigger
            placement='left'
            delayShow={Constants.OVERLAY_TIME_DELAY}
            trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
            overlay={
                <Tooltip id='voiceMessageButtonTooltip'>
                    <FormattedMessage
                        id={'advanceTextEditor.voiceMessageButton.tooltip'}
                        defaultMessage='Voice message'
                    />
                </Tooltip>}
        >
            <IconContainer
                id='PreviewInputTextButton'
                type='button'
                onClick={handleOnClick}
                aria-label={formatMessage({id: 'advanceTextEditor.voiceMessageButton.tooltip', defaultMessage: 'Voice message'})}
            >
                {/* Change to new icon */}
                <MicrophoneIcon
                    size={18}
                    color={'currentColor'}
                />
            </IconContainer>
        </OverlayTrigger>
    );
};

export default VoiceButton;
