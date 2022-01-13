// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GenericAction, DispatchFunc} from 'mattermost-redux/types/actions';

import {Constants, ActionTypes, WindowSizes, StoragePrefixes} from 'utils/constants';
import {getNotificationsPermission} from 'utils/notifications';
import * as StorageActions from 'actions/storage';

export function emitBrowserWindowResized(windowSize: string): GenericAction {
    let newWindowSize = windowSize;
    if (!windowSize) {
        const width = window.innerWidth;

        switch (true) {
        case width > Constants.TABLET_SCREEN_WIDTH && width <= Constants.DESKTOP_SCREEN_WIDTH: {
            newWindowSize = WindowSizes.SMALL_DESKTOP_VIEW;
            break;
        }
        case width > Constants.MOBILE_SCREEN_WIDTH && width <= Constants.TABLET_SCREEN_WIDTH: {
            newWindowSize = WindowSizes.TABLET_VIEW;
            break;
        }
        case width <= Constants.MOBILE_SCREEN_WIDTH: {
            newWindowSize = WindowSizes.MOBILE_VIEW;
            break;
        }
        default: {
            newWindowSize = WindowSizes.DESKTOP_VIEW; // width > Constants.DESKTOP_SCREEN_WIDTH
        }
        }
    }
    return {
        type: ActionTypes.BROWSER_WINDOW_RESIZED,
        data: newWindowSize,
    };
}

export const setBrowserNotificationsPermission = (permission?: NotificationPermission) => {
    return (dispatch: DispatchFunc) => {
        const permissionStatus = permission ?? getNotificationsPermission();
        const isPermissionGranted = permissionStatus === 'granted';

        if (isPermissionGranted) {
            dispatch(StorageActions.setGlobalItem(StoragePrefixes.ENABLE_NOTIFICATIONS_BAR_SHOWN_TIMES, 0));
            dispatch(StorageActions.setGlobalItem(StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT, null));
        }

        dispatch({
            type: ActionTypes.BROWSER_NOTIFICATIONS_PERMISSION_RECEIVED,
            data: isPermissionGranted,
        });
    };
};
