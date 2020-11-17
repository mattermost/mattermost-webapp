// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function isModalOpen(state, modalId) {
    return state.views.modals.modalState[modalId] && state.views.modals.modalState[modalId].open;
}
