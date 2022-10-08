// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {MicrophoneOutlineIcon} from '@mattermost/compass-icons/components';

import {isVoiceMessagesEnabled} from 'selectors/views/textbox';

import Constants from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {IconContainer} from 'components/advanced_text_editor/formatting_bar/formatting_icon';

interface Props {
    disabled: boolean;
    onClick: () => void;
}

const VoiceButton = (props: Props) => {
    const {formatMessage} = useIntl();

    const isVoiceMessagesFeatureEnabled = useSelector(isVoiceMessagesEnabled);

    const isVoiceRecordingBrowserSupported = navigator && navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined;

    if (!isVoiceMessagesFeatureEnabled || !isVoiceRecordingBrowserSupported) {
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
                onClick={props.onClick}
                disabled={props.disabled}
                aria-label={formatMessage({id: 'advanceTextEditor.voiceMessageButton.tooltip', defaultMessage: 'Voice message'})}
            >
                <MicrophoneOutlineIcon
                    size={18}
                    color={'currentColor'}
                />
            </IconContainer>
        </OverlayTrigger>
    );
};

export default VoiceButton;
