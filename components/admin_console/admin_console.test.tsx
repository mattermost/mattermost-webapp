// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AdminDefinition from 'components/admin_console/admin_definition';
import {TestHelper} from 'utils/test_helper';

import AdminConsole from './admin_console';

describe('components/AdminConsole', () => {
    const baseProps = {
        config: {
            TestField: true,
            ExperimentalSettings: {
                RestrictSystemAdmin: false,
            },
        },
        adminDefinition: AdminDefinition,
        license: {},
        cloud: {},
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
        };
        const wrapper = shallow(
            <AdminConsole {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
