// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GroupSettings from 'components/admin_console/group_settings/group_settings.jsx';

describe('components/admin_console/group_settings/GroupSettings', () => {
    test('should match snapshot, while loading', () => {
        const wrapper = shallow(
            <GroupSettings
                ldapGroups={[]}
                actions={{
                    getLdapGroups: jest.fn().mockReturnValue(Promise.resolve()),
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({loading: true});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without results', () => {
        const wrapper = shallow(
            <GroupSettings
                ldapGroups={[]}
                actions={{
                    getLdapGroups: jest.fn().mockReturnValue(Promise.resolve()),
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with results', () => {
        const wrapper = shallow(
            <GroupSettings
                ldapGroups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                    {primary_key: 'test3', name: 'test3', mattermost_group_id: 'group-id-2', has_syncables: true},
                ]}
                actions={{
                    getLdapGroups: jest.fn().mockReturnValue(Promise.resolve()),
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with results and next and previous', () => {
        const wrapper = shallow(
            <GroupSettings
                ldapGroups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                    {primary_key: 'test3', name: 'test3', mattermost_group_id: 'group-id-2', has_syncables: true},
                    {primary_key: 'test4', name: 'test4', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test5', name: 'test5', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test6', name: 'test6', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test7', name: 'test7', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test8', name: 'test8', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test9', name: 'test9', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test10', name: 'test10', mattermost_group_id: null, has_syncables: null},
                ]}
                actions={{
                    getLdapGroups: jest.fn().mockReturnValue(Promise.resolve()),
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({page: 1, loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with results and next', () => {
        const wrapper = shallow(
            <GroupSettings
                ldapGroups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                    {primary_key: 'test3', name: 'test3', mattermost_group_id: 'group-id-2', has_syncables: true},
                    {primary_key: 'test4', name: 'test4', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test5', name: 'test5', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test6', name: 'test6', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test7', name: 'test7', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test8', name: 'test8', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test9', name: 'test9', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test10', name: 'test10', mattermost_group_id: null, has_syncables: null},
                ]}
                actions={{
                    getLdapGroups: jest.fn().mockReturnValue(Promise.resolve()),
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with results and previous', () => {
        const wrapper = shallow(
            <GroupSettings
                ldapGroups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                    {primary_key: 'test3', name: 'test3', mattermost_group_id: 'group-id-2', has_syncables: true},
                ]}
                actions={{
                    getLdapGroups: jest.fn().mockReturnValue(Promise.resolve()),
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({page: 1, loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should change properly the state and call the getLdapGroups, on previousPage when page > 0', async () => {
        const getLdapGroups = jest.fn().mockReturnValue(Promise.resolve());
        const wrapper = shallow(
            <GroupSettings
                ldapGroups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                    {primary_key: 'test3', name: 'test3', mattermost_group_id: 'group-id-2', has_syncables: true},
                ]}
                actions={{
                    getLdapGroups,
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({page: 1, checked: {test1: true, test2: true}});

        await wrapper.instance().previousPage({preventDefault: jest.fn()});

        const state = wrapper.instance().state;
        expect(state.checked).toEqual({});
        expect(state.page).toBe(0);
        expect(state.loading).toBe(false);
    });

    test('should change properly the state and call the getLdapGroups, on previousPage when page == 0', async () => {
        const getLdapGroups = jest.fn().mockReturnValue(Promise.resolve());
        const wrapper = shallow(
            <GroupSettings
                ldapGroups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                    {primary_key: 'test3', name: 'test3', mattermost_group_id: 'group-id-2', has_syncables: true},
                ]}
                actions={{
                    getLdapGroups,
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({page: 0, checked: {test1: true, test2: true}});

        await wrapper.instance().previousPage({preventDefault: jest.fn()});

        const state = wrapper.instance().state;
        expect(state.checked).toEqual({});
        expect(state.page).toBe(0);
        expect(state.loading).toBe(false);
    });

    test('should change properly the state and call the getLdapGroups, on nextPage clicked', async () => {
        const getLdapGroups = jest.fn().mockReturnValue(Promise.resolve());
        const wrapper = shallow(
            <GroupSettings
                ldapGroups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                    {primary_key: 'test3', name: 'test3', mattermost_group_id: 'group-id-2', has_syncables: true},
                    {primary_key: 'test4', name: 'test4', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test5', name: 'test5', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test6', name: 'test6', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test7', name: 'test7', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test8', name: 'test8', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test9', name: 'test9', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test10', name: 'test10', mattermost_group_id: null, has_syncables: null},
                ]}
                actions={{
                    getLdapGroups,
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({page: 0, checked: {test1: true, test2: true}});

        await wrapper.instance().nextPage({preventDefault: jest.fn()});
        const state = wrapper.state();
        expect(state.checked).toEqual({});
        expect(state.page).toBe(1);
        expect(state.loading).toBe(false);
    });
});
