// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useDispatch} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import PricingModal from 'components/pricing_modal';

export default function useOpenPricingModal(callerComponent?: string) {
    const dispatch = useDispatch();
    return () => {
        trackEvent('cloud_pricing', 'click_open_pricing_modal', {callerComponent});
        dispatch(openModal({
            modalId: ModalIdentifiers.PRICING_MODAL,
            dialogType: PricingModal,
        }));
    };
}
