// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';

import {GenericAction} from 'mattermost-redux/types/actions';

import {modalState as modalStateReducer} from 'reducers/views/modals';

import {ActionTypes, ModalIdentifiers} from 'utils/constants';

class TestModal extends React.PureComponent {
    render() {
        return (
            <Modal
                show={true}
                onHide={jest.fn()}
            >
                <Modal.Header closeButton={true}/>
                <Modal.Body/>
            </Modal>
        );
    }
}

describe('Reducers.Modals', () => {
    test('Initial state', () => {
        const nextState = modalStateReducer(
            {},
            {} as GenericAction,
        );

        const expectedState = {};

        expect(nextState).toEqual(expectedState);
    });

    test(ActionTypes.MODAL_OPEN, () => {
        const dialogType = TestModal;
        const dialogProps = {
            test: true,
        };

        const nextState = modalStateReducer(
            {},
            {
                type: ActionTypes.MODAL_OPEN,
                modalId: ModalIdentifiers.DELETE_CHANNEL,
                dialogType: TestModal as React.ElementType<unknown>,
                dialogProps,
            },
        );

        const expectedState = {
            [ModalIdentifiers.DELETE_CHANNEL]: {
                open: true,
                dialogProps,
                dialogType,
            },
        };

        expect(nextState).toEqual(expectedState);
    });

    test(ActionTypes.MODAL_CLOSE, () => {
        const nextState = modalStateReducer(
            {},
            {
                type: ActionTypes.MODAL_CLOSE,
                modalId: ModalIdentifiers.DELETE_CHANNEL,
            },
        );

        expect(nextState).toEqual({});
    });

    test(`${ActionTypes.MODAL_CLOSE} with initial state`, () => {
        const initialState = {
            test_modal1: {
                open: true,
                dialogProps: {
                    test: true,
                },
                dialogType: TestModal as React.ElementType<unknown>,
            },
        };

        const nextState = modalStateReducer(
            initialState,
            {
                type: ActionTypes.MODAL_CLOSE,
                modalId: ModalIdentifiers.DELETE_CHANNEL,
            },
        );

        expect(nextState).toEqual(initialState);
    });
});
