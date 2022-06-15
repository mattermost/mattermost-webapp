// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {screen, fireEvent} from '@testing-library/react';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';

import {UserProfile, UsersState} from '@mattermost/types/users';
import {GlobalState} from '@mattermost/types/store';

import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';
import {Preferences} from 'mattermost-redux/constants';

import * as useOpenSalesLink from 'components/common/hooks/useOpenSalesLink';
import * as useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import * as useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';
import * as useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import * as useSaveBool from 'components/common/hooks/useSavePreferences';
import {renderWithIntl} from 'tests/react_testing_utils';

import {CloudProducts} from 'utils/constants';

import LimitReachedBanner from './limit_reached_banner';

const upgradeCloudKey = getPreferenceKey(Preferences.CATEGORY_UPGRADE_CLOUD, Preferences.SYSTEM_CONSOLE_LIMIT_REACHED);

const state: GlobalState = {
    entities: {
        users: {
            currentUserId: 'userid',
            profiles: {
                userid: {} as UserProfile,
            },
        } as unknown as UsersState,
        preferences: {
            myPreferences: {
                [upgradeCloudKey]: {value: 'false'},
            },
        },
        cloud: {
            limits: {
            },
            products: {
            },
        },
    },
} as GlobalState;

const base = {
    id: '',
    name: '',
    description: '',
    price_per_seat: 0,
    add_ons: [],
    product_family: '',
    billing_scheme: '',
    recurring_interval: '',
};

const starter = {...base, sku: CloudProducts.STARTER};
const professional = {...base, sku: CloudProducts.PROFESSIONAL};
const enterprise = {...base, sku: CloudProducts.ENTERPRISE};

const noLimitReached = {
    files: {
        totalStorage: -1,
        totalStorageLoaded: true,
    },
    messages: {
        history: -1,
        historyLoaded: true,
    },
    boards: {
        cards: -1,
        cardsLoaded: true,
    },
    teams: {
        active: -1,
        cloudArchived: -1,
        teamsLoaded: true,
    },
    integrations: {
        enabled: -1,
        enabledLoaded: true,
    },
};
const someLimitReached = {
    ...noLimitReached,
    integrations: {
        ...noLimitReached.integrations,
        enabled: 1,
    },
};

const titleStarter = /Upgrade to one of our paid plans to avoid/;
const titleProfessional = /Upgrade to Enterprise to avoid Professional plan/;

function makeSpies() {
    const mockUseOpenSalesLink = jest.spyOn(useOpenSalesLink, 'default');
    const mockUseGetUsageDeltas = jest.spyOn(useGetUsageDeltas, 'default');
    const mockUseOpenCloudPurchaseModal = jest.spyOn(useOpenCloudPurchaseModal, 'default');
    const mockUseOpenPricingModal = jest.spyOn(useOpenPricingModal, 'default');
    const mockUseSaveBool = jest.spyOn(useSaveBool, 'useSaveBool');
    return {
        useOpenSalesLink: mockUseOpenSalesLink,
        useGetUsageDeltas: mockUseGetUsageDeltas,
        useOpenCloudPurchaseModal: mockUseOpenCloudPurchaseModal,
        useOpenPricingModal: mockUseOpenPricingModal,
        useSaveBool: mockUseSaveBool,
    };
}

describe('limits_reached_banner', () => {
    test('does not render when product is enterprise', () => {
        const mockStore = configureStore([thunk]);
        const store = mockStore(state);
        const spies = makeSpies();
        spies.useGetUsageDeltas.mockReturnValue(someLimitReached);

        renderWithIntl(<Provider store={store}><LimitReachedBanner product={enterprise}/></Provider>);
        expect(screen.queryByText(titleStarter)).not.toBeInTheDocument();
        expect(screen.queryByText(titleProfessional)).not.toBeInTheDocument();
    });

    test('does not render when banner was dismissed', () => {
        const myState = {
            ...state,
            entities: {
                ...state.entities,
                preferences: {
                    ...state.entities.preferences,
                    myPreferences: {
                        ...state.entities.preferences.myPreferences,
                        [upgradeCloudKey]: {value: 'true'},
                    },
                },
            },
        };
        const mockStore = configureStore([thunk]);
        const store = mockStore(myState);
        const spies = makeSpies();
        spies.useGetUsageDeltas.mockReturnValue(someLimitReached);
        renderWithIntl(<Provider store={store}><LimitReachedBanner product={enterprise}/></Provider>);
        expect(screen.queryByText(titleStarter)).not.toBeInTheDocument();
        expect(screen.queryByText(titleProfessional)).not.toBeInTheDocument();
    });

    test('does not render when no limit reached', () => {
        const mockStore = configureStore([thunk]);
        const store = mockStore(state);
        const spies = makeSpies();
        spies.useGetUsageDeltas.mockReturnValue(noLimitReached);
        renderWithIntl(<Provider store={store}><LimitReachedBanner product={starter}/></Provider>);
        expect(screen.queryByText(titleStarter)).not.toBeInTheDocument();
        expect(screen.queryByText(titleProfessional)).not.toBeInTheDocument();
    });

    test('renders starter banner', () => {
        const mockStore = configureStore([thunk]);
        const store = mockStore(state);
        const spies = makeSpies();
        const mockOpenPricingModal = jest.fn();
        spies.useOpenPricingModal.mockReturnValue(mockOpenPricingModal);
        spies.useGetUsageDeltas.mockReturnValue(someLimitReached);
        renderWithIntl(<Provider store={store}><LimitReachedBanner product={starter}/></Provider>);
        screen.getByText(titleStarter);
        expect(screen.queryByText(titleProfessional)).not.toBeInTheDocument();
        fireEvent.click(screen.getByText('View plans'));
        expect(mockOpenPricingModal).toHaveBeenCalled();
    });

    test('clicking Contact Sales opens sales link', () => {
        const mockStore = configureStore([thunk]);
        const store = mockStore(state);
        const spies = makeSpies();
        const mockOpenSalesLink = jest.fn();
        spies.useOpenSalesLink.mockReturnValue(mockOpenSalesLink);
        spies.useGetUsageDeltas.mockReturnValue(someLimitReached);
        renderWithIntl(<Provider store={store}><LimitReachedBanner product={starter}/></Provider>);
        screen.getByText(titleStarter);
        expect(screen.queryByText(titleProfessional)).not.toBeInTheDocument();
        fireEvent.click(screen.getByText('Contact sales'));
        expect(mockOpenSalesLink).toHaveBeenCalled();
    });

    test('renders professional banner', () => {
        const mockStore = configureStore([thunk]);
        const store = mockStore(state);
        const spies = makeSpies();
        const mockOpenPurchaseModal = jest.fn();
        spies.useOpenCloudPurchaseModal.mockReturnValue(mockOpenPurchaseModal);
        spies.useGetUsageDeltas.mockReturnValue(someLimitReached);
        renderWithIntl(<Provider store={store}><LimitReachedBanner product={professional}/></Provider>);
        screen.getByText(titleProfessional);
        expect(screen.queryByText(titleStarter)).not.toBeInTheDocument();
        fireEvent.click(screen.getByText('Upgrade'));
        expect(mockOpenPurchaseModal).toHaveBeenCalled();
    });
});
