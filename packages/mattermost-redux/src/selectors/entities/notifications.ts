// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {Notification, NotificationCount} from 'mattermost-redux/types/notifications';
import {Dictionary} from 'mattermost-redux/types/utilities';
import {GlobalState} from 'mattermost-redux/types/store';

export function getNotifications(state: GlobalState): Notification[] {
    return state.entities.notifications.items;
}

export function getNotificationCounts(state: GlobalState): NotificationCount[] {
    return state.entities.notifications.counts;
}

export function makeGetNotificationCounts(): (state: GlobalState, name: string) => Dictionary<NotificationCount> {
    return createSelector(
        getNotificationCounts,
        (state: GlobalState, name: string) => name,
        (counts, name) => {
            const countsForAppByType = {} as Dictionary<NotificationCount>;

            counts.forEach((count) => {
                if (count.provider === name) {
                    countsForAppByType[count.type] = count;
                }
            });

            return countsForAppByType;
        },
    );
}
