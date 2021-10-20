import {GlobalState} from 'types/store';
import { isNotificationsPermissionGranted } from 'selectors/browser';
import { getGlobalItem } from 'selectors/storage';
import Constants, { StoragePrefixes } from 'utils/constants';

export function shouldShowEnableNotificationsBar(state: GlobalState) {
  const areNotificationsDisabled = !isNotificationsPermissionGranted(state);
  const barShownTimes = getGlobalItem(state, StoragePrefixes.ENABLE_NOTIFICATIONS_BAR_SHOWN_TIMES, 0);
  const isBarDismissedForever = barShownTimes > Constants.SCHEDULE_LAST_NOTIFICATIONS_REQUEST_AFTER_ATTEMPTS;

  if (isBarDismissedForever) {
      return false;
  }

  const showBarAt = getGlobalItem(state, StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT, 0);
  const scheduledTimeHasCome = Date.now() > showBarAt;

  return areNotificationsDisabled && scheduledTimeHasCome;
};