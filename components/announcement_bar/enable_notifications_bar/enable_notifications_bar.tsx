// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';

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
    useEffect(() => {
        if (show) {
            actions.trackEnableNotificationsBarDisplay();
        }
    }, [show, actions]);

    if (!show) {
        return null;
    }

    const handleEnableButtonClick = () => {
        actions.enableBrowserNotifications();
    };

    const handleDontAskAgainButtonClick = () => {
        actions.disableNotificationsPermissionRequests();
    };

    return (
        <AnnouncementBar
            type={AnnouncementBarTypes.GENERAL}
            message={t('enable_notifications_banner.message')}
            showLinkAsButton={true}
            modalButtonText='enable_notifications_banner.enable_button'
            modalButtonDefaultText='Enable'
            onButtonClick={handleEnableButtonClick}
            showCloseButton={true}
            showDontAskAgainButton={true}
            onDontAskAgainButtonClick={handleDontAskAgainButtonClick}
        />
    );
};

export default EnableNotificationsBar;
