// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AdminConsole from 'components/admin_console/admin_console';

describe('components/AdminConsole', () => {
    const baseProps = {
        config: {
            TestField: true,
            ExperimentalSettings: {
                RestrictSystemAdmin: false,
            },
        },
        license: {},
        buildEnterpriseReady: true,
        match: {
            url: '',
        },
        roles: {
            channel_admin: 'test',
            channel_user: 'test',
            team_admin: 'test',
            team_user: 'test',
            system_admin: 'test',
            system_user: 'test',
        },
        showNavigationPrompt: false,
        isCurrentUserSystemAdmin: false,
        actions: {
            getConfig: jest.fn(),
            getEnvironmentConfig: jest.fn(),
            setNavigationBlocked: jest.fn(),
            confirmNavigation: jest.fn(),
            cancelNavigation: jest.fn(),
            loadRolesIfNeeded: jest.fn(),
            editRole: jest.fn(),
        },
    };

    test('should redirect to / when not system admin', () => {
        const props = {
            ...baseProps,
            isCurrentUserSystemAdmin: false,
        };
        const wrapper = shallow(
            <AdminConsole {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should generate the routes', () => {
        const props = {
            ...baseProps,
            isCurrentUserSystemAdmin: true,
        };
        const wrapper = shallow(
            <AdminConsole {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
