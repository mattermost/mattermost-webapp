// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import QuickInput from 'components/quick_input';

describe('components/QuickInput', () => {
    test('should match snapshot when not clearable and empty', () => {
        const wrapper = mount(
            <QuickInput/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.unmount();
    });

    test('should match snapshot when not clearable and with content', () => {
        const wrapper = mount(
            <QuickInput/>
        );

        wrapper.setProps({value: 'mock'});
        wrapper.instance().forceUpdate();
        wrapper.update();

        expect(wrapper).toMatchSnapshot();

        wrapper.unmount();
    });

    test('should match snapshot when clearable and empty', () => {
        const wrapper = mount(
            <QuickInput
                clearable={true}
            />
        );

        wrapper.setProps({value: ''});
        wrapper.instance().forceUpdate();
        wrapper.update();

        expect(wrapper).toMatchSnapshot();

        wrapper.unmount();
    });

    test('should match snapshot when clearable and with value', () => {
        const wrapper = mount(
            <QuickInput
                clearable={true}
                value=''
            />
        );

        wrapper.setProps({value: 'mock'});
        wrapper.instance().forceUpdate();
        wrapper.update();

        expect(wrapper.instance().value).toEqual('mock');

        expect(wrapper).toMatchSnapshot();

        wrapper.find('.input-clear').simulate('click');
        wrapper.instance().forceUpdate();
        wrapper.update();

        expect(wrapper.instance().value).toEqual('');

        expect(wrapper).toMatchSnapshot();

        wrapper.unmount();
    });
});