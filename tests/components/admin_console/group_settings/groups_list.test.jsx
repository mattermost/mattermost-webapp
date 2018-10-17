// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GroupsList from 'components/admin_console/group_settings/groups_list.jsx';

describe('components/admin_console/group_settings/GroupsList', () => {
    test('should match snapshot, while loading', () => {
        const wrapper = shallow(
            <GroupsList
                groups={[]}
                loading={true}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without results', () => {
        const wrapper = shallow(
            <GroupsList
                groups={[]}
                loading={false}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with results', () => {
        const wrapper = shallow(
            <GroupsList
                groups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                    {primary_key: 'test3', name: 'test3', mattermost_group_id: 'group-id-2', has_syncables: true},
                ]}
                loading={false}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with only linked selected', () => {
        const wrapper = shallow(
            <GroupsList
                groups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                ]}
                loading={false}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({checked: {test2: true}});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with only not-linked selected', () => {
        const wrapper = shallow(
            <GroupsList
                groups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                ]}
                loading={false}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({checked: {test1: true}});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with mixed types selected', () => {
        const wrapper = shallow(
            <GroupsList
                groups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                ]}
                loading={false}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({checked: {test1: true, test2: true}});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without selection', () => {
        const wrapper = shallow(
            <GroupsList
                groups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                ]}
                loading={false}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        wrapper.setState({checked: {}});
        expect(wrapper).toMatchSnapshot();
    });

    test('onCheckToggle must toggle the checked data', () => {
        const wrapper = shallow(
            <GroupsList
                groups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                ]}
                loading={false}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />
        );
        const instance = wrapper.instance();
        expect(wrapper.state().checked).toEqual({});
        instance.onCheckToggle('test1');
        expect(wrapper.state().checked).toEqual({test1: true});
        instance.onCheckToggle('test1');
        expect(wrapper.state().checked).toEqual({test1: false});
        instance.onCheckToggle('test2');
        expect(wrapper.state().checked).toEqual({test1: false, test2: true});
        instance.onCheckToggle('test2');
        expect(wrapper.state().checked).toEqual({test1: false, test2: false});
    });

    test('linkSelectedGroups must call link for unlinked selected groups', () => {
        const link = jest.fn();
        const wrapper = shallow(
            <GroupsList
                groups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                ]}
                loading={false}
                actions={{
                    link,
                    unlink: jest.fn(),
                }}
            />
        );
        const instance = wrapper.instance();
        expect(wrapper.state().checked).toEqual({});
        instance.onCheckToggle('test1');
        instance.onCheckToggle('test2');
        instance.linkSelectedGroups();
        expect(link).toHaveBeenCalledTimes(1);
        expect(link).toHaveBeenCalledWith('test1');
    });

    test('unlinkSelectedGroups must call unlink for linked selected groups', () => {
        const unlink = jest.fn();
        const wrapper = shallow(
            <GroupsList
                groups={[
                    {primary_key: 'test1', name: 'test1', mattermost_group_id: null, has_syncables: null},
                    {primary_key: 'test2', name: 'test2', mattermost_group_id: 'group-id-1', has_syncables: false},
                    {primary_key: 'test3', name: 'test3', mattermost_group_id: 'group-id-1', has_syncables: false},
                    {primary_key: 'test4', name: 'test4', mattermost_group_id: null, has_syncables: null},
                ]}
                loading={false}
                actions={{
                    link: jest.fn(),
                    unlink,
                }}
            />
        );
        const instance = wrapper.instance();
        expect(wrapper.state().checked).toEqual({});
        instance.onCheckToggle('test1');
        instance.onCheckToggle('test2');
        instance.unlinkSelectedGroups();
        expect(unlink).toHaveBeenCalledTimes(1);
        expect(unlink).toHaveBeenCalledWith('test2');
    });
});
