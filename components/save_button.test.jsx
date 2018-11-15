// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SaveButton from 'components/save_button.jsx';

describe('components/SaveButton', () => {
    const baseProps = {
        saving: false,
    };

    test('should match snapshot, on defaultMessage', () => {
        const wrapper = shallow(
            <SaveButton {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('button').first().text()).toBe('Save');
        expect(wrapper.find('button').first().props().disabled).toBe(false);

        wrapper.setProps({defaultMessage: 'Go'});
        expect(wrapper.find('button').first().text()).toBe('Go');
    });

    test('should match snapshot, on savingMessage', () => {
        const props = {...baseProps, saving: true, disabled: true};
        const wrapper = shallow(
            <SaveButton {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('button').first().text()).toBe('Saving');
        expect(wrapper.find('button').first().props().disabled).toBe(true);

        wrapper.setProps({savingMessage: 'Saving Config...'});
        expect(wrapper.find('button').first().text()).toBe('Saving Config...');
    });

    test('should match snapshot, extraClasses', () => {
        const props = {...baseProps, extraClasses: 'some-class'};
        const wrapper = shallow(
            <SaveButton {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
