// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {AppBinding} from 'mattermost-redux/types/apps';
import {Post} from 'mattermost-redux/types/posts';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import SelectBinding, {SelectBinding as SelectBindingUnwrapped} from './select_binding';

describe('components/post_view/embedded_bindings/select_binding', () => {
    const post = {
        id: 'some_post_id',
        channel_id: 'some_channel_id',
        root_id: 'some_root_id',
    } as Post;

    const binding = {
        app_id: 'some_app_id',
        location: '/some_location',
        call: {
            path: 'some_url',
        },
        bindings: [
            {
                app_id: 'some_app_id',
                label: 'Option 1',
                location: 'option1',
                call: {
                    path: 'some_url_1',
                },
            },
            {
                app_id: 'some_app_id',
                label: 'Option 2',
                location: 'option2',
                call: {
                    path: 'some_url_2',
                },
            },
        ] as AppBinding[],
    } as AppBinding;

    const baseProps = {
        post,
        userId: 'user_id',
        binding,
        actions: {
            doAppCall: jest.fn().mockResolvedValue({
                data: {
                    type: 'ok',
                    markdown: 'Nice job!',
                },
            }),
            getChannel: jest.fn().mockResolvedValue({
                data: {
                    id: 'some_channel_id',
                    team_id: 'some_team_id',
                },
            }),
        },
        sendEphemeralPost: jest.fn(),
    };

    test('should start with nothing selected', () => {
        const wrapper = shallowWithIntl(<SelectBinding {...baseProps}/>);

        expect(wrapper.state()).toMatchObject({});
    });

    describe('handleSelected', () => {
        test('should should call doAppCall', async () => {
            const props = {
                ...baseProps,
                actions: {
                    doAppCall: jest.fn().mockResolvedValue({
                        data: {
                            type: 'ok',
                            markdown: 'Nice job!',
                        },
                    }),
                    getChannel: jest.fn().mockResolvedValue({
                        data: {
                            id: 'some_channel_id',
                            team_id: 'some_team_id',
                        },
                    }),
                },
                sendEphemeralPost: jest.fn(),
                intl: {} as any,
            };

            const wrapper = shallow<SelectBindingUnwrapped>(<SelectBindingUnwrapped {...props}/>);

            await wrapper.instance().handleSelected({
                text: 'Option 1',
                value: 'option1',
            });

            expect(props.actions.getChannel).toHaveBeenCalledWith('some_channel_id');
            expect(props.actions.doAppCall).toHaveBeenCalledWith({
                context: {
                    app_id: 'some_app_id',
                    channel_id: 'some_channel_id',
                    location: '/in_post/option1',
                    post_id: 'some_post_id',
                    root_id: 'some_root_id',
                    team_id: 'some_team_id',
                },
                expand: {
                    post: 'all',
                },
                path: 'some_url_1',
                query: undefined,
                raw_command: undefined,
                selected_field: undefined,
                values: undefined,
            }, 'submit', {});

            expect(props.sendEphemeralPost).toHaveBeenCalledWith('Nice job!', 'some_channel_id', 'some_root_id');
        });
    });

    test('should handle error call response', async () => {
        const props = {
            ...baseProps,
            actions: {
                doAppCall: jest.fn().mockResolvedValue({
                    data: {
                        type: 'error',
                        error: 'The error',
                    },
                }),
                getChannel: jest.fn().mockResolvedValue({
                    data: {
                        id: 'some_channel_id',
                        team_id: 'some_team_id',
                    },
                }),
            },
            sendEphemeralPost: jest.fn(),
            intl: {} as any,
        };

        const wrapper = shallow<SelectBindingUnwrapped>(<SelectBindingUnwrapped {...props}/>);

        await wrapper.instance().handleSelected({
            text: 'Option 1',
            value: 'option1',
        });

        expect(props.sendEphemeralPost).toHaveBeenCalledWith('The error', 'some_channel_id', 'some_root_id');
    });
});
