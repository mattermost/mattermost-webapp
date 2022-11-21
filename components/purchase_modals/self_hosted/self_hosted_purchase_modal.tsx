// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useReducer, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useIntl} from 'react-intl';

import {Stripe, StripeCardElementChangeEvent} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';

import {SelfHostedSignupProgress} from '@mattermost/types/cloud';
import {ValueOf} from '@mattermost/types/utilities';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentProduct, getSelectedProduct, getSelfHostedSignupProgress, isDelinquent, isFreeTrial} from 'mattermost-redux/selectors/entities/cloud';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {Client4} from 'mattermost-redux/client';
import {CloudTypes} from 'mattermost-redux/action_types';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {trackEvent, pageVisited} from 'actions/telemetry_actions';
import {closeModal} from 'actions/views/modals';
import {confirmSelfHostedSignup} from 'actions/cloud';

import {GlobalState} from 'types/store';

import {isModalOpen} from 'selectors/views/modals';

import {CardInputType} from 'components/payment_form/card_input';
import {completeStripeAddPaymentMethod, subscribeCloudSubscription} from 'actions/cloud';

import ProcessPaymentSetup from '../process_payment_setup';

import PurchaseScreen from '../purchase_screen';

import {loadStripe} from '@stripe/stripe-js/pure'; // https://github.com/stripe/stripe-js#importing-loadstripe-without-side-effects
import {STRIPE_CSS_SRC, STRIPE_PUBLIC_KEY} from 'components/payment_form/stripe';

import {
    ModalIdentifiers,
    TELEMETRY_CATEGORIES,
} from 'utils/constants';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RootPortal from 'components/root_portal';
import useLoadStripe from 'components/common/hooks/useLoadStripe';
import { BillingDetails } from 'types/cloud/sku';
import { getCloudSubscription } from 'mattermost-redux/actions/cloud';
import { getCloudContactUsLink, InquiryType } from 'selectors/cloud';
import { getCurrentTeam } from 'mattermost-redux/selectors/entities/teams';
import BackgroundSvg from 'components/common/svg_images_components/background_svg';

let stripePromise: Promise<Stripe | null>;

