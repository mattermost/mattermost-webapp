// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {ActionTypes, StoragePrefixes} from 'utils/constants';
import {setBrowserNotificationsPermission} from 'actions/views/browser';
import testConfigureStore from 'tests/test_configure_store';
import * as utils from 'utils/notifications';

describe('actions/views/browser', () => {
    describe('setBrowserNotificationsPermission', () => {
        const currentDate = new Date();

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

        it('should store permission status as not granted if "default" status is given', async () => {
            const store = testConfigureStore();

            await store.dispatch(setBrowserNotificationsPermission('default'));

            expect(store.getActions()).toEqual([
                {
                    type: ActionTypes.BROWSER_NOTIFICATIONS_PERMISSION_RECEIVED,
                    data: false,
                },
            ]);
        });

        it('should store permission status as not granted if "denied" status is given', async () => {
            const store = testConfigureStore();

            await store.dispatch(setBrowserNotificationsPermission('denied'));

            expect(store.getActions()).toEqual([
                {
                    type: ActionTypes.BROWSER_NOTIFICATIONS_PERMISSION_RECEIVED,
                    data: false,
                },
            ]);
        });

        it('should clear enable notifications bar display count and permission request timestamp on permission grant', async () => {
            const store = testConfigureStore();

            await store.dispatch(setBrowserNotificationsPermission('granted'));

            expect(store.getActions()).toEqual([
                {
                    type: 'SET_GLOBAL_ITEM',
                    data: {
                        name: StoragePrefixes.ENABLE_NOTIFICATIONS_BAR_SHOWN_TIMES,
                        value: 0,
                        timestamp: currentDate,
                    },
                },
                {
                    type: 'SET_GLOBAL_ITEM',
                    data: {
                        name: StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT,
                        value: null,
                        timestamp: currentDate,
                    },
                },
                {
                    type: ActionTypes.BROWSER_NOTIFICATIONS_PERMISSION_RECEIVED,
                    data: true,
                },
            ]);
        });
    });
});
