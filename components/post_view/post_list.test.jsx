// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LoadingScreen from 'components/loading_screen';
import DateSeparator from 'components/post_view/date_separator';
import Post from 'components/post_view/post';

import PostList from './post_list';

describe('PostList', () => {
    const baseProps = {
        channel: {id: 'channel'},
        currentUserId: '',
        focusedPostId: '',
        fullWidth: true,
        lastViewedAt: 0,
        posts: [
            {id: 'post1', message: 'Hello, World 1!', create_at: new Date(2019, 2, 4, 12).getTime()},
            {id: 'post2', message: 'Hello, World 2!', create_at: new Date(2019, 2, 4, 11).getTime()},
            {id: 'post3', message: 'Hello, World 3!', create_at: new Date(2019, 2, 4, 10).getTime()},
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
            posts: [],
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

            expect(wrapper.find(Post)).toHaveLength(3);
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

    describe('date separators', () => {
        test('should render above posts made all on the same day', () => {
            const wrapper = shallow(<PostList {...baseProps}/>);

            wrapper.setState({
                atEnd: true,
                isDoingInitialLoad: false,
            });

            expect(wrapper.find(DateSeparator)).toHaveLength(1);
            expect(wrapper.find('.post-list__content').children()).toMatchSnapshot();
        });

        test('should render between posts made on different days', () => {
            const props = {
                ...baseProps,
                posts: [
                    {id: 'post1', message: 'Hello, World 1!', create_at: new Date(2019, 2, 4, 12).getTime()},
                    {id: 'post2', message: 'Hello, World 2!', create_at: new Date(2019, 2, 4, 11).getTime()},
                    {id: 'post3', message: 'Hello, World 3!', create_at: new Date(2019, 2, 3, 12).getTime()},
                ],
            };

            const wrapper = shallow(<PostList {...props}/>);

            wrapper.setState({
                atEnd: true,
                isDoingInitialLoad: false,
            });

            expect(wrapper.find(DateSeparator)).toHaveLength(2);
            expect(wrapper.find('.post-list__content').children()).toMatchSnapshot();
        });
    });

    describe('new message line', () => {
        test('should not render on first read', () => {
            const props = {
                ...baseProps,
                lastViewedAt: 0,
            };

            const wrapper = shallow(<PostList {...props}/>);

            wrapper.setState({
                atEnd: true,
                isDoingInitialLoad: false,
            });

            expect(wrapper.find('.new-separator').exists()).toBe(false);
        });

        test('should render new message line between posts', () => {
            const props = {
                ...baseProps,
                lastViewedAt: new Date(2019, 2, 3, 13).getTime(),
            };

            const wrapper = shallow(<PostList {...props}/>);

            wrapper.setState({
                atEnd: true,
                isDoingInitialLoad: false,
            });

            expect(wrapper.find('.new-separator').exists()).toBe(true);
            expect(wrapper.find('.post-list__content').children()).toMatchSnapshot();
        });

        test('should not render when all posts have been read', () => {
            const props = {
                ...baseProps,
                lastViewedAt: baseProps.posts[0].create_at,
            };

            const wrapper = shallow(<PostList {...props}/>);

            wrapper.setState({
                atEnd: true,
                isDoingInitialLoad: false,
            });

            expect(wrapper.find('.new-separator').exists()).toBe(false);
        });

        test('should not render on first read', () => {
            const props = {
                ...baseProps,
                lastViewedAt: 0,
            };

            const wrapper = shallow(<PostList {...props}/>);

            wrapper.setState({
                atEnd: true,
                isDoingInitialLoad: false,
            });

            expect(wrapper.find('.new-separator').exists()).toBe(false);
        });
    });
});
