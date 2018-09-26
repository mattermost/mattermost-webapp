// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Preferences} from 'mattermost-redux/constants';

import {AdvancedSections} from 'utils/constants.jsx';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

import CodeBlockCtrlEnterSection from 'components/user_settings/advanced/code_block_ctrl_enter_section/code_block_ctrl_enter_section';

describe('components/user_settings/advanced/JoinLeaveSection', () => {
    const defaultProps = {
        activeSection: '',
        currentUserId: 'current_user_id',
        codeBlockOnCtrlEnter: 'true',
        onUpdateSection: jest.fn(),
        prevActiveSection: AdvancedSections.CONTROL_SEND,
        renderOnOffLabel: jest.fn(),
        actions: {
            savePreferences: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <CodeBlockCtrlEnterSection {...defaultProps}/>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(SettingItemMax).exists()).toEqual(false);
        expect(wrapper.find(SettingItemMin).exists()).toEqual(true);

        wrapper.setProps({activeSection: AdvancedSections.CODE_BLOCK_ON_CTRL_ENTER});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(SettingItemMax).exists()).toEqual(true);
        expect(wrapper.find(SettingItemMin).exists()).toEqual(false);
    });

    test('should match state on handleOnChange', () => {
        const wrapper = shallow(
            <CodeBlockCtrlEnterSection {...defaultProps}/>
        );

        let value = 'false';
        wrapper.setState({codeBlockOnCtrlEnterState: 'true'});
        wrapper.instance().handleOnChange({currentTarget: {value}});
        expect(wrapper.state('codeBlockOnCtrlEnterState')).toEqual(value);

        value = 'true';
        wrapper.instance().handleOnChange({currentTarget: {value}});
        expect(wrapper.state('codeBlockOnCtrlEnterState')).toEqual(value);
    });

    test('should call props.actions.savePreferences and props.onUpdateSection on handleSubmit', () => {
        const actions = {savePreferences: jest.fn()};
        const onUpdateSection = jest.fn();
        const wrapper = shallow(
            <CodeBlockCtrlEnterSection
                {...defaultProps}
                actions={actions}
                onUpdateSection={onUpdateSection}
            />
        );

        const codeBlockOnCtrlEnterPreference = {
            category: Preferences.CATEGORY_ADVANCED_SETTINGS,
            name: 'code_block_ctrl_enter',
            user_id: defaultProps.currentUserId,
            value: 'true',
        };

        wrapper.instance().handleSubmit();
        expect(actions.savePreferences).toHaveBeenCalledTimes(1);
        expect(actions.savePreferences).toHaveBeenCalledWith(defaultProps.currentUserId, [codeBlockOnCtrlEnterPreference]);
        expect(onUpdateSection).toHaveBeenCalledTimes(1);

        wrapper.setState({codeBlockOnCtrlEnterState: 'false'});
        codeBlockOnCtrlEnterPreference.value = 'false';
        wrapper.instance().handleSubmit();
        expect(actions.savePreferences).toHaveBeenCalledTimes(2);
        expect(actions.savePreferences).toHaveBeenCalledWith(defaultProps.currentUserId, [codeBlockOnCtrlEnterPreference]);
    });
});
