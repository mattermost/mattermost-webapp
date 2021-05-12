// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';

import {AppsForm, Props, State} from './apps_form';

describe('AppsForm', () => {
    const baseProps: Props = {
        intl: {} as any,
        onHide: jest.fn(),
        isEmbedded: false,
        actions: {
            performLookupCall: jest.fn(),
            refreshOnSelect: jest.fn(),
            submit: jest.fn(),
        },
        form: {
            title: 'Title',
            footer: 'Footer',
            header: 'Header',
            icon: 'Icon',
            call: {
                path: '/create',
            },
            fields: [
                {
                    name: 'bool1',
                    type: 'bool',
                },
                {
                    name: 'bool2',
                    type: 'bool',
                    value: false,
                },
                {
                    name: 'bool3',
                    type: 'bool',
                    value: true,
                },
                {
                    name: 'text1',
                    type: 'text',
                    value: 'initial text',
                },
                {
                    name: 'select1',
                    type: 'static_select',
                    options: [
                        {label: 'Label1', value: 'Value1'},
                        {label: 'Label2', value: 'Value2'}
                    ],
                    value: {label: 'Label1', value: 'Value1'},
                },
            ],
        },
    }

    test('should set match snapshot', () => {
        const wrapper: ShallowWrapper<Props, State, AppsForm> = shallow(
            <AppsForm
                {...baseProps}
            />
        ) as unknown as ShallowWrapper<Props, State, AppsForm>;

        expect(wrapper).toMatchSnapshot();
    });

    test('should set initial form values', () => {
        const wrapper: ShallowWrapper<Props, State, AppsForm> = shallow(
            <AppsForm
                {...baseProps}
            />
        ) as unknown as ShallowWrapper<Props, State, AppsForm>;

        expect(wrapper.state().values).toEqual({
            bool1: false,
            bool2: false,
            bool3: true,
            text1: 'initial text',
            select1: {label: 'Label1', value: 'Value1'},
        });
    });

    test('it should submit and close the modal', async () => {
        const submit = jest.fn().mockResolvedValue({data: {type: 'ok'}});

        const props: Props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                submit,
            },
        }

        const wrapper: ShallowWrapper<Props, State, AppsForm> = shallow(
            <AppsForm
                {...props}
            />
        ) as unknown as ShallowWrapper<Props, State, AppsForm>;

        const hide = jest.fn();
        wrapper.instance().handleHide = hide;

        await wrapper.instance().handleSubmit({preventDefault: jest.fn()} as any);

        expect(submit).toHaveBeenCalledWith({
            values: {
                bool1: false,
                bool2: false,
                bool3: true,
                text1: 'initial text',
                select1: {label: 'Label1', value: 'Value1'},
            },
        });
        expect(hide).toHaveBeenCalled();
    });
});
