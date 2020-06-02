// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
//
import React from 'react';
import {shallow} from 'enzyme';

import TextSetting from 'components/widgets/settings/text_setting';
import RadioSetting from 'components/widgets/settings/radio_setting';

import DialogElement from './dialog_element.jsx';

describe('components/interactive_dialog/DialogElement', () => {
    const baseDialogProps = {
        displayName: 'Testing',
        name: 'testing',
        type: 'text',
        maxLength: 100,
        actions: {
            autocompleteChannels: jest.fn(),
            autocompleteUsers: jest.fn(),
        },
    };
    const baseTextSettingProps = {
        id: baseDialogProps.name,
        maxLength: 100,
        resizable: false,
        value: '',
        label: (
            <React.Fragment>
                {baseDialogProps.displayName}
                <span className='error-text'>{' *'}</span>
            </React.Fragment>
        ),
    };
    it('subtype blank', () => {
        const wrapper = shallow(
            <DialogElement
                {...baseDialogProps}
                subtype=''
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
            <DialogElement
                {...baseDialogProps}
                subtype='email'
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
            <DialogElement
                {...baseDialogProps}
                subtype='invalid'
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
            <DialogElement
                {...baseDialogProps}
                subtype='password'
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
            {value: 'foo', text: 'foo-text'},
            {value: 'bar', text: 'bar-text'},
        ];

        test('RadioSetting is rendered when type is radio', () => {
            const wrapper = shallow(
                <DialogElement
                    {...baseDialogProps}
                    type='radio'
                    options={radioOptions}
                    onChange={jest.fn()}
                />,
            );

            expect(wrapper.find(RadioSetting).exists()).toBe(true);
        });

        test('RadioSetting is rendered when options are null', () => {
            const wrapper = shallow(
                <DialogElement
                    {...baseDialogProps}
                    type='radio'
                    options={null}
                    onChange={jest.fn()}
                />,
            );

            expect(wrapper.find(RadioSetting).exists()).toBe(true);
        });

        test('RadioSetting is rendered when options are null and value is null', () => {
            const wrapper = shallow(
                <DialogElement
                    {...baseDialogProps}
                    type='radio'
                    options={null}
                    value={null}
                    onChange={jest.fn()}
                />,
            );

            expect(wrapper.find(RadioSetting).exists()).toBe(true);
        });

        test('RadioSetting is rendered when options are null and value is not null', () => {
            const wrapper = shallow(
                <DialogElement
                    {...baseDialogProps}
                    type='radio'
                    options={null}
                    value={'a'}
                    onChange={jest.fn()}
                />,
            );

            expect(wrapper.find(RadioSetting).exists()).toBe(true);
        });

        test('RadioSetting is rendered when value is not one of the options', () => {
            const wrapper = shallow(
                <DialogElement
                    {...baseDialogProps}
                    type='radio'
                    options={radioOptions}
                    value={'a'}
                    onChange={jest.fn()}
                />,
            );

            expect(wrapper.find(RadioSetting).exists()).toBe(true);
        });

        test('No default value is selected from the radio button list', () => {
            const wrapper = shallow(
                <DialogElement
                    {...baseDialogProps}
                    type='radio'
                    options={radioOptions}
                    onChange={jest.fn()}
                />,
            );
            expect(wrapper.find({options: radioOptions}).props.value).toBeUndefined();
        });

        test('The default value can be specified from the list', () => {
            const wrapper = shallow(
                <DialogElement
                    {...baseDialogProps}
                    type='radio'
                    options={radioOptions}
                    value={radioOptions[1].value}
                    onChange={jest.fn()}
                />,
            );
            expect(wrapper.find({options: radioOptions, value: radioOptions[1].value}).exists()).toBe(true);
        });
    });
});
