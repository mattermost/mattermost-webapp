// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LoadingScreen from 'components/loading_screen';
import DateSeparator from 'components/post_view/date_separator';
import Post from 'components/post_view/post';

import PostList from './post_list';

import {DATE_LINE, START_OF_NEW_MESSAGES} from './index';

describe('PostList', () => {
    const baseProps = {
        channel: {id: 'channel'},
        currentUserId: '',
        focusedPostId: '',
        fullWidth: true,
        lastViewedAt: 0,
        postIds: [
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
            postIds: [],
        };

        const wrapper = shallow(<PostList {...props}/>);

        expect(wrapper.find(LoadingScreen).exists()).toBe(true);

        wrapper.setState({isDoingInitialLoad: false});

        expect(wrapper.find(LoadingScreen).exists()).toBe(false);
    });

    describe('posts', () => {
        test('should render correctly', () => {
            const wrapper = shallow(<PostList {...baseProps}/>);

            wrapper.setState({isDoingInitialLoad: false});

            const posts = wrapper.find(Post);

            expect(posts).toHaveLength(3);
            expect(posts.at(0).prop('postId')).toBe('post3');
            expect(posts.at(0).prop('previousPostId')).toBe(DATE_LINE + 1551711600000);
            expect(posts.at(1).prop('postId')).toBe('post2');
            expect(posts.at(1).prop('previousPostId')).toBe('post3');
            expect(posts.at(2).prop('postId')).toBe('post1');
            expect(posts.at(2).prop('previousPostId')).toBe('post2');
        });

        test('should limit the number based on postVisibility', () => {
            const props = {
                ...baseProps,
                postVisibility: 2,
            };

            const wrapper = shallow(<PostList {...props}/>);

            wrapper.setState({isDoingInitialLoad: false});

            expect(wrapper.find(Post)).toHaveLength(2);
        });
    });

    test('should render date separators', () => {
        const props = {
            ...baseProps,
            postIds: [
                'post1',
                'post2',
                DATE_LINE + 1551715200000,
                'post3',
                DATE_LINE + 1551632400000,
            ],
        };

        const wrapper = shallow(<PostList {...props}/>);

        wrapper.setState({
            atEnd: true,
            isDoingInitialLoad: false,
        });

        const separators = wrapper.find(DateSeparator);

        expect(separators).toHaveLength(2);
        expect(separators.at(0).prop('date')).toBe(1551632400000);
        expect(separators.at(1).prop('date')).toBe(1551715200000);
    });

    test('should render new messages line', () => {
        const props = {
            ...baseProps,
            postIds: [
                'post1',
                START_OF_NEW_MESSAGES,
                'post2',
                'post3',
                DATE_LINE + 1551632400000,
            ],
        };

        const wrapper = shallow(<PostList {...props}/>);

        wrapper.setState({
            atEnd: true,
            isDoingInitialLoad: false,
        });

        expect(wrapper.find('.new-separator').exists()).toBe(true);
        expect(wrapper.find(Post).find({postId: 'post1'}).prop('previousPostId')).toBe(START_OF_NEW_MESSAGES);
    });
});
