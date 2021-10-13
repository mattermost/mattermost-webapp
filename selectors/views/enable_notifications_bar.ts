import {GlobalState} from 'types/store';
import { isNotificationsPermissionGranted } from 'selectors/browser';
import { getGlobalItem } from 'selectors/storage';
import { StoragePrefixes } from 'utils/constants';

export function shouldShowEnableNotificationsBar(state: GlobalState) {
  const areNotificationsDisabled = !isNotificationsPermissionGranted(state);
  const showBarAt = getGlobalItem(state, StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT, null);
  const isBarDismissedForever = showBarAt === null;

  if (isBarDismissedForever) {
      return false;
  }

  const scheduledTimeHasCome = Date.now() > showBarAt;

  return areNotificationsDisabled && scheduledTimeHasCome;
};