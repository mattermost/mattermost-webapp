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
import {Constants} from 'utils/constants';

import {Subscription} from '@mattermost/types/cloud';

import Limits from './limits';

const freeLimits = {
    integrations: {
        enabled: 10,
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

function setupStore(hasLimits: boolean) {
    const mockStore = configureStore([thunk]);
    const state = {
        entities: {
            cloud: {
                limits: {
                    limitsLoaded: hasLimits,
                    limits: hasLimits ? freeLimits : {},
                },
                subscription: {} as Subscription,
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
                    enabled: 0,
                    enabledLoaded: true,
                },
            },
            general: {
                config: {
                    FeatureFlagCloudFree: hasLimits ? 'true' : 'false',
                } as GlobalState['entities']['general']['config'],
            },
            admin: {
                analytics: {
                    [Constants.StatTypes.TOTAL_POSTS]: 1234,
                } as GlobalState['entities']['admin']['analytics'],
            },
        },
    } as GlobalState;
    const store = mockStore(state);

    return store;
}

describe('Limits', () => {
    test('message limit rendered in K', () => {
        const store = setupStore(true);

        renderWithIntl(<Provider store={store}><Limits/></Provider>);
        screen.getByText('Message History');
        screen.getByText(/of 10K/);
    });

    test('storage limit rendered in GB', () => {
        const store = setupStore(true);

        renderWithIntl(<Provider store={store}><Limits/></Provider>);
        screen.getByText('File Storage');
        screen.getByText(/of 10GB/);
    });

    test('does not request limits when cloud free feature is disabled', () => {
        const mockGetLimits = jest.fn();
        jest.spyOn(cloudActions, 'getCloudLimits').mockImplementation(mockGetLimits);
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        const store = setupStore(false);

        renderWithIntl(<Provider store={store}><Limits/></Provider>);
        expect(mockGetLimits).not.toHaveBeenCalled();
    });
});
