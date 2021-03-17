// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ShallowWrapper} from 'enzyme';

import {Post} from 'mattermost-redux/types/posts';
import {AppBinding} from 'mattermost-redux/types/apps';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import ButtonBinding, {ButtonBindingUnwrapped} from './button_binding';

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
            doAppCall: jest.fn().mockResolvedValue({
                data: {
                    type: 'ok',
                },
            }),
            getChannel: jest.fn().mockResolvedValue({
                data: {
                    id: 'channel_id',
                    name: 'channel-name',
                    team_id: 'team_id',
                },
            }),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(<ButtonBinding {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call doAppCall on click', async () => {
        const wrapper: ShallowWrapper<any, any, ButtonBindingUnwrapped> = shallowWithIntl(<ButtonBinding {...baseProps}/>);
        await wrapper.instance().handleClick();

        expect(baseProps.actions.getChannel).toHaveBeenCalledWith('channel_id');
        expect(baseProps.actions.doAppCall).toHaveBeenCalledTimes(1);
    });
});
