// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';
import PropTypes from 'prop-types';
import configureStore from 'redux-mock-store';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import UserSettingsSidebar from 'components/user_settings/sidebar/user_settings_sidebar.jsx';

describe('components/user_settings/sidebar/UserSettingsSidebar', () => {
    const defaultProps = {
        closeUnusedDirectMessages: 'after_seven_days',
        displayUnreadSection: 'true',
        showUnusedOption: false,
        channelSwitcherOption: 'true',
        channelSidebarOrganizationOption: 'false',
        showGroupSortOptions: true,
        showChannelOrganization: true,
        showChannelSidebarOrganization: true,
        sidebarPreference: {
            grouping: 'by_type',
            sorting: 'alpha',
        },
        unreadsAtTop: 'true',
        favoriteAtTop: 'true',
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
    const mockStore = configureStore();
    const state = {
        views: {
            settings: {},
        },
    };

    const store = mockStore(state);

    test('should match snapshot', () => {
        const wrapper = shallow(<UserSettingsSidebar {...defaultProps}/>);

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.state('isSaving')).toEqual(false);
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            channel_switcher_section: defaultProps.channelSwitcherOption,
            channel_sidebar_organization: defaultProps.channelSidebarOrganizationOption,
            grouping: defaultProps.sidebarPreference.grouping,
            sorting: defaultProps.sidebarPreference.sorting,
            unreadsAtTop: defaultProps.unreadsAtTop,
            favoriteAtTop: defaultProps.favoriteAtTop,
        });
    });

    test('should match state when updateSection is called', () => {
        const newUpdateSection = jest.fn();
        const updateArg = 'unreadChannels';
        const props = {...defaultProps, updateSection: newUpdateSection};
        const wrapper = shallow(<UserSettingsSidebar {...props}/>);

        wrapper.setState({isSaving: true,
            settings: {
                close_unused_direct_messages: 'junk',
                channel_switcher_section: defaultProps.channelSwitcherOption,
                channel_sidebar_organization: defaultProps.channelSidebarOrganizationOption,
                grouping: defaultProps.sidebarPreference.grouping,
                sorting: defaultProps.sidebarPreference.sorting,
                unreadsAtTop: defaultProps.unreadsAtTop,
                favoriteAtTop: defaultProps.favoriteAtTop,
            },
        });
        wrapper.instance().updateSection(updateArg);

        expect(wrapper.state('isSaving')).toEqual(false);
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            channel_switcher_section: defaultProps.channelSwitcherOption,
            channel_sidebar_organization: defaultProps.channelSidebarOrganizationOption,
            grouping: defaultProps.sidebarPreference.grouping,
            sorting: defaultProps.sidebarPreference.sorting,
            unreadsAtTop: defaultProps.unreadsAtTop,
            favoriteAtTop: defaultProps.favoriteAtTop,
        });
        expect(newUpdateSection).toHaveBeenCalledTimes(1);
        expect(newUpdateSection).toHaveBeenCalledWith(updateArg);
    });

    test('should pass handleChange for channel grouping', () => {
        const props = {...defaultProps, activeSection: 'groupChannels'};
        const wrapper = mountWithIntl(
            <UserSettingsSidebar {...props}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        wrapper.find('#noneOption').simulate('change');
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            channel_switcher_section: defaultProps.channelSwitcherOption,
            channel_sidebar_organization: defaultProps.channelSidebarOrganizationOption,
            grouping: 'none',
            sorting: defaultProps.sidebarPreference.sorting,
            unreadsAtTop: defaultProps.unreadsAtTop,
            favoriteAtTop: defaultProps.favoriteAtTop,
        });

        wrapper.find('#byTypeOption').simulate('change');
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            channel_switcher_section: defaultProps.channelSwitcherOption,
            channel_sidebar_organization: defaultProps.channelSidebarOrganizationOption,
            grouping: 'by_type',
            sorting: defaultProps.sidebarPreference.sorting,
            unreadsAtTop: defaultProps.unreadsAtTop,
            favoriteAtTop: defaultProps.favoriteAtTop,
        });

        wrapper.find('#unreadAtTopOption').simulate('change', {target: {checked: false}});
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            channel_switcher_section: defaultProps.channelSwitcherOption,
            channel_sidebar_organization: defaultProps.channelSidebarOrganizationOption,
            grouping: 'by_type',
            sorting: defaultProps.sidebarPreference.sorting,
            unreadsAtTop: 'false',
            favoriteAtTop: defaultProps.favoriteAtTop,
        });

        wrapper.find('#unreadAtTopOption').simulate('change', {target: {checked: true}});
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            channel_switcher_section: defaultProps.channelSwitcherOption,
            channel_sidebar_organization: defaultProps.channelSidebarOrganizationOption,
            grouping: 'by_type',
            sorting: defaultProps.sidebarPreference.sorting,
            unreadsAtTop: 'true',
            favoriteAtTop: defaultProps.favoriteAtTop,
        });

        wrapper.find('#favoriteAtTopOption').simulate('change', {target: {checked: false}});
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            channel_switcher_section: defaultProps.channelSwitcherOption,
            channel_sidebar_organization: defaultProps.channelSidebarOrganizationOption,
            grouping: 'by_type',
            sorting: defaultProps.sidebarPreference.sorting,
            unreadsAtTop: defaultProps.unreadsAtTop,
            favoriteAtTop: 'false',
        });

        wrapper.find('#favoriteAtTopOption').simulate('change', {target: {checked: true}});
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            channel_switcher_section: defaultProps.channelSwitcherOption,
            channel_sidebar_organization: defaultProps.channelSidebarOrganizationOption,
            grouping: 'by_type',
            sorting: defaultProps.sidebarPreference.sorting,
            unreadsAtTop: defaultProps.unreadsAtTop,
            favoriteAtTop: 'true',
        });
    });

    test('should pass handleChange for channel grouping', () => {
        const props = {
            ...defaultProps,
            activeSection: 'groupChannels',
            sidebarPreference: {
                ...defaultProps.sidebarPreference,
                grouping: 'none',
            }};
        const wrapper = mountWithIntl(
            <UserSettingsSidebar {...props}/>,
            {
                context: {store},
                childContextTypes: {store: PropTypes.object},
            },
        );

        wrapper.find('#recentSectionEnabled').simulate('change');
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            channel_switcher_section: defaultProps.channelSwitcherOption,
            channel_sidebar_organization: defaultProps.channelSidebarOrganizationOption,
            grouping: 'none',
            sorting: 'recent',
            unreadsAtTop: defaultProps.unreadsAtTop,
            favoriteAtTop: defaultProps.favoriteAtTop,
        });

        wrapper.find('#alphaSectionEnabled').simulate('change');
        expect(wrapper.state('settings')).toEqual({
            close_unused_direct_messages: defaultProps.closeUnusedDirectMessages,
            channel_switcher_section: defaultProps.channelSwitcherOption,
            channel_sidebar_organization: defaultProps.channelSidebarOrganizationOption,
            grouping: 'none',
            sorting: 'alpha',
            unreadsAtTop: defaultProps.unreadsAtTop,
            favoriteAtTop: defaultProps.favoriteAtTop,
        });
    });
});
