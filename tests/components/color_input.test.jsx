// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ColorInput from 'components/color_input.jsx';

describe('components/ColorInput', () => {
    test('should match snapshot, init', () => {
        const wrapper = shallow(
            <ColorInput
                value='#ffffff'
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, opened', () => {
        const wrapper = shallow(
            <ColorInput
                value='#ffffff'
            />
        );

        wrapper.find('.input-group-addon').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, toggle picker', () => {
        const wrapper = shallow(
            <ColorInput
                value='#ffffff'
            />
        );

        wrapper.find('.input-group-addon').simulate('click');
        wrapper.find('.input-group-addon').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, click on picker', () => {
        const wrapper = shallow(
            <ColorInput
                value='#ffffff'
            />
        );

        wrapper.find('.input-group-addon').simulate('click');
        wrapper.find('.color-popover').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });
});
