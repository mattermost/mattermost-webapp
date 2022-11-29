// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useDispatch} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import AirGappedSelfHostedPurchaseModal from 'components/air_gapped_self_hosted_purchase_modal'

export default function useOpenAirGappedSelfHostedPurchaseModal() {
    const dispatch = useDispatch();
    return () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.AIR_GAPPED_SELF_HOSTED_PURCHASE,
            dialogType: AirGappedSelfHostedPurchaseModal,
        }));
    };
}
