// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Dictionary} from 'mattermost-redux/types/utilities';

interface ModalList<T> {
    [key: string]: T;
}

type ModaListType<T> = ModalList<T> & {
    modalState?: T;
}

type Modal = {
    [key: string]: any;
    open: boolean;
    dialogProps: Dictionary<any>;
    dialogType: React.Component;
}

type Props = {

    /*
     * Object that has map of modal's id and element
     */
    modals: ModaListType<Modal>;

    /*
     * Object with action creators
     */
    actions: {

        /*
         * Action creator to close modal
         */
        closeModal: (modalId: string) => {data: boolean};
    };
}

export default class ModalController extends React.PureComponent<Props> {
    public render(): JSX.Element {
        const {modals, ...props} = this.props;
        const {modalState} = modals;

        if (!modals) {
            return <div/>;
        }

        const modalOutput = [];

        for (const modalId in modalState) {
            if (modalState.hasOwnProperty(modalId)) {
                const modal = modalState[modalId];
                if (modal.open) {
                    const modalComponent = React.createElement(modal.dialogType, Object.assign({}, modal.dialogProps, {
                        onHide: props.actions.closeModal.bind(this, modalId),
                        key: `${modalId}_modal`,
                    }));

                    modalOutput.push(modalComponent);
                }
            }
        }

        return (
            <div>{modalOutput}</div>
        );
    }
}
