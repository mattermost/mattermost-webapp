// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
// import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';
import {loadStripe} from '@stripe/stripe-js/pure'; // https://github.com/stripe/stripe-js#importing-loadstripe-without-side-effects

import {paySelfHosted} from 'mattermost-redux/actions/cloud';
import {SelfHostedSignupForm} from '@mattermost/types/cloud';
import {GlobalState} from 'types/store';

import {isModalOpen} from 'selectors/views/modals';
import {STRIPE_CSS_SRC, STRIPE_PUBLIC_KEY} from 'components/payment_form/stripe';
import {trackEvent, pageVisited} from 'actions/telemetry_actions';
import {closeModal} from 'actions/views/modals';
import {
    ModalIdentifiers,
    TELEMETRY_CATEGORIES,
} from 'utils/constants';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RootPortal from 'components/root_portal';

interface Props {
    callerCTA?: string;
}

function PaymentForm() {
    const dispatch = useDispatch();
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
        subscription_request: {
            customer_id: '',
            product_id: 'prod_K3evf2gg2LIzrD',
            add_ons: [],
            seats: 123,
            total: 1234.03,
            internal_purchase_order: 'asdf',
        },
    };
    return (
        <div>
        <button
            className=''
            onClick={async () => {
                const result = await dispatch(paySelfHosted(form));
            }}
         >
        </button>
        </div>  
    )
    
}

export default function SelfHostedPurchaseModal(props: Props) {
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.SELF_HOSTED_PURCHASE));
    useEffect(() => {
        loadStripe(STRIPE_PUBLIC_KEY);

        pageVisited(
            TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
            'pageview_delinquency_cc_update',
        );
    }, []);
    const dispatch = useDispatch();

    const modalRef = useRef();
    return (
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
                    dispatch(closeModal(ModalIdentifiers.SELF_HOSTED_PURCHASE));
                }}
            >
                <PaymentForm/>
            </FullScreenModal>
        </RootPortal>
    );
}
