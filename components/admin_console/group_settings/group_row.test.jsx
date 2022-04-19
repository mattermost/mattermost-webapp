// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GroupRow from 'components/admin_console/group_settings/group_row.jsx';

describe('components/admin_console/group_settings/GroupRow', () => {
    test('should match snapshot, on linked and configured row', () => {
        const wrapper = shallow(
            <GroupRow
                primary_key='primary_key'
                name='name'
                mattermost_group_id='group-id'
                has_syncables={true}
                checked={false}
                failed={false}
                onCheckToggle={jest.fn()}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on linked but not configured row', () => {
        const wrapper = shallow(
            <GroupRow
                primary_key='primary_key'
                name='name'
                mattermost_group_id='group-id'
                has_syncables={false}
                checked={false}
                failed={false}
                onCheckToggle={jest.fn()}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on not linked row', () => {
        const wrapper = shallow(
            <GroupRow
                primary_key='primary_key'
                name='name'
                mattermost_group_id={null}
                has_syncables={null}
                checked={false}
                failed={false}
                onCheckToggle={jest.fn()}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on checked row', () => {
        const wrapper = shallow(
            <GroupRow
                primary_key='primary_key'
                name='name'
                mattermost_group_id={null}
                has_syncables={null}
                checked={true}
                failed={false}
                onCheckToggle={jest.fn()}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on failed linked row', () => {
        const wrapper = shallow(
            <GroupRow
                primary_key='primary_key'
                name='name'
                mattermost_group_id='group-id'
                has_syncables={null}
                checked={false}
                failed={true}
                onCheckToggle={jest.fn()}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on failed not linked row', () => {
        const wrapper = shallow(
            <GroupRow
                primary_key='primary_key'
                name='name'
                mattermost_group_id={null}
                has_syncables={null}
                checked={false}
                failed={true}
                onCheckToggle={jest.fn()}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('onRowClick call to onCheckToggle', () => {
        const onCheckToggle = jest.fn();
        const wrapper = shallow(
            <GroupRow
                primary_key='primary_key'
                name='name'
                mattermost_group_id={null}
                has_syncables={null}
                checked={false}
                failed={false}
                onCheckToggle={onCheckToggle}
                actions={{
                    link: jest.fn(),
                    unlink: jest.fn(),
                }}
            />,
        );

        wrapper.instance().onRowClick();
        expect(onCheckToggle).toHaveBeenCalledWith('primary_key');
    });

    test('linkHandler must run the link action', async () => {
        const link = jest.fn().mockReturnValue(Promise.resolve());
        const wrapper = shallow(
            <GroupRow
                primary_key='primary_key'
                name='name'
                mattermost_group_id={null}
                has_syncables={null}
                checked={false}
                failed={false}
                onCheckToggle={jest.fn()}
                actions={{
                    link,
                    unlink: jest.fn(),
                }}
            />,
        );

        await wrapper.instance().linkHandler({stopPropagation: jest.fn(), preventDefault: jest.fn()});
        expect(wrapper.state().loading).toBe(false);
        expect(link).toHaveBeenCalledWith('primary_key');
    });

    test('unlinkHandler must run the unlink action', async () => {
        const unlink = jest.fn().mockReturnValue(Promise.resolve());
        const wrapper = shallow(
            <GroupRow
                primary_key='primary_key'
                name='name'
                mattermost_group_id={null}
                has_syncables={null}
                checked={false}
                failed={false}
                onCheckToggle={jest.fn()}
                actions={{
                    link: jest.fn(),
                    unlink,
                }}
            />,
        );

        await wrapper.instance().unlinkHandler({stopPropagation: jest.fn(), preventDefault: jest.fn()});
        expect(wrapper.state().loading).toBe(false);
        expect(unlink).toHaveBeenCalledWith('primary_key');
    });
});
