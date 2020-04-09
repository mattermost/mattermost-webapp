// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionTypes} from 'utils/constants';

export function openModal(modalData) {
    return (dispatch) => {
        const action = {
            type: ActionTypes.MODAL_OPEN,
            modalId: modalData.modalId,
            dialogProps: modalData.dialogProps,
            dialogType: modalData.dialogType,
        };

        dispatch(action);
        return {data: true};
    };
}

export function closeModal(modalId) {
    return (dispatch) => {
        const action = {
            type: ActionTypes.MODAL_CLOSE,
            modalId,
        };

        dispatch(action);
        return {data: true};
    };
}

export function incrementAnnouncementBarCount() {
    return {
        type: ActionTypes.TRACK_ANNOUNCEMENT_BAR,
    };
}

export function decrementAnnouncementBarCount() {
    return {
        type: ActionTypes.DISMISS_ANNOUNCEMENT_BAR,
    };
}
