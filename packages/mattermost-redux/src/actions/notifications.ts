// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {NotificationTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {bindClientFunc} from './helpers';

export function getMyNotifications(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getMyNotifications,
        onSuccess: NotificationTypes.RECEIVED_NOTIFICATIONS,
    });
}

export function getMyNotificationCounts(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getMyNotificationCounts,
        onSuccess: NotificationTypes.RECEIVED_COUNTS,
    });
}
