// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {openModal, closeModal} from 'actions/views/modals';

import {ActionTypes, ModalIdentifiers} from 'utils/constants.jsx';

import DeleteChannelModal from 'components/delete_channel_modal';

describe('modals view actions', () => {
    const mockStore = configureStore([thunk]);

    beforeEach(() => {
        store = mockStore();
    });

    test(ActionTypes.MODAL_OPEN, () => {
        const dialogType = DeleteChannelModal;
        const dialogProps = {
            channel: {
                create_at: 1511983748292,
                creator_id: 'pj9tn4tyupfbbjuoah76575xso',
                delete_at: 0,
                display_name: 'Test',
                extra_update_at: 1511983748307,
                header: '',
                id: 'izpbgcd5e38xpkhgdeqwuijnoh',
                last_post_at: 1511983748333,
                name: 'test',
                purpose: '',
                team_id: 's5c6yy6jo3n57khrqeq85motnr',
                total_msg_count: 0,
                type: 'O',
                update_at: 1511983748292
            }
        };

        const modalData = {
            type: ActionTypes.MODAL_OPEN,
            modalId: ModalIdentifiers.DELETE_CHANNEL,
            dialogType,
            dialogProps
        };

        store.dispatch(openModal(modalData));

        const action = {
            type: ActionTypes.MODAL_OPEN,
            modalId: ModalIdentifiers.DELETE_CHANNEL,
            dialogType,
            dialogProps
        };

        expect(store.getActions()).toEqual([action]);
    });

    test(ActionTypes.MODAL_CLOSE, () => {
        store.dispatch(closeModal(ModalIdentifiers.DELETE_CHANNEL));

        const action = {
            type: ActionTypes.MODAL_CLOSE,
            modalId: ModalIdentifiers.DELETE_CHANNEL
        };

        expect(store.getActions()).toEqual([action]);
    });
});