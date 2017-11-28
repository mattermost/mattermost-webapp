// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {ModalIdentifiers} from 'utils/constants.jsx';

export default class ModalController extends React.Component {

    constructor(params) {
        super(params);
    }

    render() {
        const {modals, ...props} = this.props;
        const {modalState} = modals;

        if (!modals) {
            return <div></div>;
        }



        const modalOutput = [];

        for (let modalId in modalState) {
            if (modalState.hasOwnProperty(modalId)) {
                const modal = modalState[modalId];
                if (modal.open) {
                    const modalComponent = React.createElement(modal.dialogType, Object.assign({}, modal.dialogProps, {
                        onHide: props.actions.closeModal.bind(this, modalId),
                        key: `${modalId}_modal`
                    }));

                    modalOutput.push(modalComponent);
                }
            }
        }


        return (
            <div>
                {modalOutput}
            </div>
        );
    }
}
