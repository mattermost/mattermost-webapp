// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import IconButton from '@mattermost/compass-components/components/icon-button';

const SettingsButton = (): JSX.Element | null => {
    return (

        // tool tip needed
        <IconButton
            size={'sm'}
            icon={'settings-outline'}
            toggled={false} // include logic here to enable toggle when setting modal is open
            onClick={(): void => {}} // currently needed to keep button from being disabled
            inverted={true}
            compact={true}
            aria-label='Select to opens the settings modal.' // proper wording and translation needed
        />
    );
};

export default SettingsButton;
