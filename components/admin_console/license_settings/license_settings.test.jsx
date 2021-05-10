// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {fakeDate} from 'tests/helpers/date';

import LicenseSettings from './license_settings.jsx';

const flushPromises = () => new Promise(setImmediate);

describe('components/admin_console/license_settings/LicenseSettings', () => {
    let resetFakeDate;

    beforeAll(() => {
        resetFakeDate = fakeDate(new Date('2021-04-14T12:00:00Z'));
    });

    afterAll(() => {
        resetFakeDate();
    });

    const defaultProps = {
        isDisabled: false,
        license: {
            IsLicensed: 'true',
            IssuedAt: '1517714643650',
            StartsAt: '1517714643650',
            ExpiresAt: '1620335443650',
            SkuShortName: 'SkuName',
            Name: 'LicenseName',
            Company: 'Mattermost Inc.',
            Users: '100',
        },
        upgradedFromTE: false,
        enterpriseReady: true,
        actions: {
            getLicenseConfig: jest.fn(),
            uploadLicense: jest.fn(),
            removeLicense: jest.fn(),
            upgradeToE0: jest.fn(),
            ping: jest.fn(),
            requestTrialLicense: jest.fn(),
            restartServer: jest.fn(),
            upgradeToE0Status: jest.fn().mockImplementation(() => Promise.resolve({percentage: 0, error: null})),
        },
        stats: {
            TOTAL_USERS: 10,
        },
    };

    test('should match snapshot enterprise build with license', () => {
        const wrapper = shallow(<LicenseSettings {...defaultProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot enterprise build with license and isDisabled set to true', () => {
        const wrapper = shallow(
            <LicenseSettings
                {...defaultProps}
                isDisabled={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot enterprise build with license and upgraded from TE', () => {
        const props = {...defaultProps, upgradedFromTE: true};
        const wrapper = shallow(<LicenseSettings {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot enterprise build without license', () => {
        const props = {...defaultProps, license: {IsLicensed: false}};
        const wrapper = shallow(<LicenseSettings {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot enterprise build without license and upgrade from TE', () => {
        const props = {...defaultProps, license: {IsLicensed: false}, upgradedFromTE: true};
        const wrapper = shallow(<LicenseSettings {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot team edition build without license', () => {
        const props = {...defaultProps, enterpriseReady: false, license: {IsLicensed: false}};
        const wrapper = shallow(<LicenseSettings {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot team edition build with license', () => {
        const props = {...defaultProps, enterpriseReady: false};
        const wrapper = shallow(<LicenseSettings {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('upgrade to enterprise click', async () => {
        const actions = {
            ...defaultProps.actions,
            getLicenseConfig: jest.fn(),
            upgradeToE0: jest.fn(),
            upgradeToE0Status: jest.fn().mockImplementation(() => Promise.resolve({percentage: 0, error: null})),
        };
        const props = {...defaultProps, enterpriseReady: false, actions};
        const wrapper = shallow(<LicenseSettings {...props}/>);

        expect(actions.getLicenseConfig).toBeCalledTimes(1);
        expect(actions.upgradeToE0Status).toBeCalledTimes(1);
        actions.upgradeToE0Status = jest.fn().mockImplementation(() => Promise.resolve({percentage: 1, error: null}));

        const instance = wrapper.instance();
        expect(instance.interval).toBe(null);
        expect(wrapper.state('upgradingPercentage')).toBe(0);

        await instance.handleUpgrade({preventDefault: jest.fn()});
        expect(actions.upgradeToE0).toBeCalledTimes(1);
        expect(actions.upgradeToE0Status).toBeCalledTimes(1);
        expect(wrapper.state('upgradingPercentage')).toBe(1);
        expect(instance.interval).not.toBe(null);
    });

    test('load screen while upgrading', async () => {
        const actions = {
            ...defaultProps.actions,
            upgradeToE0Status: jest.fn().mockImplementation(() => Promise.resolve({percentage: 42, error: null})),
        };
        const props = {...defaultProps, enterpriseReady: false, actions};
        const wrapper = shallow(<LicenseSettings {...props}/>);
        await flushPromises();
        expect(wrapper).toMatchSnapshot();
    });

    test('load screen after upgrading', async () => {
        const actions = {
            ...defaultProps.actions,
            upgradeToE0Status: jest.fn().mockImplementation(() => Promise.resolve({percentage: 100, error: null})),
        };
        const props = {...defaultProps, enterpriseReady: false, actions};
        const wrapper = shallow(<LicenseSettings {...props}/>);
        await flushPromises();
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot enterprise build with trial license', () => {
        const props = {...defaultProps, license: {IsLicensed: 'true', StartsAt: '1617714643650', IssuedAt: '1617714643650', ExpiresAt: '1620335443650'}};
        const wrapper = shallow(<LicenseSettings {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
