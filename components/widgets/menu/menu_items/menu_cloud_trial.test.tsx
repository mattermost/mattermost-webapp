// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import MenuCloudTrial from './menu_cloud_trial';

describe('components/widgets/menu/menu_items/menu_cloud_trial', () => {
    const mockStore = configureStore();

    test('should render when on cloud license and during free trial period', () => {
        const FOURTEEN_DAYS = 1209600000; // in milliseconds
        const subscriptionCreateAt = Date.now();
        const subscriptionEndAt = subscriptionCreateAt + FOURTEEN_DAYS;
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'true',
                    },
                },
                cloud: {
                    subscription: {
                        is_free_trial: 'true',
                        trial_end_at: subscriptionEndAt,
                    },
                },
            },
        };
        const store = mockStore(state);
        const wrapper = mountWithIntl(<Provider store={store}><MenuCloudTrial id='menuCloudTrial'/></Provider>);
        expect(wrapper.find('UpgradeLink').exists()).toEqual(true);
    });

    test('should NOT render when NOT on cloud license and NOT during free trial period', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'false',
                    },
                },
                cloud: {
                    customer: null,
                    subscription: null,
                    products: null,
                    invoices: null,
                    subscriptionStats: null,
                },
            },
        };
        const store = mockStore(state);
        const wrapper = mountWithIntl(<Provider store={store}><MenuCloudTrial id='menuCloudTrial'/></Provider>);
        expect(wrapper.find('UpgradeLink').exists()).toEqual(false);
    });

    test('should NOT render when NO license is available', () => {
        const state = {
            entities: {
                general: {},
                cloud: {
                    customer: null,
                    subscription: null,
                    products: null,
                    invoices: null,
                    subscriptionStats: null,
                },
            },
        };
        const store = mockStore(state);
        const wrapper = mountWithIntl(<Provider store={store}><MenuCloudTrial id='menuCloudTrial'/></Provider>);
        expect(wrapper.find('UpgradeLink').exists()).toEqual(false);
    });
});
