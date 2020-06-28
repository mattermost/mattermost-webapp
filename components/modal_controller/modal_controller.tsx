// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
type Props = {
      modals: any;
      actions: {
        closeModal: () => void; 
      }
       
}
export default class ModalController extends React.PureComponent<Props> {
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
