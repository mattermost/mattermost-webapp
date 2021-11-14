// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as UserAgent from 'utils/user_agent';
import Constants from 'utils/constants';
import icon50 from 'images/icon50x50.png';
import iconWS from 'images/icon_WS.png';

let requestedNotificationPermission = false;

// showNotification displays a platform notification with the configured parameters.
//
// If successful in showing a notification, it resolves with a callback to manually close the
// notification. Notifications that do not require interaction will be closed automatically after
// the Constants.DEFAULT_NOTIFICATION_DURATION. Not all platforms support all features, and may
// choose different semantics for the notifications.

export interface ShowNotificationParams {
    title: string;
    body: string;
    requireInteraction: boolean;
    silent: boolean;
    onNotificationsPermissionStatusReceived: (permissionStatus: NotificationPermission) => void;
    onClick?: (this: Notification, e: Event) => any | null;
}

export function getNotificationsPermission() {
    if (!('Notification' in window)) {
        throw new Error('Notification not supported');
    }

    return Notification.permission;
}

export async function requestNotificationsPermission() {
    if (!('Notification' in window)) {
        throw new Error('Notification not supported');
    }

    if (typeof Notification.requestPermission !== 'function') {
        throw new Error('Notification.requestPermission not supported');
    }

    requestedNotificationPermission = true;

    const permission = await Notification.requestPermission();
    if (typeof permission === 'undefined') {
        // Handle browsers that don't support the promise-based syntax.
        return new Promise<NotificationPermission>((resolve) => {
            Notification.requestPermission(resolve);
        });
    }

    return permission;
}

export async function showNotification(
    {
        title,
        body,
        requireInteraction,
        silent,
        onClick,
        onNotificationsPermissionStatusReceived,
    }: ShowNotificationParams = {
        title: '',
        body: '',
        requireInteraction: false,
        silent: false,
        onNotificationsPermissionStatusReceived: () => {},
    },
) {
    if (!('Notification' in window)) {
        throw new Error('Notification not supported');
    }

    if (Notification.permission !== 'granted' && requestedNotificationPermission) {
        throw new Error('Notifications already requested but not granted');
    }

    const permission = await requestNotificationsPermission();
    onNotificationsPermissionStatusReceived(permission);

    if (permission !== 'granted') {
        throw new Error('Notifications not granted');
    }

    let icon = icon50;
    if (UserAgent.isEdge()) {
        icon = iconWS;
    }

    const notification = new Notification(title, {
        body,
        tag: body,
        icon,
        requireInteraction,
        silent,
    });

    if (onClick) {
        notification.onclick = onClick;
    }

    notification.onerror = () => {
        throw new Error('Notification failed to show.');
    };

    // Mac desktop app notification dismissal is handled by the OS
    if (!requireInteraction && !UserAgent.isMacApp()) {
        setTimeout(() => {
            notification.close();
        }, Constants.DEFAULT_NOTIFICATION_DURATION);
    }

    return () => {
        notification.close();
    };
}