export default function SelfHostedPurchaseModal() {
    const user = useSelector(getCurrentUser);
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.SELF_HOSTED_PURCHASE));
    const theme = useSelector(getTheme);
    const freeTrial = useSelector(isFreeTrial)
    const currentTeam = useSelector(getCurrentTeam)
    const isDelinquencyModal = useSelector(isDelinquent);
    const currentProduct = useSelector(getCurrentProduct);
    const selectedProduct = useSelector(getSelectedProduct);
    const progress = useSelector(getSelfHostedSignupProgress);
    const isDevMode = useSelector(getConfig).EnableDeveloper === 'true';
    const contactSalesLink = useSelector(getCloudContactUsLink)(InquiryType.Sales);


    const [processing, setProcessing] = useState(false);
    const [isUpgradeFromTrial, setIsUpgradeFromTrial] = useState(freeTrial);
    const [stripeLoadHint, setStripeLoadHint] = useState(Math.random());
    const [billingDetails, setBillingDetails] = useState<BillingDetails|null>(null);
    const [seats, setSeats] = useState(0);
    
    const dispatch = useDispatch();
    const reduxDispatch = useDispatch<DispatchFunc>();

    const cardRef = useRef<CardInputType | null>(null);
    const modalRef = useRef();

    const stripeRef = useLoadStripe(stripeLoadHint);

    useEffect(() => {
        pageVisited(
            TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
            'pageview_self_hosted_purchase',
        );
    }, []);

    const handleCardInputChange = (event: StripeCardElementChangeEvent) => {
        dispatch({type: 'card_filled', data: event.complete});
    };

    async function submit() {
        let submitProgress = progress;
        dispatch({type: 'update_submitting', data: true});
        if (billingDetails === null || selectedProduct === null) {
            return
        }

        const signupCustomerResult = await Client4.createCustomerSelfHostedSignup({
            first_name: user.first_name,
            last_name: user.last_name,
            billing_address: {
                city: billingDetails?.city,
                country: billingDetails?.country,
                line1: billingDetails?.address,
                line2: billingDetails?.address2,
                postal_code: billingDetails?.postalCode,
                state: billingDetails?.state,
            },
        });
        if (progress === SelfHostedSignupProgress.START || progress === SelfHostedSignupProgress.CREATED_CUSTOMER) {
            reduxDispatch({
                type: CloudTypes.RECEIVED_SELF_HOSTED_SIGNUP_PROGRESS,
                data: signupCustomerResult.progress,

            });
            submitProgress = signupCustomerResult.progress;
        }
        if (stripeRef.current === null) {
            setStripeLoadHint(Math.random())
            dispatch({type: 'update_submitting', data: false});
            return;
        }
        try {
            const finished = await reduxDispatch(confirmSelfHostedSignup(
                stripeRef.current,
                {
                    id: signupCustomerResult.setup_intent_id,
                    client_secret: signupCustomerResult.setup_intent_secret,
                },
                isDevMode,
                {
                    address: billingDetails.address,
                    address2: billingDetails.address2,
                    city: billingDetails.city,
                    state: billingDetails.state,
                    country: billingDetails.country,
                    postalCode: billingDetails.postalCode,
                    name: billingDetails.name,
                    card: cardRef.current?.getCard()!,
                },
                submitProgress,
                {
                    //TODO: Remove default
                    product_id: selectedProduct.id,
                    add_ons: [],
                    seats: Math.max(seats,200),
                },
            ));
            if (finished) {
                (function() {console.log('redirect to license page or something');})()
            }
            dispatch({type: 'update_submitting', data: false});
        } catch {
            dispatch({type: 'update_submitting', data: false});
        }
    }


    let buttonStep = 'Signup';
    if (progress === SelfHostedSignupProgress.CREATED_LICENSE) {
        buttonStep = 'Re-request license';
    }

    if (!stripePromise) {
        stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
    }

    const addPaymentMethod = async (stripe: Stripe, billingDetails: BillingDetails, isDevMode: boolean): Promise<any> => {
        return completeStripeAddPaymentMethod(stripe, billingDetails, isDevMode)
    }

    const subscribeToSubscription = async (productId: string): Promise<any> => {
        return subscribeCloudSubscription(productId);
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
                    <div className='PurchaseModal'>
                        {processing ? (
                        <ProcessPaymentSetup
                            stripe={stripePromise}
                            billingDetails={billingDetails}
                            addPaymentMethod={addPaymentMethod}
                            subscribeCloudSubscription={subscribeToSubscription}
                            isDevMode={isDevMode}
                            onClose={() => {
                                getCloudSubscription();
                                closeModal(ModalIdentifiers.CLOUD_PURCHASE)
                            }}
                            onBack={() => setProcessing(false)}
                            contactSupportLink={contactSalesLink}
                            currentTeam={currentTeam}
                            onSuccess={() => {
                                if (isDelinquencyModal) {
                                    trackEvent(TELEMETRY_CATEGORIES.CLOUD_DELINQUENCY, 'paid_arrears');
                                }
                            }}
                            selectedProduct={selectedProduct}
                            currentProduct={currentProduct}
                            isUpgradeFromTrial={isUpgradeFromTrial}
                            setIsUpgradeFromTrialToFalse={() => {setIsUpgradeFromTrial(false)}}
                        /> ) : null}
                        <PurchaseScreen
                                callerCTA={''}
                                setBillingDetauls={(billing: BillingDetails) => setBillingDetails(billing)}
                                theme={theme}
                        />
                        <div className='background-svg'>
                            <BackgroundSvg/>
                        </div>
                    </div>
                </FullScreenModal>
            </RootPortal>
        </Elements>
    );
}
