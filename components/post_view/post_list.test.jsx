// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {DATE_LINE} from 'mattermost-redux/utils/post_list';

import LoadingScreen from 'components/loading_screen';
import {PostListRowListIds} from 'utils/constants';

import NewMessagesBelow from './new_messages_below';
import PostList from './post_list';
import PostListRow from './post_list_row';

describe('PostList', () => {
    const baseProps = {
        channel: {id: 'channel'},
        focusedPostId: '',
        lastViewedAt: 0,
        postListIds: [
            'post1',
            'post2',
            'post3',
            DATE_LINE + 1551711600000,
        ],
        postVisibility: 10,
        actions: {
            checkAndSetMobileView: jest.fn(),
            increasePostVisibility: jest.fn(),
            loadInitialPosts: jest.fn(() => ({posts: {posts: {}, order: []}, hasMoreBefore: false})),
        },
    };

    test('should render loading screen while loading posts', () => {
        const props = {
            ...baseProps,
            postListIds: null,
        };

        const wrapper = shallow(<PostList {...props}/>);

        expect(wrapper.state('loadingFirstSetOfPosts')).toBe(true);
        expect(wrapper.find(LoadingScreen).exists()).toBe(true);

        wrapper.setState({loadingFirstSetOfPosts: false});

        expect(wrapper.find(LoadingScreen).exists()).toBe(false);
    });

    describe('renderRow', () => {
        const postListIds = ['a', 'b', 'c', 'd'];

        test('should get previous item ID correctly for oldest row', () => {
            const wrapper = shallow(<PostList {...baseProps}/>);
            const row = shallow(wrapper.instance().renderRow({
                data: postListIds,
                itemId: 'd',
            }));

            expect(row.find(PostListRow).prop('previousListId')).toEqual('');
        });

        test('should get previous item ID correctly for other rows', () => {
            const wrapper = shallow(<PostList {...baseProps}/>);
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

            const wrapper = shallow(<PostList {...props}/>);

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
            const wrapper = shallow(<PostList {...baseProps}/>);
            wrapper.setState({loadingFirstSetOfPosts: false});

            expect(wrapper.find(NewMessagesBelow).exists()).toBe(true);
        });

        test('should not mount when in permalink view', () => {
            const props = {
                ...baseProps,
                focusedPostId: '1234',
            };

            const wrapper = shallow(<PostList {...props}/>);
            wrapper.setState({loadingFirstSetOfPosts: false});

            expect(wrapper.find(NewMessagesBelow).exists()).toBe(false);
        });
    });

    describe('initScrollToIndex', () => {
        test('should return index of start of new messages and call increasePostVisibility when all posts are unread', () => {
            baseProps.actions.increasePostVisibility.mockResolvedValue({moreToLoad: false});
            const postListIds = [];
            for (let i = 0; i < 30; i++) {
                postListIds.push(`post${i}`);
            }
            postListIds.push(PostListRowListIds.START_OF_NEW_MESSAGES);

            const props = {
                ...baseProps,
                postListIds,
            };

            const wrapper = shallow(<PostList {...props}/>);
            const initScrollToIndex = wrapper.instance().initScrollToIndex();

            expect(initScrollToIndex).toEqual({index: 31, position: 'start'});

            expect(baseProps.actions.increasePostVisibility).toHaveBeenCalledTimes(1);
        });
    });

    describe('loadMorePosts', () => {
        test('should set state.atEnd to true after loading all posts in the channel', async () => {
            baseProps.actions.increasePostVisibility.mockResolvedValue({moreToLoad: false});

            const wrapper = shallow(<PostList {...baseProps}/>);

            await wrapper.instance().loadMorePosts();

            expect(baseProps.actions.increasePostVisibility).toHaveBeenCalledTimes(1);
            expect(baseProps.actions.increasePostVisibility).toHaveBeenCalledWith(baseProps.channel.id, 'post3');

            wrapper.update();

            expect(wrapper.state('atEnd')).toEqual(true);
        });
    });

    describe('onItemsRendered', () => {
        test('should set state atBottom false when visibleStopIndex is not 0', () => {
            const wrapper = shallow(<PostList {...baseProps}/>);
            wrapper.setState({atBottom: true});
            wrapper.instance().onItemsRendered({visibleStartIndex: 4, visibleStopIndex: 1});
            expect(wrapper.state('atBottom')).toEqual(false);
        });
    });
    describe('Scroll correction logic on mount of posts at the top', () => {
        test('should return previous scroll position from getSnapshotBeforeUpdate', () => {
            const wrapper = shallow(<PostList {...baseProps}/>);
            const instance = wrapper.instance();
            instance.componentDidUpdate = jest.fn();

            instance.postlistRef = {current: {scrollTop: 10, scrollHeight: 100}};
            wrapper.setState({atEnd: true});
            expect(instance.componentDidUpdate).toHaveBeenCalledTimes(1);
            expect(instance.componentDidUpdate.mock.calls[0][2]).toEqual({previousScrollTop: 10, previousScrollHeight: 100});

            instance.postlistRef = {current: {scrollTop: 30, scrollHeight: 200}};
            wrapper.setState({atEnd: false});
            expect(instance.componentDidUpdate).toHaveBeenCalledTimes(2);
            expect(instance.componentDidUpdate.mock.calls[1][2]).toEqual({previousScrollTop: 30, previousScrollHeight: 200});

            instance.postlistRef = {current: {scrollTop: 40, scrollHeight: 400}};
            wrapper.setProps({postListIds: [
                'post1',
                'post2',
                'post3',
                'post4',
                'post5',
                DATE_LINE + 1551711600000,
            ]});

            expect(instance.componentDidUpdate).toHaveBeenCalledTimes(3);
            expect(instance.componentDidUpdate.mock.calls[2][2]).toEqual({previousScrollTop: 40, previousScrollHeight: 400});
        });
    });
});
