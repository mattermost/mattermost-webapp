// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class ModalController extends React.PureComponent {
    static propTypes = {

        /**
         * Object that has map of modal's id and element
         */
        modals: PropTypes.object.isRequired,

        /**
         * Object with action creators
         */
        actions: PropTypes.shape({

            /**
             * Action creator to close modal
             */
            closeModal: PropTypes.func.isRequired,
        }).isRequired,
    }

    render() {
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
