// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import testConfigureStore from 'tests/test_store';

import {browserHistory} from 'utils/browser_history';
import Constants, {NotificationLevels, StoragePrefixes, UserStatuses} from 'utils/constants';
import * as utils from 'utils/notifications';

import {sendDesktopNotification, enableBrowserNotifications, trackEnableNotificationsBarDisplay, scheduleNextNotificationsPermissionRequest } from './notification_actions';

const MOCK_BROWSER_NOTIFICATIONS_RECEIVED_ACTION_TYPE = 'MOCK_BROWSER_NOTIFICATIONS_RECEIVED';

jest.mock('actions/views/browser', () => {
    const originalModule = jest.requireActual('actions/views/browser');

    return {
        ...originalModule,
        setBrowserNotificationsPermission: (permission) => ({type: MOCK_BROWSER_NOTIFICATIONS_RECEIVED_ACTION_TYPE, data: permission}),
    };
});

describe('notification_actions', () => {
    describe('sendDesktopNotification', () => {
        let baseState;
        let channelSettings;
        let crt;
        let msgProps;
        let post;
        let spy;
        let userSettings;

        beforeEach(() => {
            spy = jest.spyOn(utils, 'showNotification');

            crt = {
                user_id: 'current_user_id',
                value: 'off',
            };

            channelSettings = {
                desktop: NotificationLevels.ALL,
            };

            userSettings = {
                desktop: NotificationLevels.ALL,
                desktop_sound: false,
                desktop_threads: NotificationLevels.ALL,
            };

            post = {
                id: 'post_id',
                user_id: 'user_id',
                root_id: 'root_id',
                channel_id: 'channel_id',
                props: {from_webhook: false},
                message: 'Where is Jessica Hyde?',
            };

            msgProps = {
                post: JSON.stringify(post),
                channel_display_name: 'Utopia',
                team_id: 'team_id',
            };

            baseState = {
                entities: {
                    general: {
                        config: {
                            FeatureFlagCollapsedThreads: 'true',
                            CollapsedThreads: 'default_off',
                        },
                    },
                    threads: {
                        threads: {},
                    },
                    users: {
                        statuses: {
                            current_user_id: 'online',
                        },
                        isManualStatus: {
                            current_user_id: false,
                        },
                        currentUserId: 'current_user_id',
                        profiles: {
                            user_id: {
                                id: 'user_id',
                                username: 'username',
                            },
                            current_user_id: {
                                id: 'current_user_id',
                                notify_props: userSettings,
                            },
                        },
                    },
                    teams: {
                        currentTeamId: 'team_id',
                        teams: {
                            team_id: {
                                id: 'team_id',
                                name: 'team',
                            },
                        },
                        myMembers: {},
                    },
                    channels: {
                        currentChannelId: 'channel_id',
                        channels: {
                            channel_id: {
                                id: 'channel_id',
                                team_id: 'team_id',
                                display_name: 'Utopia',
                                name: 'utopia',
                            },
                            muted_channel_id: {
                                id: 'muted_channel_id',
                                team_id: 'team_id',
                            },
                            another_channel_id: {
                                id: 'another_channel_id',
                                team_id: 'team_id',
                            },
                        },
                        myMembers: {
                            channel_id: {
                                id: 'current_user_id',
                                notify_props: channelSettings,
                            },
                        },
                        membersInChannel: {
                            channel_id: {
                                current_user_id: {
                                    id: 'current_user_id',
                                    notify_props: channelSettings,
                                },
                            },
                            muted_channel_id: {
                                current_user_id: {
                                    id: 'current_user_id',
                                    notify_props: {
                                        mark_unread: NotificationLevels.MENTION,
                                    },
                                },
                            },
                        },
                    },
                    preferences: {
                        myPreferences: {
                            'display_settings--collapsed_reply_threads': crt,
                        },
                    },
                },
                views: {
                    browser: {
                        focused: false,
                    },
                    threads: {
                        selectedThreadIdInTeam: {
                            team_id: 'another_root_id',
                        },
                    },
                    rhs: {
                        isSidebarOpen: true,
                    },
                },
            };
        });

        test('should notify user', async () => {
            const store = testConfigureStore(baseState);
            const pushSpy = jest.spyOn(browserHistory, 'push');
            const focus = window.focus;
            window.focus = jest.fn();

            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).toHaveBeenCalledWith({
                    body: '@username: Where is Jessica Hyde?',
                    requireInteraction: false,
                    silent: true,
                    title: 'Utopia',
                    onClick: expect.any(Function),
                });

                spy.mock.calls[0][0].onClick();

                expect(pushSpy).toHaveBeenCalledWith('/team/channels/utopia');
                expect(window.focus).toHaveBeenCalled();
                window.focus = focus;
            });
        });

        test('should not notify user when tab and channel are active', async () => {
            const store = testConfigureStore(baseState);
            baseState.views.browser.focused = true;

            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).not.toHaveBeenCalled();
            });
        });

        test('should notify user when tab is active but the channel is not', async () => {
            const store = testConfigureStore(baseState);
            baseState.views.browser.focused = true;
            baseState.entities.channels.currentChannelId = 'another_channel_id';

            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).toHaveBeenCalled();
            });
        });

        test('should not notify user when notify props is set to mention and there are no mentions', async () => {
            channelSettings.desktop = NotificationLevels.MENTION;
            const store = testConfigureStore(baseState);

            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).not.toHaveBeenCalled();
            });
        });

        test('should not notify user when notify props is set to NONE', async () => {
            userSettings.desktop = NotificationLevels.ALL;
            channelSettings.desktop = NotificationLevels.NONE;
            const store = testConfigureStore(baseState);

            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).not.toHaveBeenCalled();
            });
        });

        test('should not notify user when notify props is set to NONE', async () => {
            userSettings.desktop = NotificationLevels.NONE;
            channelSettings.desktop = undefined;
            const store = testConfigureStore(baseState);

            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).not.toHaveBeenCalled();
            });
        });

        test('should notify user when notify props is set to mention and there are no mentions but it\'s a DM_CHANNEL', () => {
            userSettings.desktop = NotificationLevels.MENTION;
            msgProps.channel_type = Constants.DM_CHANNEL;

            const store = testConfigureStore(baseState);
            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).toHaveBeenCalled();
            });
        });

        test('should notify user when notify props is set to mention and there are mentions', async () => {
            channelSettings.desktop = NotificationLevels.MENTION;
            msgProps.mentions = JSON.stringify(['current_user_id']);

            const store = testConfigureStore(baseState);

            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).toHaveBeenCalled();
            });
        });

        test('should not notify user on user\'s webhook', async () => {
            const store = testConfigureStore(baseState);
            post.props.from_webhook = true;
            post.user_id = 'current_user_id';

            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).not.toHaveBeenCalled();
            });
        });

        test('should not notify user on systemMessage', () => {
            const store = testConfigureStore(baseState);
            post.type = 'system_message';
            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).not.toHaveBeenCalled();
            });
        });

        test('should not notify user on muted channels', () => {
            const store = testConfigureStore(baseState);
            post.channel_id = 'muted_channel_id';
            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).not.toHaveBeenCalled();
            });
        });

        test.each([
            UserStatuses.DND,
            UserStatuses.OUT_OF_OFFICE,
        ])('should not notify user on user status %s', (status) => {
            baseState.entities.users.statuses.current_user_id = status;
            const store = testConfigureStore(baseState);
            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).not.toHaveBeenCalled();
            });
        });

        test.each([
            UserStatuses.OFFLINE,
            UserStatuses.AWAY,
            UserStatuses.ONLINE,
        ])('should notify user on user status %s', (status) => {
            baseState.entities.users.statuses.current_user_id = status;
            const store = testConfigureStore(baseState);
            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).toHaveBeenCalled();
            });
        });

        describe('CollapsedThreads: false', () => {
            beforeEach(() => {
                crt.value = 'off';
            });

            test('should notify user on replies regardless of them being followed', () => {
                const store = testConfigureStore(baseState);
                return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                    expect(spy).toHaveBeenCalled();
                });
            });
        });

        describe('CollapsedThreads: true', () => {
            beforeEach(() => {
                crt.value = 'on';
            });

            test('should not notify user on crt reply when the tab is active and the thread is open', () => {
                baseState.views.threads.selectedThreadIdInTeam.team_id = 'root_id';
                baseState.views.browser.focused = true;
                msgProps.mentions = JSON.stringify(['current_user_id']);

                const store = testConfigureStore(baseState);
                return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                    expect(spy).not.toHaveBeenCalled();
                });
            });

            test('should not notify user on crt reply when desktop is MENTION and there is no mention', () => {
                userSettings.desktop = NotificationLevels.MENTION;

                msgProps.mentions = JSON.stringify([]);

                const store = testConfigureStore(baseState);
                return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                    expect(spy).not.toHaveBeenCalled();
                });
            });

            test('should redirect to permalink when CRT in on and the post is a thread', () => {
                const pushSpy = jest.spyOn(browserHistory, 'push');
                const focus = window.focus;
                window.focus = jest.fn();

                userSettings.desktop = NotificationLevels.MENTION;
                msgProps.mentions = JSON.stringify(['current_user_id']);

                const store = testConfigureStore(baseState);
                return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                    expect(spy).toHaveBeenCalledWith({
                        body: '@username: Where is Jessica Hyde?',
                        requireInteraction: false,
                        silent: true,
                        title: 'Reply in Utopia',
                        onClick: expect.any(Function),
                    });
                    spy.mock.calls[0][0].onClick();

                    expect(pushSpy).toHaveBeenCalledWith('/team/pl/post_id');
                    expect(window.focus).toHaveBeenCalled();
                    window.focus = focus;
                });
            });
        });
    });

    describe('trackEnableNotificationsBarDisplay', () => {
        let currentDate = new Date();

        beforeAll(() => {
            jest.useFakeTimers('modern');
            jest.setSystemTime(currentDate);
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        it('should increment display count for notifications bar', async () => {
            const initialShownCount = 1;
            const initialState = {
                storage: {
                    storage: {
                        [StoragePrefixes.ENABLE_NOTIFICATIONS_BAR_SHOWN_TIMES]: {
                            value: initialShownCount,
                        },
                    }
                }
            };
            
            const store = testConfigureStore(initialState);
            await store.dispatch(trackEnableNotificationsBarDisplay());

            expect(store.getActions()).toEqual([
                {
                    type: "SET_GLOBAL_ITEM",
                    data: {
                        name: StoragePrefixes.ENABLE_NOTIFICATIONS_BAR_SHOWN_TIMES,
                        value: initialShownCount + 1,
                        timestamp: currentDate
                    }
                }
            ]);
        });
    });

    describe('enableBrowserNotifications', () => {
        it('should forward retrieved permission status to setBrowserNotificationsPermission', async () => {
            const expectedPermissionStatus = 'granted';
            const requestNotificationsPermissionSpy = jest.spyOn(utils, 'requestNotificationsPermission');
            requestNotificationsPermissionSpy.mockResolvedValueOnce(expectedPermissionStatus);

            const store = testConfigureStore();

            await store.dispatch(enableBrowserNotifications());

            expect(store.getActions()).toEqual([
                {
                    type: MOCK_BROWSER_NOTIFICATIONS_RECEIVED_ACTION_TYPE,
                    data: expectedPermissionStatus
                }
            ]);
        });
    });

    describe('scheduleNextNotificationsPermissionRequest', () => {
        let currentDate = new Date();

        beforeAll(() => {
            jest.useFakeTimers('modern');
            jest.setSystemTime(currentDate);
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        it(`should disable scheduling forever if there were already more than ${Constants.SCHEDULE_LAST_NOTIFICATIONS_REQUEST_AFTER_ATTEMPTS} requests`, async () => {
            const initialState = {
                storage: {
                    storage: {
                        [StoragePrefixes.ENABLE_NOTIFICATIONS_BAR_SHOWN_TIMES]: {
                            value: Constants.SCHEDULE_LAST_NOTIFICATIONS_REQUEST_AFTER_ATTEMPTS + 1
                        }
                    }
                }
            };
            const store = testConfigureStore(initialState);

            await store.dispatch(scheduleNextNotificationsPermissionRequest());

            expect(store.getActions()).toEqual([
                {
                    type: "SET_GLOBAL_ITEM",
                    data: {
                        name: StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT,
                        value: null,
                        timestamp: currentDate
                    }
                }
            ]);
        });

        it('should not schedule next request if request has already been scheduled', async () => {
            const initialState = {
                storage: {
                    storage: {
                        [StoragePrefixes.ENABLE_NOTIFICATIONS_BAR_SHOWN_TIMES]: {
                            value: 0
                        },
                        [StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT]: {
                            value: 1
                        }
                    }
                }
            };
            const store = testConfigureStore(initialState);

            await store.dispatch(scheduleNextNotificationsPermissionRequest());

            expect(store.getActions()).toEqual([]);
        });

        it(`should schedule next request immediately if there have been less than ${Constants.SCHEDULE_LAST_NOTIFICATIONS_REQUEST_AFTER_ATTEMPTS} requests`, async () => {
            const initialState = {
                storage: {
                    storage: {
                        [StoragePrefixes.ENABLE_NOTIFICATIONS_BAR_SHOWN_TIMES]: {
                            value: 1
                        },
                        [StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT]: {
                            value: null
                        }
                    }
                }
            };
            const store = testConfigureStore(initialState);

            await store.dispatch(scheduleNextNotificationsPermissionRequest());

            expect(store.getActions()).toEqual([
                {
                    type: "SET_GLOBAL_ITEM",
                    data: {
                        name: StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT,
                        value: 0,
                        timestamp: currentDate
                    }
                }
            ]);
        });

        it('should schedule last possible request in seven days from now', async () => {
            const initialState = {
                storage: {
                    storage: {
                        [StoragePrefixes.ENABLE_NOTIFICATIONS_BAR_SHOWN_TIMES]: {
                            value: Constants.SCHEDULE_LAST_NOTIFICATIONS_REQUEST_AFTER_ATTEMPTS
                        },
                        [StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT]: {
                            value: null
                        }
                    }
                }
            };
            const store = testConfigureStore(initialState);

            await store.dispatch(scheduleNextNotificationsPermissionRequest());

            const SEVEN_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 7;

            expect(store.getActions()).toEqual([
                {
                    type: "SET_GLOBAL_ITEM",
                    data: {
                        name: StoragePrefixes.SHOW_ENABLE_NOTIFICATIONS_BAR_AT,
                        value: currentDate.getTime() + SEVEN_DAYS_IN_MS,
                        timestamp: currentDate
                    }
                }
            ]);
        });
    });
});
