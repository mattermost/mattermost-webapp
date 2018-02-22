// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import UserSettingsSidebar from 'components/user_settings/sidebar/user_settings_sidebar.jsx';

describe('components/user_settings/sidebar/UserSettingsSidebar', () => {
    const defaultProps = {
        closeUnusedDirectMessages: 'after_seven_days',
        displayUnreadSection: 'true',
        showUnusedOption: false,
        showUnreadOption: true,
        user: {
            id: 'someuserid',
        },
        closeModal: () => () => true,
        collapseModal: () => () => true,
        updateSection: () => () => true,
        actions: {
            savePreferences: () => true,
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<UserSettingsSidebar {...defaultProps}/>);

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.state('isSaving')).toEqual(false);
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            show_unread_section: defaultProps.displayUnreadSection,
        });
    });

    test('should match state when updateSection is called', () => {
        const newUpdateSection = jest.fn();
        const updateArg = 'unreadChannels';
        const props = {...defaultProps, updateSection: newUpdateSection};
        const wrapper = shallow(<UserSettingsSidebar {...props}/>);

        wrapper.setState({isSaving: true});
        wrapper.instance().updateSection(updateArg);

        expect(wrapper.state('isSaving')).toEqual(false);
        expect(newUpdateSection).toHaveBeenCalledTimes(1);
        expect(newUpdateSection).toHaveBeenCalledWith(updateArg);
    });

    test('should pass handleChange', () => {
        const props = {...defaultProps, activeSection: 'unreadChannels'};
        const wrapper = mountWithIntl(<UserSettingsSidebar {...props}/>);
        wrapper.find('#unreadSectionNever').simulate('change');

        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            show_unread_section: 'false',
        });

        wrapper.find('#unreadSectionEnabled').simulate('change');
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            show_unread_section: 'true',
        });
    });
});
