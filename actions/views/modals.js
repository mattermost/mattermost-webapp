import {ActionTypes} from 'utils/constants';
import * as Utils from 'utils/utils';

export function openModal(modalData) {
    return (dispatch, getState) => {
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
    return (dispatch, getState) => {
        const action = {
            type: ActionTypes.MODAL_CLOSE,
            modalId: modalId
        };

        dispatch(action);
    };
}