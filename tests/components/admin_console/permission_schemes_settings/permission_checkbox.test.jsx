// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PermissionCheckbox from 'components/admin_console/permission_schemes_settings/permission_checkbox.jsx';

describe('components/admin_console/permission_schemes_settings/permission_checkbox', () => {
    test('should match snapshot on no value', () => {
        const wrapper = shallow(
            <PermissionCheckbox/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on value "checked"', () => {
        const wrapper = shallow(
            <PermissionCheckbox value='checked'/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on value "intermediate"', () => {
        const wrapper = shallow(
            <PermissionCheckbox value='intermediate'/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on other value', () => {
        const wrapper = shallow(
            <PermissionCheckbox value='other'/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
