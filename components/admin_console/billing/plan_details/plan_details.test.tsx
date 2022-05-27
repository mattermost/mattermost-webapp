// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow, ShallowWrapper} from 'enzyme';

import {CloudProducts} from 'utils/constants';

import {FeatureList} from './plan_details';

describe('components/admin_console/billing/plan_details', () => {
    type Props = {
        children: React.ReactNode;
    }
    const WrapperComponent: React.FC<Props> = ({children}: Props) => {
        return (
            <div>
                {children}
            </div>
        );
    };
    test('should match snapshot when running FREE tier', () => {
        const wrapper = shallow(
            <WrapperComponent>
                <FeatureList
                    subscriptionPlan={CloudProducts.STARTER}
                    isPaidTier={false}
                />
            </WrapperComponent>,
        );
        expect(wrapper).toMatchSnapshot();
    });
    test('should match snapshot when running paid tier and professional', () => {
        const wrapper = shallow(
            <WrapperComponent>
                <FeatureList
                    subscriptionPlan={CloudProducts.PROFESSIONAL}
                    isPaidTier={true}
                />
            </WrapperComponent>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when running paid tier and enterprise', () => {
        const wrapper = shallow(
            <WrapperComponent>
                <FeatureList
                    subscriptionPlan={CloudProducts.ENTERPRISE}
                    isPaidTier={true}
                />
            </WrapperComponent>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when running paid tier and starter', () => {
        const wrapper = shallow(
            <WrapperComponent>
                <FeatureList
                    subscriptionPlan={CloudProducts.STARTER}
                    isPaidTier={true}
                />
            </WrapperComponent>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('all feature items must have different values', () => {
        const wrapperEnterprise = shallow(
            <WrapperComponent>
                <FeatureList
                    subscriptionPlan={CloudProducts.ENTERPRISE}
                    isPaidTier={true}
                />
            </WrapperComponent>,
        );

        const wrapperStarter = shallow(
            <WrapperComponent>
                <FeatureList
                    subscriptionPlan={CloudProducts.STARTER}
                    isPaidTier={true}
                />
            </WrapperComponent>,
        );

        const wrapperProfessional = shallow(
            <WrapperComponent>
                <FeatureList
                    subscriptionPlan={CloudProducts.PROFESSIONAL}
                    isPaidTier={true}
                />
            </WrapperComponent>,
        );

        const wrapperFreeTier = shallow(
            <WrapperComponent>
                <FeatureList
                    subscriptionPlan={CloudProducts.PROFESSIONAL}
                    isPaidTier={false}
                />
            </WrapperComponent>,
        );

        const wrappers = [wrapperProfessional, wrapperEnterprise, wrapperStarter, wrapperFreeTier];

        wrappers.forEach((wrapper: ShallowWrapper<typeof WrapperComponent>) => {
            const featuresSpanElements = wrapper.find('div.PlanDetails__feature > span');
            if (featuresSpanElements.length === 0) {
                console.error('No features found');
                expect(featuresSpanElements.length).toBeTruthy();
                return;
            }
            const featuresTexts = featuresSpanElements.map((element) => element.text());

            const hasDuplicates = (arr: any[]) => arr.length !== new Set(arr).size;

            expect(hasDuplicates(featuresTexts)).toBeFalsy();
        });
    });
});
