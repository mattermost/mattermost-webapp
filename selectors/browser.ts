import {GlobalState} from 'types/store';

export const isNotificationsPermissionGranted = (state: GlobalState) => state.views.browser.isNotificationsPermissionGranted;