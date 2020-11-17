// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';

import modalsReducer from 'reducers/views/modals';
import {ActionTypes, ModalIdentifiers} from 'utils/constants';

class TestModal extends React.PureComponent {
    render() {
        return (
            <Modal
                show={true}
            >
                <Modal.Header closeButton={true}/>
                <Modal.Body/>
            </Modal>
        );
    }
}

describe('Reducers.Modals', () => {
    test('Initial state', () => {
        const nextState = modalsReducer(
            {},
            {},
        );

        const expectedState = {
            modalState: {},
        };

        expect(nextState).toEqual(expectedState);
    });

    test(ActionTypes.MODAL_OPEN, () => {
        const dialogType = TestModal;
        const dialogProps = {
            test: true,
        };

        const nextState = modalsReducer(
            {},
            {
                type: ActionTypes.MODAL_OPEN,
                modalId: ModalIdentifiers.DELETE_CHANNEL,
                dialogType,
                dialogProps,
            },
        );

        const expectedState = {
            modalState: {},
        };

        expectedState.modalState[ModalIdentifiers.DELETE_CHANNEL] = {
            open: true,
            dialogProps,
            dialogType,
        };

        expect(nextState).toEqual(expectedState);
    });

    test(ActionTypes.MODAL_CLOSE, () => {
        const nextState = modalsReducer(
            {},
            {
                type: ActionTypes.MODAL_CLOSE,
                modalId: ModalIdentifiers.DELETE_CHANNEL,
            },
        );

        const expectedState = {
            modalState: {},
        };

        expectedState.modalState[ModalIdentifiers.DELETE_CHANNEL] = {
            open: false,
        };

        expect(nextState).toEqual(expectedState);
    });
});
