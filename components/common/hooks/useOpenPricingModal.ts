// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useDispatch, useSelector} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import PricingModal from 'components/pricing_modal';

import {isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';

export default function useOpenPricingModal() {
    const dispatch = useDispatch();
    const isCloud = useSelector(isCurrentLicenseCloud);
    let category;
    return () => {
        if (isCloud) {
            category = 'cloud_pricing';
        } else {
            category = 'self_hosted_pricing';
        }
        trackEvent(category, 'click_open_pricing_modal');
        dispatch(openModal({
            modalId: ModalIdentifiers.PRICING_MODAL,
            dialogType: PricingModal,
        }));
    };
}
