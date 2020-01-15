// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {DATE_LINE} from 'mattermost-redux/utils/post_list';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import {PostListRowListIds} from 'utils/constants';

import ToastWrapper, {TOAST_FADEOUT_TIME_UNREAD, TOAST_FADEOUT_TIME} from './toast_wrapper.jsx';

describe('components/ToastWrapper', () => {
    const baseProps = {
        unreadCountInChannel: 0,
        newRecentMessagesCount: 0,
        channelMarkedAsUnread: false,
        atLatestPost: false,
        postListIds: [
            'post1',
            'post2',
            'post3',
            DATE_LINE + 1551711600000,
        ],
        latestPostTimeStamp: 12345,
        atBottom: false,
        lastViewedBottom: 1234,
        width: 1000,
        updateNewMessagesAtInChannel: jest.fn(),
        scrollToNewMessage: jest.fn(),
        scrollToLatestMessages: jest.fn(),
        updateLastViewedBottomAt: jest.fn(),
    };

    describe('unread count logic', () => {
        test('If not atLatestPost and channelMarkedAsUnread is false then unread count is equal to unreads in present chunk plus recent messages', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('unreadCount')).toBe(15);
        });

        test('If atLatestPost then unread count is based on the number of posts below the new message indicator', () => {
            const props = {
                ...baseProps,
                atLatestPost: true,
                postListIds: [ //order of the postIds is in reverse order so unreadCount should be 3
                    'post1',
                    'post2',
                    'post3',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    DATE_LINE + 1551711600000,
                    'post4',
                    'post5',
                ],
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('unreadCount')).toBe(3);
        });

        test('If channelMarkedAsUnread then unread count should be based on the unreadCountInChannel', () => {
            const props = {
                ...baseProps,
                atLatestPost: false,
                channelMarkedAsUnread: true,
                unreadCountInChannel: 10,
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('unreadCount')).toBe(10);
        });
    });

    describe('toasts state', () => {
        test('Should have unread toast if unreadCount > 0', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(true);
        });

        test('Should have unread toast channel is marked as unread', () => {
            const props = {
                ...baseProps,
                channelMarkedAsUnread: false,
            };
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            expect(wrapper.state('showUnreadToast')).toBe(false);
            wrapper.setProps({channelMarkedAsUnread: true});
            expect(wrapper.state('showUnreadToast')).toBe(true);
        });

        test('Should have showNewMessagesToast if there are unreads and lastViewedAt is less than latestPostTimeStamp', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5,
            };
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            wrapper.setState({showUnreadToast: false, lastViewedBottom: 1234});
            wrapper.setProps({latestPostTimeStamp: 1235});
            expect(wrapper.state('showNewMessagesToast')).toBe(true);
        });

        test('Should hide unread toast if atBottom is true', () => {
            const props = {
                ...baseProps,
                atLatestPost: true,
                postListIds: [ //order of the postIds is in reverse order so unreadCount should be 3
                    'post1',
                    'post2',
                    'post3',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    DATE_LINE + 1551711600000,
                    'post4',
                    'post5',
                ],
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(true);
            wrapper.instance().forceUnreadEvenAtBottom = true;
            wrapper.setProps({atBottom: true});
            expect(wrapper.state('showUnreadToast')).toBe(false);
            expect(wrapper.state('toastTimer')).toBe(TOAST_FADEOUT_TIME_UNREAD);
        });

        test('Should hide showNewMessagesToast if atBottom is true', () => {
            const props = {
                ...baseProps,
                atLatestPost: true,
                postListIds: [ //order of the postIds is in reverse order so unreadCount should be 3
                    'post1',
                    'post2',
                    'post3',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    DATE_LINE + 1551711600000,
                    'post4',
                    'post5',
                ],
            };
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            wrapper.setState({showUnreadToast: false});
            wrapper.setProps({latestPostTimeStamp: 1235, lastViewedBottom: 1234});
            expect(wrapper.state('showNewMessagesToast')).toBe(true);
            wrapper.setProps({atBottom: true});
            expect(wrapper.state('showNewMessagesToast')).toBe(false);
            expect(wrapper.state('toastTimer')).toBe(TOAST_FADEOUT_TIME);
        });

        test('Should hide unread toast on scrollToNewMessage', () => {
            const props = {
                ...baseProps,
                atLatestPost: true,
                postListIds: [ //order of the postIds is in reverse order so unreadCount should be 3
                    'post1',
                    'post2',
                    'post3',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    DATE_LINE + 1551711600000,
                    'post4',
                    'post5',
                ],
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(true);
            wrapper.instance().scrollToLatestMessages();
            expect(wrapper.state('showUnreadToast')).toBe(false);
            expect(wrapper.state('toastTimer')).toBe(TOAST_FADEOUT_TIME);
            expect(baseProps.scrollToLatestMessages).toHaveBeenCalledTimes(1);
        });

        test('Should hide new messages toast if lastViewedBottom is not less than latestPostTimeStamp', () => {
            const props = {
                ...baseProps,
                atLatestPost: true,
                postListIds: [ //order of the postIds is in reverse order so unreadCount should be 3
                    'post1',
                    'post2',
                    'post3',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    DATE_LINE + 1551711600000,
                    'post4',
                    'post5',
                ],
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            wrapper.setState({showUnreadToast: false});
            wrapper.setProps({lastViewedBottom: 1234, latestPostTimeStamp: 1235, atBottom: false});
            expect(wrapper.state('showNewMessagesToast')).toBe(true);
            wrapper.setProps({lastViewedBottom: 1235, latestPostTimeStamp: 1235});
            wrapper.instance().scrollToNewMessage();
            expect(wrapper.state('showNewMessagesToast')).toBe(false);
            expect(wrapper.state('toastTimer')).toBe(0);
            expect(baseProps.scrollToNewMessage).toHaveBeenCalledTimes(1);
        });

        test('Should hide unread toast if esc key is pressed', () => {
            const props = {
                ...baseProps,
                atLatestPost: true,
                postListIds: [ //order of the postIds is in reverse order so unreadCount should be 3
                    'post1',
                    'post2',
                    'post3',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    DATE_LINE + 1551711600000,
                    'post4',
                    'post5',
                ],
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(true);

            wrapper.instance().handleShortcut({key: 'ESC', keyCode: 27});
            expect(wrapper.state('showUnreadToast')).toBe(false);
        });

        test('Should call for updateLastViewedBottomAt when new messages toast is present and if esc key is pressed', () => {
            const props = {
                ...baseProps,
                atLatestPost: true,
                postListIds: [ //order of the postIds is in reverse order so unreadCount should be 3
                    'post1',
                    'post2',
                    'post3',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    DATE_LINE + 1551711600000,
                    'post4',
                    'post5',
                ],
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            wrapper.setState({atBottom: false, showUnreadToast: false});
            wrapper.setProps({atBottom: false, lastViewedBottom: 1234, latestPostTimeStamp: 1235});
            expect(wrapper.state('showNewMessagesToast')).toBe(true);
            wrapper.instance().handleShortcut({key: 'ESC', keyCode: 27});
            expect(baseProps.updateLastViewedBottomAt).toHaveBeenCalledTimes(1);
        });
    });
});
