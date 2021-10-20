import {GlobalState} from 'types/store';
import { shouldShowEnableNotificationsBar } from 'selectors/views/enable_notifications_bar';
import Constants, { StoragePrefixes } from 'utils/constants';

describe('Selectors.EnableNotificationsBar', () => {
  describe('shouldShowEnableNotificationsBar', () => {
    let currentTimeMock = 0;

    beforeAll(() => {
      currentTimeMock = Date.now();

      jest.useFakeTimers('modern');
      jest.setSystemTime(currentTimeMock);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return false if maximum number of requests has already been made', () => {
      const state = {
        views: {
          browser: {
            isNotificationsPermissionGranted: false,
          }
        },
        storage: {
          storage: {
            [StoragePrefixes.ENABLE_NOTIFICATIONS_BAR_SHOWN_TIMES]: {
              value: Constants.SCHEDULE_LAST_NOTIFICATIONS_REQUEST_AFTER_ATTEMPTS + 1
            }
          }
        }
      } as unknown as GlobalState;

      expect(shouldShowEnableNotificationsBar(state)).toBe(false);
    });

    it('should return false if notifications permission is already granted', () => {
      const state = {
        views: {
          browser: {
            isNotificationsPermissionGranted: true,
          }
        }
      } as unknown as GlobalState;

      expect(shouldShowEnableNotificationsBar(state)).toBe(false);
    });

    it('should return false if the time for showing the bar next time has not come yet', () => {
      const state = {
        views: {
          browser: {
            isNotificationsPermissionGranted: false,
          }
        },
        storage: {
          storage: {
            [StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT]: {
              value: currentTimeMock + 1
            }
          }
        }
      } as unknown as GlobalState;

      expect(shouldShowEnableNotificationsBar(state)).toBe(false);
    });

    it('should return true if the time for showing the bar next time has come and permission is not granted', () => {
      const state = {
        views: {
          browser: {
            isNotificationsPermissionGranted: false,
          }
        },
        storage: {
          storage: {
            [StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT]: {
              value: currentTimeMock - 1
            }
          }
        }
      } as unknown as GlobalState;

      expect(shouldShowEnableNotificationsBar(state)).toBe(true);
    });
  });
});