// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import ColorInput from 'components/color_input.jsx';

describe('components/ColorInput', () => {
    test('should match snapshot, init', () => {
        const wrapper = shallow(
            <ColorInput color='#ffffff'/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, opened', () => {
        const wrapper = shallow(
            <ColorInput color='#ffffff'/>
        );

        wrapper.find('.input-group-addon').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, toggle picker', () => {
        const wrapper = shallow(
            <ColorInput color='#ffffff'/>
        );

        wrapper.find('.input-group-addon').simulate('click');
        wrapper.find('.input-group-addon').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, click on picker', () => {
        const wrapper = shallow(
            <ColorInput color='#ffffff'/>
        );

        wrapper.find('.input-group-addon').simulate('click');
        wrapper.find('.color-popover').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });

    test('should have match state on togglePicker', () => {
        const wrapper = shallow(
            <ColorInput color='#ffffff'/>
        );

        wrapper.setState({isOpened: true});

        wrapper.find('.input-group-addon').simulate('click');
        expect(wrapper.state('isOpened')).toEqual(false);

        wrapper.find('.input-group-addon').simulate('click');
        expect(wrapper.state('isOpened')).toEqual(true);
    });

    test('should have called onChange prop', () => {
        const onChange = jest.fn();
        const wrapper = shallow(
            <ColorInput
                color='#ffffff'
                onChange={onChange}
            />
        );

        const newColorData = {hex: '#ccc'};
        wrapper.instance().handleChange(newColorData);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(newColorData.hex);
    });

    test('should have match state when checkClick is called', () => {
        const wrapper = mountWithIntl(
            <ColorInput color='#ffffff'/>
        );

        wrapper.setState({isOpened: true});
        wrapper.instance().checkClick({target: {}});
        expect(wrapper.state('isOpened')).toEqual(false);
    });
});
