// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import QuickInput from 'components/quick_input';

describe('components/QuickInput', () => {
    describe('should not render clear button', () => {
        [
            ['in default state', {}],
            ['when not clearable', {value: 'value', clearable: false, onClear: () => {}}],
            ['when no onClear callback', {value: 'value', clearable: true}],
            ['when value undefined', {clearable: true, onClear: () => {}}],
            ['when value empty', {value: '', clearable: true, onClear: () => {}}],
        ].forEach(([description, props]) => {
            it(description, () => {
                const wrapper = mount(
                    <QuickInput {...props}/>
                );

                expect(wrapper.find('.input-clear').exists()).toBe(false);
            });
        });
    });

    test('should render clear button', () => {
        const wrapper = mount(
            <QuickInput
                value='mock'
                clearable={true}
                onClear={() => {}}
            />
        );

        expect(wrapper.find('.input-clear').exists()).toBe(true);
    });

    test('should dismiss clear button', () => {
        const wrapper = mount(
            <QuickInput
                value='mock'
                clearable={true}
                onClear={() => {}}
            />
        );

        wrapper.setProps({onClear: () => wrapper.setProps({value: ''})});
        expect(wrapper.find('.input-clear').exists()).toBe(true);

        wrapper.find('.input-clear').simulate('click');
        expect(wrapper.find('.input-clear').exists()).toBe(false);
    });
});
