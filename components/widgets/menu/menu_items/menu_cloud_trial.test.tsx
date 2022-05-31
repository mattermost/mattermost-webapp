// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import {FileSizes} from 'utils/file_utils';
import {limitThresholds} from 'utils/limits';

import MenuCloudTrial from './menu_cloud_trial';

const usage = {
    files: {
        totalStorage: 0,
        totalStorageLoaded: true,
    },
    messages: {
        history: 0,
        historyLoaded: true,
    },
    boards: {
        cards: 0,
        cardsLoaded: true,
    },
    integrations: {
        enabled: 0,
        enabledLoaded: true,
    },
    teams: {
        active: 0,
        cloudArchived: 0,
        teamsLoaded: true,
    },
};

const limits = {
    limitsLoaded: true,
    limits: {
        integrations: {
            enabled: 5,
        },
        messages: {
            history: 10000,
        },
        files: {
            total_storage: 10 * FileSizes.Gigabyte,
        },
        teams: {
            active: 1,
            teamsLoaded: true,
        },
        boards: {
            cards: 500,
            views: 5,
        },
    },
};

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
                    limits,
                },
                usage,
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
                    limits,
                },
                usage,
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
                    limits,
                },
                usage,
            },
        };
        const store = mockStore(state);
        const wrapper = mountWithIntl(<Provider store={store}><MenuCloudTrial id='menuCloudTrial'/></Provider>);
        expect(wrapper.find('UpgradeLink').exists()).toEqual(false);
    });

    test('should NOT render when is cloudFree enabled but is a paid customer', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'true',
                        SkuShortName: 'enterprise',
                    },
                    config: {
                        FeatureFlagCloudFree: 'true',
                    },
                },
                cloud: {
                    subscription: {
                        is_free_trial: 'false',
                        is_paid_tier: 'false',
                        trial_end_at: 0,
                    },
                    limits,
                },
                usage,
            },
        };
        const store = mockStore(state);
        const wrapper = mountWithIntl(<Provider store={store}><MenuCloudTrial id='menuCloudTrial'/></Provider>);
        expect(wrapper.find('.open-learn-more-trial-modal').exists()).toEqual(false);
        expect(wrapper.find('UpgradeLink').exists()).toEqual(false);
    });

    test('should invite to start trial when cloud free is enabled, there are not paid subscription and havent had trial before', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'true',
                        SkuShortName: 'starter',
                    },
                    config: {
                        FeatureFlagCloudFree: 'true',
                    },
                },
                cloud: {
                    subscription: {
                        is_free_trial: 'false',
                        is_paid_tier: 'false',
                        trial_end_at: 0,
                    },
                    limits,
                },
                usage,
            },
        };
        const store = mockStore(state);
        const wrapper = mountWithIntl(<Provider store={store}><MenuCloudTrial id='menuCloudTrial'/></Provider>);
        expect(wrapper.find('.open-learn-more-trial-modal').exists()).toEqual(true);
    });

    test('should show the open trial benefits modal when is cloudFree and is free trial', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'true',
                    },
                    config: {
                        FeatureFlagCloudFree: 'true',
                    },
                },
                cloud: {
                    subscription: {
                        is_free_trial: 'true',
                        trial_end_at: 12345,
                    },
                    limits,
                },
                usage,
            },
        };
        const store = mockStore(state);
        const wrapper = mountWithIntl(<Provider store={store}><MenuCloudTrial id='menuCloudTrial'/></Provider>);
        const openModalLink = wrapper.find('.open-trial-benefits-modal');
        expect(openModalLink.exists()).toEqual(true);
        expect(openModalLink.find('span').text()).toBe('Review our Enterprise Features');
    });

    test('should show the invitation to see plans when is CloudFree and is not in Trial and has had previous Trial', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'true',
                        SkuShortName: 'starter',
                    },
                    config: {
                        FeatureFlagCloudFree: 'true',
                    },
                },
                cloud: {
                    subscription: {
                        is_free_trial: 'false',
                        is_paid_tier: 'false',
                        trial_end_at: 232434,
                    },
                    limits,
                },
                usage,
            },
        };
        const store = mockStore(state);
        const wrapper = mountWithIntl(<Provider store={store}><MenuCloudTrial id='menuCloudTrial'/></Provider>);
        const openModalLink = wrapper.find('.open-see-plans-modal');
        expect(openModalLink.exists()).toEqual(true);
        expect(openModalLink.find('span').text()).toBe('See plans');
    });

    test('should return null if some limit needs attention', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'true',
                        SkuShortName: 'starter',
                    },
                    config: {
                        FeatureFlagCloudFree: 'true',
                    },
                },
                cloud: {
                    subscription: {
                        is_free_trial: 'false',
                        is_paid_tier: 'false',
                        trial_end_at: 232434,
                    },
                    limits,
                },
                usage: {
                    ...usage,
                    messages: {
                        ...usage.messages,
                        history: Math.ceil((limitThresholds.warn / 100) * limits.limits.messages.history) + 1,
                    },
                },
            },
        };
        const store = mockStore(state);
        const wrapper = mountWithIntl(<Provider store={store}><MenuCloudTrial id='menuCloudTrial'/></Provider>);
        expect(wrapper.find('UpgradeLink').exists()).toEqual(false);
        expect(wrapper.find('.open-see-plans-modal').exists()).toEqual(false);
        expect(wrapper.find('.open-learn-more-trial-modal').exists()).toEqual(false);
        expect(wrapper.find('.open-trial-benefits-modal').exists()).toEqual(false);
    });
});
