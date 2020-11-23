// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {DATE_LINE} from 'mattermost-redux/utils/post_list';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import {PostListRowListIds} from 'utils/constants';
import {browserHistory} from 'utils/browser_history';

import ToastWrapper from './toast_wrapper.jsx';

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
        lastViewedAt: 12344,
        actions: {
            updateToastStatus: jest.fn(),
        },
        match: {
            params: {
                team: 'team',
            },
        },
    };

    describe('unread count logic', () => {
        test('If not atLatestPost and channelMarkedAsUnread is false then unread count is equal to unreads in present chunk plus recent messages', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5,
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
        test('Should have unread toast if unreadCount > 0  and initScrollOffsetFromBottom is greater than 1000', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5,
                initScrollOffsetFromBottom: 1100,
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(true);
        });
        test('Should have not have unread toast if initScrollOffsetFromBottom is less than 1000', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5,
                initScrollOffsetFromBottom: 850,
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(false);
        });

        test('Should set state of have unread toast when atBottom changes from undefined', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5,
                atBottom: null,
                initScrollOffsetFromBottom: 1100,
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(undefined);
            wrapper.setProps({atBottom: false});
            expect(wrapper.state('showUnreadToast')).toBe(true);
        });

        test('Should have unread toast channel is marked as unread', () => {
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
                channelMarkedAsUnread: false,
                atBottom: true,
            };
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(false);
            wrapper.setProps({channelMarkedAsUnread: true, atBottom: false});
            expect(wrapper.state('showUnreadToast')).toBe(true);
        });

        test('Should have unread toast channel is marked as unread again', () => {
            const props = {
                ...baseProps,
                channelMarkedAsUnread: false,
                atLatestPost: true,
            };
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(false);

            wrapper.setProps({
                channelMarkedAsUnread: true,
                postListIds: [
                    'post1',
                    'post2',
                    'post3',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    DATE_LINE + 1551711600000,
                    'post4',
                    'post5',
                ],
            });

            expect(wrapper.state('showUnreadToast')).toBe(true);
            wrapper.setProps({atBottom: true});
            expect(wrapper.state('showUnreadToast')).toBe(false);
            wrapper.setProps({atBottom: false});
            wrapper.setProps({lastViewedAt: 12342});
            expect(wrapper.state('showUnreadToast')).toBe(true);
        });

        test('Should have archive toast if channel is not atLatestPost and focusedPostId exists', () => {
            const props = {
                ...baseProps,
                focusedPostId: 'asdasd',
                atLatestPost: false,
                atBottom: null,
            };
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showMessageHistoryToast')).toBe(undefined);

            wrapper.setProps({atBottom: false});
            expect(wrapper.state('showMessageHistoryToast')).toBe(true);
        });

        test('Should have archive toast if channel initScrollOffsetFromBottom is greater than 1000 and focusedPostId exists', () => {
            const props = {
                ...baseProps,
                focusedPostId: 'asdasd',
                atLatestPost: true,
                initScrollOffsetFromBottom: 1001,
            };
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            expect(wrapper.state('showMessageHistoryToast')).toBe(true);
        });

        test('Should not have unread toast if channel is marked as unread and at bottom', () => {
            const props = {
                ...baseProps,
                channelMarkedAsUnread: false,
                atLatestPost: true,
            };
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(false);
            wrapper.setProps({atBottom: true});
            wrapper.setProps({
                channelMarkedAsUnread: true,
                postListIds: [
                    'post1',
                    'post2',
                    'post3',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    DATE_LINE + 1551711600000,
                    'post4',
                    'post5',
                ],
            });

            expect(wrapper.state('showUnreadToast')).toBe(false);
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
                initScrollOffsetFromBottom: 1220,
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(true);
            wrapper.setProps({atBottom: true});
            expect(wrapper.state('showUnreadToast')).toBe(false);
        });

        test('Should hide archive toast if channel is atBottom is true', () => {
            const props = {
                ...baseProps,
                focusedPostId: 'asdasd',
                atLatestPost: true,
                initScrollOffsetFromBottom: 1001,
            };
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            expect(wrapper.state('showMessageHistoryToast')).toBe(true);
            wrapper.setProps({atBottom: true});
            expect(wrapper.state('showMessageHistoryToast')).toBe(false);
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
                initScrollOffsetFromBottom: 1005,
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(true);
            wrapper.instance().scrollToLatestMessages();
            expect(wrapper.state('showUnreadToast')).toBe(false);
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
                initScrollOffsetFromBottom: 1500,
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

        test('Changing unreadCount to 0 should set the showNewMessagesToast state to false', () => {
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
            wrapper.setProps({postListIds: baseProps.postListIds});
            expect(wrapper.state('showNewMessagesToast')).toBe(false);
        });

        test('Should call updateToastStatus on toasts state change', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5,
                initScrollOffsetFromBottom: 1008,
            };
            const updateToastStatus = baseProps.actions.updateToastStatus;

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(true);
            expect(updateToastStatus).toHaveBeenCalledWith(true);
            wrapper.setProps({atBottom: true, atLatestPost: true});
            expect(updateToastStatus).toHaveBeenCalledTimes(2);
            expect(updateToastStatus).toHaveBeenCalledWith(false);
        });

        test('Should call updateNewMessagesAtInChannel on addition of posts at the bottom of channel and user not at bottom', () => {
            const props = {
                ...baseProps,
                atLatestPost: true,
                postListIds: [
                    'post2',
                    'post3',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    DATE_LINE + 1551711600000,
                    'post4',
                    'post5',
                ],
                atBottom: true,
            };

            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            wrapper.setProps({atBottom: null});
            wrapper.setProps({
                postListIds: [
                    'post1',
                    'post2',
                    'post3',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    DATE_LINE + 1551711600000,
                    'post4',
                    'post5',
                ],
            });

            //should not call if atBottom is null
            expect(baseProps.updateNewMessagesAtInChannel).toHaveBeenCalledTimes(0);

            wrapper.setProps({
                atBottom: false,
                postListIds: [
                    'post0',
                    'post1',
                    'post2',
                    'post3',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    DATE_LINE + 1551711600000,
                    'post4',
                    'post5',
                ],
            });
            expect(baseProps.updateNewMessagesAtInChannel).toHaveBeenCalledTimes(1);
        });
    });

    describe('Histroy toast', () => {
        test('Replace browser history when not at latest posts and in permalink view with call to scrollToLatestMessages', () => {
            const props = {
                ...baseProps,
                focusedPostId: 'asdasd',
                atLatestPost: false,
                atBottom: false,
            };
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showMessageHistoryToast')).toBe(true);

            const instance = wrapper.instance();
            browserHistory.replace = jest.fn();
            instance.scrollToLatestMessages();
            expect(browserHistory.replace).toHaveBeenCalledWith('/team');
        });

        test('Replace browser history when not at latest posts and in permalink view with call to scrollToNewMessage', () => {
            const props = {
                ...baseProps,
                focusedPostId: 'asdasd',
                atLatestPost: false,
                atBottom: false,
            };
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            expect(wrapper.state('showMessageHistoryToast')).toBe(true);

            const instance = wrapper.instance();
            browserHistory.replace = jest.fn();
            instance.scrollToNewMessage();
            expect(browserHistory.replace).toHaveBeenCalledWith('/team');
        });
    });
});
