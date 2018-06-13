// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Posts} from 'mattermost-redux/constants';

import PostMarkdown from 'components/post_markdown/post_markdown';

describe('components/PostMarkdown', () => {
    const baseProps = {
        imageProps: {},
        isRHS: false,
        message: 'message',
        post: {},
    };

    test('should render properly with an empty post', () => {
        const wrapper = shallow(
            <PostMarkdown {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render properly with a post', () => {
        const props = {
            ...baseProps,
            message: 'See ~test',
            post: {
                props: {
                    channel_mentions: {
                        test: {
                            display_name: 'Test',
                        },
                    },
                },
            },
        };
        const wrapper = shallow(
            <PostMarkdown {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render header change properly', () => {
        const props = {
            ...baseProps,
            post: {
                type: Posts.POST_TYPES.HEADER_CHANGE,
                props: {
                    username: 'user',
                    old_header: 'see ~test',
                    new_header: 'now ~test',
                    channel_mentions: {
                        test: {
                            display_name: 'Test',
                        },
                    },
                },
            },
        };
        const wrapper = shallow(
            <PostMarkdown {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render purpose change properly', () => {
        const props = {
            ...baseProps,
            post: {
                type: Posts.POST_TYPES.PURPOSE_CHANGE,
                props: {
                    username: 'user',
                    old_purpose: 'see ~test',
                    new_purpose: 'now ~test',
                    channel_mentions: {
                        test: {
                            display_name: 'Test',
                        },
                    },
                },
            },
        };
        const wrapper = shallow(
            <PostMarkdown {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
