// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import {closeModal} from 'actions/views/modals';
import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import SelfHostedPurchaseModal from 'components/self_hosted_purchase_modal';
import {Client4} from 'mattermost-redux/client';
import {HostedCustomerTypes} from 'mattermost-redux/action_types';

import {useControlModal, ControlModal} from './useControlModal';

interface HookOptions{
    onClick?: () => void;
    productId: string;
    trackingLocation?: string;
}

export default function useControlSelfHostedPurchaseModal(options: HookOptions): ControlModal {
    const dispatch = useDispatch();
    const controlModal = useControlModal({
        modalId: ModalIdentifiers.SELF_HOSTED_PURCHASE,
        dialogType: SelfHostedPurchaseModal,
        dialogProps: {
            productId: options.productId,
        },
    });
    return useMemo(() => {
        return {
            ...controlModal,
            open: async () => {
                trackEvent(TELEMETRY_CATEGORIES.SELF_HOSTED_PURCHASING, 'click_open_purchase_modal', {
                    callerInfo: options.trackingLocation,
                });
                if (options.onClick) {
                    options.onClick();
                }
                try {
                    const result = await Client4.bootstrapSelfHostedSignup();
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
