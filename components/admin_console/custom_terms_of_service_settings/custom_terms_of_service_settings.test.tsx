// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {AdminConfig} from 'mattermost-redux/types/config';

import CustomTermsOfServiceSettings from 'components/admin_console/custom_terms_of_service_settings/custom_terms_of_service_settings';

describe('components/admin_console/CustomTermsOfServiceSettings', () => {
    const baseProps = {
        actions: {
            createTermsOfService: jest.fn(),
            getTermsOfService: jest.fn().mockResolvedValue({data: {id: 'tos_id', text: 'tos_text'}}),
        },
        config: {
            SupportSettings: {
                CustomTermsOfServiceEnabled: true,
                CustomTermsOfServiceReAcceptancePeriod: 365,
            },
        } as AdminConfig,
        license: {
            IsLicensed: 'true',
            CustomTermsOfService: 'true',
        },
        setNavigationBlocked: jest.fn(),
        updateConfig: jest.fn(),
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <CustomTermsOfServiceSettings
                {...baseProps}
            />,
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.setProps({saveNeeded: true});
        expect(wrapper).toMatchSnapshot();

        wrapper.setProps({saveNeeded: false, saving: true});
        expect(wrapper).toMatchSnapshot();

        wrapper.setProps({saving: false, serverError: 'error'});
        expect(wrapper).toMatchSnapshot();
    });
});
