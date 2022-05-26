// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {screen} from '@testing-library/react';

import * as redux from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';

import {renderWithIntl} from 'tests/react_testing_utils';

import * as cloudActions from 'actions/cloud';

import {FileSizes} from 'utils/file_utils';

import {GlobalState} from '@mattermost/types/store';
import {UserProfile, UsersState} from '@mattermost/types/users';
import {Constants} from 'utils/constants';

import {Subscription, Product} from '@mattermost/types/cloud';

import Limits from './limits';

const freeLimits = {
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
};

interface SetupOptions {
    hasLimits?: boolean;
    isEnterprise?: boolean;
}
function setupStore(setupOptions: SetupOptions) {
    const mockStore = configureStore([thunk]);
    const state = {
        entities: {
            cloud: {
                limits: {
                    limitsLoaded: setupOptions.hasLimits,
                    limits: setupOptions.hasLimits ? freeLimits : {},
                },
                subscription: {
                    product_id: setupOptions.isEnterprise ? 'prod_enterprise' : 'prod_starter',
                } as Subscription,
                products: {
                    prod_starter: {
                        id: 'prod_starter',
                        name: 'Cloud Starter',
                        sku: 'cloud-starter',
                    } as Product,
                    prod_enterprise: {
                        id: 'prod_enterprise',
                        name: 'Cloud Enterprise',
                        sku: 'cloud-enterprise',
                    } as Product,
                } as Record<string, Product>,
            },
            usage: {
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
                    enabled: 3,
                    enabledLoaded: true,
                },
            },
            general: {
                config: {
                    FeatureFlagCloudFree: setupOptions.hasLimits ? 'true' : 'false',
                } as GlobalState['entities']['general']['config'],
            },
            admin: {
                analytics: {
                    [Constants.StatTypes.TOTAL_POSTS]: 1234,
                } as GlobalState['entities']['admin']['analytics'],
            },
            users: {
                currentUserId: 'userid',
                profiles: {
                    userid: {} as UserProfile,
                },
            } as unknown as UsersState,
        },
    } as GlobalState;
    if (setupOptions.isEnterprise) {
        state.entities.cloud.subscription!.is_free_trial = 'true';
    }
    const store = mockStore(state);

    return store;
}

describe('Limits', () => {
    const hasLimits = {hasLimits: true};
    test('message limit rendered in K', () => {
        const store = setupStore(hasLimits);

        renderWithIntl(<Provider store={store}><Limits/></Provider>);
        screen.getByText('Message History');
        screen.getByText(/of 10K/);
    });

    test('storage limit rendered in GB', () => {
        const store = setupStore(hasLimits);

        renderWithIntl(<Provider store={store}><Limits/></Provider>);
        screen.getByText('File Storage');
        screen.getByText(/of 10GB/);
    });

    test('enabled integration count is shown', () => {
        const store = setupStore(hasLimits);

        renderWithIntl(<Provider store={store}><Limits/></Provider>);
        screen.getByText('Enabled Integrations');
        screen.getByText('3 of 5 integrations (60%)');
    });

    test('does not request limits when cloud free feature is disabled', () => {
        const mockGetLimits = jest.fn();
        jest.spyOn(cloudActions, 'getCloudLimits').mockImplementation(mockGetLimits);
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const store = setupStore({});

        renderWithIntl(<Provider store={store}><Limits/></Provider>);
        expect(mockGetLimits).not.toHaveBeenCalled();
    });

    test('renders nothing if on enterprise', () => {
        const mockGetLimits = jest.fn();
        jest.spyOn(cloudActions, 'getCloudLimits').mockImplementation(mockGetLimits);
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const store = setupStore({isEnterprise: true});

        renderWithIntl(<Provider store={store}><Limits/></Provider>);
        expect(screen.queryByTestId('limits-panel-title')).not.toBeInTheDocument();
    });

    test('renders elements if not on enterprise', () => {
        const mockGetLimits = jest.fn();
        jest.spyOn(cloudActions, 'getCloudLimits').mockImplementation(mockGetLimits);
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const store = setupStore(hasLimits);

        renderWithIntl(<Provider store={store}><Limits/></Provider>);
        screen.getByTestId('limits-panel-title');
    });
});
