// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Post} from 'mattermost-redux/types/posts';
import {AppBinding, AppCallResponse} from 'mattermost-redux/types/apps';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import ButtonBinding, {ButtonBinding as ButtonBindingUnwrapped} from './button_binding';

describe('components/post_view/embedded_bindings/button_binding/', () => {
    const post = {
        id: 'some_post_id',
        channel_id: 'some_channel_id',
        root_id: 'some_root_id',
    } as Post;

    const binding = {
        app_id: 'some_app_id',
        label: 'some_label',
        location: 'some_location',
        call: {
            path: 'some_url',
        },
    } as AppBinding;

    const callResponse = {
        type: 'ok',
        markdown: 'Nice job!',
        app_metadata: {
            bot_user_id: 'botuserid',
        },
    } as AppCallResponse;

    const baseProps = {
        post,
        userId: 'user_id',
        binding,
        actions: {
            doAppCall: jest.fn().mockResolvedValue({
                data: callResponse,
            }),
            getChannel: jest.fn().mockResolvedValue({
                data: {
                    id: 'some_channel_id',
                    team_id: 'some_team_id',
                },
            }),
            postEphemeralCallResponseForPost: jest.fn(),
            openAppsModal: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(<ButtonBinding {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call doAppCall on click', async () => {
        const props = {
            ...baseProps,
            intl: {} as any,
        };

        const wrapper = shallow<ButtonBindingUnwrapped>(<ButtonBindingUnwrapped {...props}/>);
        await wrapper.instance().handleClick();

        expect(baseProps.actions.getChannel).toHaveBeenCalledWith('some_channel_id');
        expect(baseProps.actions.doAppCall).toHaveBeenCalledWith({
            context: {
                app_id: 'some_app_id',
                channel_id: 'some_channel_id',
                location: '/in_post/some_location',
                post_id: 'some_post_id',
                root_id: 'some_root_id',
                team_id: 'some_team_id',
            },
            expand: {
                post: 'all',
            },
            path: 'some_url',
            query: undefined,
            raw_command: undefined,
            selected_field: undefined,
            values: undefined,
        }, 'submit', {});

        expect(baseProps.actions.postEphemeralCallResponseForPost).toHaveBeenCalledWith(callResponse, 'Nice job!', post);
    });

    test('should handle error call response', async () => {
        const errorCallResponse = {
            type: 'error',
            error: 'The error',
            app_metadata: {
                bot_user_id: 'botuserid',
            },
        };

        const props = {
            ...baseProps,
            actions: {
                doAppCall: jest.fn().mockResolvedValue({
                    error: errorCallResponse,
                }),
                getChannel: jest.fn().mockResolvedValue({
                    data: {
                        id: 'some_channel_id',
                        team_id: 'some_team_id',
                    },
                }),
                postEphemeralCallResponseForPost: jest.fn(),
                openAppsModal: jest.fn(),
            },
            intl: {} as any,
        };

        const wrapper = shallow<ButtonBindingUnwrapped>(<ButtonBindingUnwrapped {...props}/>);
        await wrapper.instance().handleClick();

        expect(props.actions.postEphemeralCallResponseForPost).toHaveBeenCalledWith(errorCallResponse, 'The error', post);
    });
});
