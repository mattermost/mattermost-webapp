// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {ModalData} from 'types/actions';
import {openModal, closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import AirGappedSelfHostedPurchaseModal from 'components/air_gapped_self_hosted_purchase_modal';
import ScreeningInProgressModal from 'components/screening_in_progress_modal';

export interface ControlModal {
    open: () => void;
    close: () => void;
}

export function useControlAirGappedSelfHostedPurchaseModal(): ControlModal {
    return useControlModal({
        modalId: ModalIdentifiers.AIR_GAPPED_SELF_HOSTED_PURCHASE,
        dialogType: AirGappedSelfHostedPurchaseModal,
    });
}

export function useControlScreeningInProgressModal(): ControlModal {
    return useControlModal({
        modalId: ModalIdentifiers.SCREENING_IN_PROGRESS,
        dialogType: ScreeningInProgressModal,
    });
}

export function useControlPurchaseInProgressModal(): ControlModal {
    return useControlModal({
        modalId: ModalIdentifiers.PURCHASE_IN_PROGRESS,
        dialogType: AirGappedSelfHostedPurchaseModal,
    });
}

export function useControlModal<T>(modalData: ModalData<T>): ControlModal {
    const dispatch = useDispatch();
    return useMemo(() => ({
        open: () => {
            dispatch(openModal(modalData));
        },
        close: () => {
            dispatch(closeModal(modalData.modalId));
        },
    }), [modalData]);
}
