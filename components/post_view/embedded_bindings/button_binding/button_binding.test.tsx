// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Post} from 'mattermost-redux/types/posts';
import {AppBinding} from 'mattermost-redux/types/apps';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import ButtonBinding from './button_binding';

describe('components/post_view/embedded_bindings/button_binding/', () => {
    const post = {
        id: 'post_id',
        channel_id: 'channel_id',
    } as Post;

    const binding = {
        call: {
            path: 'some_url',
        },
    } as AppBinding;
    const baseProps = {
        post,
        userId: 'user_id',
        binding,
        actions: {
            doAppCall: jest.fn(),
            getChannel: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(<ButtonBinding {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call handleAction on click', () => {
        const wrapper = shallowWithIntl(<ButtonBinding {...baseProps}/>);

        wrapper.find('button').simulate('click');

        expect(baseProps.actions.doAppCall).toHaveBeenCalledTimes(1);
    });
});
