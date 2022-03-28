// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';

import {shallow} from 'enzyme';

import {LicenseSkus} from 'mattermost-redux/types/general';

import PermissionsTreePlaybooks from 'components/admin_console/permission_schemes_settings/permissions_tree_playbooks';

describe('components/admin_console/permission_schemes_settings/permissions_tree_playbooks', () => {
    const defaultProps: ComponentProps<typeof PermissionsTreePlaybooks> = {
        role: {name: 'role'},
        parentRole: {},
        scope: 'scope',
        selectRow: () => null,
        readOnly: false,
        onToggle: () => null,
        license: {
        },
    };

    test('should match snapshots without license', () => {
        const wrapper = shallow(
            <PermissionsTreePlaybooks {...defaultProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshots with starter license', () => {
        const props = {
            ...defaultProps,
            license: {
                SkuShortName: LicenseSkus.Starter,
            },
        };
        const wrapper = shallow(
            <PermissionsTreePlaybooks {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshots with professional license', () => {
        const props = {
            ...defaultProps,
            license: {
                SkuShortName: LicenseSkus.Professional,
            },
        };
        const wrapper = shallow(
            <PermissionsTreePlaybooks {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshots with enterprise license', () => {
        const props = {
            ...defaultProps,
            license: {
                SkuShortName: LicenseSkus.Enterprise,
            },
        };
        const wrapper = shallow(
            <PermissionsTreePlaybooks {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
