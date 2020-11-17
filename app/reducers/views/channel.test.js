// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GeneralTypes, UserTypes} from 'mattermost-redux/action_types';

import channelReducer from 'reducers/views/channel';
import {ActionTypes} from 'utils/constants';

describe('Reducers.channel', () => {
    const initialState = {
        postVisibility: {},
        lastChannelViewTime: {},
        loadingPosts: {},
        focusedPostId: '',
        mobileView: false,
        lastUnreadChannel: null,
        lastGetPosts: {},
        toastStatus: false,
        channelPrefetchStatus: {},
    };

    test('Initial state', () => {
        const nextState = channelReducer(
            {},
            {},
        );

        expect(nextState).toEqual(initialState);
    });

    describe('channelPrefetchStatus', () => {
        test('should change status on dispatch of PREFETCH_POSTS_FOR_CHANNEL', () => {
            const nextState = channelReducer(
                initialState,
                {
                    type: ActionTypes.PREFETCH_POSTS_FOR_CHANNEL,
                    channelId: 'channelId',
                    status: 'success',
                },
            );

            expect(nextState).toEqual({
                ...initialState,
                channelPrefetchStatus: {
                    channelId: 'success',
                },
            });
        });

        test('should change clear channelPrefetchStatus on dispatch of WEBSOCKET_FAILURE', () => {
            const modifiedState = {
                ...initialState,
                channelPrefetchStatus: {
                    channelId: 'success',
                },
            };

            const nextState = channelReducer(
                modifiedState,
                {
                    type: GeneralTypes.WEBSOCKET_FAILURE,
                },
            );

            expect(nextState).toEqual(initialState);
        });

        test('should change clear channelPrefetchStatus on dispatch of WEBSOCKET_CLOSED', () => {
            const modifiedState = {
                ...initialState,
                channelPrefetchStatus: {
                    channelId: 'success',
                },
            };

            const nextState = channelReducer(
                modifiedState,
                {
                    type: GeneralTypes.WEBSOCKET_CLOSED,
                },
            );

            expect(nextState).toEqual(initialState);
        });

        test('should change clear channelPrefetchStatus on dispatch of LOGOUT_SUCCESS', () => {
            const modifiedState = {
                ...initialState,
                channelPrefetchStatus: {
                    channelId: 'success',
                },
            };

            const nextState = channelReducer(
                modifiedState,
                {
                    type: UserTypes.LOGOUT_SUCCESS,
                },
            );

            expect(nextState).toEqual(initialState);
        });
    });
});
