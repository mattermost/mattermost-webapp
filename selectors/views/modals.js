// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function isModalOpen(state, modalId) {
    return Boolean(state.views.modals.modalState[modalId] && state.views.modals.modalState[modalId].open);
}
export function isAnyModalOpen(state) {
    return Boolean(state.views.modals.modalState && findOpenModal(state.views.modals.modalState));
}

function findOpenModal(modalStateObject) {
    let isOpen = false;
    for (const modal in modalStateObject) {
        if (modal && modalStateObject[modal].open) {
            isOpen = true;
            break;
        }
    }
    return isOpen;
}
