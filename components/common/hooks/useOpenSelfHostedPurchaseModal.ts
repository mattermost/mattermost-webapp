// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useDispatch} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';
import {openModal} from 'actions/views/modals';
import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import SelfHostedPurchaseModal from 'components/self_hosted_purchase_modal';
import {Client4} from 'mattermost-redux/client';
import {HostedCustomerTypes} from 'mattermost-redux/action_types';

interface HookOptions{
    onClick?: () => void;
}

interface CallbackArguments {
    productId: string;
    trackingLocation?: string;
}

export default function useOpenSelfHostedPurchaseModal(options: HookOptions) {
    const dispatch = useDispatch();
    return async (args: CallbackArguments) => {
        if (options.onClick) {
            options.onClick();
        }
        const result = await Client4.bootstrapSelfHostedSignup();
        trackEvent(TELEMETRY_CATEGORIES.SELF_HOSTED_PURCHASING, 'click_open_purchase_modal', {
            callerInfo: args.trackingLocation,
        });
        dispatch({
            type: HostedCustomerTypes.RECEIVED_SELF_HOSTED_SIGNUP_PROGRESS,
            data: result.progress,
        });
        dispatch(openModal({
            modalId: ModalIdentifiers.SELF_HOSTED_PURCHASE,
            dialogType: SelfHostedPurchaseModal,
            dialogProps: {
                productId: args.productId,
            },
        }));
    };
}
