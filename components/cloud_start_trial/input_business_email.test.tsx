// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, shallow} from 'enzyme';

import InputBusinessEmail from './input_business_email';

describe('/components/cloud_start_trial/input_business_email', () => {
    const handleEmailValuesMockFn = jest.fn();
    const baseProps = {
        handleEmailValues: handleEmailValuesMockFn,
        email: 'foo@example.com',
        customInputLabel: null,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<InputBusinessEmail {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('test input business email displays the input element correctly', () => {
        const wrapper = mount(
            <InputBusinessEmail {...baseProps}/>,
        );
        const inputElement = wrapper.find('.Input');
        console.log(wrapper.debug());
        expect(inputElement.length).toBe(1);
    });

    test('test input business email displays the SUCCESS custom message correctly', () => {
        const wrapper = mount(
            <InputBusinessEmail {...{...baseProps, customInputLabel: {type: 'success', value: 'success value'}}}/>,
        );
        const customMessageElement = wrapper.find('.Input___customMessage.Input___success');
        expect(customMessageElement.length).toBe(1);
    });

    test('test input business email displays the WARNING custom message correctly', () => {
        const wrapper = mount(
            <InputBusinessEmail {...{...baseProps, customInputLabel: {type: 'warning', value: 'warning value'}}}/>,
        );
        const customMessageElement = wrapper.find('.Input___customMessage.Input___warning');
        expect(customMessageElement.length).toBe(1);
    });

    test('test input business email displays the ERROR custom message correctly', () => {
        const wrapper = mount(
            <InputBusinessEmail {...{...baseProps, customInputLabel: {type: 'error', value: 'error value'}}}/>,
        );
        const customMessageElement = wrapper.find('.Input___customMessage.Input___error');
        expect(customMessageElement.length).toBe(1);
    });

    test('test input business email displays the INFO custom message correctly', () => {
        const wrapper = mount(
            <InputBusinessEmail {...{...baseProps, customInputLabel: {type: 'info', value: 'info value'}}}/>,
        );
        const customMessageElement = wrapper.find('.Input___customMessage.Input___info');
        expect(customMessageElement.length).toBe(1);
    });

    test('test the input element handles the onChange event correctly', () => {
        const event = {
            target: {value: 'email@domain.com'},
        };
        const wrapper = mount(
            <InputBusinessEmail {...baseProps}/>,
        );
        const inputElement = wrapper.find('.Input');

        inputElement.find('input').simulate('change', event);
        expect(handleEmailValuesMockFn).toBeCalled();
    });
});
