// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useDispatch, useSelector} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import PricingModal from 'components/pricing_modal';

import {isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';

export default function useOpenPricingModal(callerComponent?: string) {
    const dispatch = useDispatch();
    const isCloud = useSelector(isCurrentLicenseCloud);
    return () => {
        if (isCloud) {
            trackEvent('cloud_pricing', 'click_open_pricing_modal', {callerComponent});
        }
        dispatch(openModal({
            modalId: ModalIdentifiers.PRICING_MODAL,
            dialogType: PricingModal,
        }));
    };
}
