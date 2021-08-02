// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import nock from 'nock';

import {Client4} from 'mattermost-redux/client';
import TestHelper from 'mattermost-redux/test/test_helper';

import testConfigureStore from 'tests/test_store';

import Constants, {NotificationLevels, UserStatuses} from 'utils/constants';
import * as utils from 'utils/notifications';

import {getNotifyLevel, sendDesktopNotification} from './notification_actions';

describe('notification_actions', () => {
    describe('getNotifyLevel', () => {
        test.each([

            // should return default values
            [
                {
                    isCrtReply: false,
                    userSettings: undefined,
                    channelSettings: undefined,
                },
                NotificationLevels.ALL,
            ],
            [
                {
                    isCrtReply: true,
                    userSettings: undefined,
                    channelSettings: undefined,
                },
                NotificationLevels.ALL,
            ],

            // should return user defined settings when no channel specific settings
            [
                {
                    isCrtReply: false,
                    userSettings: {desktop: NotificationLevels.NONE},
                    channelSettings: undefined,
                },
                NotificationLevels.NONE,
            ],
            [
                {
                    isCrtReply: false,
                    userSettings: {desktop: NotificationLevels.ALL},
                    channelSettings: undefined,
                },
                NotificationLevels.ALL,
            ],
            [
                {
                    isCrtReply: false,
                    userSettings: {desktop: NotificationLevels.MENTION},
                    channelSettings: undefined,
                },
                NotificationLevels.MENTION,
            ],

            // should return channel specific settings when it's not a crt reply
            [
                {
                    isCrtReply: false,
                    userSettings: {desktop: NotificationLevels.ALL},
                    channelSettings: {desktop: NotificationLevels.NONE},
                },
                NotificationLevels.NONE,
            ],
            [
                {
                    isCrtReply: false,
                    userSettings: {desktop: NotificationLevels.ALL},
                    channelSettings: {desktop: NotificationLevels.MENTION},
                },
                NotificationLevels.MENTION,
            ],
            [
                {
                    isCrtReply: false,
                    userSettings: {desktop: NotificationLevels.MENTION},
                    channelSettings: {desktop: NotificationLevels.ALL},
                },
                NotificationLevels.ALL,
            ],

            // channel settings do not matter when it's a crt reply
            [
                {
                    isCrtReply: true,
                    userSettings: {desktop: NotificationLevels.NONE, desktop_threads: NotificationLevels.ALL},
                    channelSettings: {desktop: NotificationLevels.ALL},
                },
                NotificationLevels.NONE,
            ],
            [
                {
                    isCrtReply: true,
                    userSettings: {desktop: NotificationLevels.ALL, desktop_threads: NotificationLevels.MENTION},
                    channelSettings: {desktop: NotificationLevels.ALL},
                },
                NotificationLevels.ALL,
            ],

            // dekstop_threads setting is respected only when desktop setting is set to MENTION
            [
                {
                    isCrtReply: true,
                    userSettings: {desktop: NotificationLevels.MENTION, desktop_threads: NotificationLevels.ALL},
                    channelSettings: {desktop: NotificationLevels.NONE},
                },
                NotificationLevels.ALL,
            ],
            [
                {
                    isCrtReply: true,
                    userSettings: {desktop: NotificationLevels.MENTION, desktop_threads: NotificationLevels.MENTION},
                    channelSettings: {desktop: NotificationLevels.NONE},
                },
                NotificationLevels.MENTION,
            ],

            // should return default ALL for crt replies
            [
                {
                    isCrtReply: true,
                    userSettings: {desktop: NotificationLevels.MENTION},
                    channelSettings: {desktop: NotificationLevels.NONE},
                },
                NotificationLevels.ALL,
            ],
            [
                {
                    isCrtReply: true,
                    userSettings: {desktop: NotificationLevels.MENTION},
                    channelSettings: {desktop: NotificationLevels.NONE},
                },
                NotificationLevels.ALL,
            ],
        ])('should return appropriate notify level', ({isCrtReply, userSettings, channelSettings}, expected) => {
            expect(getNotifyLevel(isCrtReply, userSettings, channelSettings)).toBe(expected);
        });
    });

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
                    },
                    channels: {
                        currentChannelId: 'channel_id',
                        channels: {
                            channel_id: {
                                id: 'channel_id',
                                team_id: 'team_id',
                                display_name: 'Utopia',
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

            return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                expect(spy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        body: '@username: Where is Jessica Hyde?',
                        requireInteraction: false,
                        silent: true,
                        title: 'Utopia',
                    }),
                );
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
            const thread = {
                id: 'root_id',
                participants: [
                    {id: 'current_user_id'},
                    {id: 'user_id'},
                ],
                post: {
                    id: 'root_id',
                },
                unread_replies: 0,
                unread_mentions: 0,
            };

            beforeAll(() => {
                TestHelper.initBasic(Client4);
            });

            beforeEach(() => {
                crt.value = 'on';
            });

            afterAll(() => {
                TestHelper.tearDown();
            });

            test('should not notify user on crt reply with crt on but not a followed thread', () => {
                nock(Client4.getBaseRoute()).
                    get((uri) => uri.includes('/users/current_user_id/teams/team_id/threads/root_id?extended=false')).
                    reply(500, thread);

                const store = testConfigureStore(baseState);
                return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                    expect(spy).not.toHaveBeenCalled();
                });
            });

            test('should not notify user on crt reply when the tab is active and the thread is open', () => {
                nock(Client4.getBaseRoute()).
                    get((uri) => uri.includes('/users/current_user_id/teams/team_id/threads/root_id?extended=false')).
                    reply(200, thread);

                baseState.views.threads.selectedThreadIdInTeam.team_id = 'root_id';
                baseState.views.browser.focused = true;

                const store = testConfigureStore(baseState);
                return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                    expect(spy).not.toHaveBeenCalled();
                });
            });

            test('should notify user on crt reply with crt on thread is followed', () => {
                nock(Client4.getBaseRoute()).
                    get((uri) => uri.includes('/users/current_user_id/teams/team_id/threads/root_id?extended=false')).
                    reply(200, thread);

                const store = testConfigureStore(baseState);
                return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                    expect(spy).toHaveBeenCalled();
                });
            });

            test('should not notify user on crt reply when desktop_threads is MENTION and there is no mention', () => {
                nock(Client4.getBaseRoute()).
                    get((uri) => uri.includes('/users/current_user_id/teams/team_id/threads/root_id?extended=false')).
                    reply(200, thread);

                userSettings.desktop = NotificationLevels.MENTION;
                userSettings.desktop_threads = NotificationLevels.MENTION;

                const store = testConfigureStore(baseState);
                return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                    expect(spy).not.toHaveBeenCalled();
                });
            });

            test('should notify user on crt reply when desktop_threads is MENTION and there are mentions', () => {
                nock(Client4.getBaseRoute()).
                    get((uri) => uri.includes('/users/current_user_id/teams/team_id/threads/root_id?extended=false')).
                    reply(200, thread);

                userSettings.desktop = NotificationLevels.MENTION;
                userSettings.desktop_threads = NotificationLevels.MENTION;
                msgProps.mentions = JSON.stringify(['current_user_id']);

                const store = testConfigureStore(baseState);
                return store.dispatch(sendDesktopNotification(post, msgProps)).then(() => {
                    expect(spy).toHaveBeenCalled();
                });
            });
        });
    });
});
