// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.


import modalsReducer from 'reducers/views/modals';

import {ActionTypes, ModalIdentifiers} from 'utils/constants.jsx';

import DeleteChannelModal from 'components/delete_channel_modal';

describe('Reducers.Modals', () => {
    test('Initial state', () => {
        const nextState = modalsReducer(
            {},
            {}
        );

        const expectedState = {
            modalState: {}
        };

        expect(nextState).toEqual(expectedState);
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

        const nextState = modalsReducer(
            {},
            {
                type: ActionTypes.MODAL_OPEN,
                modalId: ModalIdentifiers.DELETE_CHANNEL,
                dialogType,
                dialogProps
            }
        );

        const expectedState = {
            modalState: {}
        };

        expectedState.modalState[ModalIdentifiers.DELETE_CHANNEL] = {
            open: true,
            dialogProps,
            dialogType
        };

        expect(nextState).toEqual(expectedState);
    });

    test(ActionTypes.MODAL_CLOSE, () => {
        const nextState = modalsReducer(
            {},
            {
                type: ActionTypes.MODAL_CLOSE,
                modalId: ModalIdentifiers.DELETE_CHANNEL
            }
        );

        const expectedState = {
            modalState: {}
        };

        expectedState.modalState[ModalIdentifiers.DELETE_CHANNEL] = {
            open: false
        };

        expect(nextState).toEqual(expectedState);
    });

});