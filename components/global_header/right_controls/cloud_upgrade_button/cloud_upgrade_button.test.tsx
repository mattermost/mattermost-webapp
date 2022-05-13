// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import {CloudProducts} from 'utils/constants';

import CloudUpgradeButton from './index';

describe('components/global/CloudUpgradeButton', () => {
    const initialState = {
        entities: {
            general: {
                config: {
                    FeatureFlagCloudFree: 'true',
                } as any,
                license: {
                    IsLicensed: 'true',
                    Cloud: 'true',
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {roles: 'system_admin'},
                },
            },
            cloud: {
                subscription: {
                    product_id: 'test_prod_1',
                },
                products: {
                    test_prod_1: {
                        id: 'test_prod_1',
                        sku: CloudProducts.STARTER,
                        price_per_seat: 0,
                    },
                },
            },
        },
    };
    it('should show Upgrade button in global header for admin users, cloud and starter subscription', () => {
        const state = {
            ...initialState,
        };

        const mockStore = configureStore();
        const store = mockStore(state);

        const wrapper = mount(
            <Provider store={store}>
                <CloudUpgradeButton/>
            </Provider>,
        );

        expect(wrapper.find('UpgradeButton').exists()).toEqual(true);
    });

    it('should show Upgrade button in global header for admin users, cloud and enterprise trial subscription', () => {
        const FOURTEEN_DAYS = 1209600000; // in milliseconds
        const subscriptionCreateAt = Date.now();
        const subscriptionEndAt = subscriptionCreateAt + FOURTEEN_DAYS;
        const state = JSON.parse(JSON.stringify(initialState));
        state.entities.cloud = {
            subscription: {
                product_id: 'test_prod_2',
                trial_end_at: subscriptionEndAt, // enterprise trial with 14 days left
            },
            products: {
                test_prod_2: {
                    id: 'test_prod_2',
                    sku: CloudProducts.ENTERPRISE,
                    price_per_seat: 0,
                },
            },
        };

        const mockStore = configureStore();
        const store = mockStore(state);

        const wrapper = mount(
            <Provider store={store}>
                <CloudUpgradeButton/>
            </Provider>,
        );

        expect(wrapper.find('UpgradeButton').exists()).toEqual(true);
    });

    it('should not show Upgrade button in global header for non admin users', () => {
        const state = JSON.parse(JSON.stringify(initialState));
        state.entities.users = {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_user'},
            },
        };

        const mockStore = configureStore();
        const store = mockStore(state);

        const wrapper = mount(
            <Provider store={store}>
                <CloudUpgradeButton/>
            </Provider>,
        );

        expect(wrapper.find('UpgradeButton').exists()).toEqual(false);
    });

    it('should not show Upgrade button in global header for non cloud', () => {
        const state = JSON.parse(JSON.stringify(initialState));
        state.entities.general.license = {
            IsLicensed: 'true',
            Cloud: 'false',
        };

        const mockStore = configureStore();
        const store = mockStore(state);

        const wrapper = mount(
            <Provider store={store}>
                <CloudUpgradeButton/>
            </Provider>,
        );

        expect(wrapper.find('UpgradeButton').exists()).toEqual(false);
    });
});
