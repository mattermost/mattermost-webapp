// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Posts} from 'mattermost-redux/constants';

import {postListScrollChange} from 'actions/global_actions';

import PostMessageView from 'components/post_view/post_message_view/post_message_view.jsx';

jest.mock('actions/global_actions', () => ({
    postListScrollChange: jest.fn(),
}));

describe('components/post_view/PostAttachment', () => {
    const post = {
        id: 'post_id',
        message: 'post message',
        state: '',
        type: '',
    };

    const baseProps = {
        post,
        enableFormatting: true,
        options: {},
        lastPostCount: 1,
        compactDisplay: false,
        isRHS: false,
        isRHSOpen: false,
        isRHSExpanded: false,
        theme: {},
        pluginPostTypes: {},
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<PostMessageView {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on Show More', () => {
        const wrapper = shallow(<PostMessageView {...baseProps}/>);

        wrapper.setState({hasOverflow: true, collapse: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on Show Less', () => {
        const wrapper = shallow(<PostMessageView {...baseProps}/>);

        wrapper.setState({hasOverflow: true, collapse: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on deleted post', () => {
        const props = {...baseProps, post: {...post, state: Posts.POST_DELETED}};
        const wrapper = shallow(<PostMessageView {...props}/>);

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.instance().renderDeletedPost()).toMatchSnapshot();
    });

    test('should match snapshot, on edited post', () => {
        const props = {...baseProps, post: {...post, edit_at: 1}};
        const wrapper = shallow(<PostMessageView {...props}/>);

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.instance().renderEditedIndicator()).toMatchSnapshot();
    });

    test('should match snapshot, on ephemeral post', () => {
        const props = {...baseProps, post: {...post, type: Posts.POST_TYPES.EPHEMERAL}};
        const wrapper = shallow(<PostMessageView {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match state and call GlobalActions.postListScrollChange on handleImageHeightReceived', () => {
        const wrapper = shallow(<PostMessageView {...baseProps}/>);
        const instance = wrapper.instance();
        instance.checkOverflow = jest.fn();

        wrapper.setState({checkOverflow: false});
        instance.handleImageHeightReceived();
        expect(postListScrollChange).toHaveBeenCalledTimes(1);
        expect(wrapper.state('checkOverflow')).toEqual(true);
    });
});
