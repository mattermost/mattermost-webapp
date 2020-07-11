// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    getProfilesAndStatusesForPosts,
    getThreadsForPosts,
    receivedNewPost,
} from 'mattermost-redux/actions/posts';
import {ChannelTypes, UserTypes} from 'mattermost-redux/action_types';
import {
    getMissingProfilesByIds,
    getStatusesByIds,
    getUser,
} from 'mattermost-redux/actions/users';
import {
    getChannelStats,
} from 'mattermost-redux/actions/channels';
import {General, WebsocketEvents} from 'mattermost-redux/constants';

import {handleNewPost} from 'actions/post_actions';
import {closeRightHandSide} from 'actions/views/rhs';
import {syncPostsInChannel} from 'actions/views/channel';

import store from 'stores/redux_store.jsx';

import configureStore from 'tests/test_store';

import {browserHistory} from 'utils/browser_history';
import Constants, {SocketEvents, UserStatuses, ActionTypes} from 'utils/constants';

import {
    handleChannelUpdatedEvent,
    handleEvent,
    handleNewPostEvent,
    handleNewPostEvents,
    handlePluginEnabled,
    handlePluginDisabled,
    handlePostEditEvent,
    handlePostUnreadEvent,
    handleUserRemovedEvent,
    handleUserTypingEvent,
    handleUserUpdatedEvent,
    handleLeaveTeamEvent,
    reconnect,
} from './websocket_actions';

jest.mock('mattermost-redux/actions/posts', () => ({
    ...jest.requireActual('mattermost-redux/actions/posts'),
    getThreadsForPosts: jest.fn(() => ({type: 'GET_THREADS_FOR_POSTS'})),
    getProfilesAndStatusesForPosts: jest.fn(),
}));

jest.mock('mattermost-redux/actions/users', () => ({
    getMissingProfilesByIds: jest.fn(() => ({type: 'GET_MISSING_PROFILES_BY_IDS'})),
    getStatusesByIds: jest.fn(() => ({type: 'GET_STATUSES_BY_IDS'})),
    getUser: jest.fn(() => ({type: 'GET_STATUSES_BY_IDS'})),
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    getChannelStats: jest.fn(() => ({type: 'GET_CHANNEL_STATS'})),
}));

jest.mock('actions/post_actions', () => ({
    ...jest.requireActual('actions/post_actions'),
    handleNewPost: jest.fn(() => ({type: 'HANDLE_NEW_POST'})),
}));

jest.mock('actions/global_actions', () => ({
    ...jest.requireActual('actions/global_actions'),
    redirectUserToDefaultTeam: jest.fn(),
}));

jest.mock('actions/views/channel', () => ({
    ...jest.requireActual('actions/views/channel'),
    syncPostsInChannel: jest.fn(),
}));

jest.mock('utils/browser_history');

const mockState = {
    entities: {
        users: {
            currentUserId: 'currentUserId',
            profiles: {
                currentUserId: {
                    id: 'currentUserId',
                    roles: 'system_guest',
                },
                user: {
                    id: 'user',
                    roles: 'system_guest',
                },
            },
            statuses: {
                user: 'away',
            },
        },
        roles: {
            roles: {
                system_guest: {
                    permissions: ['view_members'],
                },
            },
        },
        general: {
            config: {},
        },
        channels: {
            currentChannelId: 'otherChannel',
            channels: {
                otherChannel: {
                    id: 'otherChannel',
                    team_id: 'otherTeam',
                },
            },
            channelsInTeam: {
                team: ['channel1', 'channel2'],
            },
            membersInChannel: {
                otherChannel: {},
            },
        },
        preferences: {
            myPreferences: {},
        },
        teams: {
            currentTeamId: 'currentTeamId',
            teams: {
                currentTeamId: {
                    id: 'currentTeamId',
                    name: 'test',
                },
            },
        },
        posts: {
            posts: {
                post1: {id: 'post1', channel_id: 'otherChannel', create_at: '12341'},
                post2: {id: 'post2', channel_id: 'otherChannel', create_at: '12342'},
                post3: {id: 'post3', channel_id: 'channel2', create_at: '12343'},
                post4: {id: 'post4', channel_id: 'channel2', create_at: '12344'},
                post5: {id: 'post5', channel_id: 'otherChannel', create_at: '12345'},
            },
            postsInChannel: {
                otherChannel: [{
                    order: ['post5', 'post2', 'post1'],
                    recent: true,
                }],
            },
        },
    },
    views: {
        rhs: {
            selectedChannelId: 'otherChannel',
        },
    },
    websocket: {},
    plugins: {
        components: {
            RightHandSidebarComponent: [],
        },
    },
};

