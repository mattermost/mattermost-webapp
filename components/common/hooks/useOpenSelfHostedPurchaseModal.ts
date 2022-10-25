// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useDispatch} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import PurchaseModal from 'components/purchase_modal';
import {Client4} from 'mattermost-redux/client';

interface OpenPurchaseModalOptions{
    onClick?: () => void;
    trackingLocation?: string;
}
type TelemetryProps = Pick<OpenPurchaseModalOptions, 'trackingLocation'>

export default function useOpenCloudPurchaseModal(options: OpenPurchaseModalOptions) {
    const dispatch = useDispatch();
    return (telemetryProps: TelemetryProps) => {
        if (options.onClick) {
            options.onClick();
        }
        Client4.bootstrapSelfHostedSignup();
        trackEvent(TELEMETRY_CATEGORIES.SELF_HOSTED_PURCHASING, 'click_open_purchase_modal', {
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

