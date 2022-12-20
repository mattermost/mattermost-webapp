// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Team} from '@mattermost/types/teams';
import {SelfHostedSignupProgress} from '@mattermost/types/cloud';
import {AdminConfig, ExperimentalSettings} from '@mattermost/types/config';

import AdminDefinition from 'components/admin_console/admin_definition';
import {TestHelper} from 'utils/test_helper';

import AdminConsole from './admin_console';
import type {Props} from './admin_console';

describe('components/AdminConsole', () => {
    const baseProps: Props = {
        config: {
            TestField: true,
            ExperimentalSettings: {
                RestrictSystemAdmin: false,
            } as ExperimentalSettings,
        } as Partial<AdminConfig>,
        adminDefinition: AdminDefinition,
        environmentConfig: {},
        unauthorizedRoute: '/',
        consoleAccess: {
            read: {},
            write: {},
        },
        team: {} as Team,
        license: {},
        cloud: {
            limits: {
                limits: {},
                limitsLoaded: false,
            },
            errors: {},
            selfHostedSignup: {
                progress: SelfHostedSignupProgress.START,
            },
            trueUpReview: {
                server_id: '',
                active_users: 0,
                authentication_features: [],
                customer_name: '',
                license_id: '',
                license_plan: '',
                licensed_seats: 0,
                plugins: {
                    active_plugin_names: [],
                    inactive_plugin_names: [],
                    total_active_plugins: 0,
                    total_inactive_plugins: 0,
                },
                server_installation_type: '',
                server_version: '',
                total_incoming_webhooks: 0,
                total_outgoing_webhooks: 0,
            },
        },
        buildEnterpriseReady: true,
        match: {
            url: '',
        },
        roles: {
            channel_admin: TestHelper.getRoleMock(),
            channel_user: TestHelper.getRoleMock(),
            team_admin: TestHelper.getRoleMock(),
            team_user: TestHelper.getRoleMock(),
            system_admin: TestHelper.getRoleMock(),
            system_user: TestHelper.getRoleMock(),
        },
        showNavigationPrompt: false,
        isCurrentUserSystemAdmin: false,
        currentUserHasAnAdminRole: false,
        actions: {
            getConfig: jest.fn(),
            getEnvironmentConfig: jest.fn(),
            setNavigationBlocked: jest.fn(),
            confirmNavigation: jest.fn(),
            cancelNavigation: jest.fn(),
            loadRolesIfNeeded: jest.fn(),
            editRole: jest.fn(),
            selectChannel: jest.fn(),
            selectTeam: jest.fn(),
        },
    };

    test('should redirect to town-square when not system admin', () => {
        const props = {
            ...baseProps,
            unauthorizedRoute: '/team-id/channels/town-square',
            isCurrentUserSystemAdmin: false,
            currentUserHasAnAdminRole: false,
            consoleAccess: {read: {}, write: {}},
            team: {name: 'development'} as Team,
        };
        const wrapper = shallow(
            <AdminConsole {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should generate the routes', () => {
        const props = {
            ...baseProps,
            unauthorizedRoute: '/team-id/channels/town-square',
            isCurrentUserSystemAdmin: true,
            currentUserHasAnAdminRole: false,
            consoleAccess: {read: {}, write: {}},
            team: {name: 'development'} as Team,
        };
        const wrapper = shallow(
            <AdminConsole {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