jest.mock('stores/redux_store', () => {
    return {
        dispatch: jest.fn(),
        getState: () => mockState,
    };
});

jest.mock('actions/views/rhs', () => ({
    closeRightHandSide: jest.fn(() => {
        return {type: ''};
    }),
}));

describe('handleEvent', () => {
    test('should dispatch channel updated event properly', () => {
        const msg = {event: SocketEvents.CHANNEL_UPDATED};

        handleEvent(msg);

        expect(store.dispatch).toHaveBeenCalled();
    });
});

describe('handlePostEditEvent', () => {
    test('post edited', async () => {
        const post = '{"id":"test","create_at":123,"update_at":123,"user_id":"user","channel_id":"12345","root_id":"","message":"asd","pending_post_id":"2345","metadata":{}}';
        const expectedAction = {type: 'RECEIVED_POST', data: JSON.parse(post)};
        const msg = {
            data: {
                post,
            },
            broadcast: {
                channel_id: '1234657',
            },
        };

        handlePostEditEvent(msg);
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});

describe('handlePostUnreadEvent', () => {
    test('post marked as unred', async () => {
        const msgData = {last_viewed_at: 123, msg_count: 40, mention_count: 1};
        const expectedData = {lastViewedAt: 123, msgCount: 40, mentionCount: 1, channelId: 'channel1'};
        const expectedAction = {type: 'POST_UNREAD_SUCCESS', data: expectedData};
        const msg = {
            data: msgData,
            broadcast: {
                channel_id: 'channel1',
            },
        };

        handlePostUnreadEvent(msg);
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});

describe('handleUserUpdatedEvent', () => {
    test('should not get channel stats if user is not guest', async () => {
        const msg = {
            data: {
                user: {
                    id: 'userid',
                    roles: 'system_user',
                },
            },
        };

        await handleUserUpdatedEvent(msg);
        expect(getChannelStats).not.toHaveBeenCalled();
    });

    test('should not get channel stats if user is not in current channel', async () => {
        const msg = {
            data: {
                user: {
                    id: 'userid',
                    roles: 'system_user',
                },
            },
        };

        await handleUserUpdatedEvent(msg);
        expect(getChannelStats).not.toHaveBeenCalled();
    });

    test('should get channel stats if user is guest and in current channel', async () => {
        const msg = {
            data: {
                user: {
                    id: 'guestid',
                    roles: 'system_guest',
                },
            },
        };

        mockState.entities.channels.membersInChannel.otherChannel = {
            guestid: {
                id: 'guestid',
            },
        };

        await handleUserUpdatedEvent(msg);
        mockState.entities.channels.membersInChannel.otherChannel = {};
        expect(getChannelStats).toHaveBeenCalled();
    });
});

describe('handleUserRemovedEvent', () => {
    let redirectUserToDefaultTeam;
    beforeEach(async () => {
        const globalActions = require('actions/global_actions'); // eslint-disable-line global-require
        redirectUserToDefaultTeam = globalActions.redirectUserToDefaultTeam;
        redirectUserToDefaultTeam.mockReset();
    });

    test('should close RHS', async () => {
        const msg = {
            data: {
                channel_id: 'otherChannel',
            },
            broadcast: {
                user_id: 'currentUserId',
            },
        };

        await handleUserRemovedEvent(msg);
        expect(closeRightHandSide).toHaveBeenCalled();
    });

    test('shouldn\'t remove the team user if the user have view members permissions', async () => {
        const expectedAction = {
            meta: {batch: true},
            payload: [
                {type: 'RECEIVED_PROFILE_NOT_IN_TEAM', data: {id: 'otherTeam', user_id: 'guestId'}},
                {type: 'REMOVE_MEMBER_FROM_TEAM', data: {team_id: 'otherTeam', user_id: 'guestId'}},
            ],
            type: 'BATCHING_REDUCER.BATCH',
        };
        const msg = {
            data: {
                channel_id: 'otherChannel',
            },
            broadcast: {
                user_id: 'guestId',
            },
        };

        await handleUserRemovedEvent(msg);
        expect(store.dispatch).not.toHaveBeenCalledWith(expectedAction);
    });

    test('should remove the team user if the user doesn\'t have view members permissions', async () => {
        const expectedAction = {
            meta: {batch: true},
            payload: [
                {type: 'RECEIVED_PROFILE_NOT_IN_TEAM', data: {id: 'otherTeam', user_id: 'guestId'}},
                {type: 'REMOVE_MEMBER_FROM_TEAM', data: {team_id: 'otherTeam', user_id: 'guestId'}},
            ],
            type: 'BATCHING_REDUCER.BATCH',
        };
        const msg = {
            data: {
                channel_id: 'otherChannel',
            },
            broadcast: {
                user_id: 'guestId',
            },
        };

        mockState.entities.roles.roles = {system_guest: {permissions: []}};
        await handleUserRemovedEvent(msg);
        mockState.entities.roles.roles = {system_guest: {permissions: ['view_members']}};
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    test('should load the remover_id user if is not available in the store', async () => {
        const msg = {
            data: {
                channel_id: 'otherChannel',
                remover_id: 'otherUser',
            },
            broadcast: {
                user_id: 'currentUserId',
            },
        };

        await handleUserRemovedEvent(msg);
        expect(getUser).toHaveBeenCalledWith('otherUser');
    });

    test('should not load the remover_id user if is available in the store', async () => {
        const msg = {
            data: {
                channel_id: 'otherChannel',
                remover_id: 'user',
            },
            broadcast: {
                user_id: 'currentUserId',
            },
        };

        await handleUserRemovedEvent(msg);
        expect(getUser).not.toHaveBeenCalled();
    });

    test('should redirect if the user removed is the current user from the current channel', async () => {
        const msg = {
            data: {
                channel_id: 'otherChannel',
                remover_id: 'user',
            },
            broadcast: {
                user_id: 'currentUserId',
            },
        };
        await handleUserRemovedEvent(msg);
        expect(redirectUserToDefaultTeam).toHaveBeenCalled();
    });

    test('should not redirect if the user removed is not the current user or the channel is not the current channel, or the remover and the user is equal', async () => {
        let msg = {
            data: {
                channel_id: 'otherChannel',
                remover_id: 'user',
            },
            broadcast: {
                user_id: 'guestId',
            },
        };

        await handleUserRemovedEvent(msg);
        expect(redirectUserToDefaultTeam).not.toHaveBeenCalled();

        msg = {
            data: {
                channel_id: 'channel1',
                remover_id: 'otherUser',
            },
            broadcast: {
                user_id: 'currentUserId',
            },
        };

        await handleUserRemovedEvent(msg);
        expect(redirectUserToDefaultTeam).not.toHaveBeenCalled();

        msg = {
            data: {
                channel_id: 'otherChannel',
                remover_id: 'currentUserId',
            },
            broadcast: {
                user_id: 'currentUserId',
            },
        };

        await handleUserRemovedEvent(msg);
        expect(redirectUserToDefaultTeam).not.toHaveBeenCalled();
    });
});

describe('handleNewPostEvent', () => {
    const initialState = {
        entities: {
            users: {
                currentUserId: 'user1',
                isManualStatus: {},
            },
        },
    };

    test('should receive post correctly', () => {
        const testStore = configureStore(initialState);

        const post = {id: 'post1', channel_id: 'channel1', user_id: 'user1'};
        const msg = {
            data: {
                post: JSON.stringify(post),
                set_online: true,
            },
        };

        testStore.dispatch(handleNewPostEvent(msg));
        expect(getProfilesAndStatusesForPosts).toHaveBeenCalledWith([post], expect.anything(), expect.anything());
        expect(handleNewPost).toHaveBeenCalledWith(post, msg);
    });

    test('should set other user to online', () => {
        const testStore = configureStore(initialState);

        const post = {id: 'post1', channel_id: 'channel1', user_id: 'user2'};
        const msg = {
            data: {
                post: JSON.stringify(post),
                set_online: true,
            },
        };

        testStore.dispatch(handleNewPostEvent(msg));

        expect(testStore.getActions()).toContainEqual({
            type: UserTypes.RECEIVED_STATUSES,
            data: [{user_id: post.user_id, status: UserStatuses.ONLINE}],
        });
    });

    test('should not set other user to online if post was from autoresponder', () => {
        const testStore = configureStore(initialState);

        const post = {id: 'post1', channel_id: 'channel1', user_id: 'user2', type: Constants.AUTO_RESPONDER};
        const msg = {
            data: {
                post: JSON.stringify(post),
                set_online: false,
            },
        };

        testStore.dispatch(handleNewPostEvent(msg));

        expect(testStore.getActions()).not.toContainEqual({
            type: UserTypes.RECEIVED_STATUSES,
            data: [{user_id: post.user_id, status: UserStatuses.ONLINE}],
        });
    });

    test('should not set other user to online if status was manually set', () => {
        const testStore = configureStore({
            ...initialState,
            entities: {
                ...initialState.entities,
                users: {
                    ...initialState.entities.users,
                    isManualStatus: {
                        user2: true,
                    },
                },
            },
        });

        const post = {id: 'post1', channel_id: 'channel1', user_id: 'user2'};
        const msg = {
            data: {
                post: JSON.stringify(post),
                set_online: true,
            },
        };

        testStore.dispatch(handleNewPostEvent(msg));

        expect(testStore.getActions()).not.toContainEqual({
            type: UserTypes.RECEIVED_STATUSES,
            data: [{user_id: post.user_id, status: UserStatuses.ONLINE}],
        });
    });

    test('should not set other user to online based on data from the server', () => {
        const testStore = configureStore(initialState);

        const post = {id: 'post1', channel_id: 'channel1', user_id: 'user2'};
        const msg = {
            data: {
                post: JSON.stringify(post),
                set_online: false,
            },
        };

        testStore.dispatch(handleNewPostEvent(msg));

        expect(testStore.getActions()).not.toContainEqual({
            type: UserTypes.RECEIVED_STATUSES,
            data: [{user_id: post.user_id, status: UserStatuses.ONLINE}],
        });
    });
});

describe('handleNewPostEvents', () => {
    test('should receive multiple posts correctly', () => {
        const testStore = configureStore();

        const posts = [
            {id: 'post1', channel_id: 'channel1'},
            {id: 'post2', channel_id: 'channel1'},
            {id: 'post3', channel_id: 'channel2'},
            {id: 'post4', channel_id: 'channel2'},
            {id: 'post5', channel_id: 'channel1'},
        ];

        const queue = posts.map((post) => {
            return {
                data: {post: JSON.stringify(post)},
            };
        });

        testStore.dispatch(handleNewPostEvents(queue));

        expect(testStore.getActions()).toEqual([
            {
                meta: {batch: true},
                payload: posts.map(receivedNewPost),
                type: 'BATCHING_REDUCER.BATCH',
            },
            {
                type: 'GET_THREADS_FOR_POSTS',
            },
        ]);
        expect(getThreadsForPosts).toHaveBeenCalledWith(posts);
        expect(getProfilesAndStatusesForPosts).toHaveBeenCalledWith(posts, expect.anything(), expect.anything());
    });
});

describe('reconnect', () => {
    test('should call syncPostsInChannel when socket reconnects', () => {
        reconnect(false);
        expect(syncPostsInChannel).toHaveBeenCalledWith('otherChannel', '12345');
    });
});

describe('handleUserTypingEvent', () => {
    const initialState = {
        entities: {
            general: {
                config: {},
            },
            users: {
                currentUserId: 'user',
                statuses: {},
                users: {},
            },
        },
    };

    test('should dispatch a TYPING event', () => {
        const testStore = configureStore(initialState);

        const channelId = 'channel';
        const rootId = 'root';
        const userId = 'otheruser';
        const msg = {
            broadcast: {
                channel_id: channelId,
            },
            data: {
                parent_id: rootId,
                user_id: userId,
            },
        };

        testStore.dispatch(handleUserTypingEvent(msg));

        expect(testStore.getActions().find((action) => action.type === WebsocketEvents.TYPING)).toMatchObject({
            type: WebsocketEvents.TYPING,
            data: {
                id: channelId + rootId,
                userId,
            },
        });
    });

    test('should possibly load missing users and not get again the state', () => {
        const testStore = configureStore(initialState);

        const userId = 'otheruser';
        const msg = {
            broadcast: {
                channel_id: 'channel',
            },
            data: {
                parent_id: '',
                user_id: userId,
            },
        };

        testStore.dispatch(handleUserTypingEvent(msg));

        expect(getMissingProfilesByIds).toHaveBeenCalledWith([userId]);
        expect(getStatusesByIds).not.toHaveBeenCalled();
    });

    test('should load statuses for users that are not online but are in the store', async () => {
        const testStore = configureStore({
            ...initialState,
            entities: {
                ...initialState.entities,
                users: {
                    ...initialState.entities.users,
                    profiles: {
                        ...initialState.entities.users.profiles,
                        otheruser: {
                            id: 'otheruser',
                            roles: 'system_user',
                        },
                    },
                    statuses: {
                        ...initialState.entities.users.statuses,
                        otheruser: General.AWAY,
                    },
                },
            },
        });

        const userId = 'otheruser';
        const msg = {
            broadcast: {
                channel_id: 'channel',
            },
            data: {
                parent_id: '',
                user_id: userId,
            },
        };

        await testStore.dispatch(handleUserTypingEvent(msg));

        expect(getStatusesByIds).toHaveBeenCalled();
    });

    test('should not load statuses for users that are online', () => {
        const testStore = configureStore({
            ...initialState,
            entities: {
                ...initialState.entities,
                users: {
                    ...initialState.entities.users,
                    statuses: {
                        ...initialState.entities.users.statuses,
                        otheruser: General.ONLINE,
                    },
                },
            },
        });

        const userId = 'otheruser';
        const msg = {
            broadcast: {
                channel_id: 'channel',
            },
            data: {
                parent_id: '',
                user_id: userId,
            },
        };

        testStore.dispatch(handleUserTypingEvent(msg));

        expect(getStatusesByIds).not.toHaveBeenCalled();
    });
});

describe('handleChannelUpdatedEvent', () => {
    const initialState = {
        entities: {
            channels: {
                currentChannelId: 'channel',
            },
            teams: {
                currentTeamId: 'team',
                teams: {
                    team: {id: 'team', name: 'team'},
                },
            },
        },
    };

    test('when a channel is updated', () => {
        const testStore = configureStore(initialState);

        const channel = {id: 'channel'};
        const msg = {data: {channel: JSON.stringify(channel)}};

        testStore.dispatch(handleChannelUpdatedEvent(msg));

        expect(testStore.getActions()).toEqual([
            {type: ChannelTypes.RECEIVED_CHANNEL, data: channel},
        ]);
    });

    test('should not change URL when current channel is updated', () => {
        const testStore = configureStore(initialState);

        const channel = {id: 'channel'};
        const msg = {data: {channel: JSON.stringify(channel)}};

        testStore.dispatch(handleChannelUpdatedEvent(msg));

        expect(browserHistory.replace).toHaveBeenCalled();
    });

    test('should not change URL when another channel is updated', () => {
        const testStore = configureStore(initialState);

        const channel = {id: 'otherchannel'};
        const msg = {data: {channel: JSON.stringify(channel)}};

        testStore.dispatch(handleChannelUpdatedEvent(msg));

        expect(browserHistory.replace).not.toHaveBeenCalled();
    });
});

describe('handlePluginEnabled/handlePluginDisabled', () => {
    const origLog = console.log;
    const origError = console.error;
    const origCreateElement = document.createElement;
    const origGetElementsByTagName = document.getElementsByTagName;
    const origWindowPlugins = window.plugins;

    afterEach(() => {
        console.log = origLog;
        console.error = origError;
        document.createElement = origCreateElement;
        document.getElementsByTagName = origGetElementsByTagName;
        window.plugins = origWindowPlugins;
    });

    describe('handlePluginEnabled', () => {
        const baseManifest = {
            name: 'Demo Plugin',
            description: 'This plugin demonstrates the capabilities of a Mattermost plugin.',
            version: '0.2.0',
            min_server_version: '5.12.0',
            server: {
                executables: {
                    'linux-amd64': 'server/dist/plugin-linux-amd64',
                    'darwin-amd64': 'server/dist/plugin-darwin-amd64',
                    'windows-amd64': 'server/dist/plugin-windows-amd64.exe',
                },
            },
            webapp: {
                bundle_path: 'webapp/dist/main.js',
            },
        };

        beforeEach(async () => {
            console.log = jest.fn();
            console.error = jest.fn();

            document.createElement = jest.fn();
            document.getElementsByTagName = jest.fn();
            document.getElementsByTagName.mockReturnValue([{
                appendChild: jest.fn(),
            }]);
        });

        test('when a plugin is enabled', () => {
            const manifest = {
                ...baseManifest,
                id: 'com.mattermost.demo-plugin',
            };
            const initialize = jest.fn();
            window.plugins = {
                [manifest.id]: {
                    initialize,
                },
            };

            const mockScript = {};
            document.createElement.mockReturnValue(mockScript);

            expect(mockScript.onload).toBeUndefined();
            handlePluginEnabled({data: {manifest}});

            expect(document.createElement).toHaveBeenCalledWith('script');
            expect(document.getElementsByTagName).toHaveBeenCalledTimes(1);
            expect(document.getElementsByTagName()[0].appendChild).toHaveBeenCalledTimes(1);
            expect(mockScript.onload).toBeInstanceOf(Function);

            // Pretend to be a browser, invoke onload
            mockScript.onload();
            expect(initialize).toHaveBeenCalledWith(expect.anything(), store);
            const registery = initialize.mock.calls[0][0];
            const mockComponent = 'mockRootComponent';
            registery.registerRootComponent(mockComponent);

            const dispatchArg = store.dispatch.mock.calls[0][0];
            expect(dispatchArg.type).toBe(ActionTypes.RECEIVED_PLUGIN_COMPONENT);
            expect(dispatchArg.name).toBe('Root');
            expect(dispatchArg.data.component).toBe(mockComponent);
            expect(dispatchArg.data.pluginId).toBe(manifest.id);

            // Assert handlePluginEnabled is idempotent
            mockScript.onload = undefined;
            handlePluginEnabled({data: {manifest}});
            expect(mockScript.onload).toBeUndefined();

            expect(store.dispatch).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledTimes(0);
        });

        test('when a plugin is upgraded', () => {
            const manifest = {
                ...baseManifest,
                id: 'com.mattermost.demo-2-plugin',
            };
            const initialize = jest.fn();
            window.plugins = {
                [manifest.id]: {
                    initialize,
                },
            };

            const manifestv2 = {
                ...manifest,
                webapp: {
                    bundle_path: 'webapp/dist/main2.0.js',
                },
            };

            const mockScript = {};
            document.createElement.mockReturnValue(mockScript);

            expect(mockScript.onload).toBeUndefined();
            handlePluginEnabled({data: {manifest}});

            expect(document.createElement).toHaveBeenCalledWith('script');
            expect(document.getElementsByTagName).toHaveBeenCalledTimes(1);
            expect(document.getElementsByTagName()[0].appendChild).toHaveBeenCalledTimes(1);
            expect(mockScript.onload).toBeInstanceOf(Function);

            // Pretend to be a browser, invoke onload
            mockScript.onload();
            expect(initialize).toHaveBeenCalledWith(expect.anything(), store);
            const registry = initialize.mock.calls[0][0];
            const mockComponent = 'mockRootComponent';
            registry.registerRootComponent(mockComponent);

            const dispatchReceivedArg = store.dispatch.mock.calls[0][0];
            expect(dispatchReceivedArg.type).toBe(ActionTypes.RECEIVED_PLUGIN_COMPONENT);
            expect(dispatchReceivedArg.name).toBe('Root');
            expect(dispatchReceivedArg.data.component).toBe(mockComponent);
            expect(dispatchReceivedArg.data.pluginId).toBe(manifest.id);

            // Upgrade plugin
            mockScript.onload = undefined;
            handlePluginEnabled({data: {manifest: manifestv2}});

            // Assert upgrade is idempotent
            handlePluginEnabled({data: {manifest: manifestv2}});

            expect(mockScript.onload).toBeInstanceOf(Function);
            expect(document.createElement).toHaveBeenCalledTimes(2);

            mockScript.onload();
            expect(initialize).toHaveBeenCalledWith(expect.anything(), store);
            expect(initialize).toHaveBeenCalledTimes(2);
            const registry2 = initialize.mock.calls[0][0];
            const mockComponent2 = 'mockRootComponent2';
            registry2.registerRootComponent(mockComponent2);

            expect(store.dispatch).toHaveBeenCalledTimes(3);
            const dispatchRemovedArg = store.dispatch.mock.calls[1][0];
            expect(typeof dispatchRemovedArg).toBe('function');
            dispatchRemovedArg(store.dispatch);

            const dispatchReceivedArg2 = store.dispatch.mock.calls[2][0];
            expect(dispatchReceivedArg2.type).toBe(ActionTypes.RECEIVED_PLUGIN_COMPONENT);
            expect(dispatchReceivedArg2.name).toBe('Root');
            expect(dispatchReceivedArg2.data.component).toBe(mockComponent2);
            expect(dispatchReceivedArg2.data.pluginId).toBe(manifest.id);

            expect(store.dispatch).toHaveBeenCalledTimes(5);
            const dispatchReceivedArg4 = store.dispatch.mock.calls[4][0];
            expect(dispatchReceivedArg4.type).toBe(ActionTypes.REMOVED_WEBAPP_PLUGIN);
            expect(dispatchReceivedArg4.data).toBe(manifestv2);

            expect(console.error).toHaveBeenCalledTimes(0);
        });
    });

    describe('handlePluginDisabled', () => {
        const baseManifest = {
            name: 'Demo Plugin',
            description: 'This plugin demonstrates the capabilities of a Mattermost plugin.',
            version: '0.2.0',
            min_server_version: '5.12.0',
            server: {
                executables: {
                    'linux-amd64': 'server/dist/plugin-linux-amd64',
                    'darwin-amd64': 'server/dist/plugin-darwin-amd64',
                    'windows-amd64': 'server/dist/plugin-windows-amd64.exe',
                },
            },
            webapp: {
                bundle_path: 'webapp/dist/main.js',
            },
        };

        beforeEach(async () => {
            console.log = jest.fn();
            console.error = jest.fn();

            document.createElement = jest.fn();
            document.getElementsByTagName = jest.fn();
            document.getElementsByTagName.mockReturnValue([{
                appendChild: jest.fn(),
            }]);
        });

        test('when a plugin is disabled', () => {
            const manifest = {
                ...baseManifest,
                id: 'com.mattermost.demo-3-plugin',
            };
            const initialize = jest.fn();
            window.plugins = {
                [manifest.id]: {
                    initialize,
                },
            };

            const mockScript = {};
            document.createElement.mockReturnValue(mockScript);

            expect(mockScript.onload).toBeUndefined();

            // Enable plugin
            handlePluginEnabled({data: {manifest}});

            expect(document.createElement).toHaveBeenCalledWith('script');
            expect(document.createElement).toHaveBeenCalledTimes(1);

            // Disable plugin
            handlePluginDisabled({data: {manifest}});

            // Assert handlePluginDisabled is idempotent
            handlePluginDisabled({data: {manifest}});

            expect(store.dispatch).toHaveBeenCalledTimes(2);
            const dispatchRemovedArg = store.dispatch.mock.calls[0][0];
            expect(typeof dispatchRemovedArg).toBe('function');
            dispatchRemovedArg(store.dispatch);

            expect(store.dispatch).toHaveBeenCalledTimes(4);
            const dispatchReceivedArg3 = store.dispatch.mock.calls[3][0];
            expect(dispatchReceivedArg3.type).toBe(ActionTypes.REMOVED_WEBAPP_PLUGIN);
            expect(dispatchReceivedArg3.data).toBe(manifest);

            expect(console.error).toHaveBeenCalledTimes(0);
        });
    });
});

describe('handleLeaveTeam', () => {
    test('when a user leave a team', () => {
        const msg = {data: {team_id: 'team', user_id: 'member1'}};

        handleLeaveTeamEvent(msg);

        const expectedAction = {
            meta: {
                batch: true,
            },
            payload: [
                {
                    data: {id: 'team', user_id: 'member1'},
                    type: 'RECEIVED_PROFILE_NOT_IN_TEAM',
                },
                {
                    data: {team_id: 'team', user_id: 'member1'},
                    type: 'REMOVE_MEMBER_FROM_TEAM',
                },
                {
                    data: {id: 'channel1', user_id: 'member1'},
                    type: 'REMOVE_MEMBER_FROM_CHANNEL',
                },
                {
                    data: {id: 'channel2', user_id: 'member1'},
                    type: 'REMOVE_MEMBER_FROM_CHANNEL',
                },
            ],
            type: 'BATCHING_REDUCER.BATCH',
        };
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
