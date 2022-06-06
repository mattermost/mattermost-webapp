// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import expect from 'expect';

import CloudTrialBanner from './cloud_trial_banner';

jest.mock('components/common/hooks/useOpenSalesLink', () => ({
    __esModule: true,
    default: () => () => true,
}));

describe('components/admin_console/billing_subscription/CloudTrialBanner', () => {
    test('should match snapshot when trial end date is 0', () => {
        const wrapper = shallow(<CloudTrialBanner trialEndDate={0}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when is cloud and is free trial', () => {
        const wrapper = shallow(<CloudTrialBanner trialEndDate={12345}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
