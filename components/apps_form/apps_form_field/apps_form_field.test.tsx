// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
//
import React from 'react';
import {shallow} from 'enzyme';

import {AppField} from 'mattermost-redux/types/apps';

import TextSetting from 'components/widgets/settings/text_setting';
import RadioSetting from 'components/widgets/settings/radio_setting';

import AppsFormField, {Props} from './apps_form_field';

describe('components/apps_form/apps_form_field/AppsFormField', () => {
    const field: AppField = {
        name: 'field1',
        type: 'text',
        max_length: 100,
        modal_label: 'The Field',
    };

    const baseDialogProps: Props = {
        name: 'testing',
        actions: {
            autocompleteChannels: jest.fn(),
            autocompleteUsers: jest.fn(),
        },
        field,
        value: '',
        onChange: () => {},
        performLookup: jest.fn(),
        isSubmit: false,
    };

    const baseTextSettingProps = {
        id: baseDialogProps.name,
        maxLength: 100,
        resizable: false,
        value: '',
        label: (
            <React.Fragment>
                {baseDialogProps.field.modal_label}
                <span className='error-text'>{' *'}</span>
            </React.Fragment>
        ),
    };
    it('subtype blank', () => {
        const wrapper = shallow(
            <AppsFormField
                {...baseDialogProps}
            />,
        );
        expect(wrapper.matchesElement(
            <TextSetting
                {...baseTextSettingProps}
                type='input'
            />,
        )).toEqual(true);
    });

    it('subtype email', () => {
        const wrapper = shallow(
            <AppsFormField
                {...baseDialogProps}
                field={{
                    ...field,
                    subtype: 'email',
                }}
            />,
        );
        expect(wrapper.matchesElement(
            <TextSetting
                {...baseTextSettingProps}
                type='email'
            />,
        )).toEqual(true);
    });

    it('subtype invalid', () => {
        const wrapper = shallow(
            <AppsFormField
                {...baseDialogProps}
                field={{
                    ...field,
                    subtype: 'invalid',
                }}
            />,
        );
        expect(wrapper.matchesElement(
            <TextSetting
                {...baseTextSettingProps}
                type='input'
            />,
        )).toEqual(true);
    });

    it('subtype password', () => {
        const wrapper = shallow(
            <AppsFormField
                {...baseDialogProps}
                field={{
                    ...field,
                    subtype: 'password',
                }}
            />,
        );
        expect(wrapper.matchesElement(
            <TextSetting
                {...baseTextSettingProps}
                type='password'
            />,
        )).toEqual(true);
    });

    describe('radioSetting', () => {
        const radioOptions = [
            {value: 'foo', label: 'foo-text'},
            {value: 'bar', label: 'bar-text'},
        ];

        test('RadioSetting is rendered when type is radio', () => {
            const wrapper = shallow(
                <AppsFormField
                    {...baseDialogProps}
                    field={{
                        ...field,
                        type: 'static_select',
                        subtype: 'radio',
                        options: radioOptions,
                    }}
                    onChange={jest.fn()}
                />,
            );

            expect(wrapper.find(RadioSetting).exists()).toBe(true);
        });

        test('RadioSetting is rendered when options are undefined', () => {
            const wrapper = shallow(
                <AppsFormField
                    {...baseDialogProps}
                    field={{
                        ...field,
                        type: 'static_select',
                        subtype: 'radio',
                        options: undefined,
                    }}
                    onChange={jest.fn()}
                />,
            );

            expect(wrapper.find(RadioSetting).exists()).toBe(true);
        });

        test('RadioSetting is rendered when options are null and value is null', () => {
            const wrapper = shallow(
                <AppsFormField
                    {...baseDialogProps}
                    field={{
                        ...field,
                        type: 'static_select',
                        subtype: 'radio',
                        options: undefined,
                    }}
                    value={null}
                    onChange={jest.fn()}
                />,
            );

            expect(wrapper.find(RadioSetting).exists()).toBe(true);
        });

        test('RadioSetting is rendered when options are null and value is not null', () => {
            const wrapper = shallow(
                <AppsFormField
                    {...baseDialogProps}
                    field={{
                        ...field,
                        type: 'static_select',
                        subtype: 'radio',
                        options: undefined,
                    }}
                    value={'a'}
                    onChange={jest.fn()}
                />,
            );

            expect(wrapper.find(RadioSetting).exists()).toBe(true);
        });

        test('RadioSetting is rendered when value is not one of the options', () => {
            const wrapper = shallow(
                <AppsFormField
                    {...baseDialogProps}
                    field={{
                        ...field,
                        type: 'static_select',
                        subtype: 'radio',
                        options: radioOptions,
                    }}
                    value={'a'}
                    onChange={jest.fn()}
                />,
            );

            expect(wrapper.find(RadioSetting).exists()).toBe(true);
        });

        test('No default value is selected from the radio button list', () => {
            const wrapper = shallow(
                <AppsFormField
                    {...baseDialogProps}
                    field={{
                        ...field,
                        type: 'static_select',
                        subtype: 'radio',
                        options: radioOptions,
                    }}
                    onChange={jest.fn()}
                />,
            );
            expect(wrapper.find({options: radioOptions}).props().value).toEqual('');
        });

        test('The default value can be specified from the list', () => {
            const wrapper = shallow(
                <AppsFormField
                    {...baseDialogProps}
                    field={{
                        ...field,
                        type: 'static_select',
                        subtype: 'radio',
                        options: radioOptions,
                    }}
                    value={radioOptions[1].value}
                    onChange={jest.fn()}
                />,
            );
            expect(wrapper.find({options: radioOptions, value: radioOptions[1].value}).exists()).toBe(true);
        });
    });
});
