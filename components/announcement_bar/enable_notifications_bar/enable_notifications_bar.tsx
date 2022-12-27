// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState, useCallback} from 'react';
import {FormattedMessage} from 'react-intl';

import {AlertCircleOutlineIcon} from '@mattermost/compass-icons/components';

import {AnnouncementBarTypes} from 'utils/constants';

import AnnouncementBar from 'components/announcement_bar/default_announcement_bar';

import './enable_notifications_bar.scss';

type Props = {
    show: boolean;
    actions: {
        enableBrowserNotifications: () => void;
        trackEnableNotificationsBarDisplay: () => void;
        disableNotificationsPermissionRequests: () => void;
    };
}

const alertIcon = (
    <div className='alert-icon'>
        <AlertCircleOutlineIcon/>
    </div>
);

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

    const handleEnableButtonClick = useCallback(() => {
        actions.enableBrowserNotifications();
    }, [actions]);

    const handleDontAskAgainButtonClick = useCallback(() => {
        actions.disableNotificationsPermissionRequests();
    }, [actions]);

    const handleCloseButtonClick = useCallback(() => {
        setIsDisplayed(false);
    }, [setIsDisplayed]);

    if (!isDisplayed) {
        return null;
    }

    return (
        <AnnouncementBar
            type={AnnouncementBarTypes.GENERAL}
            icon={alertIcon}
            message={<FormattedMessage id={'enable_notifications_banner.message'}/>}
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
