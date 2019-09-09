// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {openModal} from 'actions/views/modals';
import InteractiveDialog from 'components/interactive_dialog';
import store from 'stores/redux_store.jsx';
import {ModalIdentifiers} from 'utils/constants.jsx';

import {IntegrationTypes} from 'mattermost-redux/action_types';

export function openInteractiveDialog(dialog) {
    store.dispatch({type: IntegrationTypes.RECEIVED_DIALOG, data: dialog});

    const currentTriggerId = store.getState().entities.integrations.dialogTriggerId;

    if (dialog.trigger_id !== currentTriggerId) {
        return;
    }

    store.dispatch(openModal({modalId: ModalIdentifiers.INTERACTIVE_DIALOG, dialogType: InteractiveDialog}));
}

let previousTriggerId = '';
store.subscribe(() => {
    const state = store.getState();
    const currentTriggerId = state.entities.integrations.dialogTriggerId;

    if (currentTriggerId === previousTriggerId) {
        return;
    }

    previousTriggerId = currentTriggerId;

    const dialog = state.entities.integrations.dialog || {};
    if (dialog.trigger_id !== currentTriggerId) {
        return;
    }

    store.dispatch(openModal({modalId: ModalIdentifiers.INTERACTIVE_DIALOG, dialogType: InteractiveDialog}));
});
