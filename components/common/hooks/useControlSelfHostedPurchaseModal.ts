// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal, closeModal} from 'actions/views/modals';
import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import SelfHostedPurchaseModal from 'components/self_hosted_purchase_modal';
import PurchaseInProgressModal from 'components/self_hosted_purchase_modal/purchase_in_progress_modal';
import {Client4} from 'mattermost-redux/client';
import {getCurrentUserEmail} from 'mattermost-redux/selectors/entities/common';
import {HostedCustomerTypes} from 'mattermost-redux/action_types';

import {useControlModal, useControlPurchaseInProgressModal, ControlModal} from './useControlModal';

interface HookOptions{
    onClick?: () => void;
    productId: string;
    trackingLocation?: string;
}

export default function useControlSelfHostedPurchaseModal(options: HookOptions): ControlModal {
    const dispatch = useDispatch();
    const userEmail = useSelector(getCurrentUserEmail);
    const controlModal = useControlModal({
        modalId: ModalIdentifiers.SELF_HOSTED_PURCHASE,
        dialogType: SelfHostedPurchaseModal,
        dialogProps: {
            productId: options.productId,
        },
    });
    // const controlPurchaseInProgressModal = useControlPurchaseInProgressModal({

    return useMemo(() => {
        return {
            ...controlModal,
            open: async () => {
                // check if user already has an open purchase modal in current browser.
                const hasOpenPurchaseModal = false;

                if (hasOpenPurchaseModal) {
                    // User within the same browser session
                    // is already trying to purchase. Notify them of this
                    // and request the exit that purchase flow before attempting again.
                    dispatch({
                        modalId: ModalIdentifiers.PURCHASE_IN_PROGRESS,
                        dialogType: PurchaseInProgressModal,
                        dialogProps: {
                            purchaserEmail: userEmail,
                        },
                    });
                    return;
                }

                trackEvent(TELEMETRY_CATEGORIES.SELF_HOSTED_PURCHASING, 'click_open_purchase_modal', {
                    callerInfo: options.trackingLocation,
                });
                if (options.onClick) {
                    options.onClick();
                }
                try {
                    const result = await Client4.bootstrapSelfHostedSignup();

                    if (result.email !== userEmail) {
                        // JWT already exists and was created by another admin,
                        // meaning another admin is already trying to purchase.
                        // Notify user of this and do not allow them to try to purchase concurrently.
                        dispatch({
                            modalId: ModalIdentifiers.PURCHASE_IN_PROGRESS,
                            dialogType: PurchaseInProgressModal,
                            dialogProps: {
                                purchaserEmail: result.email
                                
                            },
                        });
                        return;
                    }         

                   dispatch({
                        type: HostedCustomerTypes.RECEIVED_SELF_HOSTED_SIGNUP_PROGRESS,
                        data: result.progress,
                    });

                    dispatch(closeModal(ModalIdentifiers.PRICING_MODAL));
                    controlModal.open();
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('error bootstrapping self hosted purchase modal', e);
                }
            },
        };
    }, [controlModal, options.productId, options.onClick, options.trackingLocation]);
}
