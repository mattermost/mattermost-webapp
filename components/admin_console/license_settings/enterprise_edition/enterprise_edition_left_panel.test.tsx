// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import EnterpriseEditionLeftPanel, {EnterpriseEditionProps} from './enterprise_edition_left_panel';

describe('components/admin_console/license_settings/enterprise_edition/enterprise_edition_left_panel', () => {
    const license = {
        IsLicensed: 'true',
        IssuedAt: '1517714643650',
        StartsAt: '1517714643650',
        ExpiresAt: '1620335443650',
        SkuShortName: 'Enterprise',
        Name: 'LicenseName',
        Company: 'Mattermost Inc.',
        Users: '1000000',
    };

    const props = {
        license,
        openEELicenseModal: jest.fn(),
        upgradedFromTE: false,
        isTrialLicense: false,
        issued: <></>,
        startsAt: <></>,
        expiresAt: <></>,
        handleRemove: jest.fn(),
        isDisabled: false,
        removing: false,
        handleChange: jest.fn(),
        fileInputRef: React.createRef(),
    } as EnterpriseEditionProps;

    test('should format the Users field', () => {
        const wrapper = mountWithIntl(
            <EnterpriseEditionLeftPanel {...props}/>,
        );

        const item = wrapper.find('.item-element').filterWhere((n) => {
            return n.children().length === 2 &&
                   n.childAt(0).type() === 'span' &&
                   n.childAt(0).text().includes('USERS');
        });

        expect(item.text()).toContain('1,000,000');
    });
});
