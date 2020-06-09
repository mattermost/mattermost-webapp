// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GuestPermissionsTree from 'components/admin_console/permission_schemes_settings/guest_permissions_tree/guest_permissions_tree.jsx';

import PermissionGroup from 'components/admin_console/permission_schemes_settings/permission_group.jsx';

describe('components/admin_console/permission_schemes_settings/permission_tree', () => {
    const defaultProps = {
        scope: 'channel_scope',
        config: {
            EnableIncomingWebhooks: 'true',
            EnableOutgoingWebhooks: 'true',
            EnableOAuthServiceProvider: 'true',
            EnableCommands: 'true',
            EnableCustomEmoji: 'true',
        },
        role: {
            name: 'test',
            permissions: [],
        },
        onToggle: jest.fn(),
        selectRow: jest.fn(),
        parentRole: null,
        readOnly: false,
        license: {
            LDAPGroups: 'true',
            IsLicensed: 'true',
        },
    };

    test('should match snapshot on default data', () => {
        const wrapper = shallow(
            <GuestPermissionsTree {...defaultProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on read only', () => {
        const wrapper = shallow(
            <GuestPermissionsTree
                {...defaultProps}
                readOnly={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on team scope', () => {
        const wrapper = shallow(
            <GuestPermissionsTree
                {...defaultProps}
                scope={'team_scope'}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on system scope', () => {
        const wrapper = shallow(
            <GuestPermissionsTree
                {...defaultProps}
                scope={'system_scope'}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with parentRole with permissions', () => {
        const wrapper = shallow(
            <GuestPermissionsTree
                {...defaultProps}
                parentRole={{permissions: 'invite_user'}}
                scope={'system_scope'}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should ask to toggle on row toggle', () => {
        const onToggle = jest.fn();
        const wrapper = shallow(
            <GuestPermissionsTree
                {...defaultProps}
                onToggle={onToggle}
            />,
        );
        wrapper.find(PermissionGroup).first().prop('onChange')(['test_permission', 'test_permission2']);
        expect(onToggle).toBeCalledWith('test', ['test_permission', 'test_permission2']);
    });

    test('should hide disabbled integration options', () => {
        const wrapper = shallow(
            <GuestPermissionsTree
                {...defaultProps}
                config={{
                    EnableIncomingWebhooks: 'false',
                    EnableOutgoingWebhooks: 'false',
                    EnableOAuthServicePrivder: 'false',
                    EnableCommands: 'false',
                    EnableCustomEmoji: 'false',
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on license without LDAPGroups', () => {
        const wrapper = shallow(
            <GuestPermissionsTree
                {...defaultProps}
                license={{}}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
