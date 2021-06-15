import React, {useEffect} from 'react';

import {t} from 'utils/i18n';
import AnnouncementBar from '../default_announcement_bar';

type Props = {
  show: boolean,
  actions: {
    enableBrowserNotifications: () => void,
    trackEnableNotificationsBarDisplay: () => void,
  }
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