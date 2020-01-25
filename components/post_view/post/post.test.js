// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import Post from './post';

describe('Post', () => {
    const baseProps = {
        post: {id: 'post1'},
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
});
