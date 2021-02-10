// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import {AppBinding} from 'mattermost-redux/types/apps';
import {Post} from 'mattermost-redux/types/posts';
import React from 'react';

import SelectBinding from './select_binding';

describe('components/post_view/embedded_bindings/select_binding', () => {
    const post = {
        id: 'post_id',
        channel_id: 'channel_id',
    } as Post;

    const binding = {} as AppBinding;

    const baseProps = {
        post,
        userId: 'user_id',
        binding,
        actions: {doAppCall: jest.fn()},
    };

    test('should start with nothing selected', () => {
        const wrapper = shallow(<SelectBinding {...baseProps}/>);

        expect(wrapper.state()).toMatchObject({});
    });
});
