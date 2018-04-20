// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FailedPostOptions from 'components/post_view/failed_post_options/failed_post_options.jsx';

describe('components/post_view/FailedPostOptions', () => {
    const baseProps = {
        post: {
            id: 'post_id',
        },
        actions: {
            createPost: jest.fn(),
            removePost: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<FailedPostOptions {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should create post at most once', () => {
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                createPost: jest.fn().
                    mockImplementationOnce((post, success, failure) => failure()).
                    mockImplementation((post, success) => success()),
            },
        };

        const wrapper = shallow(<FailedPostOptions {...props}/>);
        const e = {preventDefault: jest.fn()};

        // First attempt should fail, allowing retry
        wrapper.find('.post-retry').simulate('click', e);
        expect(props.actions.createPost.mock.calls.length).toBe(1);

        // Second attempt should succeed
        wrapper.find('.post-retry').simulate('click', e);
        expect(props.actions.createPost.mock.calls.length).toBe(2);

        // Third attempt should be ignored, since already succeeded.
        wrapper.find('.post-retry').simulate('click', e);
        expect(props.actions.createPost.mock.calls.length).toBe(2);

        // Next attempt should succeed when post id changes.
        wrapper.setProps({
            ...props,
            post: {
                ...props.post,
                id: 'post_id_new',
            },
        });
        wrapper.find('.post-retry').simulate('click', e);
        expect(props.actions.createPost.mock.calls.length).toBe(3);
    });
});
