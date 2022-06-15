// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import configureStore from 'redux-mock-store';

import {Provider} from 'react-redux';

import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import {CloudProducts} from 'utils/constants';
import {makeEmptyLimits, makeEmptyUsage} from 'utils/limits_test';

import FeatureList, {FeatureListProps} from './feature_list';

function renderFeatureList(props: FeatureListProps, deep?: boolean) {
    const state = {
        entities: {
            cloud: {
                limits: makeEmptyLimits(),
            },
            usage: makeEmptyUsage(),
        },
    };

    const mockStore = configureStore([]);
    const store = mockStore(state);
    const wrapper = deep ?
        mountWithIntl(
            <Provider store={store}>
                <FeatureList {...props}/>
            </Provider>,
        ) :
        shallow(
            <Provider store={store}>
                <FeatureList {...props}/>
            </Provider>,
        );

    return wrapper;
}

describe('components/admin_console/billing/plan_details/feature_list', () => {
    test('should match snapshot when running FREE tier', () => {
        const wrapper = renderFeatureList({
            subscriptionPlan: CloudProducts.STARTER,
            isLegacyFree: false,
        });
        expect(wrapper).toMatchSnapshot();
    });
    test('should match snapshot when running paid tier and professional', () => {
        const wrapper = renderFeatureList({
            subscriptionPlan: CloudProducts.PROFESSIONAL,
            isLegacyFree: false,
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when running paid tier and enterprise', () => {
        const wrapper = renderFeatureList({
            subscriptionPlan: CloudProducts.ENTERPRISE,
            isLegacyFree: false,
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when running paid tier and starter', () => {
        const wrapper = renderFeatureList({
            subscriptionPlan: CloudProducts.STARTER,
            isLegacyFree: false,
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('all feature items must have different values', () => {
        const wrapperEnterprise = renderFeatureList({
            subscriptionPlan: CloudProducts.ENTERPRISE,
            isLegacyFree: false,
        }, true);

        const wrapperStarter = renderFeatureList({
            subscriptionPlan: CloudProducts.STARTER,
            isLegacyFree: false,
        }, true);

        const wrapperProfessional = renderFeatureList({
            subscriptionPlan: CloudProducts.PROFESSIONAL,
            isLegacyFree: false,
        }, true);

        const wrapperFreeTier = renderFeatureList({
            subscriptionPlan: CloudProducts.PROFESSIONAL,
            isLegacyFree: false,
        }, true);

        const wrappers = [wrapperProfessional, wrapperEnterprise, wrapperStarter, wrapperFreeTier];

        wrappers.forEach((wrapper: ReturnType<typeof renderFeatureList>) => {
            const featuresSpanElements = wrapper.find('div.PlanDetailsFeature > span');
            if (featuresSpanElements.length === 0) {
                console.error('No features found');
                expect(featuresSpanElements.length).toBeTruthy();
                return;
            }
            const featuresTexts = featuresSpanElements.map((element: any) => element.text());

            const hasDuplicates = (arr: any[]) => arr.length !== new Set(arr).size;

            expect(hasDuplicates(featuresTexts)).toBeFalsy();
        });
    });
});
