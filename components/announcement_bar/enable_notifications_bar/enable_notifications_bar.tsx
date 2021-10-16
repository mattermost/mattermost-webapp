import React, {useEffect} from 'react';
import { AnnouncementBarTypes } from 'utils/constants';

import {t} from 'utils/i18n';
import AnnouncementBar from '../default_announcement_bar';

type Props = {
  show: boolean,
  actions: {
    enableBrowserNotifications: () => void,
    trackEnableNotificationsBarDisplay: () => void,
    disableNotificationsPermissionRequests: () => void,
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

  const handleDontAskAgainButtonClick = () => {
    actions.disableNotificationsPermissionRequests();
  };

  return (
    <AnnouncementBar
      type={AnnouncementBarTypes.GENERAL}
      message={t("enable_notifications_banner.message")}
      showLinkAsButton
      modalButtonText="enable_notifications_banner.enable_button"
      modalButtonDefaultText="Enable" 
      onButtonClick={handleEnableButtonClick}
      showCloseButton
      showDontAskAgainButton
      onDontAskAgainButtonClick={handleDontAskAgainButtonClick} 
    />
  );
};

export default EnableNotificationsBar;