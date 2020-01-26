// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';

import ColorInput from 'components/color_input';

describe('components/ColorInput', () => {
    test('should match snapshot, init', () => {
        const wrapper = shallow(
            <ColorInput
                color='#ffffff'
                id='sidebarBg'
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, opened', () => {
        const wrapper = shallow(
            <ColorInput
                color='#ffffff'
                id='sidebarBg'
            />
        );

        wrapper.find('.input-group-addon').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, toggle picker', () => {
        const wrapper = shallow(
            <ColorInput
                color='#ffffff'
                id='sidebarBg'
            />
        );
        wrapper.find('.input-group-addon').simulate('click');
        wrapper.find('.input-group-addon').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, click on picker', () => {
        const wrapper = shallow(
            <ColorInput
                color='#ffffff'
                id='sidebarBg'
            />
        );

        wrapper.find('.input-group-addon').simulate('click');
        wrapper.find('.color-popover').simulate('click');

        expect(wrapper).toMatchSnapshot();
    });

    test('should have match state on togglePicker', () => {
        const wrapper = shallow(
            <ColorInput
                color='#ffffff'
                id='sidebarBg'
            />
        );

        wrapper.setState({isOpened: true});

        wrapper.find('.input-group-addon').simulate('click');
        expect(wrapper.state('isOpened')).toEqual(false);

        wrapper.find('.input-group-addon').simulate('click');
        expect(wrapper.state('isOpened')).toEqual(true);
    });

    test('should have called onChange prop', () => {
        const onChange = jest.fn();
        const wrapper: ShallowWrapper<any, any, ColorInput> = shallow(
            <ColorInput
                color='#ffffff'
                id='sidebarBg'
                onChange={onChange}
            />
        );

        const newColorData: any = {hex: '#ccc'};

        wrapper.instance().handleColorChange(newColorData);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(newColorData.hex);
    });
});
