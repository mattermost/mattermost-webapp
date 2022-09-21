// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useIntl, FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {MicrophoneIcon} from '@mattermost/compass-icons/components';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {isVoiceMessageEnabled} from 'selectors/views/textbox';

import Constants from 'utils/constants';

import {IconContainer} from '../formatting_bar/formatting_icon';

const VoiceButton = () => {
    const {formatMessage} = useIntl();

    const voiceMessageEnabled = useSelector(isVoiceMessageEnabled);

    const [canRecordAudio, setCanRecordAudio] = useState(false);

    useEffect(() => {
        // Check for permissions and if the browser supports the Web Speech API
        if (navigator && navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined) {
            setCanRecordAudio(true);
        } else {
            setCanRecordAudio(false);
        }
    }, []);

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

                // onClick={onClick}
                // className={classNames({active})}
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
