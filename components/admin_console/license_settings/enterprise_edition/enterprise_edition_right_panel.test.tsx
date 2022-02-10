// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {LicenseSkus} from 'mattermost-redux/types/general';

import EnterpriseEditionRightPanel, {EnterpriseEditionProps} from './enterprise_edition_right_panel';

describe('components/admin_console/license_settings/enterprise_edition/enterprise_edition_right_panel', () => {
    const license = {
        IsLicensed: 'true',
        IssuedAt: '1517714643650',
        StartsAt: '1517714643650',
        ExpiresAt: '1620335443650',
        SkuShortName: LicenseSkus.Starter,
        Name: 'LicenseName',
        Company: 'Mattermost Inc.',
        Users: '1000000',
        IsGovSku: 'false',
    };

    const props = {
        isTrialLicense: false,
        license,
    } as EnterpriseEditionProps;

    test('should render for no Gov no Trial no Enterprise', () => {
        const wrapper = shallow(
            <EnterpriseEditionRightPanel {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render for Gov no Trial no Enterprise', () => {
        const wrapper = shallow(
            <EnterpriseEditionRightPanel
                license={{...props.license, IsGovSku: 'true'}}
                isTrialLicense={props.isTrialLicense}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render for Enterprise no Trial', () => {
        const wrapper = shallow(
            <EnterpriseEditionRightPanel
                license={{...props.license, SkuShortName: LicenseSkus.Enterprise}}
                isTrialLicense={props.isTrialLicense}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render for E20 no Trial', () => {
        const wrapper = shallow(
            <EnterpriseEditionRightPanel
                license={{...props.license, SkuShortName: LicenseSkus.E20}}
                isTrialLicense={props.isTrialLicense}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render for Trial no Gov', () => {
        const wrapper = shallow(
            <EnterpriseEditionRightPanel
                license={props.license}
                isTrialLicense={true}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render for Trial Gov', () => {
        const wrapper = shallow(
            <EnterpriseEditionRightPanel
                license={{...props.license, IsGovSku: 'true'}}
                isTrialLicense={true}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
