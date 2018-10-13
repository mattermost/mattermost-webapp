// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

let mockedCurrentUser;
jest.mock('../../stores/user_store.jsx', () => ({
    getCurrentUser: () => {
        return mockedCurrentUser;
    },
}));

import * as Utils from 'utils/channel_utils.jsx';

describe('Channel Utils', () => {
    describe('findNextUnreadChannelId', () => {
        test('no channels are unread', () => {
            const curChannelId = '3';
            const allChannelIds = ['1', '2', '3', '4', '5'];
            const unreadChannelIds = [];

            expect(Utils.findNextUnreadChannelId(curChannelId, allChannelIds, unreadChannelIds, 1)).toEqual(-1);
        });

        test('only current channel is unread', () => {
            const curChannelId = '3';
            const allChannelIds = ['1', '2', '3', '4', '5'];
            const unreadChannelIds = ['3'];

            expect(Utils.findNextUnreadChannelId(curChannelId, allChannelIds, unreadChannelIds, 1)).toEqual(-1);
        });

        test('going forward to unread channels', () => {
            const curChannelId = '3';
            const allChannelIds = ['1', '2', '3', '4', '5'];
            const unreadChannelIds = ['1', '4', '5'];

            expect(Utils.findNextUnreadChannelId(curChannelId, allChannelIds, unreadChannelIds, 1)).toEqual(3);
        });

        test('going forward to unread channels with wrapping', () => {
            const curChannelId = '3';
            const allChannelIds = ['1', '2', '3', '4', '5'];
            const unreadChannelIds = ['1', '2'];

            expect(Utils.findNextUnreadChannelId(curChannelId, allChannelIds, unreadChannelIds, 1)).toEqual(0);
        });

        test('going backwards to unread channels', () => {
            const curChannelId = '3';
            const allChannelIds = ['1', '2', '3', '4', '5'];
            const unreadChannelIds = ['1', '4', '5'];

            expect(Utils.findNextUnreadChannelId(curChannelId, allChannelIds, unreadChannelIds, -1)).toEqual(0);
        });

        test('going backwards to unread channels with wrapping', () => {
            const curChannelId = '3';
            const allChannelIds = ['1', '2', '3', '4', '5'];
            const unreadChannelIds = ['3', '4', '5'];

            expect(Utils.findNextUnreadChannelId(curChannelId, allChannelIds, unreadChannelIds, -1)).toEqual(4);
        });
    });

    describe('makeGetChannelUrlById', () => {
        const initialState = {
            entities: {
                general: {
                    config: {
                        TeammateNameDisplay: 'full',
                    },
                },
                teams: {
                    currentTeamId: 'team-1',
                    teams: {
                        'team-1': {
                            id: 'team-1',
                            name: 'team',
                            displayName: 'Team',
                        },
                    },
                },
                channels: {
                    currentChannelId: 'channel-1',
                    channels: {
                        'channel-1': {
                            id: 'channel-1',
                            name: 'test-channel-1',
                            displayName: 'Test Channel 1',
                            teamId: '',
                        },
                        'channel-2': {
                            id: 'channel-2',
                            name: 'test-channel-2',
                            displayName: 'Test Channel 2',
                            teamId: 'team-1',
                        },
                    },
                },
                users: {},
                preferences: {
                    myPreferences: {},
                },
            },
        };
        const getChannelUrlById = Utils.makeGetChannelUrlById(initialState);

        it('should return url for test-channel-1', () => {
            const url = getChannelUrlById('channel-1');
            expect(url).toEqual('/team/channels/test-channel-1');
        });

        it('should return url for test-channel-2', () => {
            const url = getChannelUrlById('channel-2');
            expect(url).toEqual('/team/channels/test-channel-2');
        });
    });
});
