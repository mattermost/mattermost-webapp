// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PermissionSchemesSettings from 'components/admin_console/permission_schemes_settings/permission_schemes_settings.jsx';

describe('components/admin_console/permission_schemes_settings/permission_schemes_settings', () => {
    test('should match snapshot on render', () => {
        const wrapper = shallow(
            <PermissionSchemesSettings/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
