// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

// @ts-expect-error TS(2307): Cannot find module 'mattermost-redux/constants/pre... Remove this comment to see the full error message
import Preferences from 'mattermost-redux/constants/preferences';

// @ts-expect-error TS(2307): Cannot find module 'mattermost-redux/utils/post_li... Remove this comment to see the full error message
import {DATE_LINE} from 'mattermost-redux/utils/post_list';

// @ts-expect-error TS(2307): Cannot find module 'tests/helpers/intl-test-helper... Remove this comment to see the full error message
import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

// @ts-expect-error TS(2307): Cannot find module 'utils/constants' or its corres... Remove this comment to see the full error message
import {PostListRowListIds} from 'utils/constants';

// @ts-expect-error TS(2307): Cannot find module 'utils/browser_history' or its ... Remove this comment to see the full error message
import {browserHistory} from 'utils/browser_history';

// @ts-expect-error TS(6142): Module './toast_wrapper.jsx' was resolved to '/Use... Remove this comment to see the full error message
import ToastWrapper from './toast_wrapper.jsx';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('components/ToastWrapper', () => {
    const baseProps = {
        unreadCountInChannel: 0,
        unreadScrollPosition: Preferences.UNREAD_SCROLL_POSITION_START_FROM_LEFT,
        newRecentMessagesCount: 0,
        channelMarkedAsUnread: false,
        isNewMessageLineReached: false,
        shouldStartFromBottomWhenUnread: false,
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

        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        updateNewMessagesAtInChannel: jest.fn(),

        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        scrollToNewMessage: jest.fn(),

        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        scrollToLatestMessages: jest.fn(),

        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        updateLastViewedBottomAt: jest.fn(),
        lastViewedAt: 12344,
        actions: {

            // @ts-expect-error TS(2304): Cannot find name 'jest'.
            updateToastStatus: jest.fn(),
        },
        match: {
            params: {
                team: 'team',
            },
        },
    };

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('unread count logic', () => {
        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('If not atLatestPost and channelMarkedAsUnread is false then unread count is equal to unreads in present chunk plus recent messages', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('unreadCount')).toBe(15);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('If atLatestPost and unreadScrollPosition is startFromNewest and prevState.unreadCountInChannel is not 0 then unread count then unread count is based on the unreadCountInChannel', () => {
            const props = {
                ...baseProps,
                atLatestPost: true,
                unreadCountInChannel: 10,
                unreadScrollPosition: Preferences.UNREAD_SCROLL_POSITION_START_FROM_NEWEST,
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('unreadCount')).toBe(10);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('If atLatestPost and prevState.unreadCountInChannel is 0 then unread count is based on the number of posts below the new message indicator', () => {
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('unreadCount')).toBe(3);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('If channelMarkedAsUnread then unread count should be based on the unreadCountInChannel', () => {
            const props = {
                ...baseProps,
                atLatestPost: false,
                channelMarkedAsUnread: true,
                unreadCountInChannel: 10,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('unreadCount')).toBe(10);
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('toasts state', () => {
        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Should have unread toast if unreadCount > 0', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(true);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Should set state of have unread toast when atBottom changes from undefined', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5,
                atBottom: null,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(undefined);
            wrapper.setProps({atBottom: false});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(true);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(false);
            wrapper.setProps({channelMarkedAsUnread: true, atBottom: false});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(true);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Should have unread toast channel is marked as unread again', () => {
            const props = {
                ...baseProps,
                channelMarkedAsUnread: false,
                atLatestPost: true,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
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

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(true);
            wrapper.setProps({atBottom: true});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(false);
            wrapper.setProps({atBottom: false});
            wrapper.setProps({lastViewedAt: 12342});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(true);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Should have archive toast if channel is not atLatestPost and focusedPostId exists', () => {
            const props = {
                ...baseProps,
                focusedPostId: 'asdasd',
                atLatestPost: false,
                atBottom: null,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showMessageHistoryToast')).toBe(undefined);

            wrapper.setProps({atBottom: false});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showMessageHistoryToast')).toBe(true);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Should have archive toast if channel initScrollOffsetFromBottom is greater than 1000 and focusedPostId exists', () => {
            const props = {
                ...baseProps,
                focusedPostId: 'asdasd',
                atLatestPost: true,
                initScrollOffsetFromBottom: 1001,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showMessageHistoryToast')).toBe(true);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Should not have unread toast if channel is marked as unread and at bottom', () => {
            const props = {
                ...baseProps,
                channelMarkedAsUnread: false,
                atLatestPost: true,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
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

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(false);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Should have showNewMessagesToast if there are unreads and lastViewedAt is less than latestPostTimeStamp', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            wrapper.setState({showUnreadToast: false, lastViewedBottom: 1234});
            wrapper.setProps({latestPostTimeStamp: 1235});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showNewMessagesToast')).toBe(true);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(true);
            wrapper.setProps({atBottom: true});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(false);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Should hide archive toast if channel is atBottom is true', () => {
            const props = {
                ...baseProps,
                focusedPostId: 'asdasd',
                atLatestPost: true,
                initScrollOffsetFromBottom: 1001,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showMessageHistoryToast')).toBe(true);
            wrapper.setProps({atBottom: true});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showMessageHistoryToast')).toBe(false);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            wrapper.setState({showUnreadToast: false});
            wrapper.setProps({latestPostTimeStamp: 1235, lastViewedBottom: 1234});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showNewMessagesToast')).toBe(true);
            wrapper.setProps({atBottom: true});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showNewMessagesToast')).toBe(false);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(true);
            wrapper.instance().scrollToLatestMessages();

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(false);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(baseProps.scrollToLatestMessages).toHaveBeenCalledTimes(1);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            wrapper.setState({showUnreadToast: false});
            wrapper.setProps({lastViewedBottom: 1234, latestPostTimeStamp: 1235, atBottom: false});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showNewMessagesToast')).toBe(true);
            wrapper.setProps({lastViewedBottom: 1235, latestPostTimeStamp: 1235});
            wrapper.instance().scrollToNewMessage();

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showNewMessagesToast')).toBe(false);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(baseProps.scrollToNewMessage).toHaveBeenCalledTimes(1);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(true);

            wrapper.instance().handleShortcut({key: 'ESC', keyCode: 27});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(false);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            wrapper.setState({atBottom: false, showUnreadToast: false});
            wrapper.setProps({atBottom: false, lastViewedBottom: 1234, latestPostTimeStamp: 1235});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showNewMessagesToast')).toBe(true);
            wrapper.instance().handleShortcut({key: 'ESC', keyCode: 27});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(baseProps.updateLastViewedBottomAt).toHaveBeenCalledTimes(1);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            wrapper.setState({atBottom: false, showUnreadToast: false});
            wrapper.setProps({atBottom: false, lastViewedBottom: 1234, latestPostTimeStamp: 1235});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showNewMessagesToast')).toBe(true);
            wrapper.setProps({postListIds: baseProps.postListIds});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showNewMessagesToast')).toBe(false);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Should call updateToastStatus on toasts state change', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5,
            };
            const updateToastStatus = baseProps.actions.updateToastStatus;

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadToast')).toBe(true);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(updateToastStatus).toHaveBeenCalledWith(true);
            wrapper.setProps({atBottom: true, atLatestPost: true});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(updateToastStatus).toHaveBeenCalledTimes(2);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(updateToastStatus).toHaveBeenCalledWith(false);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
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

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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
            // @ts-expect-error TS(2304): Cannot find name 'expect'.
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

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(baseProps.updateNewMessagesAtInChannel).toHaveBeenCalledTimes(1);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Should have unreadWithBottomStart toast if lastViewdAt and props.lastViewedAt !== prevState.lastViewedAt and shouldStartFromBottomWhenUnread and unreadCount > 0 and not isNewMessageLineReached ', () => {
            const props = {
                ...baseProps,
                lastViewedAt: 20000,
                unreadCountInChannel: 10,
                shouldStartFromBottomWhenUnread: true,
                isNewMessageLineReached: false,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadWithBottomStartToast')).toBe(true);
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Should hide unreadWithBottomStart toast if isNewMessageLineReached is set true', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                shouldStartFromBottomWhenUnread: true,
                isNewMessageLineReached: false,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadWithBottomStartToast')).toBe(true);

            wrapper.setProps({isNewMessageLineReached: true});

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showUnreadWithBottomStartToast')).toBe(false);
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('History toast', () => {
        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Replace browser history when not at latest posts and in permalink view with call to scrollToLatestMessages', () => {
            const props = {
                ...baseProps,
                focusedPostId: 'asdasd',
                atLatestPost: false,
                atBottom: false,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showMessageHistoryToast')).toBe(true);

            const instance = wrapper.instance();

            // @ts-expect-error TS(2304): Cannot find name 'jest'.
            browserHistory.replace = jest.fn();
            instance.scrollToLatestMessages();

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(browserHistory.replace).toHaveBeenCalledWith('/team');
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('Replace browser history when not at latest posts and in permalink view with call to scrollToNewMessage', () => {
            const props = {
                ...baseProps,
                focusedPostId: 'asdasd',
                atLatestPost: false,
                atBottom: false,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.state('showMessageHistoryToast')).toBe(true);

            const instance = wrapper.instance();

            // @ts-expect-error TS(2304): Cannot find name 'jest'.
            browserHistory.replace = jest.fn();
            instance.scrollToNewMessage();

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(browserHistory.replace).toHaveBeenCalledWith('/team');
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Search hint toast', () => {
        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('should should not be shown when unread toast should be shown', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5,
                showSearchHintToast: true,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.find('.toast__hint')).toEqual({});
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('should not be shown when history toast should be shown', () => {
            const props = {
                ...baseProps,
                focusedPostId: 'asdasd',
                atLatestPost: false,
                atBottom: false,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.find('.toast__hint')).toEqual({});
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('should be shown when no other toasts are shown', () => {
            const props = {
                ...baseProps,
                showSearchHintToast: true,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(wrapper.find('.toast__hint')).toBeDefined();
        });

        // @ts-expect-error TS(2582): Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test('should call the dismiss callback', () => {
            // @ts-expect-error TS(2304): Cannot find name 'jest'.
            const dismissHandler = jest.fn();
            const props = {
                ...baseProps,
                showSearchHintToast: true,
                onSearchHintDismiss: dismissHandler,
            };

            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            const wrapper = shallowWithIntl(<ToastWrapper {...props}/>);
            const instance = wrapper.instance();

            instance.hideSearchHintToast();

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(dismissHandler).toHaveBeenCalled();
        });
    });
});
