// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {MetadataGatherWireTransferKeys, TypePurchases} from '@mattermost/types/cloud';
import {updateCloudCustomer} from 'mattermost-redux/actions/cloud';
import {trackEvent} from 'actions/telemetry_actions';
import {GlobalState} from 'types/store';

interface UseGatherIntentArgs {
    typeGatherIntent: keyof typeof TypePurchases;
}

export type FormDataState = FormDateStateWithoutOtherPayment | FormDateStateWithOtherPayment;

interface FormDateStateWithOtherPayment {
    wire: boolean;
    ach: boolean;
    other: true;
    otherPayment: string;
}

interface FormDateStateWithoutOtherPayment {
    wire: boolean;
    ach: boolean;
    other: false;
    otherPayment?: never;
}

export const useGatherIntent = ({typeGatherIntent}: UseGatherIntentArgs) => {
    const dispatch = useDispatch<any>();
    const [feedbackSaved, setFeedbackSave] = useState(false);
    const [showError, setShowError] = useState(false);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const customer = useSelector((state: GlobalState) => state.entities.cloud.customer);

    const handleSaveFeedback = async (formData: FormDataState) => {
        setSubmittingFeedback(() => true);
        const customerID = customer?.id || '';

        if (customerID === '' || customer == null) {
            return;
        }

        const gatherIntentKey: MetadataGatherWireTransferKeys = `${TypePurchases[typeGatherIntent]}_intent_wire_transfer`;
        const feedbackSaved = customer[gatherIntentKey];
        let gatherIntentWireTransferFormatted = Object.entries(formData).map((entrie) => entrie.join(':')).join(',');

        if (feedbackSaved !== '') {
            gatherIntentWireTransferFormatted = [feedbackSaved, gatherIntentWireTransferFormatted].join(',');
        }

        const {error} = await dispatch(updateCloudCustomer({
            [gatherIntentKey]: gatherIntentWireTransferFormatted,
        }));

        if (error == null) {
            setFeedbackSave(() => true);
        }

        if (error != null) {
            setShowError(() => true);
        }

        setSubmittingFeedback(() => false);
    };

    const handleOpenModal = () => {
        trackEvent('click_open_payment_feedback_form_modal', {
            location: `${TypePurchases[typeGatherIntent]}_form`,
        });
        setShowModal(() => true);
    };

    const handleCloseModal = () => {
        setShowModal(() => false);
    };

    return {feedbackSaved, handleSaveFeedback, handleOpenModal, showModal, handleCloseModal, submittingFeedback, showError};
};
