// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {A11yCustomEventTypes, A11yFocusEventDetail} from 'utils/constants';

type Modal = {
    open: boolean;
    dialogProps: Record<string, any>;
    dialogType: React.ComponentType;
}

type Props = {

    /*
     * Object that has map of modal's id and element
     */
    modals: {
        modalState: {
            [modalId: string]: Modal;
        };
    };

    /*
     * Object with action creators
     */
    actions: {

        /*
         * Action creator to close modal
         */
        closeModal: (modalId: string) => void;
    };
}

export default class ModalController extends React.PureComponent<Props> {
    public render(): React.ReactNode {
        const {modals, ...props} = this.props;
        const {modalState} = modals;

        if (!modals) {
            return null;
        }

        const modalOutput = [];

        const activeElement = document.activeElement;

        const returnFocus = () => {
            document.dispatchEvent(new CustomEvent<A11yFocusEventDetail>(
                A11yCustomEventTypes.FOCUS, {
                    detail: {
                        target: activeElement as HTMLElement,
                        keyboardOnly: true,
                    },
                },
            ));
        };

        for (const modalId in modalState) {
            if (modalState.hasOwnProperty(modalId)) {
                const modal = modalState[modalId];
                if (modal.open) {
                    let returnFocusOnExit = modal.dialogProps?.returnFocusOnExit;
                    if (typeof returnFocusOnExit === 'undefined') {
                        returnFocusOnExit = true;
                    }

                    const modalComponent = React.createElement(modal.dialogType, Object.assign({}, modal.dialogProps, {
                        onExited: () => {
                            props.actions.closeModal(modalId);

                            // Call any onExited prop provided by whoever opened the modal, if one was provided
                            modal.dialogProps?.onExited?.();

                            // If we were given a returnFocus prop, use it. If not we fallback to the default behavior
                            if (returnFocusOnExit && modal.dialogProps?.returnFocus) {
                                modal.dialogProps?.returnFocus();
                            } else if (returnFocusOnExit) {
                                returnFocus();
                            }
                        },
                        onHide: props.actions.closeModal.bind(this, modalId),
                        key: `${modalId}_modal`,
                    }));

                    modalOutput.push(modalComponent);
                }
            }
        }

        return (
            <>{modalOutput}</>
        );
    }
}
