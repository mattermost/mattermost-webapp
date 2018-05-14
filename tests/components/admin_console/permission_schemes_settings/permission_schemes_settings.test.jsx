// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PermissionSchemesSettings from 'components/admin_console/permission_schemes_settings/permission_schemes_settings.jsx';

describe('components/admin_console/permission_schemes_settings/permission_schemes_settings', () => {
    const defaultProps = {
        schemes: [
            {id: 'id-1', name: 'Test 1', description: 'Test description 1'},
            {id: 'id-2', name: 'Test 2', description: 'Test description 2'},
            {id: 'id-3', name: 'Test 3', description: 'Test description 3'},
        ],
        actions: {
            loadSchemes: jest.fn(() => Promise.resolve([])),
            loadSchemeTeams: jest.fn(),
        },
    };
    test('should match snapshot loading', () => {
        const wrapper = shallow(
            <PermissionSchemesSettings {...defaultProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot without schemes', () => {
        const wrapper = shallow(
            <PermissionSchemesSettings
                {...defaultProps}
                schemes={[]}
            />
        );
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with schemes', () => {
        const wrapper = shallow(
            <PermissionSchemesSettings {...defaultProps}/>
        );
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });
});
