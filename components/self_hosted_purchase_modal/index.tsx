// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useReducer} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';

import {Stripe, StripeCardElement, StripeCardElementChangeEvent} from '@stripe/stripe-js';
import {loadStripe} from '@stripe/stripe-js/pure'; // https://github.com/stripe/stripe-js#importing-loadstripe-without-side-effects
import {Elements} from '@stripe/react-stripe-js';

import {SelfHostedSignupForm} from '@mattermost/types/cloud';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';
import {areBillingDetailsValid, BillingDetails} from 'types/cloud/sku';

import {isModalOpen} from 'selectors/views/modals';

import {STRIPE_CSS_SRC, STRIPE_PUBLIC_KEY} from 'components/payment_form/stripe';
import CardInput, {CardInputType} from 'components/payment_form/card_input';
import StateSelector from 'components/payment_form/state_selector';
import DropdownInput from 'components/dropdown_input';

import Input from 'components/widgets/inputs/input/input';

import {trackEvent, pageVisited} from 'actions/telemetry_actions';
import {closeModal} from 'actions/views/modals';
import {completeStripeAddPaymentMethod} from 'actions/cloud';
import {Client4} from 'mattermost-redux/client';
import {
    ModalIdentifiers,
    TELEMETRY_CATEGORIES,
} from 'utils/constants';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RootPortal from 'components/root_portal';

// interface Props {
//     callerCTA?: string;
// }

interface State {
    address: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    cardName: string;
    organization: string;
    waitingOnNetwork: boolean;
    agreedTerms: boolean;
    cardFilled: boolean;
}

interface UpdateAddress {
    type: 'update_address'
    data: string;
}

interface UpdateAddress2 {
    type: 'update_address_2'
    data: string;
}

interface UpdateCity {
    type: 'update_city'
    data: string;
}

interface UpdateState {
    type: 'update_state'
    data: string;
}

interface UpdateCountry {
    type: 'update_country'
    data: string;
}

interface UpdatePostalCode {
    type: 'update_postal_code'
    data: string;
}

interface UpdateOrganization {
    type: 'update_organization'
    data: string;
}

interface UpdateCardName {
    type: 'update_card_name'
    data: string;
}

interface UpdateWaitingOnNetwork {
    type: 'update_waiting_on_network'
    data: boolean;
}

interface UpdateAgreedTerms {
    type: 'update_agreed_terms'
    data: boolean;
}

interface UpdateCardFilled {
    type: 'card_filled'
    data: boolean;
}

type Action = 
    | UpdateAddress
    | UpdateAddress2
    | UpdateCity
    | UpdateState
    | UpdateCountry
    | UpdatePostalCode
    | UpdateOrganization
    | UpdateWaitingOnNetwork
    | UpdateAgreedTerms
    | UpdateCardFilled
    | UpdateCardName

const initialState: State = {
    address: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    cardName: '',
    organization: '',
    waitingOnNetwork: false,
    agreedTerms: false,
    cardFilled: false,
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
    case 'update_address': 
        return {...state, address: action.data}
    case 'update_address_2':
        return {...state, address2: action.data}
    case 'update_city':
        return {...state, city: action.data}
    case 'update_country':
        return {...state, country: action.data}
    case 'update_postal_code':
        return {...state, postalCode: action.data}
    case 'update_state':
        return {...state, state: action.data}
    case 'update_waiting_on_network':
        return {...state, waitingOnNetwork: action.data}
    case 'update_agreed_terms':
        return {...state, agreedTerms: action.data}
    case 'card_filled':
        return {...state, cardFilled: action.data}
    case 'update_card_name':
        return {...state, cardName: action.data}
    default:
        // eslint-disable-next-line
        console.error(`Exhaustiveness failure for self hosted purchase modal. action: ${JSON.stringify(action)}`)
        return state
    
    }
}

function selectBillingDetails(s: State, card: StripeCardElement): BillingDetails {
    return {
    address: s.address,
    address2: s.address2,
    city: s.city,
    state: s.state,
    country: s.country,
    postalCode: s.postalCode,
    name: s.cardName,
    card,
    agreedTerms: s.agreedTerms,
    }
    
}

