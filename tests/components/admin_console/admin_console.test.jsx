// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AdminConsole from 'components/admin_console/admin_console';

describe('components/AdminConsole', () => {
    const baseProps = {
        config: {},
        license: {},
        match: {
            url: '',
        },
        showNavigationPrompt: false,
        isCurrentUserSystemAdmin: false,
        actions: {
            getConfig: jest.fn(),
            getEnvironmentConfig: jest.fn(),
            setNavigationBlocked: jest.fn(),
            confirmNavigation: jest.fn(),
            cancelNavigation: jest.fn(),
        },
    };

    test('should redirect to / when not system admin', () => {
        const props = {
            ...baseProps,
            isCurrentSystemAdmin: false,
        };
        const wrapper = shallow(
            <AdminConsole {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
