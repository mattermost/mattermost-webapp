// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

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
