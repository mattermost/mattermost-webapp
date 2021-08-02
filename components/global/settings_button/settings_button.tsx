// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import IconButton from '@mattermost/compass-components/components/icon-button';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Constants from 'utils/constants';

const SettingsButton = (): JSX.Element | null => {
    const tooltip = (
        <Tooltip id='recentMentions'>
            "Message settings"
        </Tooltip>
    );

    return (

        <OverlayTrigger
            trigger={['hover']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='bottom'
            overlay={tooltip}
        >          
            <IconButton
                size={'sm'}
                icon={'settings-outline'}
                toggled={false} // include logic here to enable toggle when setting modal is open
                onClick={(): void => {}} // currently needed to keep button from being disabled
                inverted={true}
                compact={true}
                aria-label='Select to opens the settings modal.' // proper wording and translation needed
            />
        </OverlayTrigger>
    );
};

export default SettingsButton;
