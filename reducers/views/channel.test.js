// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import channelReducer from 'reducers/views/channel';
import {ActionTypes} from 'utils/constants.jsx';

describe('Reducers.Channel', () => {
    const initialState = {
        channelSyncStatus: {},
        channelPostsStatus: {},
        focusedPostId: '',
        keepChannelIdAsUnread: null,
        lastChannelViewTime: {},
        mobileView: false,
        postVisibility: {},
    };

    test('Sync status true for a channel', () => {
        const nextState = channelReducer(
            initialState,
            {type: ActionTypes.CHANNEL_SYNC_STATUS, data: 'channelId'}
        );

        expect(nextState).toEqual({
            ...initialState,
            channelSyncStatus: {
                channelId: true,
            },
        });
    });

    test('Sync status false for all channels when socket disconnets', () => {
        const nextState = channelReducer(
            initialState,
            {
                type: ActionTypes.ALL_CHANNEL_SYNC_STATUS,
                data: {
                    channelIds: ['channel1', 'channel2'],
                    status: false,
                },
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            channelSyncStatus: {
                channel1: false,
                channel2: false,
            },
        });
    });

    test('channelPostsStatus change for atEnd', () => {
        const nextState = channelReducer(
            initialState,
            {
                type: ActionTypes.CHANNEL_POSTS_STATUS,
                data: {
                    channelId: 'channelId',
                    atEnd: false,
                },
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            channelPostsStatus: {
                channelId: {
                    atEnd: false,
                },
            },
        });
    });

    test('channelPostsStatus change for atStart', () => {
        const nextState = channelReducer(
            initialState,
            {
                type: ActionTypes.CHANNEL_POSTS_STATUS,
                data: {
                    channelId: 'channelId',
                    atStart: false,
                },
            }
        );

        expect(nextState).toEqual({
            ...initialState,
            channelPostsStatus: {
                channelId: {
                    atStart: false,
                },
            },
        });
    });
});
