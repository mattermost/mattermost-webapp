import { ScheduleTypes } from 'mattermost-redux/action_types';

import { Client4 } from 'mattermost-redux/client';

import { DispatchFunc } from 'mattermost-redux/types/actions';

import { ScheduleType } from 'mattermost-redux/types/notifications_schdule';

export function saveNotificationsSchedules(schedules: ScheduleType[]) {
  return async (dispatch: DispatchFunc) => {
      (async function savePreferencesWrapper() {
          try {
              dispatch({
                  type: ScheduleTypes.RECEIVED_SCHEDULES,
                  data: schedules,
              });

              await Client4.saveNotificationSchedules(schedules);
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