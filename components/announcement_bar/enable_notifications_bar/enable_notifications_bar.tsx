import React from 'react';

import {t} from 'utils/i18n';
import AnnouncementBar from '../default_announcement_bar';

type Props = {
  isNotificationsPermissionGranted: boolean,
  actions: {
    enableBrowserNotifications: () => void
  }
}

const EnableNotificationsBar = ({isNotificationsPermissionGranted, actions}: Props) => {
  if (isNotificationsPermissionGranted) {
    return null;
  }

  const handleEnableButtonClick = () => {
    actions.enableBrowserNotifications();
  };

  return (
    <AnnouncementBar 
      message={t("enable_notifications_banner.message")} 
      showCloseButton 
      showLinkAsButton 
      modalButtonText="enable_notifications_banner.message" 
      modalButtonDefaultText="Enable"
      onButtonClick={handleEnableButtonClick} 
    />
  );
};

export default EnableNotificationsBar;