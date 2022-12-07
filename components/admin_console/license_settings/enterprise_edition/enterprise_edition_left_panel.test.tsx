// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {screen} from '@testing-library/react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import {renderWithIntl} from 'tests/react_testing_utils';
import {OverActiveUserLimits} from 'utils/constants';

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
        statsActiveUsers: 1,
    } as EnterpriseEditionProps;

    test('should format the Users field', () => {
        const wrapper = mountWithIntl(
            <EnterpriseEditionLeftPanel {...props}/>,
        );

        const item = wrapper.find('.item-element').filterWhere((n) => {
            return n.children().length === 2 &&
                   n.childAt(0).type() === 'span' &&
                   !n.childAt(0).text().includes('ACTIVE') &&
                   n.childAt(0).text().includes('USERS');
        });

        expect(item.text()).toContain('1,000,000');
    });

    test('should not add any class if active users is lower than the minimal', () => {
        renderWithIntl(
            <EnterpriseEditionLeftPanel
                {...props}
            />,
        );

        expect(screen.getByText(Intl.NumberFormat('en').format(props.statsActiveUsers))).toHaveClass('value');
        expect(screen.getByText(Intl.NumberFormat('en').format(props.statsActiveUsers))).not.toHaveClass('value--warning-over-seats-purchased');
        expect(screen.getByText(Intl.NumberFormat('en').format(props.statsActiveUsers))).not.toHaveClass('value--over-seats-purchased');
        expect(screen.getByText('ACTIVE USERS:')).toHaveClass('legend');
        expect(screen.getByText('ACTIVE USERS:')).not.toHaveClass('legend--warning-over-seats-purchased');
        expect(screen.getByText('ACTIVE USERS:')).not.toHaveClass('legend--over-seats-purchased');
    });

    test('should add warning class to active users', () => {
        const minWarning = Math.ceil(parseInt(license.Users, 10) * OverActiveUserLimits.MIN) + parseInt(license.Users, 10);
        renderWithIntl(
            <EnterpriseEditionLeftPanel
                {...props}
                statsActiveUsers={minWarning}
            />,
        );

        expect(screen.getByText(Intl.NumberFormat('en').format(minWarning))).toHaveClass('value');
        expect(screen.getByText(Intl.NumberFormat('en').format(minWarning))).toHaveClass('value--warning-over-seats-purchased');
        expect(screen.getByText(Intl.NumberFormat('en').format(minWarning))).not.toHaveClass('value--over-seats-purchased');
        expect(screen.getByText('ACTIVE USERS:')).toHaveClass('legend');
        expect(screen.getByText('ACTIVE USERS:')).toHaveClass('legend--warning-over-seats-purchased');
        expect(screen.getByText('ACTIVE USERS:')).not.toHaveClass('legend--over-seats-purchased');
    });

    test('should add over-seats-purchased class to active users', () => {
        const exceedHighLimitExtraUsersError = Math.ceil(parseInt(license.Users, 10) * OverActiveUserLimits.MAX) + parseInt(license.Users, 10);
        renderWithIntl(
            <EnterpriseEditionLeftPanel
                {...props}
                statsActiveUsers={exceedHighLimitExtraUsersError}
            />,
        );

        expect(screen.getByText(Intl.NumberFormat('en').format(exceedHighLimitExtraUsersError))).toHaveClass('value');
        expect(screen.getByText(Intl.NumberFormat('en').format(exceedHighLimitExtraUsersError))).toHaveClass('value--over-seats-purchased');
        expect(screen.getByText(Intl.NumberFormat('en').format(exceedHighLimitExtraUsersError))).not.toHaveClass('value--warning-over-seats-purchased');
        expect(screen.getByText('ACTIVE USERS:')).toHaveClass('legend');
        expect(screen.getByText('ACTIVE USERS:')).not.toHaveClass('legend--warning-over-seats-purchased');
        expect(screen.getByText('ACTIVE USERS:')).toHaveClass('legend--over-seats-purchased');
    });
});
