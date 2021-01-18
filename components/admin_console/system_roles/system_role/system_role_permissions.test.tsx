// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {TestHelper} from 'utils/test_helper';
import {readAccess, writeAccess} from './types';

import SystemRolePermissions from './system_role_permissions';

describe('admin_console/system_role_permissions', () => {
    const props = {
        isLicensedForCloud: false,
        updatePermissions: jest.fn(),
        permissionsToUpdate: {
            environment: readAccess,
            plugins: writeAccess,
            site: writeAccess,
        },
        role: TestHelper.getRoleMock(),
    }

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SystemRolePermissions
                {...props}
            />);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with isLicensedForCloud = true', () => {
        const wrapper = shallow(
            <SystemRolePermissions
                {...props}
                isLicensedForCloud={true}
            />);

        expect(wrapper).toMatchSnapshot();
    });
});
