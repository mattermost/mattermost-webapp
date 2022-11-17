// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useDispatch} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import PurchaseModal from 'components/purchaseModals/self_hosted_purchase_modal';

interface OpenSelfHostedPurchaseModalOptions{
    onClick?: () => void;
    trackingLocation?: string;
    isDelinquencyModal?: boolean;
    // price: string | undefined
}
type TelemetryProps = Pick<OpenSelfHostedPurchaseModalOptions, 'trackingLocation'>

export default function useOpenSelfHostedPurchaseModal(options: OpenSelfHostedPurchaseModalOptions) {
    const dispatch = useDispatch();
    return (telemetryProps: TelemetryProps) => {
        if (options.onClick) {
            options.onClick();
        }
        trackEvent(TELEMETRY_CATEGORIES.CLOUD_ADMIN, options.isDelinquencyModal ? 'click_open_delinquency_modal' : 'click_open_purchase_modal', {
            callerInfo: telemetryProps.trackingLocation,
        });
        dispatch(openModal({
            modalId: ModalIdentifiers.SELF_HOSTED_PURCHASE,
            dialogType: PurchaseModal,
            dialogProps: {
                callerCTA: telemetryProps.trackingLocation,
            },
        }));
    };
}
