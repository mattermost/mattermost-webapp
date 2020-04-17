// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PermissionTeamSchemeSettings from 'components/admin_console/permission_schemes_settings/permission_team_scheme_settings/permission_team_scheme_settings.jsx';

describe('components/admin_console/permission_schemes_settings/permission_team_scheme_settings/permission_team_scheme_settings', () => {
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
        schemeId: '',
        scheme: null,
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
            team_guest: {
                permissions: [],
            },
            channel_guest: {
                permissions: [],
            },
            aaa: {
                permissions: [],
            },
            bbb: {
                permissions: [],
            },
            ccc: {
                permissions: [],
            },
            ddd: {
                permissions: [],
            },
            eee: {
                permissions: [],
            },
            fff: {
                permissions: [],
            },
        },
        teams: [
        ],
        actions: {
            loadRolesIfNeeded: jest.fn().mockReturnValue(Promise.resolve()),
            loadRole: jest.fn(),
            loadScheme: jest.fn().mockReturnValue(Promise.resolve({data: true})),
            loadSchemeTeams: jest.fn(),
            editRole: jest.fn(),
            patchScheme: jest.fn(),
            createScheme: jest.fn(),
            updateTeamScheme: jest.fn(),
            setNavigationBlocked: jest.fn(),
        },
        history: {
            push: jest.fn(),
        },
    };

    test('should match snapshot on new with default roles without permissions', (done) => {
        const wrapper = shallow(
            <PermissionTeamSchemeSettings {...defaultProps}/>
        );
        defaultProps.actions.loadRolesIfNeeded().then(() => {
            expect(wrapper.instance().getStateRoles()).toMatchSnapshot();
            done();
        });
    });

    test('should match snapshot on new with default roles with permissions', (done) => {
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
            <PermissionTeamSchemeSettings
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

    test('should save each role on handleSubmit except system_admin role', async () => {
        const editRole = jest.fn().mockImplementation(() => Promise.resolve({data: {}}));
        const createScheme = jest.fn().mockImplementation(() => Promise.resolve({
            data: {
                id: '123',
                default_team_user_role: 'aaa',
                default_team_admin_role: 'bbb',
                default_channel_user_role: 'ccc',
                default_channel_admin_role: 'ddd',
                default_team_guest_role: 'eee',
                default_channel_guest_role: 'fff',
            },
        }));
        const updateTeamScheme = jest.fn().mockImplementation(() => Promise.resolve({}));
        const wrapper = shallow(
            <PermissionTeamSchemeSettings
                {...defaultProps}
                actions={{...defaultProps.actions, editRole, createScheme, updateTeamScheme}}
            />
        );

        expect(wrapper).toMatchSnapshot();
        await wrapper.instance().handleSubmit();
        expect(editRole).toHaveBeenCalledTimes(6);
    });

    test('should show error if createScheme fails', async () => {
        const editRole = jest.fn().mockImplementation(() => Promise.resolve({}));
        const createScheme = jest.fn().mockImplementation(() => Promise.resolve({error: {message: 'test error'}}));
        const updateTeamScheme = jest.fn().mockImplementation(() => Promise.resolve({}));
        const wrapper = shallow(
            <PermissionTeamSchemeSettings
                {...defaultProps}
                actions={{...defaultProps.actions, editRole, createScheme, updateTeamScheme}}
            />
        );

        await wrapper.instance().handleSubmit();
        expect(wrapper.state().serverError).toBe('test error');
    });

    test('should show error if editRole fails', async () => {
        const editRole = jest.fn().mockImplementation(() => Promise.resolve({error: {message: 'test error'}}));
        const createScheme = jest.fn().mockImplementation(() => Promise.resolve({
            data: {
                id: '123',
                default_team_user_role: 'aaa',
                default_team_admin_role: 'bbb',
                default_channel_user_role: 'ccc',
                default_channel_admin_role: 'ddd',
                default_team_guest_role: 'eee',
                default_channel_guest_role: 'fff',
            },
        }));
        const updateTeamScheme = jest.fn().mockImplementation(() => Promise.resolve({}));
        const wrapper = shallow(
            <PermissionTeamSchemeSettings
                {...defaultProps}
                actions={{...defaultProps.actions, editRole, createScheme, updateTeamScheme}}
            />
        );

        await wrapper.instance().handleSubmit();
        expect(wrapper.state().serverError).toBe('test error');
    });

    test('should open and close correctly roles blocks', () => {
        const wrapper = shallow(
            <PermissionTeamSchemeSettings {...defaultProps}/>
        );
        const instance = wrapper.instance();
        expect(wrapper.state().openRoles.guests).toBe(true);
        instance.toggleRole('guests');
        expect(wrapper.state().openRoles.guests).toBe(false);
        instance.toggleRole('guests');
        expect(wrapper.state().openRoles.guests).toBe(true);

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
    });

    test('should match snapshot on edit without permissions', (done) => {
        const props = {
            ...defaultProps,
            schemeId: 'xyz',
            scheme: {
                id: 'xxx',
                name: 'yyy',
                display_name: 'Test scheme',
                description: 'Test scheme description',
                default_team_user_role: 'aaa',
                default_team_admin_role: 'bbb',
                default_channel_user_role: 'ccc',
                default_channel_admin_role: 'ddd',
                default_team_guest_role: 'eee',
                default_channel_guest_role: 'fff',
            },
        };

        const wrapper = shallow(
            <PermissionTeamSchemeSettings {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        defaultProps.actions.loadRolesIfNeeded().then(() => {
            expect(wrapper.instance().getStateRoles()).toMatchSnapshot();
            done();
        });
    });

    test('should match snapshot on edit with permissions', (done) => {
        const props = {
            ...defaultProps,
            config: {
                EnableGuestAccounts: 'false',
            },
            schemeId: 'xyz',
            scheme: {
                id: 'xxx',
                name: 'yyy',
                display_name: 'Test scheme',
                description: 'Test scheme description',
                default_team_user_role: 'aaa',
                default_team_admin_role: 'bbb',
                default_channel_user_role: 'ccc',
                default_channel_admin_role: 'ddd',
                default_team_guest_role: 'eee',
                default_channel_guest_role: 'fff',
            },
            roles: {
                aaa: {
                    permissions: ['invite_user'],
                },
                bbb: {
                    permissions: ['add_user_to_team'],
                },
                ccc: {
                    permissions: ['add_reaction'],
                },
                ddd: {
                    permissions: ['delete_post'],
                },
                eee: {
                    permissions: ['edit_post'],
                },
                fff: {
                    permissions: ['delete_post'],
                },
            },
        };

        const wrapper = shallow(
            <PermissionTeamSchemeSettings {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        defaultProps.actions.loadRolesIfNeeded().then(() => {
            expect(wrapper.instance().getStateRoles()).toMatchSnapshot();
            done();
        });
    });

    test('should match snapshot on edit without guest permissions', (done) => {
        const props = {
            ...defaultProps,
            config: {
                EnableGuestAccounts: 'false',
            },
            schemeId: 'xyz',
            scheme: {
                id: 'xxx',
                name: 'yyy',
                display_name: 'Test scheme',
                description: 'Test scheme description',
                default_team_user_role: 'aaa',
                default_team_admin_role: 'bbb',
                default_channel_user_role: 'ccc',
                default_channel_admin_role: 'ddd',
                default_team_guest_role: 'eee',
                default_channel_guest_role: 'fff',
            },
        };

        const wrapper = shallow(
            <PermissionTeamSchemeSettings {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        defaultProps.actions.loadRolesIfNeeded().then(() => {
            expect(wrapper.instance().getStateRoles()).toMatchSnapshot();
            done();
        });
    });

    test('should match snapshot on edit without license', (done) => {
        const props = {
            ...defaultProps,
            license: {
                IsLicensed: 'false',
            },
            schemeId: 'xyz',
            scheme: {
                id: 'xxx',
                name: 'yyy',
                display_name: 'Test scheme',
                description: 'Test scheme description',
                default_team_user_role: 'aaa',
                default_team_admin_role: 'bbb',
                default_channel_user_role: 'ccc',
                default_channel_admin_role: 'ddd',
                default_team_guest_role: 'eee',
                default_channel_guest_role: 'fff',
            },
        };

        const wrapper = shallow(
            <PermissionTeamSchemeSettings {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        defaultProps.actions.loadRolesIfNeeded().then(() => {
            expect(wrapper.instance().getStateRoles()).toMatchSnapshot();
            done();
        });
    });
});
