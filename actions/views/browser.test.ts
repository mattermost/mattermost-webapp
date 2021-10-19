import { ActionTypes, StoragePrefixes } from 'utils/constants';
import { setBrowserNotificationsPermission } from 'actions/views/browser';
import testConfigureStore from 'tests/test_store';
import * as utils from 'utils/notifications';

describe('actions/views/browser', () => {
  describe('setBrowserNotificationsPermission', () => {
    let currentDate = new Date();

    beforeAll(() => {
        jest.useFakeTimers('modern');
        jest.setSystemTime(currentDate);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should get actual notifications permission status if it is not provided explicitly', async () => {
      const getNotificationsPermissionSpy = jest.spyOn(utils, 'getNotificationsPermission');
      getNotificationsPermissionSpy.mockReturnValueOnce('default');

      const store = testConfigureStore();

      await store.dispatch(setBrowserNotificationsPermission());

      expect(getNotificationsPermissionSpy).toHaveBeenCalled();
    });

    it('should store permission status as not granted if \"default\" status is given', async () => {
      const store = testConfigureStore();

      await store.dispatch(setBrowserNotificationsPermission('default'));

      expect(store.getActions()).toEqual([
        {
            type: ActionTypes.BROWSER_NOTIFICATIONS_PERMISSION_RECEIVED,
            data: false,
        }
      ]);
    });

    it('should store permission status as not granted if \"denied\" status is given', async () => {
      const store = testConfigureStore();

      await store.dispatch(setBrowserNotificationsPermission('denied'));

      expect(store.getActions()).toEqual([
        {
            type: ActionTypes.BROWSER_NOTIFICATIONS_PERMISSION_RECEIVED,
            data: false,
        }
      ]);
    });

    it('should set \"Enable notifications\" bar display count high enough in case of permission grant', async () => {
      const store = testConfigureStore();

      await store.dispatch(setBrowserNotificationsPermission('granted'));

      expect(store.getActions()).toEqual([
        {
          type: "SET_GLOBAL_ITEM",
          data: {
              name: StoragePrefixes.ENABLE_NOTIFICATIONS_BAR_SHOWN_TIMES,
              value: 0,
              timestamp: currentDate
          }
        },
        {
          type: "SET_GLOBAL_ITEM",
          data: {
              name: StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT,
              value: null,
              timestamp: currentDate
          }
        },
        {
            type: ActionTypes.BROWSER_NOTIFICATIONS_PERMISSION_RECEIVED,
            data: true,
        }
      ]);
    });
  });
});