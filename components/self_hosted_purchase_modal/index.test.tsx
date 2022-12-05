// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {screen, fireEvent, waitFor} from '@testing-library/react';

import {GlobalState} from 'types/store';
import {SelfHostedSignupProgress} from '@mattermost/types/hosted_customer';

import {renderWithIntlAndStore} from 'tests/react_testing_utils';
import {TestHelper as TH} from 'utils/test_helper';
import {SelfHostedProducts, ModalIdentifiers} from 'utils/constants';
import {getToday} from 'utils/utils';

import SelfHostedPurchaseModal from './';

interface MockCardInputProps {
    onCardInputChange: (event: {complete: boolean}) => void;
    forwardedRef: React.MutableRefObject<any>;
}

// number borrowed from stripe
const successCardNumber = '4242424242424242';
function MockCardInput(props: MockCardInputProps) {
    props.forwardedRef.current = {
        getCard: () => ({}),
    };
    return (
        <input
            placeholder='Card number'
            type='text'
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.value === successCardNumber) {
                    props.onCardInputChange({complete: true});
                }

                // props.onCardInputChange({complete: false});
            }}
        />
    );
}

jest.mock('components/payment_form/card_input', () => {
    const original = jest.requireActual('components/payment_form/card_input');
    return {
        ...original,
        __esModule: true,
        default: MockCardInput,
    };
});

jest.mock('components/self_hosted_purchase_modal/stripe_provider', () => {
    return function(props: {children: React.ReactNode | React.ReactNodeArray}) {
        return props.children;
    };
});

jest.mock('components/common/hooks/useLoadStripe', () => {
    return function() {
        return {current: {
            stripe: {},

        }};
    };
});

const mockCreatedIntent = SelfHostedSignupProgress.CREATED_INTENT;
const mockCreatedLicense = SelfHostedSignupProgress.CREATED_LICENSE;

jest.mock('mattermost-redux/client', () => {
    const original = jest.requireActual('mattermost-redux/client');
    return {
        __esModule: true,
        ...original,
        Client4: {
            ...original.Client4,
            pageVisited: jest.fn(),
            setAcceptLanguage: jest.fn(),
            createCustomerSelfHostedSignup: () => Promise.resolve({
                progress: mockCreatedIntent,
            }),
            confirmSelfHostedSignup: () => Promise.resolve({
                progress: mockCreatedLicense,
            }),
        },
    };
});

jest.mock('components/payment_form/stripe', () => {
    const original = jest.requireActual('components/payment_form/stripe');
    return {
        __esModule: true,
        ...original,
        getConfirmCardSetup: () => () => () => ({setupIntent: {status: 'succeeded'}, error: null}),
    };
});

const productName = 'Professional';

const existingUsers = 10;

const initialState: GlobalState = {
    views: {
        modals: {
            modalState: {
                [ModalIdentifiers.SELF_HOSTED_PURCHASE]: {
                    open: true,
                },
            },
        },
    },
    entities: {
        admin: {
            analytics: {
                TOTAL_USERS: existingUsers,
            },
        },
        teams: {
            currentTeamId: '',
        },
        preferences: {
            myPreferences: {
                theme: {},
            },
        },
        general: {
            config: {
                EnableDeveloper: 'false',
            },
            license: {},
        },
        cloud: {
            subscription: {},
        },
        users: {
            currentUserId: 'adminUserId',
            profiles: {
                adminUserId: TH.getUserMock({
                    id: 'adminUserId',
                    roles: 'admin',
                    first_name: 'first',
                    last_name: 'admin',
                }),
                otherUserId: TH.getUserMock({
                    id: 'otherUserId',
                    roles: '',
                    first_name: '',
                    last_name: '',
                }),
            },
        },
        hostedCustomer: {
            products: {
                productsLoaded: true,
                products: {
                    prod_professional: TH.getProductMock({
                        id: 'prod_professional',
                        name: 'Professional',
                        sku: SelfHostedProducts.PROFESSIONAL,
                        price_per_seat: 7.5,

                    }),

                },
            },
            signupProgress: SelfHostedSignupProgress.START,
        },
    },
} as unknown as GlobalState;

const valueEvent = (value: any) => ({target: {value}});
function changeByPlaceholder(sel: string, val: any) {
    fireEvent.change(screen.getByPlaceholderText(sel), valueEvent(val));
}

