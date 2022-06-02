// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useDispatch} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import PurchaseModal from 'components/purchase_modal';

interface OpenPurchaseModalOptions{
    onClick?: () => void;
}
export default function useOpenCloudPurchaseModal(options: OpenPurchaseModalOptions) {
    const dispatch = useDispatch();
    return () => {
        if (options.onClick) {
            options.onClick();
        }
        trackEvent('cloud_admin', 'click_open_purchase_modal');
        dispatch(openModal({
            modalId: ModalIdentifiers.CLOUD_PURCHASE,
            dialogType: PurchaseModal,
        }));
    };
}
