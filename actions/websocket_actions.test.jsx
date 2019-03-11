// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import store from 'stores/redux_store.jsx';

import {closeRightHandSide} from 'actions/views/rhs';

import {handlePostEditEvent, handleUserRemovedEvent} from './websocket_actions';

jest.mock('stores/redux_store', () => {
    return {
        dispatch: jest.fn(),
        getState: () => ({
            entities: {
                users: {
                    currentUserId: 'currentUserId',
                    profiles: {
                        user: {
                            id: 'user',
                        },
                    },
                    statuses: {
                        user: 'away',
                    },
                },
                general: {
                    config: {},
                },
                channels: {
                    currentChannelId: 'otherChannel',
                    channels: {},
                },
                preferences: {
                    myPreferences: {},
                },
            },
            views: {
                rhs: {
                    selectedChannelId: 'otherChannel',
                },
            },
        }),
    };
});

jest.mock('actions/views/rhs', () => ({
    closeRightHandSide: jest.fn(() => {
        return {type: ''};
    }),
}));

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

describe('handleUserRemovedEvent', () => {
    test('should close RHS', async () => {
        const msg = {
            data: {
                channel_id: 'otherChannel',
            },
            broadcast: {
                user_id: 'currentUserId',
            },
        };

        handleUserRemovedEvent(msg);
        expect(closeRightHandSide).toHaveBeenCalled();
    });
});
