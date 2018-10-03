// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Preferences} from 'mattermost-redux/constants';

import {AdvancedSections} from 'utils/constants.jsx';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

import SendCtrlEnterSection from 'components/user_settings/advanced/send_ctrl_enter_section/send_ctrl_enter_section';

describe('components/user_settings/advanced/JoinLeaveSection', () => {
    const defaultProps = {
        activeSection: '',
        currentUserId: 'current_user_id',
        sendMessageOnCtrlEnter: 'true',
        onUpdateSection: jest.fn(),
        prevActiveSection: 'dummySectionName',
        renderOnOffLabel: jest.fn(),
        actions: {
            savePreferences: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SendCtrlEnterSection {...defaultProps}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(SettingItemMax).exists()).toEqual(false);
        expect(wrapper.find(SettingItemMin).exists()).toEqual(true);

        wrapper.setProps({activeSection: AdvancedSections.CONTROL_SEND});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(SettingItemMax).exists()).toEqual(true);
        expect(wrapper.find(SettingItemMin).exists()).toEqual(false);
    });

    test('should match state on handleOnChange', () => {
        const wrapper = shallow(
            <SendCtrlEnterSection {...defaultProps}/>
        );

        let value = 'false';
        wrapper.setState({sendMessageOnCtrlEnterState: 'true'});
        wrapper.instance().handleOnChange({currentTarget: {value}});
        expect(wrapper.state('sendMessageOnCtrlEnterState')).toEqual(value);

        value = 'true';
        wrapper.instance().handleOnChange({currentTarget: {value}});
        expect(wrapper.state('sendMessageOnCtrlEnterState')).toEqual(value);
    });

    test('should call props.actions.savePreferences and props.onUpdateSection on handleSubmit', () => {
        const actions = {savePreferences: jest.fn()};
        const onUpdateSection = jest.fn();
        const wrapper = shallow(
            <SendCtrlEnterSection
                {...defaultProps}
                actions={actions}
                onUpdateSection={onUpdateSection}
            />
        );

        const sendOnCtrlEnterPreference = {
            category: Preferences.CATEGORY_ADVANCED_SETTINGS,
            name: Preferences.ADVANCED_SEND_ON_CTRL_ENTER,
            user_id: defaultProps.currentUserId,
            value: 'true',
        };

        wrapper.instance().handleSubmit();
        expect(actions.savePreferences).toHaveBeenCalledTimes(1);
        expect(actions.savePreferences).toHaveBeenCalledWith(defaultProps.currentUserId, [sendOnCtrlEnterPreference]);
        expect(onUpdateSection).toHaveBeenCalledTimes(1);

        wrapper.setState({sendMessageOnCtrlEnterState: 'false'});
        sendOnCtrlEnterPreference.value = 'false';
        wrapper.instance().handleSubmit();
        expect(actions.savePreferences).toHaveBeenCalledTimes(2);
        expect(actions.savePreferences).toHaveBeenCalledWith(defaultProps.currentUserId, [sendOnCtrlEnterPreference]);
    });
});
