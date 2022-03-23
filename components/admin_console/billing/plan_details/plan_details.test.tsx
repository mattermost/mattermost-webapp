// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow, ShallowWrapper} from 'enzyme';

import {CloudProducts} from 'utils/constants';

import {featureList} from './plan_details';

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
                {featureList(CloudProducts.STARTER, false)}
            </WrapperComponent>,
        );
        expect(wrapper).toMatchSnapshot();
    });
    test('should match snapshot when running paid tier and professional', () => {
        const wrapper = shallow(
            <WrapperComponent>
                {featureList(CloudProducts.PROFESSIONAL, true)}
            </WrapperComponent>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when running paid tier and enterprise', () => {
        const wrapper = shallow(
            <WrapperComponent>
                {featureList(CloudProducts.ENTERPRISE, true)}
            </WrapperComponent>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when running paid tier and starter', () => {
        const wrapper = shallow(
            <WrapperComponent>
                {featureList(CloudProducts.STARTER, true)}
            </WrapperComponent>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('all feature items must have different values', () => {
        const wrapperEnterprise = shallow(
            <WrapperComponent>
                {featureList(CloudProducts.ENTERPRISE, true)}
            </WrapperComponent>,
        );

        const wrapperStarter = shallow(
            <WrapperComponent>
                {featureList(CloudProducts.STARTER, true)}
            </WrapperComponent>,
        );

        const wrapperProfessional = shallow(
            <WrapperComponent>
                {featureList(CloudProducts.PROFESSIONAL, true)}
            </WrapperComponent>,
        );

        const wrapperFreeTier = shallow(
            <WrapperComponent>
                {featureList(CloudProducts.PROFESSIONAL, false)}
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
