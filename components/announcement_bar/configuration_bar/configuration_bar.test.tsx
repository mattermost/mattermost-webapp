// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import ConfigurationBar from 'components/announcement_bar/configuration_bar/configuration_bar';

describe('components/ConfigurationBar', () => {
    const millisPerDay = 24 * 60 * 60 * 1000;

    const baseProps = {
        isLoggedIn: true,
        canViewSystemErrors: true,
        license: {
            Id: '1234',
            IsLicensed: 'true',
            ExpiresAt: Date.now() + millisPerDay,
        },
        config: {
            sendEmailNotifications: false,
        },
        dismissedExpiringLicense: false,
        siteURL: '',
        totalUsers: 100,
        actions: {
            dismissNotice: jest.fn(),
        },
    };

    test('should match snapshot, expired, in grace period', () => {
        const props = {...baseProps, license: {Id: '1234', IsLicensed: 'true', ExpiresAt: Date.now() - millisPerDay}};
        const wrapper = shallowWithIntl(
            <ConfigurationBar {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, expired', () => {
        const props = {...baseProps, license: {Id: '1234', IsLicensed: 'true', ExpiresAt: Date.now() - (11 * millisPerDay)}};
        const wrapper = shallowWithIntl(
            <ConfigurationBar {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, expired, regular user', () => {
        const props = {...baseProps, canViewSystemErrors: false, license: {Id: '1234', IsLicensed: 'true', ExpiresAt: Date.now() - (11 * millisPerDay)}};
        const wrapper = shallowWithIntl(
            <ConfigurationBar {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, show nothing', () => {
        const props = {...baseProps, license: {Id: '1234', IsLicensed: 'true', ExpiresAt: Date.now() + (61 * millisPerDay)}};
        const wrapper = shallowWithIntl(
            <ConfigurationBar {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
