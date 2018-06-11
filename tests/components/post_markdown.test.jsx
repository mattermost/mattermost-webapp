// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

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
});
