// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

let mockedCurrentUser;
jest.mock('../../stores/user_store.jsx', () => ({
    getCurrentUser: () => {
        return mockedCurrentUser;
    },
}));

import * as Utils from 'utils/channel_utils.jsx';
import Constants from 'utils/constants.jsx';

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

    describe('getChannelDisplayName', () => {
        describe('should return display name unmodified', () => {
            [Constants.DM_CHANNEL, Constants.OPEN_CHANNEL, Constants.PRIVATE_CHANNEL].forEach((type) => {
                it(`for channels of type ${type}`, () => {
                    mockedCurrentUser = {username: 'Display Name'};

                    const channel = {
                        type,
                        display_name: 'Display Name, with a comma!',
                    };
                    expect(Utils.getChannelDisplayName(channel)).toEqual(channel.display_name);
                });
            });

            it('if there is no current user', () => {
                mockedCurrentUser = null;

                const channel = {
                    type: Constants.GM_CHANNEL,
                    display_name: 'Display Name, with a comma!',
                };
                expect(Utils.getChannelDisplayName(channel)).toEqual(channel.display_name);
            });
        });

        describe('should splice out current username with three users', () => {
            const expectedChannelName = 'jason-4, jason-admin';

            beforeEach(() => {
                mockedCurrentUser = {username: 'jason'};
            });

            it('when at the beginning', () => {
                const channel = {
                    type: Constants.GM_CHANNEL,
                    display_name: 'jason, jason-4, jason-admin',
                };
                expect(Utils.getChannelDisplayName(channel)).toEqual(expectedChannelName);
            });

            it('when in the middle', () => {
                const channel = {
                    type: Constants.GM_CHANNEL,
                    display_name: 'jason-4, jason, jason-admin',
                };
                expect(Utils.getChannelDisplayName(channel)).toEqual(expectedChannelName);
            });

            it('when at the end', () => {
                const channel = {
                    type: Constants.GM_CHANNEL,
                    display_name: 'jason-4, jason-admin, jason',
                };
                expect(Utils.getChannelDisplayName(channel)).toEqual(expectedChannelName);
            });
        });

        describe('should splice out current username with four users', () => {
            const expectedChannelName = 'test, test2, test3';

            beforeEach(() => {
                mockedCurrentUser = {username: 'test1'};
            });

            it('when at the beginning', () => {
                const channel = {
                    type: Constants.GM_CHANNEL,
                    display_name: 'test1, test, test2, test3',
                };
                expect(Utils.getChannelDisplayName(channel)).toEqual(expectedChannelName);
            });

            it('when in the middle', () => {
                const channel = {
                    type: Constants.GM_CHANNEL,
                    display_name: 'test, test2, test1, test3',
                };
                expect(Utils.getChannelDisplayName(channel)).toEqual(expectedChannelName);
            });

            it('when at the end', () => {
                const channel = {
                    type: Constants.GM_CHANNEL,
                    display_name: 'test, test2, test3, test1',
                };
                expect(Utils.getChannelDisplayName(channel)).toEqual(expectedChannelName);
            });
        });
    });
});
