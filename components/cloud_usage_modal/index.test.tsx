// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {screen} from '@testing-library/react';

import * as redux from 'react-redux';
import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import {renderWithIntl} from 'tests/react_testing_utils';
import {FileSizes} from 'utils/file_utils';

import {GlobalState} from '@mattermost/types/store';
import {Constants} from 'utils/constants';

import {Subscription} from 'mattermost-redux/types/cloud';

import CloudUsageModal, {Props} from './index';

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
    const mockStore = configureStore();
    const state = {
        entities: {
            cloud: {
                limits: {
                    limitsLoaded: hasLimits,
                    limits: hasLimits ? freeLimits : {},
                },
                subscription: {} as Subscription,
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
            teams: {
                currentTeamId: ''
            },
            preferences: {
                myPreferences: {
                }
            },
        },
    } as GlobalState;
    const store = mockStore(state);

    return store;
}

let props: Props = {
    title: '',
    onClose: jest.fn(),
};
describe('CloudUsageModal', () => {
    beforeEach(() => {
        jest.spyOn(redux, 'useDispatch').mockImplementation(jest.fn(() => jest.fn()));
        props = {
            title: '',
            onClose: jest.fn(),
            needsTheme: true,
        };
    });

    test('renders text elements', () => {
        const store = setupStore(true);

        props.title = 'very important title';
        props.description = 'very important description';

        renderWithIntl(
            <Provider store={store}>
                <CloudUsageModal
                    {...props}
                />
            </Provider>,
        );
        screen.getByText(props.title as string);
        screen.getByText(props.description as string);
    });

    test('renders primary modal action', () => {
        const store = setupStore(true);

        props.primaryAction = {
            message: 'primary action',
            onClick: jest.fn(),
        };

        renderWithIntl(
            <Provider store={store}>
                <CloudUsageModal
                    {...props}
                />
            </Provider>,
        );
        expect(props.primaryAction.onClick).not.toHaveBeenCalled();
        screen.getByText(props.primaryAction.message as string).click();
        expect(props.primaryAction.onClick).toHaveBeenCalled();
    });

    test('renders secondary modal action', () => {
        const store = setupStore(true);

        props.secondaryAction = {
            message: 'secondary action',
            onClick: jest.fn(),
        };

        renderWithIntl(
            <Provider store={store}>
                <CloudUsageModal
                    {...props}
                />
            </Provider>,
        );
        expect(props.secondaryAction.onClick).not.toHaveBeenCalled();
        screen.getByText(props.secondaryAction.message as string).click();
        expect(props.secondaryAction.onClick).toHaveBeenCalled();
    });

    test('hides footer when there are no actions', () => {
        const store = setupStore(true);

        renderWithIntl(
            <Provider store={store}>
                <CloudUsageModal
                    {...props}
                />
            </Provider>,
        );
        expect(screen.queryByTestId('limits-modal-footer')).not.toBeInTheDocument();
    });
});
