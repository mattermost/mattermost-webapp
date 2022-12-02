// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {Elements} from '@stripe/react-stripe-js';

import {SelfHostedSignupProgress} from '@mattermost/types/cloud';
import {ValueOf} from '@mattermost/types/utilities';
import {getSelfHostedSignupProgress} from 'mattermost-redux/selectors/entities/cloud';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {trackEvent, pageVisited} from 'actions/telemetry_actions';
import {closeModal} from 'actions/views/modals';

import {GlobalState} from 'types/store';

import {isModalOpen} from 'selectors/views/modals';

import {STRIPE_CSS_SRC} from 'components/payment_form/stripe';

import {
    ModalIdentifiers,
    TELEMETRY_CATEGORIES,
} from 'utils/constants';

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RootPortal from 'components/root_portal';
import useLoadStripe from 'components/common/hooks/useLoadStripe';

export default function SelfHostedPurchaseModal() {
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.SELF_HOSTED_PURCHASE));
    const progress: ValueOf<typeof SelfHostedSignupProgress> = useSelector(getSelfHostedSignupProgress);

    const reduxDispatch = useDispatch<DispatchFunc>();

    const modalRef = useRef();
    const [stripeLoadHint] = useState(Math.random());

    const stripeRef = useLoadStripe(stripeLoadHint);

    useEffect(() => {
        pageVisited(
            TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
            'pageview_self_hosted_purchase',
        );
    }, []);

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
                    {progress}
                    {'TODO: form goes here next'}
                </FullScreenModal>
            </RootPortal>
        </Elements>
    );
}
