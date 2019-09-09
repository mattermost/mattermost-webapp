// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {IntegrationTypes} from 'mattermost-redux/action_types';

import {openModal} from 'actions/views/modals';
import InteractiveDialog from 'components/interactive_dialog';
import store from 'stores/redux_store.jsx';
import {ModalIdentifiers} from 'utils/constants.jsx';

export async function openInteractiveDialog(dialog) {
    if (await matchesCurrentOrNextTriggerId(dialog.trigger_id)) {
        store.dispatch({type: IntegrationTypes.RECEIVED_DIALOG, data: dialog});
        store.dispatch(openModal({modalId: ModalIdentifiers.INTERACTIVE_DIALOG, dialogType: InteractiveDialog}));
    }
}

// matchesCurrentOrNextTriggerId determines if the given id matches the state's
// current dialogTriggerId, or the next one that is asynchronously after a slach command
// or post request.
//
// This verifies that the requested dialog has been triggered by the most recent
// request, accounting for the case where the interactive dialog websocket event
// arrives before the request has returned its dialogTriggerId.
async function matchesCurrentOrNextTriggerId(id) {
    return new Promise((resolve) => {
        let current = getDialogTriggerId(store.getState());

        if (id === current) {
            resolve(true);
        } else {
            const unsubscribe = store.subscribe(() => {
                const previous = current;
                current = getDialogTriggerId(store.getState());

                if (current !== previous) {
                    resolve(id === current);
                    unsubscribe();
                }
            });
        }
    });
}

function getDialogTriggerId(state) {
    return state.entities.integrations.dialogTriggerId;
}
