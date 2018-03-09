// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

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

    describe('showConvertOption', () => {
        test('users cannot convert default channel to private', () => {
            const channel = {name: Constants.DEFAULT_CHANNEL};
            expect(Utils.showConvertOption(channel, true, true)).
                toEqual(false);
        });

        test('users cannot convert private channel to private', () => {
            const channel = {
                name: 'fakeChannelName',
                type: Constants.PRIVATE_CHANNEL,
            };
            expect(Utils.showConvertOption(channel, true, true)).
                toEqual(false);
        });

        test('user who is not system admin nor team admin cannot convert channels', () => {
            const channel = {
                name: 'fakeChannelName',
                type: Constants.OPEN_CHANNEL,
            };
            expect(Utils.showConvertOption(channel, false, false)).
                toEqual(false);
        });

        test('user who is team admin but not system admin can convert channels', () => {
            const channel = {
                name: 'fakeChannelName',
                type: Constants.OPEN_CHANNEL,
            };
            expect(Utils.showConvertOption(channel, true, false)).
                toEqual(true);
        });

        test('user who is system admin but not team admin can convert channels', () => {
            const channel = {
                name: 'fakeChannelName',
                type: Constants.OPEN_CHANNEL,
            };
            expect(Utils.showConvertOption(channel, false, true)).
                toEqual(true);
        });

        test('user who is system admin and team admin can convert channels', () => {
            const channel = {
                name: 'fakeChannelName',
                type: Constants.OPEN_CHANNEL,
            };
            expect(Utils.showConvertOption(channel, true, true)).
                toEqual(true);
        });
    });
});
