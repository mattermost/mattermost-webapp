import {
    IntegrationTypes,
} from 'mattermost-redux/action_types';

import {openModal} from 'actions/views/modals';

import {ActionTypes, ModalIdentifiers} from 'utils/constants.jsx';

import InteractiveDialog from 'components/interactive_dialog';
import store from "../stores/redux_store";

export function openInteractiveDialog(dialog) {
    store.dispatch({type: IntegrationTypes.RECEIVED_DIALOG, data: dialog});

    store.dispatch(openModal({modalId: ModalIdentifiers.INTERACTIVE_DIALOG, dialogType: InteractiveDialog}));
}

