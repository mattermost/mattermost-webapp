// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';

import {AnnouncementBarTypes} from 'utils/constants';

import {t} from 'utils/i18n';
import AnnouncementBar from '../default_announcement_bar';

type Props = {
    show: boolean;
    actions: {
        enableBrowserNotifications: () => void;
        trackEnableNotificationsBarDisplay: () => void;
        disableNotificationsPermissionRequests: () => void;
    };
}

const EnableNotificationsBar = ({show, actions}: Props) => {
    const [isDisplayed, setIsDisplayed] = useState(false);

    useEffect(() => {
        setIsDisplayed(show);
    }, [show]);

    useEffect(() => {
        if (isDisplayed) {
            actions.trackEnableNotificationsBarDisplay();
        }
    }, [isDisplayed, actions]);

    if (!isDisplayed) {
        return null;
    }

    const handleEnableButtonClick = () => {
        actions.enableBrowserNotifications();
    };

    const handleDontAskAgainButtonClick = () => {
        actions.disableNotificationsPermissionRequests();
    };

    const handleCloseButtonClick = () => {
        setIsDisplayed(false);
    };

    return (
        <AnnouncementBar
            type={AnnouncementBarTypes.GENERAL}
            message={t('enable_notifications_banner.message')}
            showLinkAsButton={true}
            modalButtonText='enable_notifications_banner.enable_button'
            modalButtonDefaultText='Enable'
            onButtonClick={handleEnableButtonClick}
            handleClose={handleCloseButtonClick}
            showCloseButton={true}
            showDontAskAgainButton={true}
            onDontAskAgainButtonClick={handleDontAskAgainButtonClick}
        />
    );
};

export default EnableNotificationsBar;
