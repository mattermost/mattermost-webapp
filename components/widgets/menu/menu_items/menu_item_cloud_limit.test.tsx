// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import {FileSizes} from 'utils/file_utils';
import {limitThresholds} from 'utils/limits';

import MenuItemCloudLimit from './menu_item_cloud_limit';

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
        },
        boards: {
            cards: 500,
            views: 5,
        },
    },
};

describe('components/widgets/menu/menu_items/menu_cloud_trial', () => {
    const mockStore = configureStore();

    test('Does not render if not cloud', () => {
    });

    test('Does not render if not free trial', () => {
    });

    test('Does not render if no highest limit', () => {
    });

    test('Does not render if no words', () => {
    });

    test('renders when a limit needs attention', () => {
    });

    test('shows more attention grabbing UI if a limit is very close', () => {
    });
    test('', () => {
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
        const wrapper = mountWithIntl(<Provider store={store}><MenuItemCloudLimit id='menuItemCloudLimit'/></Provider>);
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

