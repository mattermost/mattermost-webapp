// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {AdvancedSections} from 'utils/constants';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min';

import JoinLeaveSection from 'components/user_settings/advanced/join_leave_section/join_leave_section.jsx';

describe('components/user_settings/advanced/JoinLeaveSection', () => {
    const defaultProps = {
        activeSection: '',
        currentUserId: 'current_user_id',
        joinLeave: 'true',
        onUpdateSection: jest.fn(),
        renderOnOffLabel: jest.fn(),
        actions: {
            savePreferences: jest.fn(() => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <JoinLeaveSection {...defaultProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(SettingItemMax).exists()).toEqual(false);
        expect(wrapper.find(SettingItemMin).exists()).toEqual(true);

        wrapper.setProps({activeSection: AdvancedSections.JOIN_LEAVE});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(SettingItemMax).exists()).toEqual(true);
        expect(wrapper.find(SettingItemMin).exists()).toEqual(false);
    });

    test('should match state on handleOnChange', () => {
        const wrapper = shallow(
            <JoinLeaveSection {...defaultProps}/>,
        );

        let value = 'false';
        wrapper.setState({joinLeaveState: 'true'});
        wrapper.instance().handleOnChange({currentTarget: {value}});
        expect(wrapper.state('joinLeaveState')).toEqual(value);

        value = 'true';
        wrapper.instance().handleOnChange({currentTarget: {value}});
        expect(wrapper.state('joinLeaveState')).toEqual(value);
    });

    test('should call props.actions.savePreferences and props.onUpdateSection on handleSubmit', () => {
        const actions = {
            savePreferences: jest.fn().mockImplementation(() => Promise.resolve({data: true})),
        };
        const onUpdateSection = jest.fn();
        const wrapper = shallow(
            <JoinLeaveSection
                {...defaultProps}
                actions={actions}
                onUpdateSection={onUpdateSection}
            />,
        );

        const joinLeavePreference = {
            category: 'advanced_settings',
            name: 'join_leave',
            user_id: 'current_user_id',
            value: 'true',
        };

        wrapper.instance().handleSubmit();
        expect(actions.savePreferences).toHaveBeenCalledTimes(1);
        expect(actions.savePreferences).toHaveBeenCalledWith('current_user_id', [joinLeavePreference]);
        expect(onUpdateSection).toHaveBeenCalledTimes(1);

        wrapper.setState({joinLeaveState: 'false'});
        joinLeavePreference.value = 'false';
        wrapper.instance().handleSubmit();
        expect(actions.savePreferences).toHaveBeenCalledTimes(2);
        expect(actions.savePreferences).toHaveBeenCalledWith('current_user_id', [joinLeavePreference]);
    });

    test('should match state and call props.onUpdateSection on handleUpdateSection', () => {
        const onUpdateSection = jest.fn();
        const wrapper = shallow(
            <JoinLeaveSection
                {...defaultProps}
                onUpdateSection={onUpdateSection}
            />,
        );

        wrapper.setState({joinLeaveState: 'false'});
        wrapper.instance().handleUpdateSection();
        expect(wrapper.state('joinLeaveState')).toEqual(defaultProps.joinLeave);
        expect(onUpdateSection).toHaveBeenCalledTimes(1);

        wrapper.setState({joinLeaveState: 'false'});
        wrapper.instance().handleUpdateSection(AdvancedSections.JOIN_LEAVE);
        expect(onUpdateSection).toHaveBeenCalledTimes(2);
        expect(onUpdateSection).toBeCalledWith(AdvancedSections.JOIN_LEAVE);
    });
});