export default function SelfHostedPurchaseModal(/*props: Props*/) {
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.SELF_HOSTED_PURCHASE));
    const theme = useSelector(getTheme);
    const intl = useIntl();

    const [state, dispatch] = useReducer(reducer, initialState)
    const reduxDispatch = useDispatch();

    const cardRef = useRef<CardInputType | null>(null);
    const modalRef = useRef();
    // const billingDetails = selectBillingDetails(state, cardRef.current?.getCard()!);
    const checkbillingDetailsValid = () => areBillingDetailsValid(selectBillingDetails(state, cardRef.current?.getCard()!));

    const stripeRef = useRef<Stripe | null>(null);

    useEffect(() => {
        pageVisited(
            TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
            'pageview_self_hosted_purchase',
        );
        loadStripe(STRIPE_PUBLIC_KEY).then((stripe: Stripe | null) => {
            stripeRef.current = stripe;
        });
    }, []);

    // const onPaymentInput = (billing: BillingDetails) => {
    //     this.setState({
    //         paymentInfoIsValid:
    //             areBillingDetailsValid(billing) && this.state.cardInputComplete,
    //     });
    //     this.setState({billingDetails: billing});
    // }

    const handleCardInputChange = (event: StripeCardElementChangeEvent) => {
        dispatch({type: 'card_filled', data: event.complete})
    }

    const form: SelfHostedSignupForm = {
        first_name: 'bob',
        last_name: 'jones',
        billing_address: {
            city: 'polis',
            country: 'polistan',
            line1: '123 polis street',
            line2: '#123',
            postal_code: '12345',
            state: 'MN',
        },
        organization: 'bob corp',
    };
    // const subscriptionRequest =  {
    //     customer_id: '',
    //     product_id: 'prod_K3evf2gg2LIzrD',
    //     add_ons: [],
    //     seats: 123,
    //     total: 1234.03,
    //     internal_purchase_order: 'asdf',
    // };
    // 

    // const onBlur = () => {
    //     const {onInputBlur} = props;
    //     if (onInputBlur) {
    //         onInputBlur(
    //             selectBillingDetails(state, cardRef.current?.getCard()!);
    //         )
    //     }
    // }

    async function submit() {
        const result = await Client4.createCustomerSelfHostedSignup(form);
        console.log(result);
        const isDevMode = false;
        if (stripeRef.current === null) {
            console.log('stripe ref is not here. waaah.')
            return
        }
        const addedPaymentMethod = await reduxDispatch(completeStripeAddPaymentMethod(
            stripeRef.current,
            {
                address: form.billing_address.line1,
                address2: form.billing_address.line2,
                city:  form.billing_address.city,
                state:  form.billing_address.state,
                country:  form.billing_address.country,
                postalCode:  form.billing_address.postal_code,
                name: form.first_name + ' ' + form.last_name,
                card: '' as any,
            },
            isDevMode,
            {
                id: result.setup_intent_id,
                client_secret: result.setup_intent_secret,
            },
        ));
        console.log(addedPaymentMethod);
    }
    
    return (
        <Elements
            options={{fonts: [{cssSrc: STRIPE_CSS_SRC}]}}
            stripe={stripeRef.current}
        >
        <RootPortal>
            <FullScreenModal
                show={show}
                ref={modalRef}
                ariaLabelledBy='self_hosted_purchase_modal_title'
                onClose={() => {
                    trackEvent(
                        TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                        'click_close_purchasing_screen',
                    );
                    reduxDispatch(closeModal(ModalIdentifiers.SELF_HOSTED_PURCHASE));
                }}
            >
        <div>
            {'form here'}
            <CardInput
                forwardedRef={cardRef}
                required={true}
                onCardInputChange={handleCardInputChange}
                theme={theme}
            />
            <Input
                name='name'
                type='text'
                value={state.cardName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {dispatch({type: 'update_card_name', data: e.target.value})}}
                placeholder={intl.formatMessage({
                    id: 'payment_form.name_on_card',
                    defaultMessage: 'Name on Card',
                })}
                required={true}
            />

                    <DropdownInput
                        onChange={this.handleCountryChange}
                        value={
                            this.state.country ? {value: this.state.country, label: this.state.country} : undefined
                        }
                        options={COUNTRIES.map((country) => ({
                            value: country.name,
                            label: country.name,
                        }))}
                        legend={Utils.localizeMessage(
                            'payment_form.country',
                            'Country',
                        )}
                        placeholder={Utils.localizeMessage(
                            'payment_form.country',
                            'Country',
                        )}
                        name={'billing_dropdown'}
                    />
            <StateSelector
                country={state.country}
                state={state.state}
                onChange={(state: string) => {dispatch({type: 'update_state', data: state})}}
            />
            <FormattedMessage
                id='payment_form.billing_address'
                defaultMessage='Billing address'
            />
        </div>
        <button
            className=''
            onClick={submit}
         >
            {'start flow'}
        </button>
            </FullScreenModal>
        </RootPortal>
        </Elements>
    );
}
