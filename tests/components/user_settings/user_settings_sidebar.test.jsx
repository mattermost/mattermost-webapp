// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import UserSettingsSidebar from 'components/user_settings/sidebar/user_settings_sidebar.jsx';

describe('components/user_settings/sidebar/UserSettingsSidebar', () => {
    const defaultProps = {
        closeUnusedDirectMessages: 'after_seven_days',
        displayUnreadSection: 'true',
        showUnusedOption: false,
        showGroupSortOptions: true,
        sidebarPreference: {
            grouping: 'by_type',
            sorting: 'alpha',
            unreadsAtTop: 'true',
            favoriteAtTop: 'true',
        },
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
            grouping: defaultProps.sidebarPreference.grouping,
            sorting: defaultProps.sidebarPreference.sorting,
            unreads_at_top: defaultProps.sidebarPreference.unreadsAtTop,
            favorite_at_top: defaultProps.sidebarPreference.favoriteAtTop,
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

    test('should pass handleChange for channel grouping', () => {
        const props = {...defaultProps, activeSection: 'groupChannels'};
        const wrapper = mountWithIntl(<UserSettingsSidebar {...props}/>);

        wrapper.find('#neverOption').simulate('change');
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            grouping: 'none',
            sorting: defaultProps.sidebarPreference.sorting,
            unreads_at_top: defaultProps.sidebarPreference.unreadsAtTop,
            favorite_at_top: defaultProps.sidebarPreference.favoriteAtTop,
        });

        wrapper.find('#byTypeOption').simulate('change');
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            grouping: 'by_type',
            sorting: defaultProps.sidebarPreference.sorting,
            unreads_at_top: defaultProps.sidebarPreference.unreadsAtTop,
            favorite_at_top: defaultProps.sidebarPreference.favoriteAtTop,
        });

        wrapper.find('#unreadAtTopOption').simulate('change', {target: {checked: false}});
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            grouping: 'by_type',
            sorting: defaultProps.sidebarPreference.sorting,
            unreads_at_top: 'false',
            favorite_at_top: defaultProps.sidebarPreference.favoriteAtTop,
        });

        wrapper.find('#unreadAtTopOption').simulate('change', {target: {checked: true}});
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            grouping: 'by_type',
            sorting: defaultProps.sidebarPreference.sorting,
            unreads_at_top: 'true',
            favorite_at_top: defaultProps.sidebarPreference.favoriteAtTop,
        });

        wrapper.find('#favoriteAtTopOption').simulate('change', {target: {checked: false}});
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            grouping: 'by_type',
            sorting: defaultProps.sidebarPreference.sorting,
            unreads_at_top: defaultProps.sidebarPreference.unreadsAtTop,
            favorite_at_top: 'false',
        });

        wrapper.find('#favoriteAtTopOption').simulate('change', {target: {checked: true}});
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            grouping: 'by_type',
            sorting: defaultProps.sidebarPreference.sorting,
            unreads_at_top: defaultProps.sidebarPreference.unreadsAtTop,
            favorite_at_top: 'true',
        });
    });

    test('should pass handleChange for channel grouping', () => {
        const props = {
            ...defaultProps,
            activeSection: 'sortChannels',
            sidebarPreference: {
                ...defaultProps.sidebarPreference,
                grouping: 'none',
            }};
        const wrapper = mountWithIntl(<UserSettingsSidebar {...props}/>);

        wrapper.find('#recentSectionEnabled').simulate('change');
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            grouping: 'none',
            sorting: 'recent',
            unreads_at_top: defaultProps.sidebarPreference.unreadsAtTop,
            favorite_at_top: defaultProps.sidebarPreference.favoriteAtTop,
        });

        wrapper.find('#alphaSectionEnabled').simulate('change');
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            grouping: 'none',
            sorting: 'alpha',
            unreads_at_top: defaultProps.sidebarPreference.unreadsAtTop,
            favorite_at_top: defaultProps.sidebarPreference.favoriteAtTop,
        });
    });
});
