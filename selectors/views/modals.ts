// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from 'types/store';

export function isModalOpen(state: GlobalState, modalId: string) {
    return Boolean(state.views.modals.modalState[modalId] && state.views.modals.modalState[modalId].open);
}
