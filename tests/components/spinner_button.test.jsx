// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, shallow} from 'enzyme';

import SpinnerButton from 'components/spinner_button.jsx';

describe('components/SpinnerButton', () => {
    test('should match snapshot with required props', () => {
        const wrapper = shallow(
            <SpinnerButton spinning={false}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with spinning', () => {
        const wrapper = shallow(
            <SpinnerButton spinning={true}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with children', () => {
        const wrapper = shallow(
            <SpinnerButton spinning={false}>
                <span id='child1'/>
                <span id='child2'/>
            </SpinnerButton>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should handle onClick', () => {
        const onClick = jest.fn();

        const wrapper = mount(
            <SpinnerButton
                spinning={false}
                onClick={onClick}
            />
        );

        wrapper.find('.btn-primary').simulate('click');
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
