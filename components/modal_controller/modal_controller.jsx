// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import ModalStore from 'stores/modal_store.jsx';
import {ActionTypes, Constants} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import QuickSwitchModal from 'components/quick_switch_modal';

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

    state = {
        showQuickSwitchModal: false,
    }

    componentDidMount() {
        ModalStore.addModalListener(ActionTypes.TOGGLE_QUICK_SWITCH_MODAL, this.toggleQuickSwitchModal);
        document.addEventListener('keydown', this.handleQuickSwitchKeyPress);
    }

    componentWillUnmount() {
        ModalStore.removeModalListener(ActionTypes.TOGGLE_QUICK_SWITCH_MODAL, this.toggleQuickSwitchModal);
        document.removeEventListener('keydown', this.handleQuickSwitchKeyPress);
    }

    toggleQuickSwitchModal = () => {
        this.setState({showQuickSwitchModal: !this.state.showQuickSwitchModal});
    }

    hideQuickSwitchModal = () => {
        this.setState({showQuickSwitchModal: false});
    }

    handleQuickSwitchKeyPress = (e) => {
        if (Utils.cmdOrCtrlPressed(e) && !e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.K)) {
            if (!e.altKey) {
                e.preventDefault();
                this.toggleQuickSwitchModal('channel');
            }
        }
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
            <div>
                {modalOutput}
                <QuickSwitchModal
                    show={this.state.showQuickSwitchModal}
                    onHide={this.hideQuickSwitchModal}
                    initialMode='channel'
                />
            </div>
        );
    }
}
