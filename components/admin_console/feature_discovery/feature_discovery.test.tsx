// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Subscription} from '@mattermost/types/cloud';

import FeatureDiscovery from 'components/admin_console/feature_discovery/feature_discovery';

import SamlSVG from './features/images/saml_svg';

describe('components/feature_discovery', () => {
    describe('FeatureDiscovery', () => {
        test('should match snapshot', () => {
            const wrapper = shallow(
                <FeatureDiscovery
                    featureName='test'
                    titleID='translation.test.title'
                    titleDefault='Foo'
                    copyID='translation.test.copy'
                    copyDefault={'Bar'}
                    learnMoreURL='https://test.mattermost.com/secondary/'
                    featureDiscoveryImage={<SamlSVG/>}
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    stats={{TOTAL_USERS: 20}}
                    prevTrialLicense={{IsLicensed: 'false'}}
                    isCloud={false}
                    isCloudTrial={false}
                    hadPrevCloudTrial={false}
                    subscription={{} as Subscription}
                    isPaidSubscription={false}
                    actions={{
                        requestTrialLicense: jest.fn(),
                        getLicenseConfig: jest.fn(),
                        getPrevTrialLicense: jest.fn(),
                        openModal: jest.fn(),
                    }}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
        test('should match snapshot when is cloud environment', () => {
            const wrapper = shallow(
                <FeatureDiscovery
                    featureName='test'
                    titleID='translation.test.title'
                    titleDefault='Foo'
                    copyID='translation.test.copy'
                    copyDefault={'Bar'}
                    learnMoreURL='https://test.mattermost.com/secondary/'
                    featureDiscoveryImage={<SamlSVG/>}
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    stats={{TOTAL_USERS: 20}}
                    prevTrialLicense={{IsLicensed: 'false'}}
                    isCloud={true}
                    isCloudTrial={false}
                    hadPrevCloudTrial={false}
                    isPaidSubscription={false}
                    subscription={{} as Subscription}
                    actions={{
                        requestTrialLicense: jest.fn(),
                        getLicenseConfig: jest.fn(),
                        getPrevTrialLicense: jest.fn(),
                        openModal: jest.fn(),
                    }}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        test('should match snapshot when is cloud environment and subscription is not loaded yet in redux store', () => {
            const wrapper = shallow(
                <FeatureDiscovery
                    featureName='test'
                    titleID='translation.test.title'
                    titleDefault='Foo'
                    copyID='translation.test.copy'
                    copyDefault={'Bar'}
                    learnMoreURL='https://test.mattermost.com/secondary/'
                    featureDiscoveryImage={<SamlSVG/>}
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    stats={{TOTAL_USERS: 20}}
                    prevTrialLicense={{IsLicensed: 'false'}}
                    isCloud={true}
                    isCloudTrial={false}
                    hadPrevCloudTrial={false}
                    subscription={undefined}
                    isPaidSubscription={false}
                    actions={{
                        requestTrialLicense: jest.fn(),
                        getLicenseConfig: jest.fn(),
                        getPrevTrialLicense: jest.fn(),
                        openModal: jest.fn(),
                    }}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
