// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {Posts} from 'mattermost-redux/constants';

import * as Actions from 'actions/notification_actions';

import * as Utils from 'utils/utils.jsx';

const mockStore = configureStore([thunk]);

jest.mock('utils/utils.jsx', () => ({
    ...jest.requireActual('utils/utils.jsx'),
    notifyMe: jest.fn(),
    ding: jest.fn(),
}));

const latestPost = {
    id: 'latest_post_id',
    user_id: 'current_user_id',
    message: 'test msg',
    channel_id: 'current_channel_id',
};

const initialState = {
    entities: {
        channels: {
            currentChannelId: 'current_channel_id',
            myMembers: {
                current_channel_id: {
                    channel_id: 'current_channel_id',
                    user_id: 'current_user_id',
                    roles: 'channel_role',
                    mention_count: 1,
                    msg_count: 9,
                },
                new_post_channel_id: {
                    channel_id: 'new_post_channel_id',
                    user_id: 'current_user_id',
                    roles: 'channel_role',
                    mention_count: 0,
                    msg_count: 0,
                },
            },
            channels: {
                current_channel_id: {
                    id: 'current_channel_id',
                    name: 'default-name',
                    display_name: 'Default',
                    delete_at: 0,
                    type: 'O',
                    total_msg_count: 10,
                    team_id: 'team_id',
                },
            },
            channelsInTeam: {
                'team-id': ['current_channel_id'],
            },
        },
        teams: {
            currentTeamId: 'team-id',
            teams: {
                'team-id': {
                    id: 'team_id',
                    name: 'team-1',
                    displayName: 'Team 1',
                },
            },
            myMembers: {
                'team-id': {roles: 'team_role'},
            },
        },
        users: {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_role'},
            },
            statuses: {
                current_user_id: 'online',
            },
        },
        posts: {
            posts: {
                [latestPost.id]: latestPost,
            },
            postsInChannel: {
                current_channel_id: [
                    {order: [latestPost.id], recent: true},
                ],
            },
            postsInThread: {},
            messagesHistory: {
                index: {
                    [Posts.MESSAGE_TYPES.COMMENT]: 0,
                },
                messages: ['test message'],
            },
        },
        preferences: {
            myPreferences: {
                'display_settings--name_format': {
                    category: 'display_settings',
                    name: 'name_format',
                    user_id: 'current_user_id',
                    value: 'username',
                },
            },
        },
        roles: {
            roles: {
                system_role: {
                    permissions: [],
                },
                team_role: {
                    permissions: [],
                },
                channel_role: {
                    permissions: [],
                },
            },
        },
        general: {
            license: {IsLicensed: 'false'},
            serverVersion: '5.4.0',
            config: {PostEditTimeLimit: -1},
        },
    },
};

describe('Actions.Notification', () => {
    test('preventNotificationIfThreadedRHS', async () => {
        const newPost = {
            id: 'new_post_id',
            root_id: 'new_post_root_id',
            channel_id: 'new_post_channel_id',
            message: 'new message',
            user_id: 'new_post_user_id',
            props: {},
        };
        const webSocketProps = {
            team_id: 'team_id',
            mentions: JSON.stringify(['current_user_id']),
            post: JSON.stringify(newPost),
        };

        const store = await mockStore({
            ...initialState,
            views: {
                ...initialState.views,
                browser: {
                    focused: true,
                },
                rhs: {
                    selectedPostId: newPost.root_id,
                },
            },
        });

        await store.dispatch(Actions.sendDesktopNotification(newPost, webSocketProps));
        expect(Utils.notifyMe).not.toHaveBeenCalled();
        expect(Utils.ding).not.toHaveBeenCalled();
    });
});
