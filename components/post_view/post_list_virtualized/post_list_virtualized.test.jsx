// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {DATE_LINE} from 'mattermost-redux/utils/post_list';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import {PostListRowListIds, PostRequestTypes} from 'utils/constants';

import PostListRow from 'components/post_view/post_list_row';

import PostList from './post_list_virtualized';

describe('PostList', () => {
    const baseActions = {
        checkAndSetMobileView: jest.fn(),
        loadOlderPosts: jest.fn(),
        loadNewerPosts: jest.fn(),
        canLoadMorePosts: jest.fn(),
        changeUnreadChunkTimeStamp: jest.fn(),
        updateNewMessagesAtInChannel: jest.fn(),
    };

    const baseProps = {
        channelId: 'channel',
        focusedPostId: '',
        postListIds: [
            'post1',
            'post2',
            'post3',
            DATE_LINE + 1551711600000,
        ],
        latestPostTimeStamp: 12345,
        loadingNewerPosts: false,
        loadingOlderPosts: false,
        atOldestPost: false,
        atLatestPost: false,
        actions: baseActions,
    };

    const postListIdsForClassNames = [
        'post1',
        'post2',
        'post3',
        DATE_LINE + 1551711600000,
        'post4',
        PostListRowListIds.START_OF_NEW_MESSAGES,
        'post5',
    ];

    describe('renderRow', () => {
        const postListIds = ['a', 'b', 'c', 'd'];

        test('should get previous item ID correctly for oldest row', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            const row = shallow(wrapper.instance().renderRow({
                data: postListIds,
                itemId: 'd',
            }));

            expect(row.find(PostListRow).prop('previousListId')).toEqual('');
        });

        test('should get previous item ID correctly for other rows', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            const row = shallow(wrapper.instance().renderRow({
                data: postListIds,
                itemId: 'b',
            }));

            expect(row.find(PostListRow).prop('previousListId')).toEqual('c');
        });

        test('should highlight the focused post', () => {
            const props = {
                ...baseProps,
                focusedPostId: 'b',
            };

            const wrapper = shallowWithIntl(<PostList {...props}/>).dive();

            let row = shallow(wrapper.instance().renderRow({
                data: postListIds,
                itemId: 'c',
            }));
            expect(row.find(PostListRow).prop('shouldHighlight')).toEqual(false);

            row = shallow(wrapper.instance().renderRow({
                data: postListIds,
                itemId: 'b',
            }));
            expect(row.find(PostListRow).prop('shouldHighlight')).toEqual(true);
        });
    });

    describe('new messages below', () => {
        test('should mount outside of permalink view', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();

            expect(wrapper.find(NewMessagesBelow).exists()).toBe(true);
        });

        test('should not mount when in permalink view', () => {
            const props = {
                ...baseProps,
                focusedPostId: '1234',
            };

            const wrapper = shallowWithIntl(<PostList {...props}/>).dive();
            expect(wrapper.find(NewMessagesBelow).exists()).toBe(false);
        });
    });

    describe('onScroll', () => {
        test('should call checkBottom', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            wrapper.instance().checkBottom = jest.fn();

            const scrollOffset = 1234;
            const scrollHeight = 1000;
            const clientHeight = 500;

            wrapper.instance().onScroll({
                scrollDirection: 'forward',
                scrollOffset,
                scrollUpdateWasRequested: false,
                scrollHeight,
                clientHeight,
            });

            expect(wrapper.instance().checkBottom).toHaveBeenCalledWith(scrollOffset, scrollHeight, clientHeight);
        });

        test('should call canLoadMorePosts with AFTER_ID if loader is visible', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            const instance = wrapper.instance();

            const scrollOffset = 1234;
            const scrollHeight = 1000;
            const clientHeight = 500;

            instance.listRef = {current: {_getRangeToRender: () => [0, 70, 12, 1]}};
            instance.onScroll({
                scrollDirection: 'forward',
                scrollOffset,
                scrollUpdateWasRequested: true,
                scrollHeight,
                clientHeight,
            });

            expect(baseProps.actions.canLoadMorePosts).toHaveBeenCalledWith(PostRequestTypes.AFTER_ID);
        });

        test('should not call canLoadMorePosts with AFTER_ID if loader is below the fold by couple of messages', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            const instance = wrapper.instance();

            const scrollOffset = 1234;
            const scrollHeight = 1000;
            const clientHeight = 500;

            instance.listRef = {current: {_getRangeToRender: () => [0, 70, 12, 2]}};
            instance.onScroll({
                scrollDirection: 'forward',
                scrollOffset,
                scrollUpdateWasRequested: true,
                scrollHeight,
                clientHeight,
            });

            expect(baseProps.actions.canLoadMorePosts).not.toHaveBeenCalled();
        });
    });

    describe('isAtBottom', () => {
        const scrollHeight = 1000;
        const clientHeight = 500;

        for (const testCase of [
            {
                name: 'when viewing the top of the post list',
                scrollOffset: 0,
                expected: false,
            },
            {
                name: 'when 11 pixel from the bottom',
                scrollOffset: 489,
                expected: false,
            },
            {
                name: 'when 9 pixel from the bottom also considered to be bottom',
                scrollOffset: 490,
                expected: true,
            },
            {
                name: 'when clientHeight is less than scrollHeight', // scrollHeight is a state value in virt list and can be one cycle off when compared to actual value
                scrollOffset: 501,
                expected: true,
            },
        ]) {
            test(testCase.name, () => {
                const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
                expect(wrapper.instance().isAtBottom(testCase.scrollOffset, scrollHeight, clientHeight)).toBe(testCase.expected);
            });
        }
    });

    describe('updateAtBottom', () => {
        test('should update atBottom and lastViewedBottom when atBottom changes', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            wrapper.setState({lastViewedBottom: 1234, atBottom: false});

            wrapper.instance().updateAtBottom(true);

            expect(wrapper.state('atBottom')).toBe(true);
            expect(wrapper.state('lastViewedBottom')).not.toBe(1234);
        });

        test('should not update lastViewedBottom when atBottom does not change', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            wrapper.setState({lastViewedBottom: 1234, atBottom: false});

            wrapper.instance().updateAtBottom(false);

            expect(wrapper.state('lastViewedBottom')).toBe(1234);
        });

        test('should update lastViewedBottom with latestPostTimeStamp as that is greater than Date.now()', () => {
            Date.now = jest.fn().mockReturnValue(12344);

            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            wrapper.setState({lastViewedBottom: 1234, atBottom: false});

            wrapper.instance().updateAtBottom(true);

            expect(wrapper.state('lastViewedBottom')).toBe(12345);
        });

        test('should update lastViewedBottom with Date.now() as it is greater than latestPostTimeStamp', () => {
            Date.now = jest.fn().mockReturnValue(12346);

            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            wrapper.setState({lastViewedBottom: 1234, atBottom: false});

            wrapper.instance().updateAtBottom(true);

            expect(wrapper.state('lastViewedBottom')).toBe(12346);
        });
    });

    describe('Scroll correction logic on mount of posts at the top', () => {
        test('should return previous scroll position from getSnapshotBeforeUpdate', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            const instance = wrapper.instance();
            instance.componentDidUpdate = jest.fn();

            instance.postListRef = {current: {scrollHeight: 100, parentElement: {scrollTop: 10}}};

            wrapper.setState({atBottom: false});
            wrapper.setProps({atOldestPost: true});
            expect(instance.componentDidUpdate).toHaveBeenCalledTimes(2);
            expect(instance.componentDidUpdate.mock.calls[1][2]).toEqual({previousScrollTop: 10, previousScrollHeight: 100});

            instance.postListRef = {current: {scrollHeight: 200, parentElement: {scrollTop: 30}}};
            wrapper.setProps({postListIds: [
                'post1',
                'post2',
                'post3',
                DATE_LINE + 1551711600000,
                'post4',
            ]});

            expect(instance.componentDidUpdate).toHaveBeenCalledTimes(3);
            expect(instance.componentDidUpdate.mock.calls[2][2]).toEqual({previousScrollTop: 30, previousScrollHeight: 200});
        });

        test('should not return previous scroll position from getSnapshotBeforeUpdate as list is at bottom', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            const instance = wrapper.instance();
            instance.componentDidUpdate = jest.fn();

            instance.postListRef = {current: {scrollHeight: 100, parentElement: {scrollTop: 10}}};
            wrapper.setProps({atOldestPost: true});

            expect(instance.componentDidUpdate.mock.calls[0][2]).toEqual(null);
        });
    });

    describe('initRangeToRender', () => {
        test('should return 0 to 50 for channel with more than 100 messages', () => {
            const postListIds = [];
            for (let i = 0; i < 110; i++) {
                postListIds.push(`post${i}`);
            }

            const props = {
                ...baseProps,
                postListIds,
            };

            const wrapper = shallowWithIntl(<PostList {...props}/>).dive();
            const instance = wrapper.instance();
            expect(instance.initRangeToRender).toEqual([0, 50]);
        });

        test('should return range if new messages are present', () => {
            const postListIds = [];
            for (let i = 0; i < 120; i++) {
                postListIds.push(`post${i}`);
            }
            postListIds[65] = PostListRowListIds.START_OF_NEW_MESSAGES;

            const props = {
                ...baseProps,
                postListIds,
            };

            const wrapper = shallowWithIntl(<PostList {...props}/>).dive();
            const instance = wrapper.instance();
            expect(instance.initRangeToRender).toEqual([35, 95]);
        });
    });

    describe('renderRow', () => {
        test('should have appropriate classNames for rows with START_OF_NEW_MESSAGES and DATE_LINE', () => {
            const props = {
                ...baseProps,
                postListIds: postListIdsForClassNames,
            };

            const wrapper = shallowWithIntl(<PostList {...props}/>).dive();
            const instance = wrapper.instance();
            const post3Row = shallow(instance.renderRow({
                data: postListIdsForClassNames,
                itemId: 'post3',
            }));

            const post5Row = shallow(instance.renderRow({
                data: postListIdsForClassNames,
                itemId: 'post5',
            }));

            expect(post3Row.prop('className')).toEqual('post-row__padding top');
            expect(post5Row.prop('className')).toEqual('post-row__padding bottom');
        });

        test('should have both top and bottom classNames as post is in between DATE_LINE and START_OF_NEW_MESSAGES', () => {
            const props = {
                ...baseProps,
                postListIds: [
                    'post1',
                    'post2',
                    'post3',
                    DATE_LINE + 1551711600000,
                    'post4',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    'post5',
                ],
            };

            const wrapper = shallowWithIntl(<PostList {...props}/>).dive();

            const row = shallow(wrapper.instance().renderRow({
                data: props.postListIds,
                itemId: 'post4',
            }));

            expect(row.prop('className')).toEqual('post-row__padding bottom top');
        });

        test('should have empty string as className when both previousItemId and nextItemId are posts', () => {
            const props = {
                ...baseProps,
                postListIds: [
                    'post1',
                    'post2',
                    'post3',
                    DATE_LINE + 1551711600000,
                    'post4',
                    PostListRowListIds.START_OF_NEW_MESSAGES,
                    'post5',
                ],
            };

            const wrapper = shallowWithIntl(<PostList {...props}/>).dive();

            const row = shallow(wrapper.instance().renderRow({
                data: props.postListIds,
                itemId: 'post2',
            }));

            expect(row.prop('className')).toEqual('');
        });
    });

    describe('updateFloatingTimestamp', () => {
        test('should not update topPostId as is it not mobile view', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            const instance = wrapper.instance();
            wrapper.setState({isMobile: false});
            instance.onItemsRendered({visibleStartIndex: 0});
            expect(wrapper.state('topPostId')).toBe('');
        });

        test('should update topPostId with latest visible postId', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            const instance = wrapper.instance();
            wrapper.setState({isMobile: true});
            instance.onItemsRendered({visibleStartIndex: 1});
            expect(wrapper.state('topPostId')).toBe('post2');

            instance.onItemsRendered({visibleStartIndex: 2});
            expect(wrapper.state('topPostId')).toBe('post3');
        });
    });

    describe('scrollToLatestMessages', () => {
        test('should call scrollToBottom', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            wrapper.setProps({atLatestPost: true});
            const instance = wrapper.instance();
            instance.scrollToBottom = jest.fn();
            instance.scrollToLatestMessages();
            expect(instance.scrollToBottom).toHaveBeenCalled();
        });

        test('should call changeUnreadChunkTimeStamp', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            const instance = wrapper.instance();
            instance.scrollToLatestMessages();
            expect(baseActions.changeUnreadChunkTimeStamp).toHaveBeenCalledWith('');
        });
    });

    describe('postIds state', () => {
        test('should have LOAD_NEWER_MESSAGES_TRIGGER and LOAD_OLDER_MESSAGES_TRIGGER', () => {
            const wrapper = shallowWithIntl(<PostList {...baseProps}/>).dive();
            wrapper.setProps({autoRetryEnable: false});
            const postListIdsState = wrapper.state('postListIds');
            expect(postListIdsState[0]).toBe(PostListRowListIds.LOAD_NEWER_MESSAGES_TRIGGER);
            expect(postListIdsState[postListIdsState.length - 1]).toBe(PostListRowListIds.LOAD_OLDER_MESSAGES_TRIGGER);
        });
    });

    describe('initScrollToIndex', () => {
        test('return date index if it is just above new message line', () => {
            const postListIds = [
                'post1',
                'post2',
                'post3',
                'post4',
                PostListRowListIds.START_OF_NEW_MESSAGES,
                DATE_LINE + 1551711600000,
                'post5',
            ];

            const props = {
                ...baseProps,
                postListIds,
            };

            const wrapper = shallowWithIntl(<PostList {...props}/>).dive();
            const instance = wrapper.instance();
            const initScrollToIndex = instance.initScrollToIndex();
            expect(initScrollToIndex).toEqual({index: 6, position: 'start', offset: -50});
        });
    });

    test('return new message line index if there is no date just above it', () => {
        const postListIds = [
            'post1',
            'post2',
            'post3',
            'post4',
            PostListRowListIds.START_OF_NEW_MESSAGES,
            'post5',
        ];

        const props = {
            ...baseProps,
            postListIds,
        };

        const wrapper = shallowWithIntl(<PostList {...props}/>).dive();
        const instance = wrapper.instance();
        const initScrollToIndex = instance.initScrollToIndex();
        expect(initScrollToIndex).toEqual({index: 5, position: 'start', offset: -50});
    });

    describe('unread count logic', () => {
        test('If not atLatestPost and channelMarkedAsUnread is false then unread count is equal to unreads in present chunk plus recent messages', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5
            };

            const wrapper = shallowWithIntl(<PostList {...props}/>);
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

            const wrapper = shallowWithIntl(<PostList {...props}/>);
            expect(wrapper.state('unreadCount')).toBe(3);
        });

        test('If channelMarkedAsUnread then unread count should be based on the unreadCountInChannel', () => {
            const props = {
                ...baseProps,
                atLatestPost: false,
                channelMarkedAsUnread: true,
                unreadCountInChannel: 10,
            };

            const wrapper = shallowWithIntl(<PostList {...props}/>);
            expect(wrapper.state('unreadCount')).toBe(10);
        });
    });

    describe('toasts state', () => {
        jest.useFakeTimers();
        test('Should have unread toast if unreadCount > 0', () => {
            const props = {
                ...baseProps,
                unreadCountInChannel: 10,
                newRecentMessagesCount: 5
            };

            const wrapper = shallowWithIntl(<PostList {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(true);
        });

        test('Should have unread toast channel is marked as unread', () => {
            const props = {
                ...baseProps,
                channelMarkedAsUnread: false,
            };
            const wrapper = shallowWithIntl(<PostList {...props}/>);

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
            const wrapper = shallowWithIntl(<PostList {...props}/>);
            wrapper.setState({atBottom: false, showUnreadToast: false, lastViewedBottom: 1234});
            wrapper.setProps({latestPostTimeStamp: 1235});
            expect(wrapper.state('showNewMessagesToast')).toBe(true);
        });

        test('Should hide unread toast if scrolled to bottom', () => {
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

            const wrapper = shallowWithIntl(<PostList {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(true);
            wrapper.setState({atBottom: false});
            wrapper.instance().updateAtBottom(true);
            expect(wrapper.state('atBottom')).toBe(true);
            jest.runOnlyPendingTimers();
            expect(wrapper.state('showUnreadToast')).toBe(false);
        });

        test('Should hide showNewMessagesToast if scrolled to bottom', () => {
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
            const wrapper = shallowWithIntl(<PostList {...props}/>);
            wrapper.setState({atBottom: false, showUnreadToast: false, lastViewedBottom: 1234});
            wrapper.setProps({latestPostTimeStamp: 1235});
            expect(wrapper.state('showNewMessagesToast')).toBe(true);
            wrapper.instance().updateAtBottom(true);
            expect(wrapper.state('atBottom')).toBe(true);
            jest.runOnlyPendingTimers();
            expect(wrapper.state('showNewMessagesToast')).toBe(false);
        });

        test('Should hide unread toast on scrollToUnread', () => {
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

            const wrapper = shallowWithIntl(<PostList {...props}/>);
            const instance = wrapper.instance();
            instance.listRef = {current: {scrollToItem: jest.fn()}};
            expect(wrapper.state('showUnreadToast')).toBe(true);

            instance.scrollToLatestMessages();
            jest.runOnlyPendingTimers();
            expect(wrapper.state('showUnreadToast')).toBe(false);
            expect(instance.listRef.current.scrollToItem).toHaveBeenCalledWith(0, 'end');
        });

        test('Should hide new messages toast on scrollToUnread', () => {
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

            const wrapper = shallowWithIntl(<PostList {...props}/>);
            const instance = wrapper.instance();
            instance.listRef = {current: {scrollToItem: jest.fn()}};

            wrapper.setState({atBottom: false, showUnreadToast: false, lastViewedBottom: 1234});
            wrapper.setProps({latestPostTimeStamp: 1235});
            expect(wrapper.state('showNewMessagesToast')).toBe(true);

            instance.scrollToUnread();
            jest.runOnlyPendingTimers();
            expect(wrapper.state('showNewMessagesToast')).toBe(false);
            expect(instance.listRef.current.scrollToItem).toHaveBeenCalledWith(3, 'start', -50);
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

            const wrapper = shallowWithIntl(<PostList {...props}/>);
            expect(wrapper.state('showUnreadToast')).toBe(true);

            wrapper.instance().handleShortcut({key: 'ESC', keyCode: 27});
            expect(wrapper.state('showUnreadToast')).toBe(false);
        });

        test('Should hide new messages toast if esc key is pressed', () => {
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

            const wrapper = shallowWithIntl(<PostList {...props}/>);
            wrapper.setState({atBottom: false, showUnreadToast: false, lastViewedBottom: 1234});
            wrapper.setProps({latestPostTimeStamp: 1235});
            expect(wrapper.state('showNewMessagesToast')).toBe(true);

            wrapper.instance().handleShortcut({key: 'ESC', keyCode: 27});
            expect(wrapper.state('showNewMessagesToast')).toBe(false);
        });
    });
});
