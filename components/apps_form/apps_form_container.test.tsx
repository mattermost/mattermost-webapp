// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {AppContext, AppForm} from 'mattermost-redux/types/apps';

import EmojiMap from 'utils/emoji_map';

import AppsFormContainer, {Props} from './apps_form_container';

describe('components/apps_model/AppsFormContainer', () => {
    const emojiMap = new EmojiMap(new Map());

    const context: AppContext = {
        app_id: 'app',
        channel_id: 'channel',
        team_id: 'team',
        post_id: 'post',
    };

    const baseProps: Props = {
        emojiMap,
        form: {
            title: 'Form Title',
            header: 'Form Header',
            fields: [
                {
                    type: 'text',
                    name: 'field1',
                    value: 'initial_value_1',
                    source_url: '/dynamic_url',
                },
            ],
        },
        call: {
            context,
            url: '/submit_url',
        },
        actions: {
            doAppCall: jest.fn().mockResolvedValue({}),
        },
        onHide: jest.fn(),
        postID: context.post_id,
        channelID: context.channel_id,
        teamID: context.team_id,
        isEmbedded: false,
    };

    test('should match snapshot', () => {
        const props = baseProps;

        const wrapper = shallow(<AppsFormContainer {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    describe('submitDialog', () => {
        test('should handle form submission result', async () => {
            const response = {
                data: {},
            };

            const props = {
                ...baseProps,
                actions: {
                    ...baseProps.actions,
                    doAppCall: jest.fn().mockResolvedValue(response),
                },
            };

            const wrapper = shallow<AppsFormContainer>(<AppsFormContainer {...props}/>);
            const result = await wrapper.instance().submitDialog({
                values: {
                    field1: 'value1',
                    field2: {label: 'label2', value: 'value2'},
                },
            });

            expect(props.actions.doAppCall).toHaveBeenCalledWith({
                context: {
                    app_id: 'app',
                    channel_id: 'channel',
                    location: '/in_post',
                    post_id: 'post',
                    team_id: 'team',
                },
                type: '',
                url: '/submit_url',
                values: {
                    field1: 'value1',
                    field2: [
                        {
                            label: 'label2',
                            value: 'value2',
                        },
                    ],
                },
            });

            expect(result).toEqual({
                data: {},
            });
        });
    });

    describe('performLookupCall', () => {
        test('should handle form user input', async () => {
            const response = {
                data: {
                    data: {
                        items: [{
                            label: 'Fetched Label',
                            value: 'fetched_value',
                        }],
                    },
                },
            };

            const props = {
                ...baseProps,
                actions: {
                    ...baseProps.actions,
                    doAppCall: jest.fn().mockResolvedValue(response),
                },
            };

            const form = props.form as AppForm;

            const wrapper = shallow<AppsFormContainer>(<AppsFormContainer {...props}/>);
            const result = await wrapper.instance().performLookupCall(
                form.fields[0],
                {
                    field1: 'value1',
                    field2: {label: 'label2', value: 'value2'},
                },
                'My search',
            );

            expect(props.actions.doAppCall).toHaveBeenCalledWith({
                context: {
                    app_id: 'app',
                    channel_id: 'channel',
                    location: '/in_post',
                    post_id: 'post',
                    team_id: 'team',
                },
                type: 'lookup',
                url: '/dynamic_url',
                values: {
                    form: {
                        fields: [
                            {
                                name: 'field1',
                                source_url: '/dynamic_url',
                                type: 'text',
                                value: 'initial_value_1',
                            },
                        ],
                        header: 'Form Header',
                        title: 'Form Title',
                    },
                    user_input: 'My search',
                    values: {
                        field1: 'value1',
                        field2: [
                            {
                                label: 'label2',
                                value: 'value2',
                            },
                        ],
                    },
                },
            });

            expect(result).toEqual([{
                label: 'Fetched Label',
                value: 'fetched_value',
            }]);
        });
    });
});
