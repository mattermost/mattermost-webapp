// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {ActionTypes} from 'utils/constants';

export function openModal(modalData) {
    return (dispatch) => {
        const action = {
            type: ActionTypes.MODAL_OPEN,
            modalId: modalData.modalId,
            dialogProps: modalData.dialogProps,
            dialogType: modalData.dialogType
        };

        dispatch(action);
    };
}

export function closeModal(modalId) {
    return (dispatch) => {
        const action = {
            type: ActionTypes.MODAL_CLOSE,
            modalId
        };

        dispatch(action);
    };
}
