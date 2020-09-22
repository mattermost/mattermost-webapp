// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import PostPreHeader from 'components/post_view/post_pre_header';

import Post from './post';

describe('Post', () => {
    const baseProps = {
        post: {id: 'post1', is_pinned: false},
        createAriaLabel: jest.fn(),
        currentUserId: 'user1',
        center: false,
        compactDisplay: false,
        isFirstReply: true,
        shouldHighlight: false,
        consecutivePostByUser: false,
        previousPostIsComment: false,
        togglePostMenu: jest.fn(),
        isCommentMention: false,
        replyCount: 0,
        channelIsArchived: false,
        actions: {
            selectPost: jest.fn(),
            selectPostCard: jest.fn(),
            markPostAsUnread: jest.fn(),
        },
        isFlagged: false,
    };

    test('should do nothing when clicking on the post', () => {
        const wrapper = shallowWithIntl(<Post {...baseProps}/>);

        wrapper.find(`#post_${baseProps.post.id}`).simulate('click', {});

        expect(baseProps.actions.markPostAsUnread).not.toHaveBeenCalled();
    });

    test('should mark post as unread when clicking on the post with alt held', () => {
        const wrapper = shallowWithIntl(<Post {...baseProps}/>);

        wrapper.find(`#post_${baseProps.post.id}`).simulate('click', {altKey: true});

        expect(baseProps.actions.markPostAsUnread).toHaveBeenCalledWith(baseProps.post);
    });

    test('should not mark post as unread on click when channel is archived', () => {
        const props = {
            ...baseProps,
            channelIsArchived: true,
        };

        const wrapper = shallowWithIntl(<Post {...props}/>);

        wrapper.find(`#post_${props.post.id}`).simulate('click', {altKey: true});

        expect(baseProps.actions.markPostAsUnread).not.toHaveBeenCalled();
    });

    describe('getClassName', () => {
        test('should not show cursor pointer normally', () => {
            const wrapper = shallowWithIntl(<Post {...baseProps}/>);

            expect(wrapper.instance().getClassName(baseProps.post, false, false, false, false, false)).not.toContain('cursor--pointer');
        });

        test('should show cursor pointer when alt is held', () => {
            const wrapper = shallowWithIntl(<Post {...baseProps}/>);

            wrapper.setState({alt: true});

            expect(wrapper.instance().getClassName(baseProps.post, false, false, false, false, false)).toContain('cursor--pointer');
        });

        test('should not show cursor pointer when channel is archived', () => {
            const props = {
                ...baseProps,
                channelIsArchived: true,
            };

            const wrapper = shallowWithIntl(<Post {...props}/>);

            wrapper.setState({alt: true});

            expect(wrapper.instance().getClassName(baseProps.post, false, false, false, false, false)).not.toContain('cursor--pointer');
        });
    });

    test('should not remove post--highlight class after timeout so the classes for permalink are not applied', () => {
        jest.useFakeTimers();

        const props = {
            ...baseProps,
            shouldHighlight: true,
        };

        const wrapper = shallowWithIntl(<Post {...props}/>);
        expect(wrapper.state('fadeOutHighlight')).toBe(false);
        expect(wrapper).toMatchSnapshot();
        jest.runOnlyPendingTimers();
        expect(wrapper.state('fadeOutHighlight')).toBe(true);
        expect(wrapper).toMatchSnapshot();
    });

    test('should handle highlighting properly when jumping to pinned or flagged posts', () => {
        jest.useFakeTimers();

        const props = {
            ...baseProps,
            shouldHighlight: true,
            isFlagged: true,
        };

        const wrapper = shallowWithIntl(<Post {...props}/>);
        expect(wrapper.state('fadeOutHighlight')).toBe(false);
        expect(wrapper.find('div.post').hasClass('post--highlight')).toBe(true);
        expect(wrapper.find('div.post').hasClass('post--pinned-or-flagged-highlight')).toBe(true);
        expect(wrapper).toMatchSnapshot();
        jest.runOnlyPendingTimers();
        expect(wrapper.state('fadeOutHighlight')).toBe(true);
        expect(wrapper.find('div.post').hasClass('post--highlight')).toBe(false);
        expect(wrapper.find('div.post').hasClass('post--pinned-or-flagged-highlight')).toBe(false);
        expect(wrapper).toMatchSnapshot();
    });

    test('should pass props correctly to PostPreHeader', () => {
        const wrapper = shallowWithIntl(
            <Post {...baseProps}/>,
        );

        const postPreHeader = wrapper.find(PostPreHeader);
        expect(postPreHeader).toHaveLength(1);
        expect(postPreHeader.prop('isFlagged')).toEqual(baseProps.isFlagged);
        expect(postPreHeader.prop('isPinned')).toEqual(baseProps.post.is_pinned);
        expect(postPreHeader.prop('channelId')).toEqual(baseProps.post.channel_id);
    });

    test('should not highlight the post of it is neither flagged nor pinned', () => {
        const wrapper = shallowWithIntl(
            <Post {...baseProps}/>,
        );

        expect(wrapper.find('div.a11y__section')).toHaveLength(1);
        expect(wrapper.find('div.a11y__section').hasClass('post--pinned-or-flagged')).toBe(false);
    });

    describe('should handle post highlighting correctly', () => {
        for (const testCase of [
            {
                name: 'flagged only',
                isFlagged: true,
                isPinned: false,
            },
            {
                name: 'pinned only',
                isFlagged: false,
                isPinned: true,
            },
            {
                name: 'pinned and flagged',
                isFlagged: true,
                isPinned: true,
            },
        ]) {
            // eslint-disable-next-line no-loop-func
            test(testCase.name, () => {
                const props = {
                    ...baseProps,
                    isFlagged: testCase.isFlagged,
                    post: {...baseProps.post, is_pinned: testCase.isPinned},
                };

                const wrapper = shallowWithIntl(
                    <Post {...props}/>,
                );

                expect(wrapper.find('div.a11y__section')).toHaveLength(1);
                expect(wrapper.find('div.a11y__section').hasClass('post--pinned-or-flagged')).toBe(true);
            });
        }
    });
});
