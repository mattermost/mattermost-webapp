// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PermissionSystemSchemeSettings from 'components/admin_console/permission_schemes_settings/permission_system_scheme_settings/permission_system_scheme_settings.jsx';
import {DefaultRolePermissions} from 'utils/constants';

describe('components/admin_console/permission_schemes_settings/permission_system_scheme_settings/permission_system_scheme_settings', () => {
    const defaultProps = {
        config: {
            EnableGuestAccounts: 'true',
        },
        license: {
            IsLicensed: 'true',
            CustomPermissionsSchemes: 'true',
            GuestAccountsPermissions: 'true',
        },
        location: {},
        roles: {
            system_guest: {
                permissions: [],
            },
            team_guest: {
                permissions: [],
            },
            channel_guest: {
                permissions: [],
            },
            system_user: {
                permissions: [],
            },
            team_user: {
                permissions: [],
            },
            channel_user: {
                permissions: [],
            },
            system_admin: {
                permissions: [],
            },
            team_admin: {
                permissions: [],
            },
            channel_admin: {
                permissions: [],
            },
        },
        actions: {
            loadRolesIfNeeded: jest.fn().mockReturnValue(Promise.resolve()),
            editRole: jest.fn(),
            setNavigationBlocked: jest.fn(),
        },
    };

    test('should match snapshot on roles without permissions', (done) => {
        const wrapper = shallow(
            <PermissionSystemSchemeSettings {...defaultProps}/>,
        );
        defaultProps.actions.loadRolesIfNeeded().then(() => {
            expect(wrapper.state()).toMatchSnapshot();
            done();
        });
    });

    test('should match snapshot when the license doesnt have custom schemes', (done) => {
        const license = {
            IsLicensed: 'true',
            CustomPermissionsSchemes: 'false',
        };
        const wrapper = shallow(
            <PermissionSystemSchemeSettings
                {...defaultProps}
                license={license}
            />,
        );
        defaultProps.actions.loadRolesIfNeeded().then(() => {
            expect(wrapper).toMatchSnapshot();
            done();
        });
    });

    test('should match snapshot on roles with permissions', (done) => {
        const roles = {
            system_guest: {
                permissions: ['create_post'],
            },
            team_guest: {
                permissions: ['invite_user'],
            },
            channel_guest: {
                permissions: ['add_reaction'],
            },
            system_user: {
                permissions: ['create_post'],
            },
            team_user: {
                permissions: ['invite_user'],
            },
            channel_user: {
                permissions: ['add_reaction'],
            },
            system_admin: {
                permissions: ['manage_system'],
            },
            team_admin: {
                permissions: ['add_user_to_team'],
            },
            channel_admin: {
                permissions: ['delete_post'],
            },
        };
        const wrapper = shallow(
            <PermissionSystemSchemeSettings
                {...defaultProps}
                roles={roles}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        defaultProps.actions.loadRolesIfNeeded().then(() => {
            expect(wrapper.state()).toMatchSnapshot();
            done();
        });
    });

    test('should save each role on handleSubmit except system_admin role', async () => {
        const editRole = jest.fn().mockImplementation(() => Promise.resolve({data: {}}));
        const wrapper = shallow(
            <PermissionSystemSchemeSettings
                {...defaultProps}
                actions={{...defaultProps.actions, editRole}}
            />,
        );

        expect(wrapper).toMatchSnapshot();

        await wrapper.instance().handleSubmit();
        expect(editRole).toHaveBeenCalledTimes(8);
    });

    test('should save roles based on license', async () => {
        const license = {
            IsLicensed: 'true',
            CustomPermissionsSchemes: 'false',
            GuestAccountsPermissions: 'false',
        };
        let editRole = jest.fn().mockImplementation(() => Promise.resolve({data: {}}));
        const wrapper = shallow(
            <PermissionSystemSchemeSettings
                {...defaultProps}
                license={license}
                actions={{...defaultProps.actions, editRole}}
            />,
        );

        expect(wrapper).toMatchSnapshot();

        await wrapper.instance().handleSubmit();
        expect(editRole).toHaveBeenCalledTimes(5);
        license.GuestAccountsPermissions = 'true';
        editRole = jest.fn().mockImplementation(() => Promise.resolve({data: {}}));
        const wrapper2 = shallow(
            <PermissionSystemSchemeSettings
                {...defaultProps}
                license={license}
                actions={{...defaultProps.actions, editRole}}
            />,
        );

        expect(wrapper2).toMatchSnapshot();

        await wrapper2.instance().handleSubmit();
        expect(editRole).toHaveBeenCalledTimes(8);
    });

    test('should show error if editRole fails', async () => {
        const editRole = jest.fn().mockImplementation(() => Promise.resolve({error: {message: 'test error'}}));
        const wrapper = shallow(
            <PermissionSystemSchemeSettings
                {...defaultProps}
                actions={{...defaultProps.actions, editRole}}
            />,
        );

        await wrapper.instance().handleSubmit();
        await expect(wrapper.state().serverError).toBe('test error');
    });

    test('should open and close correctly roles blocks', () => {
        const wrapper = shallow(
            <PermissionSystemSchemeSettings {...defaultProps}/>,
        );
        const instance = wrapper.instance();
        expect(wrapper.state().openRoles.all_users).toBe(true);
        instance.toggleRole('all_users');
        expect(wrapper.state().openRoles.all_users).toBe(false);
        instance.toggleRole('all_users');
        expect(wrapper.state().openRoles.all_users).toBe(true);

        expect(wrapper.state().openRoles.channel_admin).toBe(true);
        instance.toggleRole('channel_admin');
        expect(wrapper.state().openRoles.channel_admin).toBe(false);
        instance.toggleRole('channel_admin');
        expect(wrapper.state().openRoles.channel_admin).toBe(true);

        expect(wrapper.state().openRoles.team_admin).toBe(true);
        instance.toggleRole('team_admin');
        expect(wrapper.state().openRoles.team_admin).toBe(false);
        instance.toggleRole('team_admin');
        expect(wrapper.state().openRoles.team_admin).toBe(true);

        expect(wrapper.state().openRoles.system_admin).toBe(true);
        instance.toggleRole('system_admin');
        expect(wrapper.state().openRoles.system_admin).toBe(false);
        instance.toggleRole('system_admin');
        expect(wrapper.state().openRoles.system_admin).toBe(true);
    });

    test('should open modal on click reset defaults', () => {
        const wrapper = shallow(
            <PermissionSystemSchemeSettings {...defaultProps}/>,
        );
        expect(wrapper.state().showResetDefaultModal).toBe(false);
        wrapper.find('.reset-defaults-btn').first().simulate('click');
        expect(wrapper.state().showResetDefaultModal).toBe(true);
    });

    test('should have default permissions that match the defaults constant', () => {
        const wrapper = shallow(
            <PermissionSystemSchemeSettings {...defaultProps}/>,
        );
        expect(wrapper.state().roles.all_users.permissions.length).toBe(0);
        expect(wrapper.state().roles.channel_admin.permissions.length).toBe(0);
        expect(wrapper.state().roles.team_admin.permissions.length).toBe(0);
        wrapper.instance().resetDefaults();
        expect(wrapper.state().roles.all_users.permissions).toBe(DefaultRolePermissions.all_users);
        expect(wrapper.state().roles.channel_admin.permissions).toBe(DefaultRolePermissions.channel_admin);
        expect(wrapper.state().roles.team_admin.permissions).toBe(DefaultRolePermissions.team_admin);
        expect(wrapper.state().roles.system_admin.permissions.length).toBe(defaultProps.roles.system_admin.permissions.length);
    });
});
