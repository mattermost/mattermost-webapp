// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {ScheduleTypes} from 'mattermost-redux/action_types';

import {Client4} from 'mattermost-redux/client';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {ScheduleType} from 'mattermost-redux/types/notifications_schdule';

export function saveNotificationsSchedules(
    currentUserId: string,
    schedules: ScheduleType[],
) {
    return async (dispatch: DispatchFunc) => {
        (async function savePreferencesWrapper() {
            try {
                dispatch({
                    type: ScheduleTypes.RECEIVED_SCHEDULES,
                    data: schedules,
                });

                await Client4.saveNotificationSchedules(currentUserId, schedules);
            } catch {
                dispatch({
                    type: ScheduleTypes.DELETED_SCHEDULES,
                    data: schedules,
                });
            }
        }());

        return {data: true};
    };
}
