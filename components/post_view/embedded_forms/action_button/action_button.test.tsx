// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Post} from 'mattermost-redux/types/posts';
import {AppBinding} from 'mattermost-redux/types/apps';

import ActionButton from './action_button';

describe('components/post_view/embedded_forms/embedded_form/action_button', () => {
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
        const wrapper = shallow(<ActionButton {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call handleAction on click', () => {
        const wrapper = shallow(<ActionButton {...baseProps}/>);

        wrapper.find('button').simulate('click');

        expect(baseProps.actions.doAppCall).toHaveBeenCalledTimes(1);
    });
});
