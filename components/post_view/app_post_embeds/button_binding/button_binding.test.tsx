// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Post} from 'mattermost-redux/types/posts';
import {AppBinding} from 'mattermost-redux/types/apps';

import ButtonBinding from './button_binding';

describe('components/post_view/app_post_embeds/button_binding/button_binding', () => {
    const post = {
        id: 'post_id',
        channel_id: 'channel_id',
    } as Post;

    const binding = {
        call: {
            url: 'some_url',
        },
    } as AppBinding;
    const baseProps = {
        post,
        userId: 'user_id',
        binding,
        actions: {doAppCall: jest.fn()},
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<ButtonBinding {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call handleAction on click', () => {
        const wrapper = shallow(<ButtonBinding {...baseProps}/>);

        wrapper.find('button').simulate('click');

        expect(baseProps.actions.doAppCall).toHaveBeenCalledTimes(1);
    });
});
