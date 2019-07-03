// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import * as Actions from 'actions/notification_actions';

import * as Utils from 'utils/utils.jsx';

const mockStore = configureStore([thunk]);

jest.mock('utils/utils.jsx', () => ({
    ...jest.requireActual('utils/utils.jsx'),
    notifyMe: jest.fn(),
    ding: jest.fn(),
}));

const initialState = {
    entities: {
        channels: {
            currentChannelId: 'current_channel_id',
            myMembers: {
                current_channel_id: {
                    channel_id: 'current_channel_id',
                    user_id: 'current_user_id',
                    mention_count: 1,
                    msg_count: 9,
                },
                new_post_channel_id: {
                    channel_id: 'new_post_channel_id',
                    user_id: 'current_user_id',
                },
            },
            channels: {
                current_channel_id: {
                    id: 'current_channel_id',
                    type: 'O',
                    total_msg_count: 10,
                },
                new_post_channel_id: {
                    id: 'new_post_channel_id',
                    type: 'O',
                },
            },
        },
        users: {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {},
            },
            statuses: {
                current_user_id: 'online',
            },
        },
        preferences: {
            myPreferences: {},
        },
        general: {
            config: {},
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
