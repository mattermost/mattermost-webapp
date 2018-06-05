// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PermissionSystemSchemeSettings from 'components/admin_console/permission_schemes_settings/permission_system_scheme_settings/permission_system_scheme_settings.jsx';
import SaveButton from 'components/save_button.jsx';
import {DefaultRolePermissions} from 'utils/constants.jsx';

describe('components/admin_console/permission_schemes_settings/permission_system_scheme_settings/permission_system_scheme_settings', () => {
    const defaultProps = {
        license: {
            IsLicensed: 'true',
            CustomPermissionsSchemes: 'true',
        },
        location: {},
        roles: {
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
            <PermissionSystemSchemeSettings {...defaultProps}/>
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
            />
        );
        defaultProps.actions.loadRolesIfNeeded().then(() => {
            expect(wrapper).toMatchSnapshot();
            done();
        });
    });

    test('should match snapshot on roles with permissions', (done) => {
        const roles = {
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
            />
        );

        expect(wrapper).toMatchSnapshot();
        defaultProps.actions.loadRolesIfNeeded().then(() => {
            expect(wrapper.state()).toMatchSnapshot();
            done();
        });
    });

    test('should save each role on save clicked except system_admin role', () => {
        const editRole = jest.fn().mockImplementation(() => Promise.resolve({data: {}}));
        const wrapper = shallow(
            <PermissionSystemSchemeSettings
                {...defaultProps}
                actions={{...defaultProps.actions, editRole}}
            />
        );

        expect(wrapper).toMatchSnapshot();
        wrapper.find(SaveButton).simulate('click');
        expect(editRole).toHaveBeenCalledTimes(5);
    });

    test('should show error if editRole fails', (done) => {
        const editRole = jest.fn().mockImplementation(() => Promise.resolve({error: {message: 'test error'}}));
        const wrapper = shallow(
            <PermissionSystemSchemeSettings
                {...defaultProps}
                actions={{...defaultProps.actions, editRole}}
            />
        );

        wrapper.find(SaveButton).simulate('click');
        setTimeout(() => {
            expect(wrapper.state().serverError).toBe('test error');
            done();
        });
    });

    test('should open and close correctly roles blocks', () => {
        const wrapper = shallow(
            <PermissionSystemSchemeSettings {...defaultProps}/>
        );
        expect(wrapper.state().openRoles.all_users).toBe(true);
        wrapper.find('.header').first().simulate('click');
        expect(wrapper.state().openRoles.all_users).toBe(false);
        wrapper.find('.header').first().simulate('click');
        expect(wrapper.state().openRoles.all_users).toBe(true);

        expect(wrapper.state().openRoles.channel_admin).toBe(true);
        wrapper.find('.header').at(1).simulate('click');
        expect(wrapper.state().openRoles.channel_admin).toBe(false);
        wrapper.find('.header').at(1).simulate('click');
        expect(wrapper.state().openRoles.channel_admin).toBe(true);

        expect(wrapper.state().openRoles.team_admin).toBe(true);
        wrapper.find('.header').at(2).simulate('click');
        expect(wrapper.state().openRoles.team_admin).toBe(false);
        wrapper.find('.header').at(2).simulate('click');
        expect(wrapper.state().openRoles.team_admin).toBe(true);

        expect(wrapper.state().openRoles.system_admin).toBe(true);
        wrapper.find('.header').at(3).simulate('click');
        expect(wrapper.state().openRoles.system_admin).toBe(false);
        wrapper.find('.header').at(3).simulate('click');
        expect(wrapper.state().openRoles.system_admin).toBe(true);
    });

    test('should open modal on click reset defaults', () => {
        const wrapper = shallow(
            <PermissionSystemSchemeSettings {...defaultProps}/>
        );
        expect(wrapper.state().showResetDefaultModal).toBe(false);
        wrapper.find('.reset-defaults-btn').first().simulate('click');
        expect(wrapper.state().showResetDefaultModal).toBe(true);
        wrapper.find('.btn-cancel').first().simulate('click');
        expect(wrapper.state().showResetDefaultModal).toBe(false);
    });

    test('should have default permissions that match the defaults constant', () => {
        const wrapper = shallow(
            <PermissionSystemSchemeSettings {...defaultProps}/>
        );
        expect(wrapper.state().roles.all_users.permissions.length).toBe(0);
        expect(wrapper.state().roles.channel_admin.permissions.length).toBe(0);
        expect(wrapper.state().roles.team_admin.permissions.length).toBe(0);
        wrapper.find('.reset-defaults-btn').first().simulate('click');
        wrapper.find('.btn-default').first().simulate('click');
        expect(wrapper.state().roles.all_users.permissions).toBe(DefaultRolePermissions.all_users);
        expect(wrapper.state().roles.channel_admin.permissions).toBe(DefaultRolePermissions.channel_admin);
        expect(wrapper.state().roles.team_admin.permissions).toBe(DefaultRolePermissions.team_admin);
        expect(wrapper.state().roles.system_admin.permissions.length).toBe(defaultProps.roles.system_admin.permissions.length);
    });
});
