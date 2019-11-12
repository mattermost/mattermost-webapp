// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CustomEnableDisableGuestAccountsSetting from './custom_enable_disable_guest_accounts_setting';

describe('components/AdminConsole/CustomEnableDisableGuestAccountsSetting', () => {
    const baseProps = {
        id: 'MySetting',
        value: false,
        onChange: jest.fn(),
        disabled: false,
        setByEnv: false,
    };

    describe('initial state', () => {
        test('with true', () => {
            const props = {
                ...baseProps,
                value: true,
            };

            const wrapper = shallow(
                <CustomEnableDisableGuestAccountsSetting {...props}/>
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('with false', () => {
            const props = {
                ...baseProps,
                value: false,
            };

            const wrapper = shallow(
                <CustomEnableDisableGuestAccountsSetting {...props}/>
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('handleChange', () => {
        test('should enable without show confirmation modal', () => {
            const props = {
                ...baseProps,
                onChange: jest.fn(),
            };

            const wrapper = shallow<CustomEnableDisableGuestAccountsSetting>(
                <CustomEnableDisableGuestAccountsSetting {...props}/>
            );

            wrapper.instance().handleChange('MySetting', true);
            expect(props.onChange).toBeCalledWith(baseProps.id, true);
            expect(wrapper.state().showConfirm).toBe(false);
        });

        test('should show confirmation modal on disable without confirm', () => {
            const props = {
                ...baseProps,
                onChange: jest.fn(),
            };

            const wrapper = shallow<CustomEnableDisableGuestAccountsSetting>(
                <CustomEnableDisableGuestAccountsSetting {...props}/>
            );

            wrapper.instance().handleChange('MySetting', false);
            expect(props.onChange).not.toBeCalled();
            expect(wrapper.state().showConfirm).toBe(true);
        });

        test('should disable when confirm param is passed', () => {
            const props = {
                ...baseProps,
                onChange: jest.fn(),
            };

            const wrapper = shallow<CustomEnableDisableGuestAccountsSetting>(
                <CustomEnableDisableGuestAccountsSetting {...props}/>
            );

            wrapper.instance().handleChange('MySetting', false, true);
            expect(props.onChange).toBeCalledWith(baseProps.id, false);
            expect(wrapper.state().showConfirm).toBe(false);
        });
    });
});