// having issues with normal selection of texts and clicks.
function selectDropdownValue(testId: string, value: string) {
    fireEvent.change(screen.getByTestId(testId).querySelector('input') as any, valueEvent(value));
    fireEvent.click(screen.getByTestId(testId).querySelector('.DropDown__option--is-focused') as any);
}

describe('SelfHostedPurchaseModal', () => {
    it('renders the form', () => {
        renderWithIntlAndStore(<div id='root-portal'><SelfHostedPurchaseModal productId={'prod_professional'}/></div>, initialState);

        // check title, and some of the most prominent details and secondary actions
        screen.getByText('Provide your payment details');
        screen.getByText('Contact Sales');
        screen.getByText('/user/month');
        screen.getByText(productName);
        screen.getByText(`You will be billed ${getToday()}. Your license will be applied automatically`, {exact: false});
        screen.getByText('See how billing works', {exact: false});
    });

    it('filling the form enables signup', () => {
        renderWithIntlAndStore(<div id='root-portal'><SelfHostedPurchaseModal productId={'prod_professional'}/></div>, initialState);
        expect(screen.getByText('Upgrade')).toBeDisabled();
        changeByPlaceholder('Card number', successCardNumber);
        changeByPlaceholder('Organization Name', 'My org');
        changeByPlaceholder('Name on Card', 'The Cardholder');
        selectDropdownValue('selfHostedPurchaseCountrySelector', 'United States of America');
        changeByPlaceholder('Address', '123 Main Street');
        changeByPlaceholder('City', 'Minneapolis');
        selectDropdownValue('selfHostedPurchaseStateSelector', 'MN');
        changeByPlaceholder('Zip/Postal Code', '55423');
        fireEvent.click(screen.getByText('I have read and agree', {exact: false}));

        // not changing the license seats number,
        // because it is expected to be pre-filled with the correct number of seats.
        expect(screen.getByText('Upgrade')).toBeEnabled();
    });

    it('disables signup if too few seats chosen', () => {
        renderWithIntlAndStore(<div id='root-portal'><SelfHostedPurchaseModal productId={'prod_professional'}/></div>, initialState);
        changeByPlaceholder('Card number', successCardNumber);
        changeByPlaceholder('Organization Name', 'My org');
        changeByPlaceholder('Name on Card', 'The Cardholder');
        selectDropdownValue('selfHostedPurchaseCountrySelector', 'United States of America');
        changeByPlaceholder('Address', '123 Main Street');
        changeByPlaceholder('City', 'Minneapolis');
        selectDropdownValue('selfHostedPurchaseStateSelector', 'MN');
        changeByPlaceholder('Zip/Postal Code', '55423');
        fireEvent.click(screen.getByText('I have read and agree', {exact: false}));

        const tooFewSeats = existingUsers - 1;
        expect(screen.getByText('Upgrade')).toBeEnabled();
        fireEvent.change(screen.getByTestId('selfHostedPurchaseSeatsInput'), valueEvent(tooFewSeats.toString()));
        expect(screen.getByText('Upgrade')).toBeDisabled();
        screen.getByText('Your workspace currently has 10 users', {exact: false});
    });

    it('happy path submit shows success screen', async () => {
        renderWithIntlAndStore(<div id='root-portal'><SelfHostedPurchaseModal productId={'prod_professional'}/></div>, initialState);
        expect(screen.getByText('Upgrade')).toBeDisabled();
        changeByPlaceholder('Card number', successCardNumber);
        changeByPlaceholder('Organization Name', 'My org');
        changeByPlaceholder('Name on Card', 'The Cardholder');
        selectDropdownValue('selfHostedPurchaseCountrySelector', 'United States of America');
        changeByPlaceholder('Address', '123 Main Street');
        changeByPlaceholder('City', 'Minneapolis');
        selectDropdownValue('selfHostedPurchaseStateSelector', 'MN');
        changeByPlaceholder('Zip/Postal Code', '55423');
        fireEvent.click(screen.getByText('I have read and agree', {exact: false}));

        const upgradeButton = screen.getByText('Upgrade');
        expect(upgradeButton).toBeEnabled();
        upgradeButton.click();
        await waitFor(() => expect(screen.getByText(`You're now subscribed to ${productName}`)).toBeTruthy(), {timeout: 1234});
    });
});

