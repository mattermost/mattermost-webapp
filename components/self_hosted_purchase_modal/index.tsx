// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';
import {loadStripe} from '@stripe/stripe-js/pure'; // https://github.com/stripe/stripe-js#importing-loadstripe-without-side-effects


import {GlobalState} from 'types/store';

import {isModalOpen} from 'selectors/views/modals';
import {STRIPE_CSS_SRC, STRIPE_PUBLIC_KEY} from 'components/payment_form/stripe';
import {trackEvent, pageVisited} from 'actions/telemetry_actions';
import {closeModal, openModal} from 'actions/views/modals';
import {
    ModalIdentifiers,
    TELEMETRY_CATEGORIES,
} from 'utils/constants'

import FullScreenModal from 'components/widgets/modals/full_screen_modal';
import RootPortal from 'components/root_portal';

export default function SelfHostedPurchaseModal() {
  const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.CLOUD_PURCHASE))
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
    {'hi'}
      </FullScreenModal>
    </RootPortal>
  )
}
